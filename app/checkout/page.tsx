"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, CreditCard, CheckCircle2, ArrowRight, Shield, Truck, Clock } from "lucide-react";
import { useCart } from "@/context/CartContext";

const INDIAN_STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra",
  "Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal",
];

type Step = "address" | "payment" | "confirm";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState<Step>("address");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId] = useState(() => "GRF" + Math.floor(100000 + Math.random() * 900000));

  const [address, setAddress] = useState({
    name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "",
  });

  const delivery = total > 5000 ? 0 : 299;
  const gst = Math.round(total * 0.18);
  const grandTotal = total + delivery + gst;

  function handleAddressNext(e: React.FormEvent) {
    e.preventDefault();
    setStep("payment");
  }

  async function handlePlaceOrder() {
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setPlacing(false);
    setPlaced(true);
    clearCart();
  }

  if (placed) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mb-2">Order Placed!</h1>
          <p className="text-stone-500 mb-1">Your order has been confirmed.</p>
          <p className="text-sm font-bold text-orange-500 mb-6">Order ID: {orderId}</p>

          <div className="bg-stone-50 rounded-2xl p-4 mb-6 text-left space-y-2 text-sm text-stone-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500" />
              <span>Estimated delivery: <strong className="text-stone-900">2–4 working days</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>You'll receive updates via SMS & email</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              <span>Payment secured via Griffy Escrow</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href={`/orders/${orderId}`} className="btn-primary justify-center">
              Track Your Order
            </Link>
            <Link href="/materials" className="btn-secondary justify-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/cart" className="hover:text-orange-500">Cart</Link>
            <ChevronRight className="w-4 h-4" />
            <span className={step === "address" ? "text-stone-900 font-medium" : "hover:text-orange-500 cursor-pointer"} onClick={() => step !== "address" && setStep("address")}>
              Delivery Address
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className={step === "payment" || step === "confirm" ? "text-stone-900 font-medium" : "text-stone-400"}>
              Payment
            </span>
          </nav>
        </div>
      </div>

      {/* Step indicators */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            {(["address", "payment"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex items-center gap-2 text-sm font-semibold ${step === s ? "text-orange-500" : (i < ["address","payment"].indexOf(step) ? "text-green-500" : "text-stone-300")}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step === s ? "border-orange-500 bg-orange-50 text-orange-600" : (i < ["address","payment"].indexOf(step) ? "border-green-500 bg-green-50 text-green-600" : "border-stone-200 text-stone-300")}`}>
                    {i < ["address","payment"].indexOf(step) ? "✓" : i + 1}
                  </div>
                  <span className="hidden sm:inline capitalize">{s === "address" ? "Delivery Address" : "Payment"}</span>
                </div>
                {i < 1 && <div className={`flex-1 h-0.5 w-8 ${i < ["address","payment"].indexOf(step) ? "bg-green-400" : "bg-stone-200"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main form area */}
          <div className="lg:col-span-2">

            {/* Step 1 — Address */}
            {step === "address" && (
              <form onSubmit={handleAddressNext} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-5">
                <h2 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" /> Delivery Address
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Full Name *</label>
                    <input
                      required
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      placeholder="Rajesh Kumar"
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Mobile Number *</label>
                    <input
                      required
                      type="tel"
                      pattern="[6-9]\d{9}"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Address Line 1 *</label>
                  <input
                    required
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    placeholder="Plot no., Street name"
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Address Line 2</label>
                  <input
                    value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    placeholder="Landmark, Colony (optional)"
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">City *</label>
                    <input
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Bengaluru"
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">State *</label>
                    <select
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                    >
                      <option value="">Select</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Pincode *</label>
                    <input
                      required
                      pattern="\d{6}"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      placeholder="560001"
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full btn-primary justify-center">
                  Continue to Payment <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </form>
            )}

            {/* Step 2 — Payment */}
            {step === "payment" && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-5">
                <h2 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-500" /> Choose Payment Method
                </h2>

                <div className="space-y-3">
                  {[
                    { id: "upi", label: "UPI / GPay / PhonePe", desc: "Pay instantly via any UPI app", icon: "📱" },
                    { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay accepted", icon: "💳" },
                    { id: "cod", label: "Cash on Delivery", desc: "Pay when materials arrive at site", icon: "💵" },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === m.id ? "border-orange-400 bg-orange-50" : "border-stone-200 hover:border-stone-300"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={paymentMethod === m.id as typeof paymentMethod}
                        onChange={() => setPaymentMethod(m.id as typeof paymentMethod)}
                        className="accent-orange-500"
                      />
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <p className="font-semibold text-stone-900 text-sm">{m.label}</p>
                        <p className="text-xs text-stone-500">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === "upi" && (
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1.5">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                    ₹50 COD convenience fee applies. Payment collected at delivery.
                  </div>
                )}

                <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700">
                  <Shield className="w-4 h-4 shrink-0" />
                  All payments are secured and processed via Razorpay. Your card details are never stored.
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full btn-primary justify-center disabled:opacity-60"
                >
                  {placing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>Place Order · ₹{grandTotal.toLocaleString("en-IN")} <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 sticky top-24">
              <h3 className="font-bold text-stone-900 mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
                      <p className="text-xs text-stone-400">{item.quantity} {item.unit}</p>
                    </div>
                    <p className="text-sm font-bold text-stone-900 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST (18%)</span>
                  <span>₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? "text-green-600 font-medium" : ""}>
                    {delivery === 0 ? "FREE" : `₹${delivery}`}
                  </span>
                </div>
                <div className="border-t border-stone-100 pt-2 flex justify-between font-extrabold text-stone-900">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {step === "payment" && address.name && (
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <p className="text-xs font-bold text-stone-700 mb-1">Delivering to:</p>
                  <p className="text-xs text-stone-500">{address.name}, {address.line1}, {address.city} - {address.pincode}</p>
                  <button onClick={() => setStep("address")} className="text-xs text-orange-500 font-semibold hover:underline mt-1">
                    Change
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
