import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function DemoModeBanner() {
  return (
    <View style={styles.pill} pointerEvents="none">
      <Text style={styles.text}>DEMO MODE — simulated traffic</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(16, 20, 24, 0.85)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    zIndex: 20,
  },
  text: {
    color: '#ffd54f',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
