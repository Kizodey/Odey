import type { LatLng, RouteSet } from '../../types';
import { config } from '../../config';
import { GoogleRoutingService } from './GoogleRoutingService';
import { MockRoutingService } from './MockRoutingService';

export interface RoutingService {
  computeRoutes(origin: LatLng, destination: LatLng): Promise<RouteSet>;
  /** Mid-drive re-check from the current position. */
  refreshRoutes(
    current: LatLng,
    destination: LatLng,
    currentRouteId: string,
  ): Promise<RouteSet>;
}

let instance: RoutingService | null = null;

export function getRoutingService(): RoutingService {
  if (!instance) {
    instance =
      config.mode === 'live' && config.googleApiKey
        ? new GoogleRoutingService(config.googleApiKey)
        : new MockRoutingService();
  }
  return instance;
}
