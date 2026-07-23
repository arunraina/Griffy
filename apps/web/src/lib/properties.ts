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
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export interface PropertyListing {
  id: string;
  title: string;
  propertyType: string;
  furnishing: string;
  areaSqFt: string;
  price: string;
  bedrooms: number | null;
  bathrooms: number | null;
  city: string;
  state: string;
  listingType: string;
  isAvailable: boolean;
  viewCount: number;
  createdAt: string;
}

export interface CreatePropertyInput {
  title: string;
  description?: string;
  propertyType: string;
  furnishing: string;
  areaSqFt: number;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  location: string;
  city: string;
  state: string;
}

export async function fetchMyProperties(): Promise<PropertyListing[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/properties/mine`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function createMyProperty(input: CreatePropertyInput): Promise<PropertyListing> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/properties`, { method: 'POST', headers, body: JSON.stringify(input) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to create listing (${res.status})`);
  }
  return res.json();
}

export async function updateMyProperty(id: string, input: Partial<CreatePropertyInput> & { isAvailable?: boolean }): Promise<PropertyListing> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/properties/${id}`, { method: 'PATCH', headers, body: JSON.stringify(input) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to update listing (${res.status})`);
  }
  return res.json();
}
