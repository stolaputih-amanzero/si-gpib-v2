import { Profile360View } from '@/components/pendeta/Profile360View';
import { MobileHeader } from '@/components/mobile/MobileHeader';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Profile 360°" showBack />
      <main className="pt-16">
        <Profile360View idPendeta={id} />
      </main>
    </div>
  );
}
