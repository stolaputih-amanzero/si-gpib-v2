import { ReadOnlyNoticeBanner } from '@/components/auth/ReadOnlyNoticeBanner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  return (
    <div className="flex-1 flex flex-col h-full relative min-w-0 overflow-hidden">
      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-36 md:pb-16 px-gutter-mobile md:px-gutter-desktop pt-4 md:pt-6">
        <div className="max-w-7xl mx-auto min-h-full w-full">
          <ReadOnlyNoticeBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
