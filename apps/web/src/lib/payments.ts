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

export async function createPaymentOrder(
  entityType: 'order' | 'booking',
  entityId: string,
  amountInPaise: number,
): Promise<{ razorpayOrderId: string; amount: number; currency: string }> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/payments/create-order`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ entityType, entityId, amountInPaise }),
  });
  if (!res.ok) throw new Error('Failed to create payment order');
  return res.json();
}

export async function verifyPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): Promise<{ success: boolean }> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/payments/verify`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, signature }),
  });
  if (!res.ok) throw new Error('Payment verification failed');
  return res.json();
}
