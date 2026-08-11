import { OfflineSyncWorkspaceShell } from '@/components/offline/OfflineSyncWorkspaceShell';

export async function generateMetadata() {
  return {
    title: `PWA Offline Queue & Sync Workspace | SI GPIB`,
  };
}

export default function OfflineSyncPage() {
  return <OfflineSyncWorkspaceShell />;
}
