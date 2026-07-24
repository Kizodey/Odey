import type { LatLng, Place } from '../../types';
import { config } from '../../config';
import { GooglePlacesService } from './GooglePlacesService';
import { MockPlacesService } from './MockPlacesService';

export interface PlacesService {
  autocomplete(query: string, near: LatLng): Promise<Place[]>;
}

let instance: PlacesService | null = null;

export function getPlacesService(): PlacesService {
  if (!instance) {
    instance =
      config.mode === 'live' && config.googleApiKey
        ? new GooglePlacesService(config.googleApiKey)
        : new MockPlacesService();
  }
  return instance;
}
