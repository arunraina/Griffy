import { createClient } from './supabase';
import { getImpersonationToken } from './impersonation';
import { NotAuthenticatedError } from './users';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function authHeaders(): Promise<Record<string, string>> {
  const impersonationToken = getImpersonationToken();
  if (impersonationToken) return { Authorization: `Bearer ${impersonationToken}` };
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new NotAuthenticatedError();
  return { Authorization: `Bearer ${session.access_token}` };
}

export interface MyServiceExpertProfile {
  id: string;
  expertiseType: string;
  qualifications: string[];
  experience: string;
  serviceCities: string[];
  consultationFee: string | number | null;
  isAvailable: boolean;
  bio: string | null;
  portfolioImages: string[];
  totalReviews: number;
  totalJobs: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export async function fetchMyServiceExpertProfile(): Promise<MyServiceExpertProfile | null> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/service-expert-profiles/me`, { headers });
  if (!res.ok) return null;
  return res.json();
}

// Matches the same key-derivation admin/profile/[id]/page.tsx uses for its
// QUICK_ADD_SERVICES lookup: lowercase the display name, spaces -> underscores.
export function toSkillKey(expertiseType: string): string {
  return expertiseType.toLowerCase().replace(/\s+/g, '_');
}
