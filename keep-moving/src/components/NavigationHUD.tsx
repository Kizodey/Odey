import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { PositionFix, RouteProgress } from '../types';
import { formatDistance, formatEtaClock, formatMinutes } from './format';

type Props = {
  progress: RouteProgress;
  fix: PositionFix | null;
  onEnd(): void;
};

export function NavigationHUD({ progress, fix, onEnd }: Props) {
  const speedKmh = fix ? Math.round(fix.speedMps * 3.6) : 0;
  return (
    <View style={styles.bar}>
      <View style={styles.stat}>
        <Text style={styles.big}>{formatMinutes(progress.remainingSec)}</Text>
        <Text style={styles.small}>
          {formatDistance(progress.remainingMeters)}
        </Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.big}>{formatEtaClock(progress.remainingSec)}</Text>
        <Text style={styles.small}>arrival</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.big}>{speedKmh}</Text>
        <Text style={styles.small}>km/h</Text>
      </View>
      <TouchableOpacity style={styles.endBtn} onPress={onEnd}>
        <Text style={styles.endText}>End</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: '#101418',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  stat: { alignItems: 'center' },
  big: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
  small: { fontSize: 11, color: '#9aa4ad', marginTop: 2 },
  endBtn: {
    backgroundColor: '#c62828',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  endText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
