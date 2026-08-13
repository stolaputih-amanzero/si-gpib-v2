import Link from 'next/link';
import { enforceReadAccess } from '@/lib/authorization/helpers/enforce-read'; 

export async function DemografiSection({ contextId }: { contextId: string }) { 
  await enforceReadAccess('OC-DEMO-002', { targetEntity: { entityId: contextId, entityType: 'Context' } }); 
  return (
    <Link href="/analytics" className="block p-4 border rounded-xl bg-card hover:bg-accent/50 hover:border-primary/30 transition-all cursor-pointer group">
      <h3 className="font-semibold group-hover:text-primary transition-colors">Demografi Pelkat</h3>
    </Link>
  ); 
}
