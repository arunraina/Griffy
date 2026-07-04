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
