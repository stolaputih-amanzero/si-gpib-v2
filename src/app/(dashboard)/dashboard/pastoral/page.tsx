import { redirect } from 'next/navigation';

export default function LegacyDashboardPastoralRedirect() {
  redirect('/projections/pastoral-dashboard');
}
