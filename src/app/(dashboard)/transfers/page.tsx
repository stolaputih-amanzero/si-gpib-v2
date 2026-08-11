import { TransferWorkspaceShell } from '@/components/transfers/TransferWorkspaceShell';

export async function generateMetadata() {
  return {
    title: `Pastoral Transfer Workspace | SI GPIB`,
  };
}

export default function PastoralTransfersPage() {
  return <TransferWorkspaceShell />;
}
