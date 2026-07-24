import { create } from 'zustand';
import { config } from '../config';
import {
  computeProgress,
  evaluateReroute,
  routeKey,
  shouldSuppressOffer,
  type AntiNagState,
} from '../engine/keepMovingEngine';
import type {
  NavPhase,
  Place,
  PositionFix,
  RerouteOffer,
  Route,
  RouteProgress,
  RouteSet,
} from '../types';
import { DeviceLocationProvider } from '../services/location/DeviceLocationProvider';
import type { LocationProvider, Unsubscribe } from '../services/location/LocationProvider';
import { SimulatedLocationProvider } from '../services/location/SimulatedLocationProvider';
import { DEMO_ORIGIN, trafficScenario } from '../services/routing/mockData';
import { getRoutingService } from '../services/routing/RoutingService';

type NavState = {
  phase: NavPhase;
  destination: Place | null;
  routeSet: RouteSet | null;
  activeRoute: Route | null;
  fix: PositionFix | null;
  progress: RouteProgress | null;
  offer: RerouteOffer | null;
  error: string | null;

  setDestination(place: Place): Promise<void>;
  startNavigation(): Promise<void>;
  acceptOffer(): void;
  dismissOffer(): void;
  cancel(): void;
  acknowledgeArrival(): void;
};

// Runtime plumbing that doesn't belong in reactive state.
const simProvider = new SimulatedLocationProvider(config.demoSpeedMultiplier);
const deviceProvider = new DeviceLocationProvider();
const locationProvider: LocationProvider =
  config.mode === 'mock' ? simProvider : deviceProvider;

let unwatch: Unsubscribe | null = null;
let rerouteTimer: ReturnType<typeof setInterval> | null = null;
let tickInFlight = false;
let slowTicks = 0;
const antiNag: AntiNagState = {
  lastOfferDismissedAt: null,
  declined: new Map(),
};
// Corridors we switched away from via an accepted offer: no silent switching
// back for a while, or the app ping-pongs between routes.
const AVOID_SWITCHBACK_MS = 300_000;
const avoidUntil = new Map<string, number>();

function activeAvoidKeys(now: number): Set<string> {
  const keys = new Set<string>();
  for (const [key, until] of avoidUntil) {
    if (until > now) keys.add(key);
    else avoidUntil.delete(key);
  }
  return keys;
}

function teardown() {
  if (unwatch) unwatch();
  unwatch = null;
  if (rerouteTimer) clearInterval(rerouteTimer);
  rerouteTimer = null;
  tickInFlight = false;
  slowTicks = 0;
  antiNag.lastOfferDismissedAt = null;
  antiNag.declined.clear();
  avoidUntil.clear();
  trafficScenario.reset();
}

