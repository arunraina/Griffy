'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuthUser } from '@/lib/useAuthUser';

export default function CartPage() {
  const { items, setQty, removeItem, total } = useCart();
  const { user, loading } = useAuthUser();

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#FAEEE9] rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
            🛒
          </div>
          <h1 className="text-xl font-bold text-[#2C1810] mb-2">Log in to see your cart</h1>
          <p className="text-[#6B5248] mb-6">Your cart is tied to your account so it&apos;s there whenever you come back.</p>
          <Link
            href="/login"
            className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#FAEEE9] rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
            🛒
          </div>
          <h1 className="text-xl font-bold text-[#2C1810] mb-2">Your cart is empty</h1>
          <p className="text-[#6B5248] mb-6">Browse our construction materials marketplace and add items to get started.</p>
          <Link
            href="/materials"
            className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Browse Materials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-[#2C1810] mb-6" style={{ fontFamily: 'Georgia, serif' }}>
          Your Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-[#FAEEE9] rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {item.imageIcon || '🏗️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#2C1810] truncate">{item.name}</p>
                  <p className="text-xs text-[#A08070]">{item.sellerName}</p>
                  <p className="text-sm font-bold text-[#C0593A] mt-1">
                    ₹{item.price.toLocaleString('en-IN')} <span className="text-xs text-[#A08070] font-normal">{item.unit}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#FAEEE9] rounded-xl px-2 py-1.5 shrink-0">
                  <button
                    onClick={() => setQty(item.id, item.quantity - 1)}
                    className="text-[#C0593A] text-lg font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F0D8CC]"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-[#C0593A] w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => setQty(item.id, item.quantity + 1)}
                    className="text-[#C0593A] text-lg font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F0D8CC]"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 text-sm shrink-0 px-2"
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 sticky top-20">
              <h2 className="font-bold text-[#2C1810] mb-4">Order Summary</h2>
              <div className="flex justify-between text-sm text-[#6B5248] mb-2">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-[#A08070] mb-4">Delivery and taxes calculated at checkout.</p>
              <Link
                href="/checkout"
                className="block text-center bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/materials"
                className="block text-center text-sm text-[#C0593A] hover:underline mt-3"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
