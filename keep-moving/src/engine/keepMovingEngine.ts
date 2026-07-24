import type { RerouteConfig } from '../config';
import type { LatLng, Route, RouteProgress, RerouteOffer } from '../types';
import { haversineMeters, nearestPointIndex } from './geo';

export type RerouteDecision =
  | { type: 'none' }
  | { type: 'silentSwitch'; route: Route }
  | { type: 'offer'; offer: RerouteOffer };

export type AntiNagState = {
  lastOfferDismissedAt: number | null;
  /** routeKey -> jamTimeSavedSec at the moment it was declined. */
  declined: Map<string, number>;
};

/**
 * Identity for anti-nag purposes. Refreshed routes are re-based at the car's
 * position so their polyline hash changes every tick; the corridor summary
 * ("via I-5 N") is what stays stable.
 */
export function routeKey(route: Route): string {
  return route.summary || route.id;
}

export function computeProgress(
  route: Route,
  position: LatLng,
  offRouteThresholdM: number,
): RouteProgress {
  const { index, distanceM } = nearestPointIndex(route.points, position);
  let remainingMeters = 0;
  for (let i = index + 1; i < route.points.length; i++) {
    remainingMeters += haversineMeters(route.points[i - 1], route.points[i]);
  }
  let remainingSec = 0;
  for (const seg of route.segments) {
    if (seg.endIndex <= index) continue;
    const overlapStart = Math.max(seg.startIndex, index);
    const fraction =
      seg.endIndex > seg.startIndex
        ? (seg.endIndex - overlapStart) / (seg.endIndex - seg.startIndex)
        : 0;
    const meters = seg.lengthMeters * fraction;
    const speedMps = Math.max(seg.expectedSpeedKmh, 1) / 3.6;
    remainingSec += meters / speedMps;
  }
  return {
    pointIndex: index,
    remainingSec,
    remainingMeters,
    offRoute: distanceM > offRouteThresholdM,
  };
}

/**
 * Walk the route from pointIndex, summing expected time spent in JAM and SLOW
 * congestion within the next `lookaheadSec` of driving.
 */
export function jamTimeAhead(
  route: Route,
  pointIndex: number,
  lookaheadSec: number,
): { jamSec: number; slowSec: number } {
  let elapsed = 0;
  let jamSec = 0;
  let slowSec = 0;
  for (const seg of route.segments) {
    if (elapsed >= lookaheadSec) break;
    if (seg.endIndex <= pointIndex) continue;
    const overlapStart = Math.max(seg.startIndex, pointIndex);
    const fraction =
      seg.endIndex > seg.startIndex
        ? (seg.endIndex - overlapStart) / (seg.endIndex - seg.startIndex)
        : 0;
    const meters = seg.lengthMeters * fraction;
    const speedMps = Math.max(seg.expectedSpeedKmh, 1) / 3.6;
    let time = meters / speedMps;
    time = Math.min(time, lookaheadSec - elapsed);
    if (seg.congestion === 'JAM') jamSec += time;
    else if (seg.congestion === 'SLOW') slowSec += time;
    elapsed += time;
  }
  return { jamSec, slowSec };
}

export type EvaluateInput = {
  /** Active route, re-based at the current position (fresh from refresh). */
  current: Route;
  /** Alternate candidates, also starting at the current position. */
  candidates: Route[];
  /** Speed has been below 40% of expected in a JAM segment for 2+ ticks. */
  sustainedSlow: boolean;
  /**
   * Route keys we recently switched AWAY from (accepted offers). Silent
   * switching back to these is suppressed to stop route ping-pong.
   */
  avoidKeys?: ReadonlySet<string>;
  cfg: RerouteConfig;
  now: number;
};

export function evaluateReroute(input: EvaluateInput): RerouteDecision {
  const { current, candidates, sustainedSlow, cfg, now } = input;
  const avoidKeys = input.avoidKeys ?? new Set<string>();
  const currentJam = jamTimeAhead(current, 0, cfg.lookaheadSec);
  const remainingSec = current.durationSec;

  // Ordinary rerouting first: a candidate that is plainly faster with no more
  // jam than we already face gets taken silently, no card.
  let silentBest: Route | null = null;
  for (const c of candidates) {
    if (avoidKeys.has(routeKey(c))) continue;
    const gain = remainingSec - c.durationSec;
    const cJam = jamTimeAhead(c, 0, cfg.lookaheadSec).jamSec;
    if (gain > cfg.silentSwitchGainSec && cJam <= currentJam.jamSec) {
      if (!silentBest || c.durationSec < silentBest.durationSec) silentBest = c;
    }
  }
  if (silentBest) return { type: 'silentSwitch', route: silentBest };

  const triggered = currentJam.jamSec >= cfg.minJamAheadSec || sustainedSlow;
  if (!triggered) return { type: 'none' };

  let bestOffer: RerouteOffer | null = null;
  let bestScore = Infinity;
  for (const c of candidates) {
    if (avoidKeys.has(routeKey(c))) continue;
    const etaDeltaSec = c.durationSec - remainingSec;
    const cJam = jamTimeAhead(c, 0, cfg.lookaheadSec).jamSec;
    const jamTimeSavedSec = currentJam.jamSec - cJam;
    if (etaDeltaSec > cfg.maxEtaPenaltySec) continue;
    if (jamTimeSavedSec < cfg.minJamSavingSec) continue;
    const score = cJam * cfg.jamWeight + Math.max(etaDeltaSec, 0);
    if (score < bestScore) {
      bestScore = score;
      bestOffer = {
        alternate: c,
        etaDeltaSec,
        jamTimeSavedSec,
        reason: buildReason(currentJam.jamSec, etaDeltaSec),
        offeredAt: now,
      };
    }
  }
  return bestOffer ? { type: 'offer', offer: bestOffer } : { type: 'none' };
}

export function shouldSuppressOffer(
  offer: RerouteOffer,
  antiNag: AntiNagState,
  now: number,
  remainingSec: number,
  cfg: RerouteConfig,
): boolean {
  if (remainingSec < cfg.noOfferFinalSec) return true;
  if (
    antiNag.lastOfferDismissedAt !== null &&
    now - antiNag.lastOfferDismissedAt < cfg.offerCooldownMs
  ) {
    return true;
  }
  const declinedAt = antiNag.declined.get(routeKey(offer.alternate));
  if (
    declinedAt !== undefined &&
    offer.jamTimeSavedSec - declinedAt < cfg.reofferImprovementSec
  ) {
    return true;
  }
  return false;
}

function buildReason(jamSecAhead: number, etaDeltaSec: number): string {
  const jamMin = Math.max(1, Math.round(jamSecAhead / 60));
  if (etaDeltaSec <= 30) {
    return `Heavy traffic ahead (~${jamMin} min stopped). A moving route is available.`;
  }
  const extraMin = Math.max(1, Math.round(etaDeltaSec / 60));
  return `Heavy traffic ahead (~${jamMin} min stopped). Keep moving for +${extraMin} min?`;
}
