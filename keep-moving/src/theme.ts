/**
 * WAVE theme — Waze-inspired: chunky rounded cards, pill buttons, purple/blue
 * palette, friendly map furniture. All visual tokens live here.
 */
export const theme = {
  route: {
    FREE: '#4a67f5',
    SLOW: '#ffb300',
    JAM: '#ff3b6b',
    alt: 'rgba(122,138,220,0.5)',
    width: 8,
    altWidth: 4,
  },
  color: {
    accent: '#6b46e5',
    accentSoft: '#eef0fa',
    text: '#243056',
    subtext: '#8a90b3',
    saved: '#00a86b',
    danger: '#ff3b6b',
    cardBg: '#ffffff',
    carBubble: '#4a67f5',
    shadow: 'rgba(59,48,140,0.4)',
  },
  radius: {
    card: 26,
    pill: 999,
    fab: 24,
  },
  shadow: {
    card: {
      shadowColor: '#3b308c',
      shadowOpacity: 0.22,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
  },
} as const;
