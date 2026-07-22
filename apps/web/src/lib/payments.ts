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

export async function createPaymentOrder(
  entityType: 'order' | 'booking' | 'milestone',
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
