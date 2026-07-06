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
  type: string;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPage {
  items: Notification[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchNotifications(opts: { unread?: boolean; page?: number; pageSize?: number } = {}): Promise<NotificationPage> {
  const headers = await authHeaders();
  const params = new URLSearchParams();
  if (opts.unread) params.set('unread', 'true');
  if (opts.page) params.set('page', String(opts.page));
  if (opts.pageSize) params.set('pageSize', String(opts.pageSize));

  const res = await fetch(`${API}/notifications?${params.toString()}`, { headers });
  if (!res.ok) return { items: [], total: 0, page: 1, pageSize: opts.pageSize ?? 20 };
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
