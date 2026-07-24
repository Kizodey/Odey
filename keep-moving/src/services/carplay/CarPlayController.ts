import { AlertTemplate, CarPlay, MapTemplate } from 'react-native-carplay';
import { formatMinutes } from '../../components/format';
import { useNavStore } from '../../state/navStore';
import { theme } from '../../theme';
import type { NavPhase, RerouteOffer } from '../../types';
import { CarPlayMapScreen } from './CarPlayMapScreen';

/**
 * Mirrors the phone's navigation state machine onto the car display.
 * Only ever loaded through services/carplay/index.ts once the native
 * react-native-carplay module is confirmed present.
 */
export function startCarPlayController(): void {
  let mapTemplate: MapTemplate | null = null;
  let alertUp = false;

  const showOfferAlert = (offer: RerouteOffer) => {
    const extra =
      offer.etaDeltaSec > 30 ? ` (+${formatMinutes(offer.etaDeltaSec)})` : '';
    const alert = new AlertTemplate({
      titleVariants: [
        `Heavy traffic ahead — keep moving${extra}?`,
        'Keep moving?',
      ],
      actions: [
        { id: 'accept', title: `Switch${extra}` },
        { id: 'stay', title: 'Stay' },
      ],
      onActionButtonPressed({ id }) {
        alertUp = false;
        if (id === 'accept') useNavStore.getState().acceptOffer();
        else useNavStore.getState().dismissOffer();
      },
    });
    CarPlay.presentTemplate(alert, true);
    alertUp = true;
  };

  const showArrivedAlert = () => {
    const alert = new AlertTemplate({
      titleVariants: ['You have arrived'],
      actions: [{ id: 'done', title: 'Done' }],
      onActionButtonPressed() {
        alertUp = false;
        useNavStore.getState().acknowledgeArrival();
      },
    });
    CarPlay.presentTemplate(alert, true);
    alertUp = true;
  };

  const dismissAlertIfUp = () => {
    if (alertUp) {
      CarPlay.dismissTemplate(true);
      alertUp = false;
    }
  };

  const syncPhase = (phase: NavPhase) => {
    if (!CarPlay.connected) return;
    const { offer } = useNavStore.getState();
    switch (phase) {
      case 'rerouteOffered':
        if (offer && !alertUp) showOfferAlert(offer);
        break;
      case 'arrived':
        dismissAlertIfUp();
        showArrivedAlert();
        break;
      default:
        // The phone dismissed/accepted the offer (or navigation ended) while
        // the car alert was still up — keep the two screens in agreement.
        dismissAlertIfUp();
        break;
    }
  };

  CarPlay.registerOnConnect(() => {
    mapTemplate = new MapTemplate({
      component: CarPlayMapScreen,
      guidanceBackgroundColor: theme.color.accent,
    });
    CarPlay.setRootTemplate(mapTemplate);
    syncPhase(useNavStore.getState().phase);
  });

  CarPlay.registerOnDisconnect(() => {
    mapTemplate = null;
    alertUp = false;
  });

  useNavStore.subscribe((state, prev) => {
    if (state.phase !== prev.phase) syncPhase(state.phase);
  });
}
