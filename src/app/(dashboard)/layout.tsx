'use client';

import Sidebar from '@/components/layout/Sidebar';
import MobileHeader from '@/components/layout/MobileHeader';
import { SuperBottomNav } from '@/components/mobile/SuperBottomNav/SuperBottomNav';
import { ReadOnlyNoticeBanner } from '@/components/auth/ReadOnlyNoticeBanner';
import { PosProvider } from '@/stores/pos-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PosProvider>
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
            <ReadOnlyNoticeBanner />
            {children}
          </div>
        </main>

        {/* Super Bottom Navigation */}
        <SuperBottomNav />
      </div>
    </div>
    </PosProvider>
  );
}
