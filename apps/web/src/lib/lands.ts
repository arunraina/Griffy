import { createClient } from './supabase';
import { getImpersonationToken } from './impersonation';
import { NotAuthenticatedError } from './users';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function authHeaders(): Promise<Record<string, string>> {
  const impersonationToken = getImpersonationToken();
  if (impersonationToken) {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${impersonationToken}` };
  }
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new NotAuthenticatedError();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export interface Land {
  id: string;
  title: string;
  landType: string;
  areaSqFt: string;
  price: string;
  city: string;
  state: string;
  isAvailable: boolean;
  createdAt: string;
}

export async function fetchMyLands(): Promise<Land[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/lands/mine`, { headers });
  if (!res.ok) return [];
  return res.json();
}
