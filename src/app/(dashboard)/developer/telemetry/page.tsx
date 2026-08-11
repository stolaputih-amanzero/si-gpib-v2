import { Metadata } from 'next';
import { TelemetryWorkspaceShell } from '@/components/developer/telemetry/TelemetryWorkspaceShell';

export const metadata: Metadata = {
  title: 'Observabilitas Stream Telemetri (Developer Telemetry) | SI-GPIB',
  description: 'Pemantauan stream event transaksional real-time dengan pemulihan replay sequence & perlindungan Zero-PII.'
};

export default function DeveloperTelemetryPage() {
  return <TelemetryWorkspaceShell />;
}
