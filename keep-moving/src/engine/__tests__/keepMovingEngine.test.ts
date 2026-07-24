import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CongestionLevel, Route, RouteSegment } from '../../types';
import type { RerouteConfig } from '../../config';
import {
  evaluateReroute,
  jamTimeAhead,
  routeKey,
  shouldSuppressOffer,
  type AntiNagState,
} from '../keepMovingEngine';

const cfg: RerouteConfig = {
  checkIntervalMs: 45_000,
  lookaheadSec: 600,
  minJamAheadSec: 120,
  maxEtaPenaltySec: 600,
  minJamSavingSec: 90,
  offerCooldownMs: 180_000,
  offRouteThresholdM: 50,
  noOfferFinalSec: 300,
  silentSwitchGainSec: 60,
  jamWeight: 3,
  reofferImprovementSec: 60,
};

/**
 * Build a straight north-heading route out of (congestion, meters, kmh)
 * blocks. Points are laid every 100 m so index math mirrors production data.
 */
function makeRoute(
  summary: string,
  blocks: Array<[CongestionLevel, number, number]>,
): Route {
  const points = [];
  const segments: RouteSegment[] = [];
  let index = 0;
  let lat = 47.6;
  let durationSec = 0;
  let distanceMeters = 0;
  points.push({ latitude: lat, longitude: -122.3 });
  for (const [congestion, meters, kmh] of blocks) {
    const steps = Math.max(1, Math.round(meters / 100));
    const startIndex = index;
    for (let i = 0; i < steps; i++) {
      lat += 0.0009; // ~100 m
      points.push({ latitude: lat, longitude: -122.3 });
      index++;
    }
    segments.push({
      startIndex,
      endIndex: index,
      congestion,
      lengthMeters: meters,
      expectedSpeedKmh: kmh,
    });
    durationSec += meters / (kmh / 3.6);
    distanceMeters += meters;
  }
  return {
    id: summary,
    points,
    segments,
    durationSec,
    staticDurationSec: distanceMeters / (60 / 3.6),
    distanceMeters,
    summary,
  };
}

test('jamTimeAhead counts jam within the lookahead window only', () => {
  // 5 km free @60 (300s), then 1 km jam @8 (450s), then free.
  const route = makeRoute('via Test', [
    ['FREE', 5000, 60],
    ['JAM', 1000, 8],
    ['FREE', 5000, 60],
  ]);
  const { jamSec } = jamTimeAhead(route, 0, 600);
  // Jam starts at t=300s; only 300s of it fits in the 600s window.
  assert.ok(Math.abs(jamSec - 300) < 20, `expected ~300, got ${jamSec}`);
  const full = jamTimeAhead(route, 0, 100_000);
  assert.ok(Math.abs(full.jamSec - 450) < 20, `expected ~450, got ${full.jamSec}`);
});

test('no offer when the road ahead is clear', () => {
  const current = makeRoute('via Main', [['FREE', 10_000, 60]]);
  const alt = makeRoute('via Side', [['FREE', 12_000, 45]]);
  const decision = evaluateReroute({
    current,
    candidates: [alt],
    sustainedSlow: false,
    cfg,
    now: 0,
  });
  assert.equal(decision.type, 'none');
});

test('jam ahead triggers an offer for a slower but moving alternate', () => {
  // Current: 2 km to a 1 km jam, ~16.5 min total. Alternate: clear but
  // ~18 min — slower overall, which is exactly when Keep Moving should ask.
  const current = makeRoute('via Main', [
    ['FREE', 2000, 60],
    ['JAM', 1000, 8],
    ['FREE', 7000, 60],
  ]);
  const alt = makeRoute('via Side', [['FREE', 12_000, 40]]);
  const decision = evaluateReroute({
    current,
    candidates: [alt],
    sustainedSlow: false,
    cfg,
    now: 123,
  });
  assert.equal(decision.type, 'offer');
  if (decision.type === 'offer') {
    assert.equal(decision.offer.alternate.summary, 'via Side');
    assert.ok(decision.offer.etaDeltaSec > 0, 'alternate is slower yet offered');
    assert.ok(decision.offer.jamTimeSavedSec >= cfg.minJamSavingSec);
  }
});

test('alternates beyond the ETA penalty cap are never offered', () => {
  const current = makeRoute('via Main', [
    ['FREE', 2000, 60],
    ['JAM', 1000, 8],
  ]);
  // ~26 min vs ~8.5 min remaining: way past the 10 min penalty cap.
  const alt = makeRoute('via Detour', [['FREE', 26_000, 60]]);
  const decision = evaluateReroute({
    current,
    candidates: [alt],
    sustainedSlow: false,
    cfg,
    now: 0,
  });
  assert.equal(decision.type, 'none');
});

test('a plainly faster candidate is switched to silently, not offered', () => {
  const current = makeRoute('via Main', [
    ['FREE', 2000, 60],
    ['JAM', 2000, 8],
    ['FREE', 6000, 60],
  ]);
  const faster = makeRoute('via Bypass', [['FREE', 10_000, 60]]);
  const decision = evaluateReroute({
    current,
    candidates: [faster],
    sustainedSlow: false,
    cfg,
    now: 0,
  });
  assert.equal(decision.type, 'silentSwitch');
});

test('anti-nag: cooldown and declined-route dedupe suppress offers', () => {
  const alt = makeRoute('via Side', [['FREE', 12_000, 52]]);
  const offer = {
    alternate: alt,
    etaDeltaSec: 120,
    jamTimeSavedSec: 300,
    reason: 'test',
    offeredAt: 0,
  };
  const now = 1_000_000;

  const cooldown: AntiNagState = {
    lastOfferDismissedAt: now - 60_000,
    declined: new Map(),
  };
  assert.equal(shouldSuppressOffer(offer, cooldown, now, 2000, cfg), true);

  const declined: AntiNagState = {
    lastOfferDismissedAt: null,
    declined: new Map([[routeKey(alt), 280]]),
  };
  // Improved by only 20s of jam-saving since the decline: stay quiet.
  assert.equal(shouldSuppressOffer(offer, declined, now, 2000, cfg), true);
  // Improved by 200s: allowed through.
  declined.declined.set(routeKey(alt), 100);
  assert.equal(shouldSuppressOffer(offer, declined, now, 2000, cfg), false);

  const nearArrival: AntiNagState = { lastOfferDismissedAt: null, declined: new Map() };
  assert.equal(shouldSuppressOffer(offer, nearArrival, now, 200, cfg), true);
});
