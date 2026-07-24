import { Platform } from 'react-native';

let started = false;

/**
 * Boot the CarPlay integration if (and only if) the native module is present.
 * In Expo Go — and in any build without react-native-carplay's native side —
 * this is a silent no-op, so phone behaviour is completely unaffected.
 */
export function initCarPlay(): void {
  if (started || Platform.OS !== 'ios') return;
  started = true;
  try {
    require('react-native-carplay');
  } catch {
    return; // Native module absent (Expo Go): stay phone-only.
  }
  try {
    const { startCarPlayController } = require('./CarPlayController');
    startCarPlayController();
  } catch (e) {
    console.warn('CarPlay init failed:', e);
  }
}
