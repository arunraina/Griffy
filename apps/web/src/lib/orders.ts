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

export interface OrderItem {
  id: string;
  materialId: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  material?: { name: string; imageUrls: string[]; supplierId?: string };
}

export type OrderStatusValue = 'PLACED' | 'ACCEPTED' | 'REJECTED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatusValue = 'UNPAID' | 'PAID' | 'FAILED' | 'REFUND_INITIATED' | 'REFUNDED';
export type RefundStatusValue = 'INITIATED' | 'PROCESSED' | 'FAILED';

export interface Refund {
  id: string;
  orderId: string;
  amount: number; // paise
  reason: string;
  status: RefundStatusValue;
  createdAt: string;
  processedAt: string | null;
}

export interface Order {
  id: string;
  buyerId: string;
  totalAmount: string;
  status: OrderStatusValue;
  paymentStatus: PaymentStatusValue;
  shippingAddress: string | null;
  notes: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  items: OrderItem[];
  buyer?: { name: string; phone: string | null };
  refunds?: Refund[];
}

export interface OrderStatusEvent {
  id: string;
  orderId: string;
  status: OrderStatusValue;
  note: string | null;
  createdAt: string;
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

export async function fetchOrderHistory(id: string): Promise<OrderStatusEvent[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/orders/${id}/history`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchIncomingOrders(): Promise<Order[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/orders/incoming`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function updateOrderStatus(id: string, status: OrderStatusValue, note?: string): Promise<Order> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/orders/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to update order status');
  }
  return res.json();
}

export async function downloadInvoice(id: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/orders/${id}/invoice`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Invoice not available for this order.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
