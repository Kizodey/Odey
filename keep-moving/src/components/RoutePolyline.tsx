import React from 'react';
import { Polyline } from 'react-native-maps';
import type { Route } from '../types';

const CONGESTION_COLORS = {
  FREE: '#2e7d32',
  SLOW: '#f9a825',
  JAM: '#c62828',
} as const;

type Props = {
  route: Route;
  /** Dim gray rendering for non-active alternates. */
  dimmed?: boolean;
};

export function RoutePolyline({ route, dimmed = false }: Props) {
  if (dimmed) {
    return (
      <Polyline
        coordinates={route.points}
        strokeWidth={4}
        strokeColor="rgba(120, 120, 120, 0.55)"
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
          strokeWidth={6}
          strokeColor={CONGESTION_COLORS[seg.congestion]}
          zIndex={2}
        />
      ))}
    </>
  );
}
