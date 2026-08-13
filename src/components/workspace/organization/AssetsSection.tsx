import Link from 'next/link';
import { enforceReadAccess } from '@/lib/authorization/helpers/enforce-read'; 

export async function AssetsSection({ contextId }: { contextId: string }) { 
  await enforceReadAccess('OC-ASSET-004', { targetEntity: { entityId: contextId, entityType: 'Context' } }); 
  return (
    <Link href="/assets" className="block p-4 border rounded-xl bg-card hover:bg-accent/50 hover:border-primary/30 transition-all cursor-pointer group">
      <h3 className="font-semibold group-hover:text-primary transition-colors">Aset & Inventaris</h3>
    </Link>
  ); 
}
