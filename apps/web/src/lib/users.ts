import { createClient } from './supabase';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// Distinguishes "genuinely not logged in" from a network/server error so
// callers don't bounce a user to /login just because the API was briefly
// unreachable — see post-project/page.tsx for why this distinction matters.
export class NotAuthenticatedError extends Error {
  constructor() {
    super('Not authenticated');
    this.name = 'NotAuthenticatedError';
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new NotAuthenticatedError();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export interface Me {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
}

export async function fetchMe(): Promise<Me> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/users/me`, { headers });
  if (res.status === 401) throw new NotAuthenticatedError();
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export async function updateMe(data: { name?: string; phone?: string }): Promise<Me> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/users/me`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save profile');
  return res.json();
}

export interface ReferralStats {
  code: string;
  referralCount: number;
}

export async function fetchReferralStats(): Promise<ReferralStats> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/users/me/referral`, { headers });
  if (!res.ok) throw new Error('Failed to load referral stats');
  return res.json();
}

export interface MyAnalytics {
  completedJobs: number;
  totalEarnings: number;
  bidsSubmitted: number;
  bidsWon: number;
}

export async function fetchMyAnalytics(): Promise<MyAnalytics> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/users/me/analytics`, { headers });
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}
