/**
 * Haptic feedback helper
 * Triggers device vibration on supported devices
 */
export const haptic = {
  light: () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
  },
  heavy: () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
  },
  selection: () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5);
    }
  },
  success: () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  },
  error: () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }
  }
};
