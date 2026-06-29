"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, ChevronRight, Tag, ArrowRight, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const discount = couponApplied ? Math.round(total * 0.1) : 0;
  const delivery = total > 5000 ? 0 : 299;
  const grandTotal = total - discount + delivery;

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === "GRIFFY10") {
      setCouponApplied(true);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mb-6">
          <ShoppingCart className="w-12 h-12 text-orange-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 mb-2">Your cart is empty</h1>
        <p className="text-stone-500 mb-8 max-w-sm">
          Browse our construction materials marketplace and add items to get started.
        </p>
        <Link href="/materials" className="btn-primary">
          Browse Materials
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/materials" className="hover:text-orange-500">Materials</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-stone-900 font-medium">Cart</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-stone-900">
            Shopping Cart <span className="text-stone-400 font-normal text-lg">({items.length} {items.length === 1 ? "item" : "items"})</span>
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> Clear cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  {/* Emoji thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center text-3xl shrink-0">
                    {item.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-stone-900">{item.name}</h3>
                        <p className="text-sm text-stone-500 mt-0.5">{item.supplier} · {item.category}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                      {/* Qty control */}
                      <div className="flex items-center gap-0 bg-stone-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                          disabled={item.quantity <= item.minOrder}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-12 text-center font-bold text-stone-900 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-stone-400">Min: {item.minOrder} {item.unit}</span>

                      <div className="text-right">
                        <p className="font-extrabold text-stone-900">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-stone-400">₹{item.price.toLocaleString("en-IN")} / {item.unit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link
              href="/materials"
              className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-semibold px-1 pt-2 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Continue Shopping
            </Link>

            {/* Delivery info */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
              <Package className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-stone-800">
                  {total > 5000
                    ? "🎉 You qualify for FREE delivery!"
                    : `Add ₹${(5000 - total).toLocaleString("en-IN")} more for FREE delivery`}
                </p>
                <p className="text-stone-500 mt-0.5">Estimated delivery: 2–4 working days after confirmation</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <aside className="space-y-5">
            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" /> Apply Coupon
              </h3>
              {couponApplied ? (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-green-700 text-sm">GRIFFY10 applied!</p>
                    <p className="text-xs text-green-600">10% off on total order</p>
                  </div>
                  <button
                    onClick={() => { setCouponApplied(false); setCoupon(""); }}
                    className="text-xs text-red-500 font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              <p className="text-xs text-stone-400 mt-2">Try: GRIFFY10 for 10% off</p>
            </div>

            {/* Price breakdown */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-bold text-stone-900 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon discount (10%)</span>
                    <span>−₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Delivery charges</span>
                  <span className={delivery === 0 ? "text-green-600 font-medium" : ""}>
                    {delivery === 0 ? "FREE" : `₹${delivery}`}
                  </span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between font-extrabold text-stone-900 text-base">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <p className="text-xs text-stone-400 mt-3">
                *Prices are exclusive of GST. GST will be calculated at checkout.
              </p>

              <Link
                href="/checkout"
                className="w-full btn-primary justify-center mt-4 flex"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-stone-400">
                <span>🔒 Secure payment</span>
                <span>·</span>
                <span>✓ Verified suppliers</span>
              </div>
            </div>

            {/* Need help */}
            <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4 text-center">
              <p className="text-sm text-stone-600 font-medium">Need help with your order?</p>
              <Link href="/contact" className="text-sm text-orange-500 hover:text-orange-600 font-semibold mt-1 block">
                Contact Support →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
