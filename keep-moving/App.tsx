import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useState } from 'react';
import { BrandedSplash } from './src/components/BrandedSplash';
import { initCarPlay } from './src/services/carplay';
import { MapScreen } from './src/screens/MapScreen';

// Hold the native splash until our branded overlay is on screen.
SplashScreen.preventAutoHideAsync().catch(() => {});

// No-op unless running in a dev/production build that includes the CarPlay
// native module (never in Expo Go).
initCarPlay();

export default function App() {
  const [mapReady, setMapReady] = useState(false);

  const onMapReady = useCallback(() => {
    setMapReady(true);
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <>
      <MapScreen onMapReady={onMapReady} />
      <BrandedSplash visible={!mapReady} />
      <StatusBar style="dark" />
    </>
  );
}
