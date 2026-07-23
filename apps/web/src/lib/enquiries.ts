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

export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'SITE_VISIT' | 'NEGOTIATING' | 'CLOSED';

export interface Enquiry {
  id: string;
  targetType: 'PROPERTY' | 'LAND';
  propertyId: string | null;
  landId: string | null;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  enquirer?: { name: string; phone: string | null };
  property?: { id: string; title: string } | null;
  land?: { id: string; title: string } | null;
}

export async function createEnquiry(input: { targetType: 'PROPERTY' | 'LAND'; propertyId?: string; landId?: string; message: string }): Promise<Enquiry> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/enquiries`, { method: 'POST', headers, body: JSON.stringify(input) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to send enquiry (${res.status})`);
  }
  return res.json();
}

export async function fetchReceivedEnquiries(): Promise<Enquiry[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/enquiries/received`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<Enquiry> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/enquiries/${id}/status`, { method: 'PATCH', headers, body: JSON.stringify({ status }) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to update enquiry (${res.status})`);
  }
  return res.json();
}
