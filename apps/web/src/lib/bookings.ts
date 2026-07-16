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

export interface Booking {
  id: string;
  providerId: string;
  customerId: string;
  providerRole: string;
  scheduledAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  amount: string;
  createdAt: string;
  provider?: { id: string; name: string; avatarUrl: string | null; phone: string | null };
  customer?: { id: string; name: string; phone: string | null; email: string };
}

export async function createBooking(body: {
  providerId: string;
  providerRole: string;
  scheduledAt: string;
  notes?: string;
}): Promise<Booking> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...body, amount: 0 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to create booking (${res.status})`);
  }
  return res.json();
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/bookings/my`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchIncomingBookings(): Promise<Booking[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/bookings/incoming`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function confirmBooking(id: string): Promise<Booking> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/bookings/${id}/confirm`, { method: 'PATCH', headers });
  if (!res.ok) throw new Error('Failed to confirm booking');
  return res.json();
}

export async function cancelBooking(id: string): Promise<Booking> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/bookings/${id}/cancel`, { method: 'PATCH', headers });
  if (!res.ok) throw new Error('Failed to cancel booking');
  return res.json();
}
