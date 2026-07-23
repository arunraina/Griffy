import { redirect, notFound } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const PATH_BY_TYPE: Record<string, string> = {
  contractor: '/contractors',
  labour: '/labour',
  'service-expert': '/service-experts',
};

// Canonical "I don't know if they're a contractor, labour, or expert" link --
// /profile/<userId> resolves the role server-side and redirects to the real
// page (/contractors/[id], /labour/[id], /service-experts/[id]). Those
// existing per-type URLs stay the actual indexed/shared URLs; this route is
// purely a lookup convenience, so it doesn't touch the SEO structure already
// built around them.
export default async function ProfileLookupPage({ params }: { params: { userId: string } }) {
  let result: { type: string; profileId: string } | null = null;
  try {
    const res = await fetch(`${API_BASE}/profile-lookup/${params.userId}`, { next: { revalidate: 30 } });
    if (res.ok) result = await res.json();
  } catch {
    result = null;
  }

  const path = result ? PATH_BY_TYPE[result.type] : undefined;
  if (!result || !path) notFound();

  redirect(`${path}/${result.profileId}`);
}
