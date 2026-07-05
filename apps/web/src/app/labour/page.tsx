import LabourClient from './LabourClient';

interface LabourProfile {
  id: string;
  name: string;
  skillType: string;
  experience: string;
  location: string;
  dailyRate: number;
  available: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  verified: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLabour(p: any): LabourProfile {
  return {
    id: p.id,
    name: p.user?.name ?? 'Unknown',
    skillType: p.skillType ?? 'General Labour',
    experience: p.experience ?? '',
    location: p.serviceCities?.[0] ?? '',
    dailyRate: Number(p.dailyRate ?? 0),
    available: p.availability ?? true,
    rating: Number(p.avgRating ?? 0),
    reviewCount: p.totalReviews ?? 0,
    completedJobs: p.totalJobs ?? 0,
    verified: p.approvalStatus === 'APPROVED',
  };
}

async function fetchLabour(): Promise<LabourProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/labour-profiles`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data ?? []).map(mapLabour);
  } catch {
    return [];
  }
}

export default async function LabourPage() {
  const profiles = await fetchLabour();
  return <LabourClient profiles={profiles} />;
}
