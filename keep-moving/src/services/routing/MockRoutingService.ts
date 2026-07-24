import type {
  CongestionLevel,
  LatLng,
  Route,
  RouteSegment,
  RouteSet,
} from '../../types';
import {
  bearingDeg,
  hashPoints,
  haversineMeters,
  offsetPoint,
  pathLengthMeters,
} from '../../engine/geo';
import type { RoutingService } from './RoutingService';
import { mockLatency, trafficScenario } from './mockData';

const POINT_SPACING_M = 100;
const JAM_SPEED_KMH = 8;
const SLOW_SPEED_KMH = 30;

type Corridor = {
  name: string;
  /** Perpendicular bow at the midpoint, meters. Positive = right of bearing. */
  bowM: number;
  freeSpeedKmh: number;
};

const CORRIDORS: Corridor[] = [
  { name: 'via Demo Expressway', bowM: 0, freeSpeedKmh: 58 },
  { name: 'via Eastside Ave', bowM: 1500, freeSpeedKmh: 40 },
  { name: 'via Riverside Dr', bowM: -1500, freeSpeedKmh: 38 },
];

type Zone = { center: LatLng; radiusM: number; congestion: CongestionLevel };

/**
 * Procedural routing over a "two parallel corridors" topology. Traffic is
 * modelled as geographic zones anchored when the trip is first computed, so
 * refreshed routes (re-based at the car's position) hit the same jam.
 */
export class MockRoutingService implements RoutingService {
  private zones: Zone[] = [];
  private tripKey = '';

  computeRoutes(origin: LatLng, destination: LatLng): Promise<RouteSet> {
    const key = `${origin.latitude},${origin.longitude}->${destination.latitude},${destination.longitude}`;
    if (key !== this.tripKey) {
      this.tripKey = key;
      this.anchorZones(origin, destination);
    }
    return mockLatency(this.buildRouteSet(origin, destination));
  }

  refreshRoutes(current: LatLng, destination: LatLng): Promise<RouteSet> {
    return mockLatency(this.buildRouteSet(current, destination));
  }

  /**
   * Traffic zones live on the primary corridor: a permanent slow patch a third
   * of the way along, and the scripted jam block at ~58% that appears once the
   * scenario clock passes jamAppearsAtSec.
   */
  private anchorZones(origin: LatLng, destination: LatLng) {
    const primary = corridorPoints(origin, destination, CORRIDORS[0]);
    this.zones = [
      { center: pointAtFraction(primary, 0.32), radiusM: 400, congestion: 'SLOW' },
      { center: pointAtFraction(primary, 0.58), radiusM: 450, congestion: 'JAM' },
    ];
  }

  private buildRouteSet(from: LatLng, destination: LatLng): RouteSet {
    const jamOn = trafficScenario.jamActive();
    const routes = CORRIDORS.map((corridor) =>
      this.buildRoute(from, destination, corridor, jamOn),
    );
    routes.sort((a, b) => a.durationSec - b.durationSec);
    return { primary: routes[0], alternates: routes.slice(1) };
  }

  private buildRoute(
    from: LatLng,
    destination: LatLng,
    corridor: Corridor,
    jamOn: boolean,
  ): Route {
    const points = corridorPoints(from, destination, corridor);
    const segments: RouteSegment[] = [];
    let durationSec = 0;

    let segStart = 0;
    let segLength = 0;
    let segCongestion = this.congestionAt(points, 0, corridor, jamOn);
    for (let i = 1; i < points.length; i++) {
      const stepCongestion = this.congestionAt(points, i, corridor, jamOn);
      const stepLen = haversineMeters(points[i - 1], points[i]);
      if (stepCongestion !== segCongestion) {
        segments.push(
          makeSegment(segStart, i - 1, segLength, segCongestion, corridor),
        );
        segStart = i - 1;
        segLength = 0;
        segCongestion = stepCongestion;
      }
      segLength += stepLen;
    }
    segments.push(
      makeSegment(segStart, points.length - 1, segLength, segCongestion, corridor),
    );

    for (const seg of segments) {
      durationSec += seg.lengthMeters / (seg.expectedSpeedKmh / 3.6);
    }
    const distanceMeters = pathLengthMeters(points);
    return {
      id: hashPoints(points),
      points,
      segments,
      durationSec,
      staticDurationSec: distanceMeters / (corridor.freeSpeedKmh / 3.6),
      distanceMeters,
      summary: corridor.name,
    };
  }

  private congestionAt(
    points: LatLng[],
    index: number,
    corridor: Corridor,
    jamOn: boolean,
  ): CongestionLevel {
    if (corridor.bowM !== 0) return 'FREE'; // traffic zones sit on the primary
    const p = points[index];
    for (const zone of this.zones) {
      if (zone.congestion === 'JAM' && !jamOn) continue;
      if (haversineMeters(p, zone.center) <= zone.radiusM) return zone.congestion;
    }
    return 'FREE';
  }
}

function makeSegment(
  startIndex: number,
  endIndex: number,
  lengthMeters: number,
  congestion: CongestionLevel,
  corridor: Corridor,
): RouteSegment {
  const speed =
    congestion === 'JAM'
      ? JAM_SPEED_KMH
      : congestion === 'SLOW'
        ? SLOW_SPEED_KMH
        : corridor.freeSpeedKmh;
  return { startIndex, endIndex, lengthMeters, congestion, expectedSpeedKmh: speed };
}

/**
 * A corridor is the straight origin->destination line bowed sideways by a sine
 * arc and lightly wiggled so it reads as a road, densified to ~100 m spacing.
 */
function corridorPoints(
  from: LatLng,
  to: LatLng,
  corridor: Corridor,
): LatLng[] {
  const directM = haversineMeters(from, to);
  const steps = Math.max(2, Math.round(directM / POINT_SPACING_M));
  const heading = bearingDeg(from, to);
  // Cap the bow relative to trip length: refreshed routes re-bow from the
  // car's position, and a fixed-size bow would keep pushing arrival away.
  const bowAmp =
    Math.sign(corridor.bowM) *
    Math.min(Math.abs(corridor.bowM), 0.15 * directM);
  const points: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const along = offsetPoint(from, heading, directM * t);
    const bow = bowAmp * Math.sin(Math.PI * t);
    const wiggle = 60 * Math.sin(t * 24 + corridor.bowM);
    const lateral = bow + wiggle;
    points.push(
      lateral === 0 ? along : offsetPoint(along, heading + 90, lateral),
    );
  }
  return points;
}

function pointAtFraction(points: LatLng[], fraction: number): LatLng {
  const index = Math.min(
    points.length - 1,
    Math.max(0, Math.round(fraction * (points.length - 1))),
  );
  return points[index];
}
