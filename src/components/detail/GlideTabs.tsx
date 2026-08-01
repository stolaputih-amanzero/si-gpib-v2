'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';

export interface TabOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

export interface GlideTabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function GlideTabs({ tabs, activeTab, onChange, className }: GlideTabsProps) {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const updateSlider = () => {
    const activeEl = tabRefs.current.get(activeTab);
    if (activeEl) {
      setSliderStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  };

  useEffect(() => {
    updateSlider();
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [activeTab, tabs]);

  return (
    <div
      className={cn(
        'relative border-b border-border-subtle bg-surface-1/90 backdrop-blur-md px-2 overflow-x-auto scrollbar-none select-none touch-pan-x',
        className
      )}
    >
      <div className="flex items-center gap-1 relative min-w-max">
        {/* Sliding Indicator (60fps CSS transform) */}
        <div
          className="absolute bottom-0 h-0.5 bg-brand-primary transition-all duration-300 ease-ios pointer-events-none rounded-full"
          style={{
            transform: `translate3d(${sliderStyle.left}px, 0, 0)`,
            width: `${sliderStyle.width}px`,
          }}
        />

        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              type="button"
              onClick={() => {
                if (!isActive) {
                  haptic.selection();
                  onChange(tab.id);
                }
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-3 min-h-[48px] text-xs font-bold transition-colors shrink-0 rounded-t-xl',
                isActive
                  ? 'text-brand-primary'
                  : 'text-text-muted hover:text-text-high hover:bg-surface-sunken/50'
              )}
            >
              {tab.icon && (
                <span className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand-primary' : 'text-text-tertiary')}>
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>

              {tab.badge !== undefined && tab.badge !== null && tab.badge !== '' && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 text-[10px] font-extrabold rounded-full tabular-nums',
                    isActive
                      ? 'bg-brand-primary/15 text-brand-primary'
                      : 'bg-surface-sunken text-text-tertiary'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GlideTabs;
