import { redirect } from 'next/navigation';

export default function LegacyDashboardOrgListRedirect() {
  redirect('/org');
}
