import type { Metadata } from 'next';
import ContractorDetailClient from './ContractorDetailClient';
import { buildMetadata } from '@/lib/seo';
import { fetchPublicServiceItems } from '@/lib/serviceItems';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchProfile(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/contractor-profiles/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchReviews(id: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/reviews?targetType=CONTRACTOR&targetId=${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

// Every contractor profile page previously inherited the listing layout's
// generic "Find Verified Contractors..." title -- a duplicate <title> across
// every single profile. This gives each one a unique, entity-specific tag.
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const raw = await fetchProfile(params.id);
  if (!raw) return buildMetadata({ title: 'Contractor not found', description: 'This profile may have been removed or is unavailable.', path: `/contractors/${params.id}` });

  const name = raw.user?.name ?? 'Contractor';
  const city = raw.serviceCities?.[0];
  const type = raw.contractorType ?? 'Contractor';
  const rating = raw.avgRating ? Number(raw.avgRating).toFixed(1) : null;

  return buildMetadata({
    title: `${name} — ${type}${city ? ` in ${city}` : ''}`,
    description: `${name}${city ? `, ${type} in ${city}` : `, ${type}`}.${rating ? ` Rated ${rating}/5` : ''}${raw.totalReviews ? ` from ${raw.totalReviews} reviews` : ''} on Griffy — India's construction marketplace.`,
    path: `/contractors/${params.id}`,
    type: 'profile',
    image: raw.user?.avatarUrl ?? undefined,
  });
}

export default async function ContractorDetailPage({ params }: { params: { id: string } }) {
  const [raw, reviews, serviceItems] = await Promise.all([
    fetchProfile(params.id),
    fetchReviews(params.id),
    fetchPublicServiceItems('contractor', params.id),
  ]);

  if (!raw) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-[#2C1810]">Contractor not found</p>
          <p className="text-sm text-[#A08070] mt-2">This profile may have been removed or is unavailable.</p>
        </div>
      </div>
    );
  }

  const profile = {
    id:              raw.id,
    userId:          raw.userId as string,
    name:            raw.user?.name ?? 'Unknown',
    avatarUrl:       raw.user?.avatarUrl ?? null,
    contractorType:  raw.contractorType ?? 'Contractor',
    tradeSkills:     raw.tradeSkills ?? [],
    serviceCities:   raw.serviceCities ?? [],
    experience:      raw.experience ?? '',
    dailyRate:       raw.dailyRate != null ? Number(raw.dailyRate) : null,
    projectRate:     raw.projectRate != null ? Number(raw.projectRate) : null,
    availability:    raw.availability ?? true,
    bio:             raw.bio ?? null,
    govtIdVerified:  raw.licenseNumber != null,
    avgRating:       Number(raw.avgRating ?? 0),
    totalReviews:    raw.totalReviews ?? 0,
    completedJobs:   raw.totalJobs ?? 0,
    createdAt:       raw.createdAt ?? new Date().toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': ['Person', 'LocalBusiness'],
    name: profile.name,
    jobTitle: profile.contractorType,
    ...(profile.serviceCities[0]
      ? { address: { '@type': 'PostalAddress', addressLocality: profile.serviceCities[0], addressCountry: 'IN' } }
      : {}),
    ...(profile.totalReviews > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: profile.avgRating,
            reviewCount: profile.totalReviews,
            bestRating: 5,
          },
        }
      : {}),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(reviews.length > 0
      ? {
          review: reviews.slice(0, 3).map((r: any) => ({
            '@type': 'Review',
            reviewRating: { '@type': 'Rating', ratingValue: r.rating },
            author: { '@type': 'Person', name: r.reviewer?.name ?? r.reviewerName ?? 'Griffy user' },
            reviewBody: r.comment ?? '',
          })),
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ContractorDetailClient profile={profile} reviews={reviews} serviceItems={serviceItems} />
    </>
  );
}
