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

export type PortfolioProfileType = 'contractor' | 'labour' | 'service-expert';

export interface PortfolioItem {
  id: string;
  profileType: PortfolioProfileType;
  profileId: string;
  title: string;
  description: string | null;
  imageUrls: string[];
  completedAt: string | null;
  createdAt: string;
}

export async function fetchPortfolio(profileType: PortfolioProfileType, profileId: string): Promise<PortfolioItem[]> {
  const res = await fetch(`${API}/portfolio/${profileType}/${profileId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createPortfolioItem(data: {
  profileType: PortfolioProfileType;
  title: string;
  description?: string;
  imageUrls: string[];
  completedAt?: string;
}): Promise<PortfolioItem> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/portfolio`, { method: 'POST', headers, body: JSON.stringify(data) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to create portfolio item');
  }
  return res.json();
}

export async function updatePortfolioItem(id: string, data: Partial<{
  title: string; description: string; imageUrls: string[]; completedAt: string;
}>): Promise<PortfolioItem> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/portfolio/${id}`, { method: 'PATCH', headers, body: JSON.stringify(data) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to update portfolio item');
  }
  return res.json();
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/portfolio/${id}`, { method: 'DELETE', headers });
  if (!res.ok) throw new Error('Failed to delete portfolio item');
}
