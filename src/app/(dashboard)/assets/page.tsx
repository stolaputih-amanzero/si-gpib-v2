import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';

export default async function AssetsCatalogWorkspacePage() {
  const context = await getServerContext();
  const contextId = context?.context_id;

  if (context?.status === 'CONTEXT_STALE' || !contextId) {
    redirect('/context-selection');
  }

  // Redirect root /assets to the specific context-aware asset workspace
  redirect(`/assets/${contextId}`);
}
