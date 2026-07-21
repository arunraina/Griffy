'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/orders';
import { createPaymentOrder, verifyPayment } from '@/lib/payments';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay';
import { trackEvent } from '@/lib/analytics';
import { INDIAN_STATES } from '@/lib/geoConstants';

type Step = 'address' | 'payment';
type PaymentMethod = 'online' | 'cod';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState<Step>('address');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const [address, setAddress] = useState({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
  });

  const delivery = total > 5000 ? 0 : 299;
  const gst = Math.round(total * 0.18);
  const grandTotal = total + delivery + gst;

  if (items.length === 0 && !placedOrderId) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-4">Your cart is empty.</p>
          <Link href="/materials" className="text-[#C0593A] hover:underline font-semibold">Browse Materials →</Link>
        </div>
      </div>
    );
  }

  if (placedOrderId) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#EBE0D8] p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">✅</div>
          <h1 className="text-xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Order Placed!</h1>
          <p className="text-[#6B5248] mb-1">Your order has been confirmed.</p>
          <p className="text-sm font-bold text-[#C0593A] mb-6">Order ID: {placedOrderId}</p>
          <Link href={`/orders/${placedOrderId}`} className="block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold py-3 rounded-xl transition-colors mb-3">
            View Order
          </Link>
          <Link href="/materials" className="text-sm text-[#C0593A] hover:underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  function handleAddressNext(e: React.FormEvent) {
    e.preventDefault();
    setStep('payment');
    trackEvent('begin_checkout', { value: grandTotal, items: items.length });
  }

  function shippingAddressString() {
    return [address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(', ');
  }

  async function handlePlaceOrder() {
    setError('');
    setPlacing(true);
    try {
      const order = await createOrder({
        items: items.map((i) => ({ materialId: i.id, quantity: i.quantity })),
        shippingAddress: shippingAddressString(),
      });

      if (paymentMethod === 'cod') {
        clearCart();
        setPlacedOrderId(order.id);
        setPlacing(false);
        trackEvent('purchase', { transaction_id: order.id, value: grandTotal, payment_method: 'cod', items: items.length });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Could not load payment gateway. Please check your internet connection.');
        setPlacing(false);
        return;
      }

      const amountInPaise = Math.round(grandTotal * 100);
      const payOrder = await createPaymentOrder('order', order.id, amountInPaise);

      openRazorpayCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        amount: payOrder.amount,
        currency: payOrder.currency,
        name: 'Griffy',
        description: `${items.length} item${items.length > 1 ? 's' : ''} — Construction Materials`,
        order_id: payOrder.razorpayOrderId,
        prefill: { name: address.name, contact: address.phone },
        theme: { color: '#C0593A' },
        modal: { confirm_close: true, ondismiss: () => setPlacing(false) },
        handler: async (response) => {
          try {
            await verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            clearCart();
            setPlacedOrderId(order.id);
            trackEvent('purchase', { transaction_id: order.id, value: grandTotal, payment_method: 'online', items: items.length });
          } catch {
            setError(`Payment verification failed. Your order (${order.id}) is saved as pending — contact support with payment ID: ${response.razorpay_payment_id}`);
          } finally {
            setPlacing(false);
          }
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-[#2C1810] mb-6" style={{ fontFamily: 'Georgia, serif' }}>Checkout</h1>

        <div className="flex items-center gap-2 mb-6 text-sm font-medium">
          <span className={step === 'address' ? 'text-[#C0593A]' : 'text-[#A08070]'}>1. Address</span>
          <span className="text-[#D8B8A8]">→</span>
          <span className={step === 'payment' ? 'text-[#C0593A]' : 'text-[#A08070]'}>2. Payment</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {step === 'address' ? (
              <form onSubmit={handleAddressNext} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 space-y-4">
                <p className="font-bold text-[#2C1810]">Delivery Address</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input required placeholder="Full name" value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]" />
                  <input required placeholder="Phone number" value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]" />
                </div>
                <input required placeholder="Address line 1" value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]" />
                <input placeholder="Address line 2 (optional)" value={address.line2}
                  onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                  className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]" />
                <div className="grid sm:grid-cols-3 gap-4">
                  <input required placeholder="City" value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]" />
                  <select required value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A] bg-white">
                    <option value="">State</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input required placeholder="Pincode" value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]" />
                </div>
                <button type="submit" className="w-full bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold py-3 rounded-xl transition-colors">
                  Continue to Payment
                </button>
              </form>
            ) : (
              <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 space-y-4">
                <p className="font-bold text-[#2C1810]">Payment Method</p>
                <button onClick={() => setPaymentMethod('online')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === 'online' ? 'border-[#C0593A] bg-[#FAEEE9]' : 'border-[#EBE0D8]'}`}>
                  <span className="text-xl">💳</span>
                  <div>
                    <p className="font-semibold text-sm text-[#2C1810]">UPI / Card / Netbanking</p>
                    <p className="text-xs text-[#A08070]">Pay securely via Razorpay</p>
                  </div>
                </button>
                <button onClick={() => setPaymentMethod('cod')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === 'cod' ? 'border-[#C0593A] bg-[#FAEEE9]' : 'border-[#EBE0D8]'}`}>
                  <span className="text-xl">💵</span>
                  <div>
                    <p className="font-semibold text-sm text-[#2C1810]">Cash on Delivery</p>
                    <p className="text-xs text-[#A08070]">Pay when your order arrives</p>
                  </div>
                </button>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep('address')} className="flex-1 border-2 border-[#EBE0D8] text-[#6B5248] font-semibold py-3 rounded-xl">
                    Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={placing}
                    className="flex-1 bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                    {placing ? 'Placing Order…' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 sticky top-20">
              <h2 className="font-bold text-[#2C1810] mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm text-[#6B5248] mb-3 max-h-48 overflow-y-auto">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between gap-2">
                    <span className="truncate">{i.name} × {i.quantity}</span>
                    <span className="shrink-0">₹{(i.price * i.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#F0E8E2] pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-[#6B5248]"><span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-[#6B5248]"><span>Delivery</span><span>{delivery === 0 ? 'Free' : `₹${delivery}`}</span></div>
                <div className="flex justify-between text-[#6B5248]"><span>GST (18%)</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-bold text-[#2C1810] pt-1.5 border-t border-[#F0E8E2]">
                  <span>Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
