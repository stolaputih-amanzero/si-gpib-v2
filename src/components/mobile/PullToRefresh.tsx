'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleTouchStart = () => {
    if (window.scrollY === 0) setPullDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !refreshing) {
      const distance = Math.min(e.touches[0].clientY / 3, 80);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {pullDistance > 0 && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform"
          style={{
            transform: `translateY(${pullDistance - 40}px)`,
            opacity: pullDistance > 0 ? 1 : 0,
          }}
        >
          <RefreshCw className={cn("w-6 h-6 text-brand-primary", refreshing && "animate-spin")} />
        </div>
      )}
      <div style={{ paddingTop: pullDistance }}>
        {children}
      </div>
    </div>
  );
}

export default PullToRefresh;
