import { DocumentVaultWorkspaceShell } from '@/components/vault/DocumentVaultWorkspaceShell';

export async function generateMetadata() {
  return {
    title: `Document Vault Workspace | SI GPIB`,
  };
}

export default function DocumentVaultPage() {
  return <DocumentVaultWorkspaceShell />;
}
