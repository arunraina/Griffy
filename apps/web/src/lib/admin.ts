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

export interface AdminProject {
  id: string;
  title: string;
  projectType: string;
  city: string;
  state: string;
  budgetMin: string;
  budgetMax: string;
  status: 'OPEN' | 'AWARDED' | 'CLOSED';
  createdAt: string;
  owner?: { name: string; email: string };
  _count?: { bids: number };
}

export async function fetchAdminProjects(status?: string): Promise<AdminProject[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/projects${status ? `?status=${status}` : ''}`, { headers });
  if (!res.ok) throw new Error('Failed to load projects');
  return res.json();
}

export async function moderateProject(id: string, status: 'OPEN' | 'CLOSED'): Promise<AdminProject> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/projects/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}
