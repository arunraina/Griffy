import ServiceExpertDetailClient from './ServiceExpertDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchProfile(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/service-expert-profiles/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchReviews(id: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/reviews?targetType=SERVICE_EXPERT&targetId=${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export default async function ServiceExpertDetailPage({ params }: { params: { id: string } }) {
  const [raw, reviews] = await Promise.all([
    fetchProfile(params.id),
    fetchReviews(params.id),
  ]);

  if (!raw) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-[#2C1810]">Expert not found</p>
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
    expertiseType:   raw.expertiseType ?? 'Service Expert',
    qualifications:  raw.qualifications ?? [],
    experience:      raw.experience ?? '',
    serviceCities:   raw.serviceCities ?? [],
    consultationFee: raw.consultationFee != null ? Number(raw.consultationFee) : null,
    availability:    raw.availability ?? true,
    bio:             raw.bio ?? null,
    govtIdVerified:  raw.govtIdVerified ?? false,
    avgRating:       Number(raw.avgRating ?? 0),
    totalReviews:    raw.totalReviews ?? 0,
    completedJobs:   raw.totalJobs ?? 0,
    createdAt:       raw.createdAt ?? new Date().toISOString(),
  };

  return <ServiceExpertDetailClient profile={profile} reviews={reviews} />;
}
