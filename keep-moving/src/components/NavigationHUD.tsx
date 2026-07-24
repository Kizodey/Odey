import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';
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
    backgroundColor: theme.color.cardBg,
    borderRadius: theme.radius.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadow.card,
  },
  stat: { alignItems: 'center' },
  big: { fontSize: 18, fontWeight: '800', color: theme.color.text },
  small: { fontSize: 11, color: theme.color.subtext, marginTop: 2 },
  endBtn: {
    backgroundColor: theme.color.danger,
    borderRadius: theme.radius.pill,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  endText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
