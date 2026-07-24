import polyline from '@mapbox/polyline';
import type {
  CongestionLevel,
  LatLng,
  Route,
  RouteSegment,
  RouteSet,
} from '../../types';
import { hashPoints, haversineMeters } from '../../engine/geo';
import type { RoutingService } from './RoutingService';

const ENDPOINT = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const FIELD_MASK = [
  'routes.duration',
  'routes.staticDuration',
  'routes.distanceMeters',
  'routes.polyline.encodedPolyline',
  'routes.travelAdvisory.speedReadingIntervals',
  'routes.description',
].join(',');

const JAM_SPEED_KMH = 8;

type ApiSpeedInterval = {
  startPolylinePointIndex?: number;
  endPolylinePointIndex?: number;
  speed?: 'SPEED_UNSPECIFIED' | 'NORMAL' | 'SLOW' | 'TRAFFIC_JAM';
};

type ApiRoute = {
  duration?: string;
  staticDuration?: string;
  distanceMeters?: number;
  description?: string;
  polyline?: { encodedPolyline?: string };
  travelAdvisory?: { speedReadingIntervals?: ApiSpeedInterval[] };
};

export class GoogleRoutingService implements RoutingService {
  constructor(private readonly apiKey: string) {}

  computeRoutes(origin: LatLng, destination: LatLng): Promise<RouteSet> {
    return this.request(origin, destination);
  }

  refreshRoutes(current: LatLng, destination: LatLng): Promise<RouteSet> {
    return this.request(current, destination);
  }

  private async request(origin: LatLng, destination: LatLng): Promise<RouteSet> {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        origin: { location: { latLng: origin } },
        destination: { location: { latLng: destination } },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
        computeAlternativeRoutes: true,
        extraComputations: ['TRAFFIC_ON_POLYLINE'],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Routes API ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = (await res.json()) as { routes?: ApiRoute[] };
    const routes = (data.routes ?? []).map(toRoute).filter((r): r is Route => !!r);
    if (routes.length === 0) throw new Error('Routes API returned no routes.');
    return { primary: routes[0], alternates: routes.slice(1) };
  }
}

function toRoute(api: ApiRoute): Route | null {
  const encoded = api.polyline?.encodedPolyline;
  if (!encoded) return null;
  // @mapbox/polyline decodes to [lat, lng] tuples at precision 5 (the Routes
  // API default encoding).
  const points: LatLng[] = polyline
    .decode(encoded)
    .map(([latitude, longitude]) => ({ latitude, longitude }));
  if (points.length < 2) return null;

  const durationSec = parseSeconds(api.duration);
  const staticDurationSec = parseSeconds(api.staticDuration) || durationSec;
  const distanceMeters = api.distanceMeters ?? 0;
  const freeSpeedKmh =
    staticDurationSec > 0 ? (distanceMeters / staticDurationSec) * 3.6 : 50;

  const intervals = api.travelAdvisory?.speedReadingIntervals ?? [];
  const segments: RouteSegment[] =
    intervals.length > 0
      ? intervals.map((iv) => {
          // speedReadingIntervals are polyline POINT INDEX ranges, not
          // distance fractions; an absent start index means 0.
          const startIndex = iv.startPolylinePointIndex ?? 0;
          const endIndex = Math.min(
            iv.endPolylinePointIndex ?? points.length - 1,
            points.length - 1,
          );
          const congestion = toCongestion(iv.speed);
          return {
            startIndex,
            endIndex,
            congestion,
            lengthMeters: sliceLength(points, startIndex, endIndex),
            expectedSpeedKmh:
              congestion === 'JAM'
                ? JAM_SPEED_KMH
                : congestion === 'SLOW'
                  ? Math.max(freeSpeedKmh * 0.5, 15)
                  : freeSpeedKmh,
          };
        })
      : [
          {
            startIndex: 0,
            endIndex: points.length - 1,
            congestion: 'FREE' as const,
            lengthMeters: distanceMeters,
            expectedSpeedKmh: freeSpeedKmh,
          },
        ];

  return {
    id: hashPoints(points),
    points,
    segments,
    durationSec,
    staticDurationSec,
    distanceMeters,
    summary: api.description ?? 'Route',
  };
}

function toCongestion(speed: ApiSpeedInterval['speed']): CongestionLevel {
  if (speed === 'TRAFFIC_JAM') return 'JAM';
  if (speed === 'SLOW') return 'SLOW';
  return 'FREE';
}

function parseSeconds(duration: string | undefined): number {
  if (!duration) return 0;
  const n = Number.parseFloat(duration.replace(/s$/, ''));
  return Number.isFinite(n) ? n : 0;
}

function sliceLength(points: LatLng[], start: number, end: number): number {
  let total = 0;
  for (let i = start + 1; i <= end; i++) {
    total += haversineMeters(points[i - 1], points[i]);
  }
  return total;
}
