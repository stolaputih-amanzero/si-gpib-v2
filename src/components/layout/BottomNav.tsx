'use client';

import { BottomNavigation } from '@/components/mobile/BottomNavigation';

export interface BottomNavProps {
  onOpenDrawer?: () => void;
  onFabClick?: () => void;
}

export function BottomNav({ onOpenDrawer, onFabClick }: BottomNavProps) {
  return <BottomNavigation onFabClick={onFabClick || onOpenDrawer || (() => {})} />;
}

export default BottomNav;
