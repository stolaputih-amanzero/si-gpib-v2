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
        {/* Mobile Header (optional if you want a top bar on mobile) */}
        <div className="md:hidden h-14 border-b border-gray-100 flex items-center justify-center bg-surface-elevated z-10 flex-shrink-0">
          <h1 className="font-bold text-brand-primary text-lg">SI GPIB</h1>
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 px-4 py-6 md:px-8">
          <div className="max-w-6xl mx-auto h-full">
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
