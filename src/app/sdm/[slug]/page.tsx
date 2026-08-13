import { redirect } from 'next/navigation';

export default function LegacySdmSlugRedirect() {
  redirect('/people');
}
