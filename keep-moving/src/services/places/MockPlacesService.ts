import type { LatLng, Place } from '../../types';
import { MOCK_PLACES, mockLatency } from '../routing/mockData';
import type { PlacesService } from './PlacesService';

export class MockPlacesService implements PlacesService {
  autocomplete(query: string, _near: LatLng): Promise<Place[]> {
    const q = query.trim().toLowerCase();
    const results =
      q.length === 0
        ? MOCK_PLACES
        : MOCK_PLACES.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.address.toLowerCase().includes(q),
          );
    return mockLatency(results);
  }
}
