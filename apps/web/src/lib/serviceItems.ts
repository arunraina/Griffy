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

export interface PublicServiceItem {
  id: string;
  name: string;
  description: string | null;
  price: number; // paise
  priceUnit: 'FIXED' | 'PER_HOUR' | 'PER_DAY' | 'PER_POINT' | 'PER_SQFT' | 'PER_VISIT';
  category: string;
}

const PRICE_UNIT_LABEL: Record<PublicServiceItem['priceUnit'], string> = {
  FIXED: '',
  PER_HOUR: '/hour',
  PER_DAY: '/day',
  PER_POINT: '/point',
  PER_SQFT: '/sqft',
  PER_VISIT: '/visit',
};

export function formatServiceItemPrice(item: PublicServiceItem): string {
  const rupees = (item.price / 100).toLocaleString('en-IN');
  return `₹${rupees}${PRICE_UNIT_LABEL[item.priceUnit]}`;
}

// Public, unauthenticated -- same GET /service-items/:profileType/:profileId
// the admin panel's own service-item manager writes to.
export async function fetchPublicServiceItems(
  profileType: 'contractor' | 'labour' | 'service-expert',
  profileId: string,
): Promise<PublicServiceItem[]> {
  try {
    const res = await fetch(`${API}/service-items/${profileType}/${profileId}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export interface CreateServiceItemInput {
  profileType: 'contractor' | 'labour' | 'service-expert';
  name: string;
  category: string;
  price: number; // paise
  priceUnit: PublicServiceItem['priceUnit'];
}

// Self-serve -- the server resolves profileId from the caller's own
// profile, same route the admin panel's quick-add already writes to.
export async function createMyServiceItem(input: CreateServiceItemInput): Promise<PublicServiceItem> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/service-items`, { method: 'POST', headers, body: JSON.stringify(input) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to add service (${res.status})`);
  }
  return res.json();
}

export async function deleteMyServiceItem(id: string): Promise<void> {
  const headers = await authHeaders();
  await fetch(`${API}/service-items/${id}`, { method: 'DELETE', headers });
}
