const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (document.getElementById('razorpay-script')) return resolve(true);

    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const API = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

export async function createRazorpayOrder(
  amount: number,
  token: string,
  notes?: string,
): Promise<{ razorpay_order_id: string; amount: number; currency: string; key_id: string }> {
  const res = await fetch(`${API}/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount, notes }),
  });
  if (!res.ok) throw new Error('Failed to create payment order');
  return res.json();
}

export async function verifyRazorpayPayment(
  payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; deliveryAddress?: string },
  token: string,
): Promise<{ success: boolean }> {
  const res = await fetch(`${API}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Payment verification failed');
  return res.json();
}

export function openRazorpayCheckout(options: RazorpayOptions): void {
  const rzp = new window.Razorpay(options);
  rzp.open();
}
