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

// ── Dashboard summary ────────────────────────────────────────────────────────

export interface AdminSummary {
  pendingApprovals: { type: string; pending: number }[];
  totalPendingApprovals: number;
  hiddenContent: Record<string, number>;
  careerApplications: number;
  earlyAccessSignups: number;
  totalUsers: number;
}

export async function fetchAdminSummary(): Promise<AdminSummary> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/summary`, { headers });
  if (!res.ok) throw new Error('Failed to load summary');
  return res.json();
}

// ── Profile approvals (contractor, labour, service-expert, material-supplier,
// land-owner, property-seller, builder, property-agent) ─────────────────────

export type ProfileType =
  | 'contractor' | 'labour' | 'service-expert' | 'material-supplier'
  | 'land-owner' | 'property-seller' | 'builder' | 'property-agent';

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  contractor: 'Contractors',
  labour: 'Labour',
  'service-expert': 'Service Experts',
  'material-supplier': 'Material Suppliers',
  'land-owner': 'Land Owners',
  'property-seller': 'Property Sellers',
  builder: 'Builders',
  'property-agent': 'Property Agents',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAdminProfiles(type: ProfileType, status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<any[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/profiles/${type}${status ? `?status=${status}` : ''}`, { headers });
  if (!res.ok) throw new Error('Failed to load profiles');
  return res.json();
}

export async function approveProfile(type: ProfileType, id: string) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/profiles/${type}/${id}/approve`, { method: 'PATCH', headers });
  if (!res.ok) throw new Error('Failed to approve');
  return res.json();
}

export async function rejectProfile(type: ProfileType, id: string, reason?: string) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/profiles/${type}/${id}/reject`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to reject');
  return res.json();
}

// ── Content moderation (review, project, land, property, material) ─────────

export type ContentType = 'review' | 'project' | 'land' | 'property' | 'material';

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  review: 'Reviews',
  project: 'Projects',
  land: 'Land Listings',
  property: 'Properties',
  material: 'Materials',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAdminContent(type: ContentType): Promise<any[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/content/${type}`, { headers });
  if (!res.ok) throw new Error('Failed to load content');
  return res.json();
}

export async function moderateContent(
  type: ContentType,
  id: string,
  data: { isHidden?: boolean; isDemoted?: boolean; moderationNote?: string },
) {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/content/${type}/${id}/moderate`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update content');
  return res.json();
}

// ── Career applications & early access signups ───────────────────────────────

export interface AdminCareerApplication {
  id: string; role: string; name: string; email: string; resumeUrl: string;
  institute: string; courseOrDegree: string; degreeStatus: string; graduationYear: number; createdAt: string;
}

export async function fetchCareerApplications(): Promise<AdminCareerApplication[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/career-applications`, { headers });
  if (!res.ok) throw new Error('Failed to load career applications');
  return res.json();
}

export interface AdminEarlyAccessSignup {
  id: string; email: string; interest?: string; createdAt: string;
}

export async function fetchEarlyAccessSignups(): Promise<AdminEarlyAccessSignup[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/early-access-signups`, { headers });
  if (!res.ok) throw new Error('Failed to load early access signups');
  return res.json();
}
