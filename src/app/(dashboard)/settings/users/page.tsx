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
    <div className="min-h-screen bg-surface-base pb-20">
      <MobileHeader title="Manajemen Pengguna" showBack />
      <div className="p-4 space-y-4 mt-16">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Cari pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-elevated border-border-subtle text-text-high placeholder:text-text-muted/60"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface-elevated border border-border-subtle rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {users?.map((user) => (
              <Card
                key={user.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-surface-elevated border-border-subtle hover:bg-surface-sunken"
                onClick={() => router.push(`/settings/users/${user.id_pendeta || user.id}`)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border border-border-subtle">
                    <AvatarImage src={user.foto_url || undefined} />
                    <AvatarFallback className="bg-surface-sunken text-text-muted">
                      <User className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-text-high truncate">{user.nama_lengkap}</p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="secondary" className="text-[10px] bg-brand-primary/10 text-brand-primary border border-brand-primary/20">{user.role}</Badge>
                    <p className="text-[10px] text-text-muted mt-1">{user.status}</p>
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
