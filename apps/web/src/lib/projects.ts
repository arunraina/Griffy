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

export interface Project {
  id: string;
  ownerId: string;
  projectType: string;
  title: string;
  description: string;
  city: string;
  state: string;
  budgetMin: string;
  budgetMax: string;
  timeline: string;
  status: 'OPEN' | 'AWARDED' | 'CLOSED';
  createdAt: string;
  owner?: { name: string };
  _count?: { bids: number };
}

export interface Bid {
  id: string;
  projectId: string;
  contractorId: string;
  bidAmount: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  contractor?: { name: string; avatarUrl: string | null };
}

export async function listProjects(projectType?: string): Promise<Project[]> {
  try {
    const res = await fetch(`${API}/projects${projectType ? `?projectType=${projectType}` : ''}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const res = await fetch(`${API}/projects/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function createProject(data: {
  projectType: string;
  title: string;
  description: string;
  city: string;
  state: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
}): Promise<Project> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/projects`, { method: 'POST', headers, body: JSON.stringify(data) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to post project (${res.status})`);
  }
  return res.json();
}

export async function getProjectBids(id: string): Promise<Bid[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/projects/${id}/bids`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function submitBid(id: string, data: { bidAmount: number; message: string }): Promise<Bid> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/projects/${id}/bids`, { method: 'POST', headers, body: JSON.stringify(data) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to submit bid (${res.status})`);
  }
  return res.json();
}

export async function updateBidStatus(id: string, bidId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<Bid> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/projects/${id}/bids/${bidId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update bid');
  return res.json();
}
