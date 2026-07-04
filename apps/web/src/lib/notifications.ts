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

export interface Notification {
  id: string;
  type: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'ORDER_STATUS_CHANGED';
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/notifications`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchUnreadCount(): Promise<number> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/notifications/unread-count`, { headers });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const headers = await authHeaders();
  await fetch(`${API}/notifications/${id}/read`, { method: 'PATCH', headers });
}

export async function markAllNotificationsRead(): Promise<void> {
  const headers = await authHeaders();
  await fetch(`${API}/notifications/read-all`, { method: 'PATCH', headers });
}
