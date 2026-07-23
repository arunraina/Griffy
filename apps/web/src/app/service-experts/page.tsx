import ServiceExpertsClient from './ServiceExpertsClient';

interface ServiceExpertProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  expertiseType: string;
  qualifications: string[];
  experience: string;
  location: string;
  consultationFee: number;
  available: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  verified: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapExpert(p: any): ServiceExpertProfile {
  return {
    id: p.id,
    userId: p.user?.id ?? p.userId,
    name: p.user?.name ?? 'Unknown',
    avatarUrl: p.user?.avatarUrl ?? null,
    expertiseType: p.expertiseType ?? 'Service Expert',
    qualifications: p.qualifications ?? [],
    experience: p.experience ?? '',
    location: p.serviceCities?.[0] ?? '',
    consultationFee: Number(p.consultationFee ?? 0),
    available: p.availability ?? true,
    rating: Number(p.avgRating ?? 0),
    reviewCount: p.totalReviews ?? 0,
    completedJobs: p.totalJobs ?? 0,
    verified: p.approvalStatus === 'APPROVED',
  };
}

async function fetchExperts(): Promise<ServiceExpertProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/service-expert-profiles`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data ?? []).map(mapExpert);
  } catch {
    return [];
  }
}

export default async function ServiceExpertsPage() {
  const profiles = await fetchExperts();
  return <ServiceExpertsClient profiles={profiles} />;
}
