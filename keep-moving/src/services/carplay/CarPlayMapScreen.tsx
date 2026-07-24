import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { RoutePolyline } from '../../components/RoutePolyline';
import { formatDistance, formatMinutes } from '../../components/format';
import { DEMO_ORIGIN } from '../routing/mockData';
import { useNavStore } from '../../state/navStore';
import { theme } from '../../theme';

/**
 * The view rendered on the car's display inside the CarPlay MapTemplate.
 * Read-only: all interaction happens through CarPlay template buttons/alerts
 * (drivers shouldn't be reaching for map gestures) or on the phone.
 */
export function CarPlayMapScreen() {
  const mapRef = useRef<MapView>(null);
  const activeRoute = useNavStore((s) => s.activeRoute);
  const fix = useNavStore((s) => s.fix);
  const progress = useNavStore((s) => s.progress);
  const destination = useNavStore((s) => s.destination);
  const phase = useNavStore((s) => s.phase);

  const navigating = phase === 'navigating' || phase === 'rerouteOffered';

  useEffect(() => {
    if (navigating && fix) {
      mapRef.current?.animateCamera(
        { center: fix.position, heading: fix.heading, zoom: 15 },
        { duration: 900 },
      );
    } else if (activeRoute) {
      mapRef.current?.fitToCoordinates(activeRoute.points, {
        edgePadding: { top: 60, bottom: 60, left: 60, right: 60 },
        animated: true,
      });
    }
  }, [navigating, fix, activeRoute?.id]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...DEMO_ORIGIN, latitudeDelta: 0.2, longitudeDelta: 0.2 }}
        showsUserLocation={false}
        toolbarEnabled={false}
      >
        {activeRoute && <RoutePolyline route={activeRoute} />}
        {destination && (
          <Marker coordinate={destination.location} pinColor={theme.color.accent} />
        )}
        {fix && (
          <Marker coordinate={fix.position} anchor={{ x: 0.5, y: 0.5 }} flat>
            <View style={styles.car} />
          </Marker>
        )}
      </MapView>
      {navigating && progress && (
        <View style={styles.hud}>
          <Text style={styles.hudBig}>{formatMinutes(progress.remainingSec)}</Text>
          <Text style={styles.hudSmall}>
            {formatDistance(progress.remainingMeters)} to go
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  car: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.color.carBubble,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  hud: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: theme.color.cardBg,
    borderRadius: theme.radius.card,
    paddingHorizontal: 18,
    paddingVertical: 12,
    ...theme.shadow.card,
  },
  hudBig: { fontSize: 22, fontWeight: '800', color: theme.color.text },
  hudSmall: { fontSize: 13, color: theme.color.subtext, marginTop: 2 },
});
