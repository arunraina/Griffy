const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("griffy_token");
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "homeowner" | "contractor" | "labour" | "supplier" | "admin";
  city?: string;
  state?: string;
  isVerified: boolean;
}

export interface Material {
  id: string;
  name: string;
  description?: string;
  category: string;
  pricePerUnit: number;
  unit: string;
  minOrderQuantity?: number;
  stockQuantity?: number;
  imageUrls?: string[];
  brand?: string;
  deliveryDays?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  city?: string;
  state?: string;
  rating: number;
  reviewCount: number;
  supplier?: { id: string; fullName: string };
}

export interface Contractor {
  id: string;
  businessName: string;
  specialty: string;
  experienceYears: number;
  licenseNumber?: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
  priceUnit?: string;
  bio?: string;
  skills?: string[];
  city?: string;
  state?: string;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  isAvailable: boolean;
  isVerified: boolean;
  avatarUrl?: string;
  portfolioImages?: string[];
  profileViews?: number;
  user?: { id: string; fullName: string };
}

export interface Labour {
  id: string;
  trade: string;
  experienceYears: number;
  dailyRate: number;
  weeklyRate?: number;
  bio?: string;
  skills?: string[];
  languages?: string[];
  city?: string;
  state?: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  isAvailable: boolean;
  isVerified: boolean;
  avatarUrl?: string;
  profileViews?: number;
  user?: { id: string; fullName: string };
}

export interface Order {
  id: string;
  type: "material" | "contractor" | "labour";
  itemId: string;
  amount: number;
  platformFee: number;
  status: string;
  quantity?: number;
  deliveryAddress?: string;
  notes?: string;
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  isEscrowReleased: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export const getMe = () => apiFetch<User>("/auth/me");

// ── Materials ──────────────────────────────────────────────────────────────

type MaterialsParams = Partial<{
  page: number; limit: number; category: string;
  city: string; search: string; minPrice: number; maxPrice: number; sortBy: string;
}>;

export function listMaterials(params: MaterialsParams = {}) {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();
  return apiFetch<Paginated<Material>>(`/materials${qs ? "?" + qs : ""}`);
}

export const getMaterial = (id: string) => apiFetch<Material>(`/materials/${id}`);

// ── Contractors ────────────────────────────────────────────────────────────

type ContractorsParams = Partial<{
  page: number; limit: number; specialty: string;
  city: string; search: string; available: boolean; sortBy: string;
}>;

export function listContractors(params: ContractorsParams = {}) {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();
  return apiFetch<Paginated<Contractor>>(`/contractors${qs ? "?" + qs : ""}`);
}

export const getContractor = (id: string) => apiFetch<Contractor>(`/contractors/${id}`);

// ── Labour ─────────────────────────────────────────────────────────────────

type LabourParams = Partial<{
  page: number; limit: number; trade: string;
  city: string; search: string; available: boolean; maxRate: number; sortBy: string;
}>;

export function listLabour(params: LabourParams = {}) {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();
  return apiFetch<Paginated<Labour>>(`/labour${qs ? "?" + qs : ""}`);
}

export const getLabour = (id: string) => apiFetch<Labour>(`/labour/${id}`);

// ── Orders ─────────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  type: string;
  itemId: string;
  amount: number;
  quantity?: number;
  deliveryAddress?: string;
  notes?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
}

export const createOrder = (data: CreateOrderPayload) =>
  apiFetch<Order>("/orders", { method: "POST", body: JSON.stringify(data) });

export const listMyOrders = (page = 1, limit = 20) =>
  apiFetch<Paginated<Order>>(`/orders/my?page=${page}&limit=${limit}`);

export const getOrder = (id: string) => apiFetch<Order>(`/orders/${id}`);

export const listIncomingOrders = (page = 1, limit = 20) =>
  apiFetch<Paginated<Order & { buyer?: User }>>(`/orders/incoming?page=${page}&limit=${limit}`);

export const updateOrderStatus = (id: string, status: string) =>
  apiFetch<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const releaseEscrow = (id: string) =>
  apiFetch<Order>(`/orders/${id}/release-escrow`, { method: 'PATCH' });

// ── Profile ────────────────────────────────────────────────────────────────

export const updateMe = (data: { fullName?: string; phone?: string; city?: string; state?: string }) =>
  apiFetch<User>('/users/me', { method: 'PATCH', body: JSON.stringify(data) });

// ── My profiles (contractor / labour / supplier) ───────────────────────────

export const getMyContractorProfile = () => apiFetch<Contractor | null>('/contractors/my');

