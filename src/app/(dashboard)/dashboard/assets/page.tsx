import { redirect } from 'next/navigation';

export default function LegacyDashboardAssetsRedirect() {
  redirect('/assets');
}
