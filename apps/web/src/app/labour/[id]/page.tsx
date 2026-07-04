import LabourDetailClient from './LabourDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchProfile(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/labour-profiles/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchReviews(id: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/reviews?targetType=LABOUR&targetId=${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export default async function LabourDetailPage({ params }: { params: { id: string } }) {
  const [raw, reviews] = await Promise.all([
    fetchProfile(params.id),
    fetchReviews(params.id),
  ]);

  if (!raw) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-[#2C1810]">Worker not found</p>
          <p className="text-sm text-[#A08070] mt-2">This profile may have been removed or is unavailable.</p>
        </div>
      </div>
    );
  }

  const profile = {
    id:              raw.id,
    userId:          raw.userId as string,
    name:            raw.user?.name ?? 'Unknown',
    skillType:       raw.skillType ?? 'General Labour',
    experience:      raw.experience ?? '',
    serviceCities:   raw.serviceCities ?? [],
    dailyRate:       raw.dailyRate != null ? Number(raw.dailyRate) : null,
    availability:    raw.availability ?? true,
    bio:             raw.bio ?? null,
    portfolioImages: raw.portfolioImages ?? [],
    govtIdVerified:  raw.govtIdVerified ?? false,
    avgRating:       Number(raw.avgRating ?? 0),
    totalReviews:    raw.totalReviews ?? 0,
    createdAt:       raw.createdAt ?? new Date().toISOString(),
  };

  return <LabourDetailClient profile={profile} reviews={reviews} />;
}
