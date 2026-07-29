export function haptic(type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      selection: [5],
      success: [10, 50, 10],
      error: [50, 100, 50],
    };
    navigator.vibrate(patterns[type]);
  }
}

haptic.light = () => haptic('light');
haptic.medium = () => haptic('medium');
haptic.heavy = () => haptic('heavy');
haptic.selection = () => haptic('selection');
haptic.success = () => haptic('success');
haptic.error = () => haptic('error');