export const updateMyContractorProfile = (data: Partial<Omit<Contractor, 'id' | 'userId' | 'user' | 'rating' | 'reviewCount' | 'completedProjects' | 'isVerified' | 'createdAt' | 'updatedAt'>>) =>
  apiFetch<Contractor>('/contractors/my', { method: 'PATCH', body: JSON.stringify(data) });

export const getMyLabourProfile = () => apiFetch<Labour | null>('/labour/my');

export const updateMyLabourProfile = (data: Partial<Omit<Labour, 'id' | 'userId' | 'user' | 'rating' | 'reviewCount' | 'completedJobs' | 'isVerified' | 'createdAt' | 'updatedAt'>>) =>
  apiFetch<Labour>('/labour/my', { method: 'PATCH', body: JSON.stringify(data) });

export const listMyMaterials = (page = 1, limit = 20) =>
  apiFetch<Paginated<Material>>(`/materials/my?page=${page}&limit=${limit}`);

export const createMaterial = (data: Partial<Omit<Material, 'id' | 'supplierId' | 'supplier' | 'rating' | 'reviewCount' | 'isFeatured' | 'createdAt' | 'updatedAt'>>) =>
  apiFetch<Material>('/materials', { method: 'POST', body: JSON.stringify(data) });

export const updateMaterial = (id: string, data: Partial<Omit<Material, 'id' | 'supplierId' | 'supplier' | 'rating' | 'reviewCount' | 'isFeatured' | 'createdAt' | 'updatedAt'>>) =>
  apiFetch<Material>(`/materials/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteMaterial = (id: string) =>
  apiFetch<void>(`/materials/${id}`, { method: 'DELETE' });

// ── Reviews ────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  orderId?: string;
  targetType: 'material' | 'contractor' | 'labour';
  targetId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer?: { id: string; fullName: string };
}

export interface CreateReviewPayload {
  orderId?: string;
  targetType: 'material' | 'contractor' | 'labour';
  targetId: string;
  rating: number;
  comment?: string;
}

export const createReview = (data: CreateReviewPayload) =>
  apiFetch<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) });

export const listReviews = (targetType: string, targetId: string, page = 1, limit = 20) =>
  apiFetch<Paginated<Review>>(`/reviews?targetType=${targetType}&targetId=${targetId}&page=${page}&limit=${limit}`);

export const getMyReviewForOrder = (orderId: string) =>
  apiFetch<Review | null>(`/reviews/my-review?orderId=${orderId}`);

// ── Enquiries ──────────────────────────────────────────────────────────────

export interface Enquiry {
  id: string;
  senderId: string;
  sender?: { id: string; fullName: string };
  recipientId: string;
  recipientType: 'contractor' | 'labour';
  targetId: string;
  message: string;
  budget?: number;
  projectDescription?: string;
  status: 'pending' | 'replied' | 'accepted' | 'declined';
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface CreateEnquiryPayload {
  recipientType: 'contractor' | 'labour';
  targetId: string;
  message: string;
  budget?: number;
  projectDescription?: string;
}

export const createEnquiry = (data: CreateEnquiryPayload) =>
  apiFetch<Enquiry>('/enquiries', { method: 'POST', body: JSON.stringify(data) });

export const listSentEnquiries = (page = 1, limit = 20) =>
  apiFetch<Paginated<Enquiry>>(`/enquiries/sent?page=${page}&limit=${limit}`);

export const listReceivedEnquiries = (page = 1, limit = 20) =>
  apiFetch<Paginated<Enquiry>>(`/enquiries/received?page=${page}&limit=${limit}`);

export const replyEnquiry = (id: string, reply: string, status?: string) =>
  apiFetch<Enquiry>(`/enquiries/${id}/reply`, {
    method: 'PATCH',
    body: JSON.stringify({ reply, status }),
  });

// ── Notifications ──────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const listNotifications = (page = 1, limit = 20) =>
  apiFetch<Paginated<AppNotification>>(`/notifications?page=${page}&limit=${limit}`);

export const getUnreadNotificationCount = () =>
  apiFetch<{ count: number }>('/notifications/unread-count');

export const markNotificationRead = (id: string) =>
  apiFetch<void>(`/notifications/${id}/read`, { method: 'PATCH' });

export const markAllNotificationsRead = () =>
  apiFetch<void>('/notifications/read-all', { method: 'PATCH' });

// ── Admin ──────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalContractors: number;
  pendingVerifications: number;
  platformRevenue: number;
}

export const adminGetStats = () => apiFetch<AdminStats>('/admin/stats');

export const adminListUsers = (page = 1, limit = 20, search?: string) =>
  apiFetch<Paginated<User>>(`/admin/users?page=${page}&limit=${limit}${search ? '&search=' + encodeURIComponent(search) : ''}`);

export const adminUpdateUser = (id: string, data: { isActive?: boolean; role?: string }) =>
  apiFetch<User>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const adminListContractors = (page = 1, limit = 20, verified?: boolean) =>
  apiFetch<Paginated<Contractor>>(`/admin/contractors?page=${page}&limit=${limit}${verified !== undefined ? '&verified=' + verified : ''}`);

export const adminVerifyContractor = (id: string) =>
  apiFetch<Contractor>(`/admin/contractors/${id}/verify`, { method: 'PATCH' });

export const adminListMaterials = (page = 1, limit = 20) =>
  apiFetch<Paginated<Material>>(`/admin/materials?page=${page}&limit=${limit}`);

export const adminToggleFeatured = (id: string) =>
  apiFetch<Material>(`/admin/materials/${id}/feature`, { method: 'PATCH' });

export const adminListOrders = (page = 1, limit = 20) =>
  apiFetch<Paginated<Order & { buyer?: User }>>(`/admin/orders?page=${page}&limit=${limit}`);

// ── Projects ───────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  homeownerId: string;
  homeowner?: { id: string; fullName: string };
  title: string;
  description: string;
  projectType: string;
  city?: string;
  state?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  status: 'open' | 'closed' | 'awarded';
  bidCount?: number;
  createdAt: string;
}

export interface Bid {
  id: string;
  projectId: string;
  contractorId: string;
  contractor?: Contractor & { user?: { id: string; fullName: string } };
  bidAmount: number;
  message: string;
  status: 'pending' | 'shortlisted' | 'awarded' | 'rejected';
  createdAt: string;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  projectType: string;
  city?: string;
  state?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
}

export const createProject = (data: CreateProjectPayload) =>
  apiFetch<Project>('/projects', { method: 'POST', body: JSON.stringify(data) });

type ProjectsParams = Partial<{ page: number; limit: number; projectType: string; city: string; search: string }>;

export function listProjects(params: ProjectsParams = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '').map(([k, v]) => [k, String(v)])
  ).toString();
  return apiFetch<Paginated<Project>>(`/projects${qs ? '?' + qs : ''}`);
}

export const listMyProjects = (page = 1, limit = 20) =>
  apiFetch<Paginated<Project>>(`/projects/my?page=${page}&limit=${limit}`);

export const getProject = (id: string) => apiFetch<Project>(`/projects/${id}`);

export const closeProject = (id: string) =>
  apiFetch<Project>(`/projects/${id}/close`, { method: 'PATCH' });

export const submitBid = (projectId: string, data: { bidAmount: number; message: string }) =>
  apiFetch<Bid>(`/projects/${projectId}/bids`, { method: 'POST', body: JSON.stringify(data) });

export const getProjectBids = (projectId: string) =>
  apiFetch<Bid[]>(`/projects/${projectId}/bids`);

export const updateBidStatus = (projectId: string, bidId: string, status: string) =>
  apiFetch<Bid>(`/projects/${projectId}/bids/${bidId}`, { method: 'PATCH', body: JSON.stringify({ status }) });

// ── Saved / Bookmarks ──────────────────────────────────────────────────────

export type SavedType = 'contractor' | 'labour' | 'material';

export interface SavedItem {
  id: string;
  userId: string;
  type: SavedType;
  targetId: string;
  createdAt: string;
}

export const saveItem = (type: SavedType, targetId: string) =>
  apiFetch<SavedItem>('/saved', { method: 'POST', body: JSON.stringify({ type, targetId }) });

export const unsaveItem = (type: SavedType, targetId: string) =>
  apiFetch<void>(`/saved/${type}/${targetId}`, { method: 'DELETE' });

export const listSaved = (type?: SavedType) =>
  apiFetch<SavedItem[]>(`/saved${type ? '?type=' + type : ''}`);

export const isSaved = (type: SavedType, targetId: string) =>
  apiFetch<boolean>(`/saved/${type}/${targetId}`);

// ── Analytics ──────────────────────────────────────────────────────────────

export interface MyAnalytics {
  profileViews: number;
  enquiryCount: number;
  totalEarnings: number;
  weeklyEarnings: { label: string; earnings: number }[];
}

export const getMyAnalytics = () => apiFetch<MyAnalytics>('/analytics/my');

// ── Referral ───────────────────────────────────────────────────────────────

export interface ReferralStats {
  code: string;
  referralCount: number;
}

export const getReferralStats = () => apiFetch<ReferralStats>('/users/me/referral');
