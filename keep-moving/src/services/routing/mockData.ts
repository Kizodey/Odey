import type { Place } from '../../types';

/** Demo geography: Seattle. The simulated car starts at Pike Place Market. */
export const DEMO_ORIGIN = { latitude: 47.6097, longitude: -122.3422 };

export const MOCK_PLACES: Place[] = [
  {
    id: 'mock-seatac',
    name: 'Sea-Tac Airport',
    address: '17801 International Blvd, Seattle, WA',
    location: { latitude: 47.4502, longitude: -122.3088 },
  },
  {
    id: 'mock-uw',
    name: 'University of Washington',
    address: '1410 NE Campus Pkwy, Seattle, WA',
    location: { latitude: 47.6553, longitude: -122.3035 },
  },
  {
    id: 'mock-space-needle',
    name: 'Space Needle',
    address: '400 Broad St, Seattle, WA',
    location: { latitude: 47.6205, longitude: -122.3493 },
  },
  {
    id: 'mock-bellevue',
    name: 'Bellevue Downtown',
    address: 'Bellevue Way NE, Bellevue, WA',
    location: { latitude: 47.6101, longitude: -122.2015 },
  },
  {
    id: 'mock-alki',
    name: 'Alki Beach',
    address: '2665 Alki Ave SW, Seattle, WA',
    location: { latitude: 47.5812, longitude: -122.4088 },
  },
  {
    id: 'mock-northgate',
    name: 'Northgate Station',
    address: '401 NE 103rd St, Seattle, WA',
    location: { latitude: 47.7057, longitude: -122.3243 },
  },
  {
    id: 'mock-renton',
    name: 'The Landing, Renton',
    address: '800 N 10th Pl, Renton, WA',
    location: { latitude: 47.498, longitude: -122.2035 },
  },
  {
    id: 'mock-woodinville',
    name: 'Woodinville Wine District',
    address: '14700 148th Ave NE, Woodinville, WA',
    location: { latitude: 47.7543, longitude: -122.1635 },
  },
];

/**
 * Scripted traffic timeline for the demo. The scenario clock starts when
 * navigation starts; before that, refreshes see the baseline state.
 */
export const trafficScenario = {
  navigationStartedAt: null as number | null,
  /** Seconds into the drive at which the jam materialises on the primary. */
  jamAppearsAtSec: 30,

  start(now: number = Date.now()) {
    this.navigationStartedAt = now;
  },
  reset() {
    this.navigationStartedAt = null;
  },
  /** Is the scripted jam active on the primary corridor right now? */
  jamActive(now: number = Date.now()): boolean {
    if (this.navigationStartedAt === null) return false;
    return (now - this.navigationStartedAt) / 1000 >= this.jamAppearsAtSec;
  },
};

/** Simulated network latency so loading states are honest. */
export function mockLatency<T>(value: T): Promise<T> {
  const ms = 200 + Math.random() * 300;
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
