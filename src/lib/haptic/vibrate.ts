// src/lib/haptic/vibrate.ts
export function haptic(type: 'success' | 'error' | 'warning' | 'selection' | 'light' | 'medium') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  switch (type) {
    case 'success':
      navigator.vibrate([50, 50, 50]);
      break;
    case 'error':
      navigator.vibrate([100, 50, 100, 50, 100]);
      break;
    case 'warning':
      navigator.vibrate([100, 100]);
      break;
    case 'selection':
    case 'light':
      navigator.vibrate(20);
      break;
    case 'medium':
      navigator.vibrate(40);
      break;
  }
}

haptic.success = () => haptic('success');
haptic.error = () => haptic('error');
haptic.warning = () => haptic('warning');
haptic.selection = () => haptic('selection');
haptic.light = () => haptic('light');
haptic.medium = () => haptic('medium');
