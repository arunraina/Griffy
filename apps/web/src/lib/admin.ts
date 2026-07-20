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
  kycPending: number;
}

export async function fetchAdminSummary(): Promise<AdminSummary> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/summary`, { headers });
  if (!res.ok) throw new Error('Failed to load summary');
  return res.json();
}

// ── Growth metrics ───────────────────────────────────────────────────────────

export interface AdminMetrics {
  newUsersByDay: { date: string; count: number }[];
  newOrdersByDay: { date: string; count: number }[];
  newBookingsByDay: { date: string; count: number }[];
  gmv: { last30d: number; allTime: number };
  bookingsValueAllTime: number;
  usersByRole: { role: string; count: number }[];
  activeListings: {
    contractors: number; labour: number; serviceExperts: number;
    materialSuppliers: number; materials: number; lands: number; properties: number;
  };
  totalProjects: number;
  totalBids: number;
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/metrics`, { headers });
  if (!res.ok) throw new Error('Failed to load metrics');
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

// ── Users (search / suspend) ─────────────────────────────────────────────────

export interface AdminUser {
  id: string; userNumber: number; name: string; email: string; phone: string | null;
  role: string; isSuspended: boolean; isFirstParty: boolean; createdAt: string;
}

export async function fetchAdminUsers(search?: string, role?: string): Promise<AdminUser[]> {
  const headers = await authHeaders();
  const qs = new URLSearchParams();
  if (search) qs.set('search', search);
  if (role) qs.set('role', role);
  const res = await fetch(`${API}/admin/users${qs.toString() ? `?${qs}` : ''}`, { headers });
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export async function suspendUser(id: string): Promise<AdminUser> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${id}/suspend`, { method: 'PATCH', headers });
  if (!res.ok) throw new Error('Failed to suspend user');
  return res.json();
}

export async function unsuspendUser(id: string): Promise<AdminUser> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${id}/unsuspend`, { method: 'PATCH', headers });
  if (!res.ok) throw new Error('Failed to unsuspend user');
  return res.json();
}

// ── KYC review ────────────────────────────────────────────────────────────────

export interface AdminKycDetail {
  id: string; userId: string; status: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  aadhaarNumber: string | null; panNumber: string | null; gstNumber: string | null;
  businessName: string | null; bankAccountNumber: string | null; bankIfsc: string | null;
  bankAccountHolderName: string | null; panCardUrl: string | null; bankProofUrl: string | null;
  rejectionReason: string | null; submittedAt: string | null; verifiedAt: string | null;
  user?: { name: string; email: string; role: string };
}

export async function fetchAdminKyc(status?: string): Promise<AdminKycDetail[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/kyc${status ? `?status=${status}` : ''}`, { headers });
  if (!res.ok) throw new Error('Failed to load KYC submissions');
  return res.json();
}

export async function verifyKyc(userId: string): Promise<AdminKycDetail> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/kyc/${userId}/verify`, { method: 'PATCH', headers });
  if (!res.ok) throw new Error('Failed to verify KYC');
  return res.json();
}

export async function rejectKyc(userId: string, reason?: string): Promise<AdminKycDetail> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/kyc/${userId}/reject`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to reject KYC');
  return res.json();
}

// ── Orders / refunds ─────────────────────────────────────────────────────────

export interface AdminRefund {
  id: string;
  orderId: string;
  amount: number; // paise
  reason: string;
  status: 'INITIATED' | 'PROCESSED' | 'FAILED';
  createdAt: string;
  processedAt: string | null;
}

export interface AdminOrder {
  id: string;
  totalAmount: string;
  status: string;
  paymentStatus: 'UNPAID' | 'PAID' | 'FAILED' | 'REFUND_INITIATED' | 'REFUNDED';
  createdAt: string;
  buyer?: { name: string; email: string };
  refunds: AdminRefund[];
  items: { id: string }[];
}

export async function fetchAdminOrders(paymentStatus?: string): Promise<AdminOrder[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/orders${paymentStatus ? `?paymentStatus=${paymentStatus}` : ''}`, { headers });
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
}

export async function createRefund(orderId: string, reason: string, amount?: number): Promise<AdminRefund> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/orders/${orderId}/refund`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason, ...(amount !== undefined && { amount }) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to create refund');
  }
  return res.json();
}
