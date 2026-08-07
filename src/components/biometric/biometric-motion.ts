'use client';

import { useReducedMotion, useAnimationControls } from 'motion/react';
import type { Variants } from 'motion/react';

/**
 * Variants + kontrol animasi biometrik.
 * Jika user mengaktifkan reduce-motion (NFR-31), shake & pulse
 * dinonaktifkan dan digantikan transisi opacity statis.
 */
export function useBiometricMotion() {
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimationControls();

  const iconVariants: Variants = prefersReducedMotion
    ? { idle: { opacity: 1 }, loading: { opacity: 1 }, success: { opacity: 1 } }
    : {
        idle: { scale: 1, opacity: 1 },
        loading: {
          scale: [1, 1.08, 1],
          opacity: 1,
          transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
        },
        success: {
          scale: [1, 1.25, 1],
          opacity: 1,
          transition: { duration: 0.4, ease: 'easeOut' },
        },
      };

  /** Shake saat autentikasi gagal. No-op jika reduce-motion aktif. */
  const shake = async () => {
    if (prefersReducedMotion) return;
    await controls.start({
      x: [0, -12, 12, -9, 9, -5, 5, 0],
      transition: { duration: 0.45, ease: 'easeInOut' },
    });
  };

  return { prefersReducedMotion, iconVariants, controls, shake };
}
