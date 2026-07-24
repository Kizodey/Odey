import React from 'react';
import { Polyline } from 'react-native-maps';
import { theme } from '../theme';
import type { Route } from '../types';

const CONGESTION_COLORS = {
  FREE: theme.route.FREE,
  SLOW: theme.route.SLOW,
  JAM: theme.route.JAM,
} as const;

type Props = {
  route: Route;
  /** Dimmed rendering for non-active alternates. */
  dimmed?: boolean;
};

export function RoutePolyline({ route, dimmed = false }: Props) {
  if (dimmed) {
    return (
      <Polyline
        coordinates={route.points}
        strokeWidth={theme.route.altWidth}
        strokeColor={theme.route.alt}
        zIndex={1}
      />
    );
  }
  return (
    <>
      {route.segments.map((seg) => (
        <Polyline
          key={`${route.id}-${seg.startIndex}`}
          coordinates={route.points.slice(seg.startIndex, seg.endIndex + 1)}
          strokeWidth={theme.route.width}
          strokeColor={CONGESTION_COLORS[seg.congestion]}
          zIndex={2}
        />
      ))}
    </>
  );
}
