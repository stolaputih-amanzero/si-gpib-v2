'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileHeader from '@/components/layout/MobileHeader';
import BottomNavigation from '@/components/mobile/BottomNavigation';
import QuickActionSheet from '@/components/mobile/QuickActionSheet';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">
      {/* Desktop Sidebar (Collapsible with grouped navigation) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative min-w-0 overflow-hidden">
        {/* Mobile Header (Dynamic Title & Back Button, NO Breadcrumbs duplication) */}
        <MobileHeader />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 px-4 sm:px-6 md:px-8 pt-4 sm:pt-6">
          <div className="max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation (5 items: Peta, Struktur, FAB, Pos & Bajem, Pengaturan) */}
        <BottomNavigation onFabClick={() => setIsQuickActionOpen(true)} />

        {/* FAB Quick Action Sheet (Mobile Bottom Sheet Modal) */}
        <QuickActionSheet
          isOpen={isQuickActionOpen}
          onClose={() => setIsQuickActionOpen(false)}
        />
      </div>
    </div>
  );
}
