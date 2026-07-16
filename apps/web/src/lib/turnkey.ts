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

export type TurnkeyProjectType = 'TURNKEY' | 'LAND_PLOTTING';
export type TurnkeyProjectStatus = 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MilestoneStatus = 'PENDING' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'APPROVED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED' | 'REFUND_INITIATED' | 'REFUNDED';

export interface TurnkeyMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  amount: string;
  sequence: number;
  status: MilestoneStatus;
  changesRequestedNote: string | null;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface TurnkeyProjectSummary {
  id: string;
  type: TurnkeyProjectType;
  title: string;
  description: string;
  budget: string;
  status: TurnkeyProjectStatus;
  percentComplete: number;
  createdAt: string;
  customer?: { name: string; avatarUrl: string | null };
  provider?: { name: string; avatarUrl: string | null };
  _count?: { milestones: number };
}

export interface TurnkeyProjectDetail extends TurnkeyProjectSummary {
  customerId: string;
  providerId: string | null;
  targetEndDate: string | null;
  milestones: TurnkeyMilestone[];
}

export interface TurnkeyProjectUpdate {
  id: string;
  note: string;
  percentComplete: number;
  imageUrls: string[];
  createdAt: string;
}

export async function createTurnkeyProject(input: {
  providerId: string; type: TurnkeyProjectType; title: string; description: string; budget: number; targetEndDate?: string;
}): Promise<TurnkeyProjectDetail> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/turnkey-projects`, { method: 'POST', headers, body: JSON.stringify(input) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to request project');
  }
  return res.json();
}

export async function fetchMyTurnkeyProjects(): Promise<TurnkeyProjectSummary[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/turnkey-projects/mine`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchAssignedTurnkeyProjects(): Promise<TurnkeyProjectSummary[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/turnkey-projects/assigned`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchTurnkeyProject(id: string): Promise<TurnkeyProjectDetail> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/turnkey-projects/${id}`, { headers });
  if (!res.ok) throw new Error('Project not found');
  return res.json();
}

async function patch(path: string, body?: unknown): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${API}${path}`, { method: 'PATCH', headers, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Request failed');
  }
}

export const acceptTurnkeyProject = (id: string) => patch(`/turnkey-projects/${id}/accept`);
export const declineTurnkeyProject = (id: string) => patch(`/turnkey-projects/${id}/decline`);
export const completeTurnkeyProject = (id: string) => patch(`/turnkey-projects/${id}/complete`);
export const cancelTurnkeyProject = (id: string) => patch(`/turnkey-projects/${id}/cancel`);

export async function postTurnkeyUpdate(id: string, input: { note: string; percentComplete: number; imageUrls?: string[] }): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/turnkey-projects/${id}/updates`, { method: 'POST', headers, body: JSON.stringify(input) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to post update');
  }
}

export async function fetchTurnkeyUpdates(id: string): Promise<TurnkeyProjectUpdate[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/turnkey-projects/${id}/updates`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function proposeMilestone(projectId: string, input: { title: string; description?: string; amount: number; sequence: number }): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/turnkey-projects/${projectId}/milestones`, { method: 'POST', headers, body: JSON.stringify(input) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to propose milestone');
  }
}

export const submitMilestone = (milestoneId: string) => patch(`/turnkey-projects/milestones/${milestoneId}/submit`);
export const approveMilestone = (milestoneId: string) => patch(`/turnkey-projects/milestones/${milestoneId}/approve`);
export const requestMilestoneChanges = (milestoneId: string, note: string) =>
  patch(`/turnkey-projects/milestones/${milestoneId}/request-changes`, { note });
