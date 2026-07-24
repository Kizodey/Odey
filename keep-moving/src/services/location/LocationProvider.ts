import type { LatLng, PositionFix } from '../../types';

export type Unsubscribe = () => void;

export interface LocationProvider {
  getCurrent(): Promise<LatLng>;
  watch(cb: (fix: PositionFix) => void): Promise<Unsubscribe>;
}
