import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Keep Moving',
  slug: 'keep-moving',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: false,
    // CarPlay navigation entitlement — Apple grants this on application
    // (https://developer.apple.com/contact/carplay). Harmless until then in
    // dev builds; App Store builds are rejected if it's present but ungranted.
    entitlements: {
      'com.apple.developer.carplay-maps': true,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Keep Moving uses your location to navigate and keep you out of traffic.',
      // CarPlay scene wiring (native builds only; Expo Go ignores it). The
      // CarSceneDelegate class comes from carplay-native/ — added to the Xcode
      // project after `expo prebuild`; see README "Apple CarPlay".
      UIApplicationSceneManifest: {
        UIApplicationSupportsMultipleScenes: true,
        UISceneConfigurations: {
          CPTemplateApplicationSceneSessionRoleApplication: [
            {
              UISceneClassName: 'CPTemplateApplicationScene',
              UISceneConfigurationName: 'CarPlay',
              UISceneDelegateClassName: 'CarSceneDelegate',
            },
          ],
        },
      },
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
  },
  extra: {
    googleApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? null,
    forceMockMode: process.env.EXPO_PUBLIC_FORCE_MOCK === '1',
  },
};

export default config;
