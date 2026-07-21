'use client';

import * as React from 'react';
import { RefreshCw } from 'lucide-react';

export interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [startY, setStartY] = React.useState(0);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const threshold = 70;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
      setPullDistance(Math.min(diff * 0.5, threshold + 20));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setStartY(0);
      }
    } else {
      setPullDistance(0);
      setStartY(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex-1 overflow-y-auto"
    >
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center py-2 transition-transform"
          style={{ height: `${pullDistance}px`, opacity: pullDistance / threshold }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary bg-surface-elevated px-3 py-1.5 rounded-full shadow-soft border border-border-subtle">
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'Memuat ulang...' : 'Tarik untuk memperbarui'}</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export default PullToRefresh;
