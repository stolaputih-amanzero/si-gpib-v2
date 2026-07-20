import BottomNav from '@/components/layout/BottomNav';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Scrollable Content Area - Flush on Mobile so sticky page headers fit seamlessly */}
        <main className="flex-1 overflow-y-auto pb-32 md:pb-8 px-0 md:px-8">
          <div className="max-w-6xl mx-auto min-h-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

