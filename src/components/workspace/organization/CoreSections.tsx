import { enforceReadAccess } from '@/lib/authorization/helpers/enforce-read';

export async function OverviewSection({ contextId }: { contextId: string }) {
  // Selalu ada, gunakan contract read umum organisasi
  await enforceReadAccess('OC-ORG-004', { targetEntity: { entityId: contextId, entityType: 'Context' } });
  
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border bg-card">
      <h2 className="text-lg font-bold">Overview</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-muted rounded-lg flex flex-col justify-center items-center">
          <span className="text-2xl font-bold">120</span>
          <span className="text-xs text-muted-foreground">Total Jemaat</span>
        </div>
        <div className="p-3 bg-muted rounded-lg flex flex-col justify-center items-center">
          <span className="text-2xl font-bold">45</span>
          <span className="text-xs text-muted-foreground">SDM Aktif</span>
        </div>
      </div>
    </div>
  );
}

export async function IdentitySection({ contextId }: { contextId: string }) {
  // Selalu ada
  await enforceReadAccess('OC-ORG-004', { targetEntity: { entityId: contextId, entityType: 'Context' } });
  
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
        {contextId.substring(0, 3)}
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">{contextId}</h3>
        <p className="text-sm text-muted-foreground">Profil Organisasi</p>
      </div>
    </div>
  );
}
