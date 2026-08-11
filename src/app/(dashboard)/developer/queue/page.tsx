import { Metadata } from 'next';
import { BatchWorkspaceShell } from '@/components/developer/queue/BatchWorkspaceShell';

export const metadata: Metadata = {
  title: 'Antrean Mutasi Massal (Mass Import Queue) | SI-GPIB',
  description: 'Ruang kerja pengelolaan impor data massal terisolasi di sys_batch_staging dengan validasi Dry-Run & eksekusi chunked.'
};

export default function MassImportQueuePage() {
  return <BatchWorkspaceShell />;
}
