# Keep Moving 🚗💨

A navigation app with one philosophy: **never sit in traffic**.

Ordinary navigation apps optimise for arrival time and will happily park you
in a 15-minute crawl if it's nominally "fastest". Keep Moving re-evaluates
your route continuously while you drive, and the moment you're heading into
heavy traffic it offers you an alternate route that keeps the car moving —
even when that alternate adds a few minutes. Moving beats stopped.

Built with React Native + Expo (TypeScript). Traffic-aware routing comes from
the Google Maps Platform **Routes API** (whose live traffic data is partly fed
by Waze). Without an API key the app runs in a fully scripted **demo mode**,
so you can see the whole experience before setting anything up.

## Run it in 2 minutes (demo mode, no API key)

1. Install [Node.js](https://nodejs.org) 20 or newer on your computer.
2. Install **Expo Go** on your phone (free — App Store / Google Play).
3. In this folder:

   ```bash
   npm install
   npx expo start
   ```

4. Scan the QR code with your phone (Camera app on iOS, Expo Go on Android).
   Phone and computer must be on the same Wi-Fi; if that's awkward, run
   `npx expo start --tunnel` instead.

### Demo script

1. Tap the search bar and pick **Sea-Tac Airport** (any demo destination works).
2. You'll see the primary route with traffic colouring and two grey alternates.
   Press **Start**.
3. A simulated car drives the route at 5× speed. About 45 seconds in, a red
   traffic jam materialises ahead and the **Keep moving?** card slides up:
   switch to a moving route for roughly a minute of extra ETA, avoiding
   ~3 minutes of stopped traffic.
4. Accept it and watch the car take the detour — or press **Stay** and watch
   it crawl through the jam at 8 km/h. Your call. The app's whole point is
   that it asks.

The yellow **DEMO MODE** pill is shown whenever the app is running on
simulated data.

## Going live with real traffic

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com)
   and enable billing (Google gives a substantial free monthly credit).
2. Enable two APIs: **Routes API** and **Places API (New)**.
3. Create an API key and **restrict it to those two APIs**. This matters:
   `EXPO_PUBLIC_*` values are embedded in the app's JS bundle, so an
   unrestricted key would be exposed.
4. In this folder:

   ```bash
   cp .env.example .env
   # paste your key into .env
   npx expo start
   ```

With a key present the app uses your real GPS position, real destination
search, and live Google traffic. Quota maths: while navigating, the app
re-checks routes every 45 s ≈ 80 Routes API calls per driving hour.

## Platform notes

- **Map tiles:** in Expo Go the map uses the platform default provider —
  Apple tiles on iOS, Google tiles on Android. (The Google tile provider on
  iOS requires a development build, out of scope here.) Routing and traffic
  data are independent of the tile layer: the traffic-coloured route line is
  drawn by the app either way.
- Location permission is only requested in live mode.

## How Keep Moving decides

All thresholds live in [`src/config.ts`](src/config.ts) — tuning is a
one-file edit.

| Setting | Default | Meaning |
| --- | --- | --- |
| `checkIntervalMs` | 45 s live / 15 s demo | How often the route is re-evaluated |
| `lookaheadSec` | 600 | How far ahead (driving time) congestion is examined |
| `minJamAheadSec` | 120 | ≥ this much stop-and-go ahead triggers a reroute check |
| `maxEtaPenaltySec` | 600 | Never offer an alternate more than 10 min slower |
| `minJamSavingSec` | 90 | An alternate must cut jam time by at least this |
| `offerCooldownMs` | 3 min | Silence after you dismiss an offer |
| `jamWeight` | 3 | A minute stopped counts as 3 minutes moving when scoring |
| `noOfferFinalSec` | 300 | No offers in the last 5 minutes of a trip |

A plainly *faster* route with no extra jam is switched to silently — that's
ordinary rerouting. The offer card only appears for the Keep Moving case:
trading a slightly later arrival for staying in motion. Declined routes
aren't re-offered unless they get meaningfully better, so the app never nags.

## Project structure

```
src/
  config.ts             mode selection (mock/live) + all tuning thresholds
  types/                shared domain types (Route, RouteSet, RerouteOffer…)
  engine/               pure decision logic + geometry (unit-tested, no RN)
  state/navStore.ts     navigation state machine (zustand)
  services/
    routing/            RoutingService interface; Google + mock implementations
    places/             destination search; Google Places (New) + mock
    location/           GPS provider; real device + simulated drive
  screens/MapScreen.tsx the single map screen
  components/           search bar, route line, HUD, offer card…
```

Run the engine's unit tests with `npm run test:engine`.
