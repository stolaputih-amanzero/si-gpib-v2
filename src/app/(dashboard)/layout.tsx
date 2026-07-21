'use client';

import { useState } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import Sidebar from '@/components/layout/Sidebar';
import MobileHeaderBreadcrumb from '@/components/layout/MobileHeaderBreadcrumb';
import MobileDrawer from '@/components/layout/MobileDrawer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">
      {/* Desktop Sidebar (Collapsible) */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative min-w-0 overflow-hidden">
        {/* Mobile Top Breadcrumb Header */}
        <MobileHeaderBreadcrumb onOpenDrawer={() => setIsMobileDrawerOpen(true)} />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto pb-32 md:pb-8 px-4 sm:px-6 md:px-8 pt-4">
          <div className="max-w-6xl mx-auto min-h-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <BottomNav onOpenDrawer={() => setIsMobileDrawerOpen(true)} />
        </div>

        {/* Mobile Slide-over Navigation Drawer */}
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
        />
      </div>
    </div>
  );
}
