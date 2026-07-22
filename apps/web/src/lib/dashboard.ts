import { createClient } from './supabase';
import { getImpersonationToken } from './impersonation';
import { NotAuthenticatedError } from './users';
import type { UserState } from '@griffy/shared';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function authHeaders(): Promise<Record<string, string>> {
  const impersonationToken = getImpersonationToken();
  if (impersonationToken) return { Authorization: `Bearer ${impersonationToken}` };
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new NotAuthenticatedError();
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function fetchDashboardState(): Promise<UserState> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/dashboard/state`, { headers });
  if (res.status === 401) throw new NotAuthenticatedError();
  if (!res.ok) throw new Error('Failed to load dashboard state');
  return res.json();
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Working late? 😄';
}

export function firstName(name: string): string {
  return name?.split(' ')[0] || 'there';
}
