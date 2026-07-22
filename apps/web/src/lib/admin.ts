import { createClient } from './supabase';
import { NotAuthenticatedError } from './users';
import { getImpersonationToken, type ImpersonationTarget } from './impersonation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function authHeaders(): Promise<Record<string, string>> {
  // The only admin.ts call expected to fire during active impersonation is
  // endImpersonation() itself -- the backend needs the impersonation token
  // to know which admin/target pair to close out.
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

export async function startImpersonation(userId: string): Promise<{ impersonationToken: string; targetUser: ImpersonationTarget }> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${userId}/impersonate`, { method: 'POST', headers });
  if (!res.ok) throw new Error('Failed to start impersonation');
  return res.json();
}

export async function endImpersonation(): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/impersonate/end`, { method: 'DELETE', headers });
  if (!res.ok) throw new Error('Failed to end impersonation');
}

export interface AdminProject {
  id: string;
  title: string;
  description?: string;
  projectType: string;
  city: string;
  state: string;
  budgetMin: string;
  budgetMax: string;
  timeline?: string;
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

export interface CreateAdminProjectPayload {
  projectType: string; title: string; description: string; city: string; state: string;
  budgetMin: number; budgetMax: number; timeline: string;
}

export async function fetchAdminUserProjects(userId: string): Promise<AdminProject[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${userId}/projects`, { headers });
  if (!res.ok) throw new Error('Failed to load projects');
  return res.json();
}

export async function createAdminProject(userId: string, payload: CreateAdminProjectPayload): Promise<AdminProject> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${userId}/projects`, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to create project');
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

export const ACCOUNT_STATUSES = [
  'ACTIVE', 'SUSPENDED', 'TEMP_SUSPENDED', 'RESTRICTED_LISTING',
  'RESTRICTED_BOOKING', 'RESTRICTED_EXPLORE', 'PENDING_REVIEW',
] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export interface AdminUser {
  id: string; userNumber: number; name: string; email: string; phone: string | null;
  city: string | null; state: string | null;
  role: string; adminRole: string | null; isSuspended: boolean; isFirstParty: boolean; createdAt: string;
  accountStatus: AccountStatus; statusReason: string | null; statusExpiresAt: string | null;
}

export const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MODERATOR', 'KYC_MODERATOR', 'HR'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

// adminRole: null removes admin access entirely (reverts to a plain user).
export async function setAdminRole(id: string, adminRole: AdminRole | null): Promise<AdminUser> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${id}/admin-role`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ adminRole }),
  });
  if (!res.ok) throw new Error('Failed to update admin role');
  return res.json();
}

export interface SetAccountStatusPayload {
  status: AccountStatus; reason?: string; expiresAt?: string; notifyUser?: boolean;
}

export async function setAccountStatus(id: string, payload: SetAccountStatusPayload): Promise<AdminUser> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.message?.[0] ?? 'Failed to change status');
  return res.json();
}

export interface AdminStatusHistoryEntry {
  id: string; previousStatus: AccountStatus; newStatus: AccountStatus; reason: string;
  expiresAt: string | null; createdAt: string; changedBy: { name: string; email: string } | null;
}

export async function fetchAdminStatusHistory(id: string): Promise<AdminStatusHistoryEntry[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${id}/status-history`, { headers });
  if (!res.ok) throw new Error('Failed to load status history');
  return res.json();
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

// ── User detail (profile + listings a curator can manage) ───────────────────

export interface AdminPortfolioItem {
  id: string; title: string; description: string | null; imageUrls: string[]; completedAt: string | null;
}

export interface AdminServiceItem {
  id: string; name: string; description: string | null; price: number; priceUnit: string; category: string; active: boolean;
}

export interface AdminUserDetail {
  user: AdminUser;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profileType: ProfileType | null;
  profile: Record<string, unknown> | null;
  portfolio: AdminPortfolioItem[];
  services: AdminServiceItem[];
}

export async function fetchAdminUserDetail(id: string): Promise<AdminUserDetail> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${id}`, { headers });
  if (!res.ok) throw new Error('Failed to load user');
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAdminUserProfile(id: string, patch: Record<string, any>): Promise<AdminUserDetail> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${id}/profile`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export interface AdminProviderBooking {
  id: string; status: string; scheduledAt: string; amount: string;
  customer?: { id: string; name: string; phone: string | null; email: string };
}

export async function fetchAdminUserBookings(id: string): Promise<AdminProviderBooking[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${id}/bookings`, { headers });
  if (!res.ok) throw new Error('Failed to load bookings');
  return res.json();
}

export interface AdminProviderReview {
  id: string; rating: number; comment: string | null; createdAt: string;
  reviewer?: { name: string; avatarUrl: string | null } | null;
  reviewerName: string | null;
  isAdminAdded: boolean;
  isVerified: boolean;
  source: string | null;
}

// Mirrors AdminService.PROFILE_TYPE_TO_REVIEW_TARGET on the backend — only
// the profile types that have a real review target.
export const PROFILE_TYPE_TO_REVIEW_TARGET_TYPE: Partial<Record<ProfileType, string>> = {
  contractor: 'CONTRACTOR',
  labour: 'LABOUR',
  'service-expert': 'SERVICE_EXPERT',
  'material-supplier': 'MATERIAL_SUPPLIER',
  builder: 'BUILDER',
  'property-agent': 'PROPERTY_AGENT',
};

export const REVIEW_SOURCES = [
  { value: 'phone_feedback', label: 'Phone feedback' },
  { value: 'whatsapp_feedback', label: 'WhatsApp feedback' },
  { value: 'in_person', label: 'In-person feedback' },
  { value: 'other', label: 'Other' },
] as const;

export interface CreateAdminReviewPayload {
  targetType: string; targetId: string; rating: number; comment: string;
  reviewerName: string; reviewerPhone?: string; source?: string;
}

export async function createAdminReview(payload: CreateAdminReviewPayload): Promise<AdminProviderReview> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/reviews`, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to add review');
  return res.json();
}

export async function updateAdminReview(id: string, patch: Partial<CreateAdminReviewPayload> & { isVerified?: boolean }): Promise<AdminProviderReview> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/reviews/${id}`, { method: 'PATCH', headers, body: JSON.stringify(patch) });
  if (!res.ok) throw new Error('Failed to update review');
  return res.json();
}

export async function deleteAdminReview(id: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/reviews/${id}`, { method: 'DELETE', headers });
  if (!res.ok) throw new Error('Failed to delete review');
}

