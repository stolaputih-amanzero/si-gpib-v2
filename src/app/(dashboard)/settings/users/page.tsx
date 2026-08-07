'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, User } from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';

export default function UsersListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-list', search],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from('users')
        .select('id, nama_lengkap, email, role, status, foto_url, id_pendeta')
        .order('nama_lengkap', { ascending: true });

      if (search) {
        query = query.or(`nama_lengkap.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Manajemen Pengguna" showBack />
      <div className="p-4 space-y-4 mt-16">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {users?.map((user) => (
              <Card
                key={user.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/settings/users/${user.id_pendeta || user.id}`)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.foto_url || undefined} />
                    <AvatarFallback>
                      <User className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{user.nama_lengkap}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-[10px]">{user.role}</Badge>
                    <p className="text-[10px] text-gray-500 mt-1">{user.status}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
