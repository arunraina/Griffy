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

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; contact?: string; email?: string };
  theme?: { color: string };
  modal?: { confirm_close?: boolean; ondismiss?: () => void };
  handler: (response: RazorpaySuccessResponse) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export function openRazorpayCheckout(options: RazorpayOptions): void {
  const rzp = new window.Razorpay(options);
  rzp.open();
}
