'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ProfileHeaderProps {
  pendeta: {
    nama_lengkap: string;
    jabatan: string;
    status: string;
    foto_url: string | null;
  };
}

export function ProfileHeader({ pendeta }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white border-b">
      <Avatar className="w-24 h-24 mb-4 ring-4 ring-gray-50">
        <AvatarImage src={pendeta.foto_url || undefined} />
        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
          {pendeta.nama_lengkap.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <h2 className="text-xl font-bold mb-1">{pendeta.nama_lengkap}</h2>
      <p className="text-gray-600 mb-3">{pendeta.jabatan}</p>
      <Badge variant={pendeta.status.toLowerCase() === 'aktif' ? 'default' : 'secondary'}>
        {pendeta.status}
      </Badge>
    </div>
  );
}
