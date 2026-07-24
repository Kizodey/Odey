import Constants from 'expo-constants';

export type RerouteConfig = {
  checkIntervalMs: number;
  /** How far ahead (in route travel time) to look for congestion. */
  lookaheadSec: number;
  /** Trigger: at least this much JAM-level driving ahead. */
  minJamAheadSec: number;
  /** Never offer alternates slower than this. */
  maxEtaPenaltySec: number;
  /** Alternate must cut jam time by at least this much. */
  minJamSavingSec: number;
  /** Silence after the driver dismisses an offer. */
  offerCooldownMs: number;
  /** Distance from the route polyline that counts as off-route. */
  offRouteThresholdM: number;
  /** No offers when the trip is nearly over. */
  noOfferFinalSec: number;
  /** Fresh primary this much faster => switch silently (normal rerouting). */
  silentSwitchGainSec: number;
  /** Sitting still: a minute stopped weighs this much vs a minute moving. */
  jamWeight: number;
  /** A declined route must improve its jam saving by this much to be re-offered. */
  reofferImprovementSec: number;
};

const extra = (Constants.expoConfig?.extra ?? {}) as {
  googleApiKey?: string | null;
  forceMockMode?: boolean;
};

const googleApiKey = extra.googleApiKey || undefined;
const mode: 'mock' | 'live' =
  !googleApiKey || extra.forceMockMode ? 'mock' : 'live';

export const config = {
  googleApiKey,
  mode,
  /** Simulated drives run this many times faster than real time. */
  demoSpeedMultiplier: 5,
  arrivalThresholdM: 60,
  reroute: {
    checkIntervalMs: mode === 'mock' ? 15_000 : 45_000,
    lookaheadSec: 600,
    minJamAheadSec: 120,
    maxEtaPenaltySec: 600,
    minJamSavingSec: 90,
    offerCooldownMs: 180_000,
    offRouteThresholdM: 50,
    noOfferFinalSec: 300,
    silentSwitchGainSec: 60,
    jamWeight: 3,
    reofferImprovementSec: 60,
  } satisfies RerouteConfig,
};
