import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RerouteOffer } from '../types';
import { formatMinutes } from './format';

const AUTO_DISMISS_SEC = 20;

type Props = {
  offer: RerouteOffer;
  onAccept(): void;
  onDismiss(): void;
};

export function RerouteOfferCard({ offer, onAccept, onDismiss }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_DISMISS_SEC);

  useEffect(() => {
    setSecondsLeft(AUTO_DISMISS_SEC);
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [offer.offeredAt]);

  useEffect(() => {
    if (secondsLeft <= 0) onDismiss();
  }, [secondsLeft, onDismiss]);

  const etaLabel =
    offer.etaDeltaSec > 30
      ? `+${formatMinutes(offer.etaDeltaSec)}`
      : offer.etaDeltaSec < -30
        ? `${formatMinutes(-offer.etaDeltaSec)} faster`
        : 'similar ETA';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🚦 Keep moving?</Text>
        <Text style={styles.countdown}>{Math.max(secondsLeft, 0)}s</Text>
      </View>
      <Text style={styles.reason}>{offer.reason}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.saved}>
          Avoids ~{formatMinutes(offer.jamTimeSavedSec)} stopped
        </Text>
        <Text style={styles.delta}>{etaLabel}</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.stayBtn} onPress={onDismiss}>
          <Text style={styles.stayText}>Stay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
          <Text style={styles.acceptText}>
            Switch {offer.alternate.summary}
          </Text>
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
    borderLeftWidth: 6,
    borderLeftColor: '#c62828',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  countdown: { fontSize: 14, fontWeight: '700', color: '#999' },
  reason: { fontSize: 14, color: '#444', marginTop: 8, lineHeight: 20 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saved: { fontSize: 13, fontWeight: '700', color: '#0a7d36' },
  delta: { fontSize: 13, fontWeight: '600', color: '#555' },
  buttonRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
  stayBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  stayText: { fontSize: 15, fontWeight: '600', color: '#555' },
  acceptBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0a7d36',
    alignItems: 'center',
  },
  acceptText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
});
