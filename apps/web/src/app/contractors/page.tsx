import ContractorsClient from './ContractorsClient';

type ContractorType = 'Labour' | 'Sub-Contractor' | 'Full Contractor';
type TradeSkill = 'Civil Contractor' | 'Renovation Contractor' | 'Architect' | 'Interior Designer' | 'Structural Engineer' | 'Project Manager';

interface Contractor {
  id: string;
  name: string;
  avatarUrl: string | null;
  type: ContractorType;
  skills: TradeSkill[];
  location: string;
  experience: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  available: boolean;
  rateType: 'daily' | 'project';
  rate: number;
  verified: boolean;
  featured: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function mapContractorType(t: string): ContractorType {
  const lower = (t ?? '').toLowerCase();
  if (lower.includes('full')) return 'Full Contractor';
  if (lower.includes('sub')) return 'Sub-Contractor';
  return 'Labour';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfile(p: any): Contractor {
  return {
    id: p.id,
    name: p.user?.name ?? 'Unknown',
    avatarUrl: p.user?.avatarUrl ?? null,
    type: mapContractorType(p.contractorType ?? ''),
    skills: (p.tradeSkills ?? []) as TradeSkill[],
    location: p.serviceCities?.[0] ?? '',
    experience: parseInt(p.experience) || 0,
    rating: Number(p.avgRating ?? 0),
    reviewCount: p.totalReviews ?? 0,
    completedJobs: p.totalJobs ?? 0,
    available: p.availability ?? true,
    rateType: p.dailyRate != null ? 'daily' : 'project',
    rate: Number(p.dailyRate ?? p.projectRate ?? 0),
    verified: p.approvalStatus === 'APPROVED',
    featured: false,
  };
}

async function fetchContractors(): Promise<Contractor[]> {
  try {
    const res = await fetch(`${API_BASE}/contractor-profiles`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data ?? []).map(mapProfile);
  } catch {
    return [];
  }
}

export default async function ContractorsPage() {
  const contractors = await fetchContractors();
  return <ContractorsClient contractors={contractors} />;
}
