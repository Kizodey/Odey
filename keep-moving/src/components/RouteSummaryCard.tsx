import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  destination: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  summary: { fontSize: 13, color: '#777', marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    gap: 12,
  },
  eta: { fontSize: 26, fontWeight: '800', color: '#0a7d36' },
  distance: { fontSize: 15, color: '#555' },
  delay: { fontSize: 13, color: '#c62828', fontWeight: '600' },
  buttonRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '600', color: '#555' },
  startBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0a7d36',
    alignItems: 'center',
  },
  startText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
});
