export type LatLng = { latitude: number; longitude: number };

export type CongestionLevel = 'FREE' | 'SLOW' | 'JAM';

export type RouteSegment = {
  /** Index range into Route.points (inclusive start, inclusive end). */
  startIndex: number;
  endIndex: number;
  congestion: CongestionLevel;
  lengthMeters: number;
  expectedSpeedKmh: number;
};

export type Route = {
  /** Stable hash of the polyline — used for anti-nag dedupe. */
  id: string;
  points: LatLng[];
  segments: RouteSegment[];
  /** Traffic-aware duration. */
  durationSec: number;
  /** No-traffic baseline; durationSec - staticDurationSec = traffic delay. */
  staticDurationSec: number;
  distanceMeters: number;
  /** Corridor label, e.g. "via I-5 N" — stable across refreshes of the same road. */
  summary: string;
};

export type RouteSet = { primary: Route; alternates: Route[] };

export type Place = {
  id: string;
  name: string;
  address: string;
  location: LatLng;
};

export type NavPhase =
  | 'idle'
  | 'routing'
  | 'preview'
  | 'navigating'
  | 'rerouteOffered'
  | 'arrived';

export type RerouteOffer = {
  alternate: Route;
  /** Positive = alternate arrives later than staying on the current route. */
  etaDeltaSec: number;
  /** Seconds of stopped/jammed driving avoided by switching. */
  jamTimeSavedSec: number;
  reason: string;
  offeredAt: number;
};

export type PositionFix = {
  position: LatLng;
  /** Meters per second; clamped to >= 0 (GPS reports -1 when unknown). */
  speedMps: number;
  /** Degrees clockwise from north. */
  heading: number;
};

export type RouteProgress = {
  pointIndex: number;
  remainingSec: number;
  remainingMeters: number;
  offRoute: boolean;
};