export async function fetchAdminUserReviews(id: string): Promise<AdminProviderReview[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${id}/reviews`, { headers });
  if (!res.ok) throw new Error('Failed to load reviews');
  return res.json();
}

export interface CreatePortfolioItemPayload {
  profileType: 'contractor' | 'labour' | 'service-expert';
  title: string;
  description?: string;
  imageUrls: string[];
  completedAt?: string;
}

export async function createAdminPortfolioItem(userId: string, payload: CreatePortfolioItemPayload): Promise<AdminPortfolioItem> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${userId}/portfolio-items`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to add portfolio item');
  }
  return res.json();
}

export interface CreateServiceItemPayload {
  profileType: 'labour' | 'service-expert';
  name: string;
  description?: string;
  price: number;
  priceUnit: 'FIXED' | 'PER_HOUR' | 'PER_DAY' | 'PER_POINT' | 'PER_SQFT' | 'PER_VISIT';
  category: string;
}

export async function createAdminServiceItem(userId: string, payload: CreateServiceItemPayload): Promise<AdminServiceItem> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users/${userId}/service-items`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to add service');
  }
  return res.json();
}

// Roles an admin can manually seed via createUser() — every ProfileType has a
// matching UserRole; HOMEOWNER and ADMIN aren't creatable this way (ADMIN
// must go through a dedicated setRole flow, HOMEOWNER has no profile table).
export const CREATABLE_ROLES: { role: string; type: ProfileType }[] = [
  { role: 'CONTRACTOR', type: 'contractor' },
  { role: 'LABOUR', type: 'labour' },
  { role: 'SERVICE_EXPERT', type: 'service-expert' },
  { role: 'MATERIAL_SUPPLIER', type: 'material-supplier' },
  { role: 'LAND_OWNER', type: 'land-owner' },
  { role: 'PROPERTY_SELLER', type: 'property-seller' },
  { role: 'BUILDER', type: 'builder' },
  { role: 'PROPERTY_AGENT', type: 'property-agent' },
];

export interface CreateUserProfilePayload {
  contractorType?: string;
  skillType?: string;
  expertiseType?: string;
  tradeSkills?: string[];
  qualifications?: string[];
  experience?: string;
  serviceCities?: string[];
  licenseNumber?: string;
  dailyRate?: number;
  projectRate?: number;
  consultationFee?: number;
  bio?: string;
  businessName?: string;
  gstNumber?: string;
  businessAddress?: string;
  deliveryCities?: string[];
  companyName?: string;
  registrationNumber?: string;
  specializations?: string[];
  agencyName?: string;
}

export interface CreateUserPayload {
  role: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  profile?: CreateUserProfilePayload;
}

export async function createUser(payload: CreateUserPayload): Promise<AdminUser> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to create user');
  }
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

// ── Blog ──────────────────────────────────────────────────────────────────────

export interface AdminBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string[];
  featuredImage: string | null;
  readTimeMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostPayload {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  status?: 'DRAFT' | 'PUBLISHED';
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  readTimeMinutes?: number;
}

export async function fetchAdminBlogPosts(): Promise<AdminBlogPost[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/blog`, { headers });
  if (!res.ok) throw new Error('Failed to load blog posts');
  return res.json();
}

export async function createBlogPost(payload: BlogPostPayload): Promise<AdminBlogPost> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/blog`, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to create post');
  }
  return res.json();
}

export async function updateBlogPost(id: string, payload: Partial<BlogPostPayload>): Promise<AdminBlogPost> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/blog/${id}`, { method: 'PATCH', headers, body: JSON.stringify(payload) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to update post');
  }
  return res.json();
}

export async function deleteBlogPost(id: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/blog/${id}`, { method: 'DELETE', headers });
  if (!res.ok) throw new Error('Failed to delete post');
}
