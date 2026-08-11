import { Metadata } from 'next';
import { AccessControlWorkspaceShell } from '@/components/developer/access-control/AccessControlWorkspaceShell';

export const metadata: Metadata = {
  title: 'Manajemen Kontrol Akses & Inspeksi Kebijakan | SI-GPIB',
  description: 'Observabilitas Policy Decision Point (PDP) server-side terikat RLS PostgreSQL & hirarki organisasi generik.'
};

export default function AccessControlPage() {
  return <AccessControlWorkspaceShell />;
}
