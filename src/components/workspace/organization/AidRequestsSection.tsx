import Link from 'next/link';
import { enforceReadAccess } from '@/lib/authorization/helpers/enforce-read'; 

export async function AidRequestsSection({ contextId }: { contextId: string }) { 
  await enforceReadAccess('OC-ORG-004', { targetEntity: { entityId: contextId, entityType: 'Context' } }); 
  return (
    <Link href="/aid-requests" className="block p-4 border rounded-xl bg-card hover:bg-accent/50 hover:border-primary/30 transition-all cursor-pointer group">
      <h3 className="font-semibold group-hover:text-primary transition-colors">Pengajuan Bantuan</h3>
    </Link>
  ); 
}
