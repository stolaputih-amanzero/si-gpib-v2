'use client';

import React from 'react';
import { PrivacyNotice } from './PrivacyNotice';

export interface PrivacyGuardProps {
  canAccess: boolean;
  sectionName?: 'keluarga' | 'biometric' | 'aktivitas' | 'umum';
  message?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PrivacyGuard({
  canAccess,
  sectionName = 'umum',
  message,
  fallback,
  children,
}: PrivacyGuardProps) {
  if (!canAccess) {
    if (fallback) return <>{fallback}</>;
    return <PrivacyNotice sectionName={sectionName} message={message} />;
  }

  return <>{children}</>;
}

export default PrivacyGuard;
