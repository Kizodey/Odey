import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

type Props = {
  /** While true the splash covers the app; on false it fades out and unmounts. */
  visible: boolean;
};

/**
 * JS-side branded splash. The OS-level splash (expo-splash-screen, same
 * artwork) shows from process start; this overlay takes over once React is
 * up and holds until the map is ready, then fades so there's never a flash
 * of half-loaded UI.
 */
export function BrandedSplash({ visible }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!visible) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => setGone(true));
    }
  }, [visible, opacity]);

  if (gone) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <Image
        source={require('../../assets/splash-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>finding your way…</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  logo: { width: 260, height: 260 },
  tagline: {
    position: 'absolute',
    bottom: 64,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
