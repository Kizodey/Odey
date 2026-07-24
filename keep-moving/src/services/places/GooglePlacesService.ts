import type { LatLng, Place } from '../../types';
import type { PlacesService } from './PlacesService';

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const DETAILS_URL = 'https://places.googleapis.com/v1/places';

type ApiSuggestion = {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
    structuredFormat?: {
      mainText?: { text?: string };
      secondaryText?: { text?: string };
    };
  };
};

export class GooglePlacesService implements PlacesService {
  constructor(private readonly apiKey: string) {}

  async autocomplete(query: string, near: LatLng): Promise<Place[]> {
    if (query.trim().length === 0) return [];
    const res = await fetch(AUTOCOMPLETE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
      },
      body: JSON.stringify({
        input: query,
        locationBias: {
          circle: { center: near, radius: 50_000 },
        },
      }),
    });
    if (!res.ok) {
      throw new Error(`Places autocomplete ${res.status}`);
    }
    const data = (await res.json()) as { suggestions?: ApiSuggestion[] };
    const predictions = (data.suggestions ?? [])
      .map((s) => s.placePrediction)
      .filter((p): p is NonNullable<typeof p> => !!p?.placeId)
      .slice(0, 6);

    // Resolve locations up front so tapping a result can route immediately.
    const places = await Promise.all(
      predictions.map(async (p) => {
        const location = await this.resolveLocation(p.placeId!);
        if (!location) return null;
        return {
          id: p.placeId!,
          name: p.structuredFormat?.mainText?.text ?? p.text?.text ?? 'Unknown',
          address: p.structuredFormat?.secondaryText?.text ?? '',
          location,
        } satisfies Place;
      }),
    );
    return places.filter((p): p is Place => p !== null);
  }

  private async resolveLocation(placeId: string): Promise<LatLng | null> {
    const res = await fetch(`${DETAILS_URL}/${encodeURIComponent(placeId)}`, {
      headers: {
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'location',
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      location?: { latitude?: number; longitude?: number };
    };
    if (
      typeof data.location?.latitude !== 'number' ||
      typeof data.location?.longitude !== 'number'
    ) {
      return null;
    }
    return {
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    };
  }
}
