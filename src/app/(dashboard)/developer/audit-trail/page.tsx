import { Metadata } from 'next';
import { AuditTrailWorkspaceShell } from '@/components/developer/audit-trail/AuditTrailWorkspaceShell';

export const metadata: Metadata = {
  title: 'Jejak Audit Kriptografi & Rekonstruksi Komputasi | SI-GPIB',
  description: 'Penyimpanan bukti transaksi imutabel terikat SHA-256 hash-chaining, F12 policy provenance, dan Zero-PII redaction.'
};

export default function AuditTrailPage() {
  return <AuditTrailWorkspaceShell />;
}
