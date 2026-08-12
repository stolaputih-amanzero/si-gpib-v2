import { getServerContext } from '@/lib/utils/context';
import Sidebar from '@/components/layout/Sidebar';
import MobileHeader from '@/components/layout/MobileHeader';
import { SuperBottomNav } from '@/components/mobile/SuperBottomNav/SuperBottomNav';
import { ReadOnlyNoticeBanner } from '@/components/auth/ReadOnlyNoticeBanner';
import { ActiveContextProvider } from '@/stores/active-context';

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
      <div className="flex h-screen bg-[#0B1220] overflow-hidden">
      {/* Desktop Sidebar (Collapsible with grouped navigation) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative min-w-0 overflow-hidden">
        {/* Mobile Header (Dynamic Title & Back Button, NO Breadcrumbs duplication) */}
        <MobileHeader />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-36 md:pb-16 px-gutter-mobile md:px-gutter-desktop pt-4 md:pt-6">
          <div className="max-w-7xl mx-auto min-h-full w-full">
            <ReadOnlyNoticeBanner />
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
