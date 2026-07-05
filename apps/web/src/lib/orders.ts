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

export interface OrderItem {
  id: string;
  materialId: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  material?: { name: string; imageUrls: string[] };
}

export interface Order {
  id: string;
  buyerId: string;
  totalAmount: string;
  status: 'PLACED' | 'ACCEPTED' | 'REJECTED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string | null;
  notes: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  items: OrderItem[];
}

export async function createOrder(body: {
  items: { materialId: string; quantity: number }[];
  shippingAddress: string;
  notes?: string;
}): Promise<Order> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to place order (${res.status})`);
  }
  return res.json();
}

export async function fetchMyOrders(): Promise<Order[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/orders`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchOrder(id: string): Promise<Order | null> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/orders/${id}`, { headers });
  if (!res.ok) return null;
  return res.json();
}
