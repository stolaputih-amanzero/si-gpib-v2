import { redirect } from 'next/navigation';

export default function LegacyDashboardAidRequestsRedirect() {
  redirect('/aid-requests');
}
