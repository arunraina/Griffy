import { createClient } from './supabase';
import { getImpersonationToken } from './impersonation';
import { NotAuthenticatedError } from './users';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function authHeaders(): Promise<Record<string, string>> {
  const impersonationToken = getImpersonationToken();
  if (impersonationToken) {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${impersonationToken}` };
  }
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new NotAuthenticatedError();
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` };
}

export interface Material {
  id: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string;
  price: string | number;
  unit: string;
  stock: number;
  minOrderQty: number | null;
  imageUrls: string[];
  avgRating: number;
  reviewCount: number;
  isHidden: boolean;
  createdAt: string;
}

export interface CreateMaterialInput {
  name: string;
  description?: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  stock: number;
}

export async function fetchMyMaterials(): Promise<Material[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/materials/mine`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function createMyMaterial(input: CreateMaterialInput): Promise<Material> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/materials`, { method: 'POST', headers, body: JSON.stringify(input) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to add material (${res.status})`);
  }
  return res.json();
}

export async function updateMyMaterial(id: string, input: Partial<CreateMaterialInput>): Promise<Material> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/materials/${id}`, { method: 'PATCH', headers, body: JSON.stringify(input) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to update material (${res.status})`);
  }
  return res.json();
}
