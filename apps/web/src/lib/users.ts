import { createClient } from './supabase';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
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
