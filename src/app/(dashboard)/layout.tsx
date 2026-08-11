import { getServerContext } from '@/lib/utils/context';
import Sidebar from '@/components/layout/Sidebar';
import MobileHeader from '@/components/layout/MobileHeader';
import { SuperBottomNav } from '@/components/mobile/SuperBottomNav/SuperBottomNav';
import { ReadOnlyNoticeBanner } from '@/components/auth/ReadOnlyNoticeBanner';
import { ActiveContextProvider } from '@/stores/active-context';
import { SyncManagerSheet } from '@/components/offline/SyncManagerSheet';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contextData = await getServerContext();
  
  // Remove redirect logic for now to prevent infinite redirect loops during transition
  // We'll let page components handle authentication gaps or empty context

  return (
    <ActiveContextProvider initialContextId={contextData.context_id}>
      <div className="flex h-screen bg-surface-base overflow-hidden">
      {/* Desktop Sidebar (Collapsible with grouped navigation) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative min-w-0 overflow-hidden">
        {/* Mobile Header (Dynamic Title & Back Button, NO Breadcrumbs duplication) */}
        <MobileHeader />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-28 md:pb-12 px-3 sm:px-6 md:px-8 pt-3 sm:pt-6">
          <div className="max-w-7xl mx-auto min-h-full">
            <ReadOnlyNoticeBanner />
            <div className="flex justify-end mb-4">
              <SyncManagerSheet />
            </div>
            {children}
          </div>
        </main>

        {/* Super Bottom Navigation */}
        <SuperBottomNav />
      </div>
    </div>
    </ActiveContextProvider>
  );
}
