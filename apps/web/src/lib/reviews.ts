import { createClient } from './supabase';
import { NotAuthenticatedError } from './users';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new NotAuthenticatedError();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export type ReviewTargetType =
  | 'CONTRACTOR' | 'LABOUR' | 'SERVICE_EXPERT' | 'MATERIAL_SUPPLIER'
  | 'BUILDER' | 'PROPERTY_AGENT' | 'MATERIAL' | 'LAND' | 'PROPERTY';

export interface ReviewEligibility {
  eligible: boolean;
  wouldBeVerified: boolean;
  reason?: string;
}

export async function checkReviewEligibility(targetType: ReviewTargetType, targetId: string): Promise<ReviewEligibility> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/reviews/eligibility?targetType=${targetType}&targetId=${targetId}`, { headers });
  if (!res.ok) return { eligible: false, wouldBeVerified: false };
  return res.json();
}

export async function submitReview(input: {
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment?: string;
}): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/reviews`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to submit review (${res.status})`);
  }
}
