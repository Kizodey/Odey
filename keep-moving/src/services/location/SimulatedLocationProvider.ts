import type { LatLng, PositionFix, Route } from '../../types';
import { bearingDeg, haversineMeters, nearestPointIndex } from '../../engine/geo';
import { DEMO_ORIGIN } from '../routing/mockData';
import type { LocationProvider, Unsubscribe } from './LocationProvider';

/**
 * Drives a virtual car along the active route at each segment's expected
 * speed, time-compressed by `speedMultiplier`. Consumers see the same
 * PositionFix stream a real GPS would produce; the reported speed is the
 * un-multiplied road speed so the HUD and the engine's speed checks stay
 * realistic.
 */
export class SimulatedLocationProvider implements LocationProvider {
  private route: Route | null = null;
  private pointIndex = 0;
  /** Meters already covered past points[pointIndex]. */
  private overshootM = 0;
  private position: LatLng = DEMO_ORIGIN;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listener: ((fix: PositionFix) => void) | null = null;

  constructor(private readonly speedMultiplier: number) {}

  setRoute(route: Route) {
    this.route = route;
    const { index } = nearestPointIndex(route.points, this.position);
    this.pointIndex = index;
    this.overshootM = 0;
  }

  getCurrent(): Promise<LatLng> {
    return Promise.resolve(this.position);
  }

  watch(cb: (fix: PositionFix) => void): Promise<Unsubscribe> {
    this.listener = cb;
    this.timer = setInterval(() => this.tick(), 1000);
    return Promise.resolve(() => {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
      this.listener = null;
    });
  }

  private tick() {
    const route = this.route;
    if (!route || !this.listener) return;
    const speedKmh = this.speedAtIndex(route, this.pointIndex);
    let budgetM = (speedKmh / 3.6) * this.speedMultiplier + this.overshootM;

    let i = this.pointIndex;
    while (i < route.points.length - 1) {
      const stepM = haversineMeters(route.points[i], route.points[i + 1]);
      if (budgetM < stepM) break;
      budgetM -= stepM;
      i++;
    }
    this.pointIndex = i;
    this.overshootM = i >= route.points.length - 1 ? 0 : budgetM;
    this.position = route.points[i];

    const heading =
      i < route.points.length - 1
        ? bearingDeg(route.points[i], route.points[i + 1])
        : bearingDeg(route.points[Math.max(i - 1, 0)], route.points[i]);
    this.listener({
      position: this.position,
      speedMps: speedKmh / 3.6,
      heading,
    });
  }

  private speedAtIndex(route: Route, index: number): number {
    for (const seg of route.segments) {
      if (index >= seg.startIndex && index <= seg.endIndex) {
        return seg.expectedSpeedKmh;
      }
    }
    return 50;
  }
}
