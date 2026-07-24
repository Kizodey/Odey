import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';
import type { Place, Route } from '../types';
import { formatDistance, formatMinutes } from './format';

type Props = {
  route: Route;
  destination: Place;
  onStart(): void;
  onCancel(): void;
};

export function RouteSummaryCard({ route, destination, onStart, onCancel }: Props) {
  const trafficDelaySec = Math.max(0, route.durationSec - route.staticDurationSec);
  return (
    <View style={styles.card}>
      <Text style={styles.destination}>{destination.name}</Text>
      <Text style={styles.summary}>{route.summary}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.eta}>{formatMinutes(route.durationSec)}</Text>
        <Text style={styles.distance}>{formatDistance(route.distanceMeters)}</Text>
        {trafficDelaySec > 60 && (
          <Text style={styles.delay}>
            +{formatMinutes(trafficDelaySec)} of traffic
          </Text>
        )}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.startBtn} onPress={onStart}>
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: theme.color.cardBg,
    borderRadius: theme.radius.card,
    padding: 22,
    ...theme.shadow.card,
  },
  destination: { fontSize: 19, fontWeight: '800', color: theme.color.text },
  summary: { fontSize: 13, color: theme.color.subtext, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    gap: 12,
  },
  eta: { fontSize: 27, fontWeight: '900', color: theme.route.FREE },
  distance: { fontSize: 15, color: theme.color.subtext },
  delay: { fontSize: 13, color: theme.color.danger, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', marginTop: 18, gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.accentSoft,
    alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '700', color: theme.color.accent },
  startBtn: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.accent,
    alignItems: 'center',
  },
  startText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
});
