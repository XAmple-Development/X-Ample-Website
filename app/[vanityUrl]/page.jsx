import { redirect } from 'next/navigation';
import { getSettings } from '../../utils/settingsServer';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function VanityRedirect({ params }) {
  const { vanityUrl } = await params;
  const settings = await getSettings();
  
  const vanityLinks = settings?.general?.settings?.vanity_links?.settings?.links || [];
  const link = vanityLinks.find((l) => l.path === vanityUrl);
  
  if (!link || !link.url) {
    return notFound();
  }
  
  redirect(link.url);
}

