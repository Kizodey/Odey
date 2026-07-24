import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { config } from '../config';
import { DemoModeBanner } from '../components/DemoModeBanner';
import { DestinationSearch } from '../components/DestinationSearch';
import { NavigationHUD } from '../components/NavigationHUD';
import { RerouteOfferCard } from '../components/RerouteOfferCard';
import { RoutePolyline } from '../components/RoutePolyline';
import { RouteSummaryCard } from '../components/RouteSummaryCard';
import { DEMO_ORIGIN } from '../services/routing/mockData';
import { useNavStore } from '../state/navStore';

// The map uses the platform default tiles (Apple on iOS, Google on Android):
// the Google tile provider needs a dev build and can't run inside Expo Go on
// iOS. Routing and traffic data are independent of the tile layer.
export function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const phase = useNavStore((s) => s.phase);
  const destination = useNavStore((s) => s.destination);
  const routeSet = useNavStore((s) => s.routeSet);
  const activeRoute = useNavStore((s) => s.activeRoute);
  const fix = useNavStore((s) => s.fix);
  const progress = useNavStore((s) => s.progress);
  const offer = useNavStore((s) => s.offer);
  const error = useNavStore((s) => s.error);
  const setDestination = useNavStore((s) => s.setDestination);
  const startNavigation = useNavStore((s) => s.startNavigation);
  const acceptOffer = useNavStore((s) => s.acceptOffer);
  const dismissOffer = useNavStore((s) => s.dismissOffer);
  const cancel = useNavStore((s) => s.cancel);
  const acknowledgeArrival = useNavStore((s) => s.acknowledgeArrival);

  const navigating = phase === 'navigating' || phase === 'rerouteOffered';

  // Fit the preview; follow the car (heading-up) while navigating.
  useEffect(() => {
    if (phase === 'preview' && activeRoute) {
      mapRef.current?.fitToCoordinates(activeRoute.points, {
        edgePadding: { top: 140, bottom: 240, left: 60, right: 60 },
        animated: true,
      });
    }
  }, [phase, activeRoute?.id]);

  useEffect(() => {
    if (navigating && fix) {
      mapRef.current?.animateCamera(
        {
          center: fix.position,
          heading: fix.heading,
          pitch: 0,
          zoom: 15,
        },
        { duration: 900 },
      );
    }
  }, [navigating, fix]);

  const searchAnchor = fix?.position ?? DEMO_ORIGIN;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          ...DEMO_ORIGIN,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
        showsUserLocation={config.mode === 'live'}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {routeSet?.alternates.map((alt) => (
          <RoutePolyline key={alt.id} route={alt} dimmed />
        ))}
        {activeRoute && <RoutePolyline route={activeRoute} />}
        {destination && (
          <Marker
            coordinate={destination.location}
            title={destination.name}
            pinColor="#c62828"
          />
        )}
        {config.mode === 'mock' && fix && (
          <Marker
            coordinate={fix.position}
            anchor={{ x: 0.5, y: 0.5 }}
            flat
            title="You (simulated)"
          >
            <View style={styles.car} />
          </Marker>
        )}
      </MapView>

      {config.mode === 'mock' && <DemoModeBanner />}

      {(phase === 'idle' || phase === 'routing' || phase === 'preview') && (
        <DestinationSearch near={searchAnchor} onSelect={setDestination} />
      )}

      {phase === 'routing' && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#0a7d36" />
          <Text style={styles.loadingText}>Finding routes…</Text>
        </View>
      )}

      {phase === 'preview' && activeRoute && destination && (
        <RouteSummaryCard
          route={activeRoute}
          destination={destination}
          onStart={() => void startNavigation()}
          onCancel={cancel}
        />
      )}

      {phase === 'navigating' && progress && (
        <NavigationHUD progress={progress} fix={fix} onEnd={cancel} />
      )}

      {phase === 'rerouteOffered' && offer && (
        <RerouteOfferCard
          offer={offer}
          onAccept={acceptOffer}
          onDismiss={dismissOffer}
        />
      )}

      {phase === 'arrived' && (
        <View style={styles.arrivedCard}>
          <Text style={styles.arrivedTitle}>You've arrived 🎉</Text>
          {destination && (
            <Text style={styles.arrivedSub}>{destination.name}</Text>
          )}
          <TouchableOpacity style={styles.doneBtn} onPress={acknowledgeArrival}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  car: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1565c0',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  loading: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  loadingText: { marginTop: 8, fontSize: 14, color: '#555' },
  arrivedCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  arrivedTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  arrivedSub: { fontSize: 14, color: '#666', marginTop: 4 },
  doneBtn: {
    marginTop: 16,
    backgroundColor: '#0a7d36',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  doneText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  errorBar: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    backgroundColor: '#c62828',
    borderRadius: 10,
    padding: 12,
  },
  errorText: { color: '#fff', fontSize: 13, textAlign: 'center' },
});
