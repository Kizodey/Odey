import { StatusBar } from 'expo-status-bar';
import { initCarPlay } from './src/services/carplay';
import { MapScreen } from './src/screens/MapScreen';

// No-op unless running in a dev/production build that includes the CarPlay
// native module (never in Expo Go).
initCarPlay();

export default function App() {
  return (
    <>
      <MapScreen />
      <StatusBar style="dark" />
    </>
  );
}
