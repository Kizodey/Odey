import * as Location from 'expo-location';
import type { LatLng, PositionFix } from '../../types';
import type { LocationProvider, Unsubscribe } from './LocationProvider';

export class DeviceLocationProvider implements LocationProvider {
  private async ensurePermission(): Promise<void> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission was denied.');
    }
  }

  async getCurrent(): Promise<LatLng> {
    await this.ensurePermission();
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };
  }

  async watch(cb: (fix: PositionFix) => void): Promise<Unsubscribe> {
    await this.ensurePermission();
    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 5,
      },
      (pos) => {
        cb({
          position: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          // GPS reports -1 when speed/heading are unknown.
          speedMps: Math.max(pos.coords.speed ?? 0, 0),
          heading: Math.max(pos.coords.heading ?? 0, 0),
        });
      },
    );
    return () => sub.remove();
  }
}