export const useNavStore = create<NavState>((set, get) => {
  const setActiveRoute = (route: Route) => {
    if (config.mode === 'mock') simProvider.setRoute(route);
    set({ activeRoute: route });
  };

  const onFix = (fix: PositionFix) => {
    const { activeRoute, phase } = get();
    if (!activeRoute || (phase !== 'navigating' && phase !== 'rerouteOffered')) {
      set({ fix });
      return;
    }
    const progress = computeProgress(
      activeRoute,
      fix.position,
      config.reroute.offRouteThresholdM,
    );
    set({ fix, progress });

    if (progress.remainingMeters < config.arrivalThresholdM) {
      teardown();
      set({ phase: 'arrived', offer: null });
      return;
    }
    // Off the route in live mode: reroute silently right away — that's
    // ordinary rerouting, not a Keep Moving decision.
    if (progress.offRoute && config.mode === 'live' && phase === 'navigating') {
      void reroute();
    }
  };

  const reroute = async () => {
    const { destination, fix } = get();
    if (!destination || !fix) return;
    try {
      const fresh = await getRoutingService().refreshRoutes(
        fix.position,
        destination.location,
        get().activeRoute?.id ?? '',
      );
      if (get().phase !== 'navigating') return;
      setActiveRoute(fresh.primary);
      set({ routeSet: fresh });
    } catch {
      // Transient refresh failures are fine; keep driving the current route.
    }
  };

  const tick = async () => {
    if (tickInFlight) return;
    const { phase, destination, activeRoute, fix } = get();
    if (phase !== 'navigating' || !destination || !activeRoute || !fix) return;
    tickInFlight = true;
    try {
      const fresh = await getRoutingService().refreshRoutes(
        fix.position,
        destination.location,
        activeRoute.id,
      );
      if (get().phase !== 'navigating') return;

      // Re-match our corridor among the fresh routes so the active route's
      // traffic picture updates seamlessly; everything else is a candidate.
      const all = [fresh.primary, ...fresh.alternates];
      const matched =
        all.find((r) => routeKey(r) === routeKey(activeRoute)) ?? fresh.primary;
      const candidates = all.filter((r) => r !== matched);
      setActiveRoute(matched);
      set({ routeSet: { primary: matched, alternates: candidates } });

      const currentFix = get().fix ?? fix;
      const progress = computeProgress(
        matched,
        currentFix.position,
        config.reroute.offRouteThresholdM,
      );
      set({ progress });

      updateSlowTicks(matched, progress, currentFix);
      const decision = evaluateReroute({
        current: matched,
        candidates,
        sustainedSlow: slowTicks >= 2,
        avoidKeys: activeAvoidKeys(Date.now()),
        cfg: config.reroute,
        now: Date.now(),
      });

      if (decision.type === 'silentSwitch') {
        setActiveRoute(decision.route);
      } else if (decision.type === 'offer') {
        const suppress = shouldSuppressOffer(
          decision.offer,
          antiNag,
          Date.now(),
          progress.remainingSec,
          config.reroute,
        );
        if (!suppress) {
          set({ phase: 'rerouteOffered', offer: decision.offer });
        }
      }
    } catch {
      // Skip this tick on network failure; the next one will retry.
    } finally {
      tickInFlight = false;
    }
  };

  const updateSlowTicks = (
    route: Route,
    progress: RouteProgress,
    fix: PositionFix,
  ) => {
    const seg = route.segments.find(
      (s) =>
        progress.pointIndex >= s.startIndex && progress.pointIndex <= s.endIndex,
    );
    const inJam =
      !!seg &&
      seg.congestion === 'JAM' &&
      fix.speedMps * 3.6 < 0.4 * seg.expectedSpeedKmh;
    slowTicks = inJam ? slowTicks + 1 : 0;
  };

  return {
    phase: 'idle',
    destination: null,
    routeSet: null,
    activeRoute: null,
    fix: null,
    progress: null,
    offer: null,
    error: null,

    async setDestination(place: Place) {
      teardown();
      set({
        phase: 'routing',
        destination: place,
        routeSet: null,
        activeRoute: null,
        offer: null,
        progress: null,
        error: null,
      });
      try {
        const origin =
          config.mode === 'mock'
            ? DEMO_ORIGIN
            : await deviceProvider.getCurrent();
        const routeSet = await getRoutingService().computeRoutes(
          origin,
          place.location,
        );
        set({ phase: 'preview', routeSet, activeRoute: routeSet.primary });
      } catch (e) {
        set({
          phase: 'idle',
          destination: null,
          error: e instanceof Error ? e.message : 'Could not compute a route.',
        });
      }
    },

    async startNavigation() {
      const { phase, activeRoute } = get();
      if (phase !== 'preview' || !activeRoute) return;
      set({ phase: 'navigating', error: null });
      if (config.mode === 'mock') {
        trafficScenario.start();
        simProvider.setRoute(activeRoute);
      }
      try {
        unwatch = await locationProvider.watch(onFix);
      } catch (e) {
        teardown();
        set({
          phase: 'preview',
          error: e instanceof Error ? e.message : 'Could not start GPS.',
        });
        return;
      }
      rerouteTimer = setInterval(() => void tick(), config.reroute.checkIntervalMs);
    },

    acceptOffer() {
      const { offer, activeRoute } = get();
      if (!offer) return;
      antiNag.declined.clear();
      if (activeRoute) {
        avoidUntil.set(routeKey(activeRoute), Date.now() + AVOID_SWITCHBACK_MS);
      }
      setActiveRoute(offer.alternate);
      set({ phase: 'navigating', offer: null });
    },

    dismissOffer() {
      const { offer } = get();
      if (!offer) return;
      antiNag.lastOfferDismissedAt = Date.now();
      antiNag.declined.set(routeKey(offer.alternate), offer.jamTimeSavedSec);
      set({ phase: 'navigating', offer: null });
    },

    cancel() {
      teardown();
      set({
        phase: 'idle',
        destination: null,
        routeSet: null,
        activeRoute: null,
        progress: null,
        offer: null,
        error: null,
      });
    },

    acknowledgeArrival() {
      get().cancel();
    },
  };
});
