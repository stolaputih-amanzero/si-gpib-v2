'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';

interface ForensicWatermarkProps {
  label?: string;
  className?: string;
}

export function ForensicWatermark({ label = 'SI GPIB CONFIDENTIAL', className = '' }: ForensicWatermarkProps) {
  const { data: currentUser } = useCurrentUser();
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(
        now.toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const userEmail = currentUser?.email || 'authenticated-user';
  const watermarkText = `${userEmail} • ${timestamp} • ${label}`;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-40 select-none overflow-hidden opacity-[0.035] dark:opacity-[0.055] ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='220px' width='450px'><text transform='translate(40, 160) rotate(-24)' fill='%2364748b' font-size='12' font-family='sans-serif' font-weight='bold'>${encodeURIComponent(
          watermarkText
        )}</text></svg>")`,
      }}
    />
  );
}
