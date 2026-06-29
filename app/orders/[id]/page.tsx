import Link from "next/link";
import { ChevronRight, Package, Truck, CheckCircle2, Clock, MapPin, Phone, MessageSquare, Download, RotateCcw } from "lucide-react";

const order = {
  id: "GRF847291",
  date: "24 Jun 2025, 10:32 AM",
  status: "in_transit",
  estimatedDelivery: "28 Jun 2025",
  supplier: "Shree Building Materials",
  supplierPhone: "+91 98765 43210",
  supplierRating: 4.7,
  items: [
    { emoji: "🧱", name: "Red Clay Bricks (Class A)", qty: 500, unit: "pcs", price: 13, amount: 6500 },
    { emoji: "🪨", name: "River Sand (M-Sand)", qty: 2, unit: "tonnes", price: 1900, amount: 3800 },
  ],
  subtotal: 10300,
  gst: 1854,
  delivery: 0,
  total: 12154,
  address: {
    name: "Rajesh Kumar",
    phone: "9876543210",
    line1: "Plot 42, 6th Cross, HSR Layout",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560102",
  },
  payment: { method: "UPI — GPay", transactionId: "TXN8472910293", status: "Paid" },
  timeline: [
    { label: "Order Placed", time: "24 Jun, 10:32 AM", done: true, icon: Package },
    { label: "Order Confirmed", time: "24 Jun, 11:05 AM", done: true, icon: CheckCircle2 },
    { label: "Dispatched from Supplier", time: "26 Jun, 9:00 AM", done: true, icon: Truck },
    { label: "Out for Delivery", time: "28 Jun, 8:30 AM (expected)", done: false, icon: Truck },
    { label: "Delivered", time: "28 Jun (expected)", done: false, icon: CheckCircle2 },
  ],
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Order ${params.id} | Griffy`, description: "Track your Griffy order in real-time." };
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const currentStep = order.timeline.filter((t) => t.done).length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/orders" className="hover:text-orange-500">My Orders</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-stone-900 font-medium">{params.id}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title row */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">Order {params.id}</h1>
            <p className="text-sm text-stone-500 mt-0.5">Placed on {order.date}</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-sm font-semibold text-stone-600 border border-stone-200 px-4 py-2 rounded-xl hover:bg-stone-50 transition-colors">
              <Download className="w-4 h-4" /> Invoice
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold text-stone-600 border border-stone-200 px-4 py-2 rounded-xl hover:bg-stone-50 transition-colors">
              <RotateCcw className="w-4 h-4" /> Reorder
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-stone-900 text-lg">Tracking</h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                  🚚 In Transit
                </span>
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between text-sm text-stone-500 mb-2">
                  <span>Step {currentStep} of {order.timeline.length}</span>
                  <span className="font-semibold text-orange-500">Est. {order.estimatedDelivery}</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                    style={{ width: `${(currentStep / order.timeline.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="relative">
                {order.timeline.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 mb-4 last:mb-0 relative">
                      {i < order.timeline.length - 1 && (
                        <div className={`absolute left-4 top-8 w-0.5 h-8 ${step.done ? "bg-orange-300" : "bg-stone-200"}`} />
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${step.done ? "bg-orange-500" : "bg-stone-100"}`}>
                        <Icon className={`w-4 h-4 ${step.done ? "text-white" : "text-stone-400"}`} />
                      </div>
                      <div className="pt-1">
                        <p className={`text-sm font-semibold ${step.done ? "text-stone-900" : "text-stone-400"}`}>{step.label}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{step.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-4">Items Ordered</h2>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 pb-4 last:pb-0 last:border-0 border-b border-stone-50">
                    <span className="text-3xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-stone-800">{item.name}</p>
                      <p className="text-sm text-stone-500">{item.qty} {item.unit} × ₹{item.price.toLocaleString("en-IN")}/{item.unit}</p>
                    </div>
                    <p className="font-bold text-stone-900">₹{item.amount.toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-stone-100 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span><span>₹{order.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST (18%)</span><span>₹{order.gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery</span><span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between font-extrabold text-stone-900 pt-2 border-t border-stone-100">
                  <span>Total Paid</span><span>₹{order.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" /> Delivery Address
              </h2>
              <div className="text-sm text-stone-600 leading-relaxed">
                <p className="font-semibold text-stone-900">{order.address.name}</p>
                <p>{order.address.line1}</p>
                <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                <p className="mt-1">📞 {order.address.phone}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Supplier */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-bold text-stone-900 mb-3 text-sm">Supplier</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center">
                  {order.supplier[0]}
                </div>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{order.supplier}</p>
                  <p className="text-xs text-stone-400">⭐ {order.supplierRating} · Verified Supplier</p>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 border border-stone-200 hover:border-blue-300 text-stone-700 hover:text-blue-600 font-semibold py-2.5 rounded-xl transition-all text-sm">
                  <Phone className="w-4 h-4" /> Call Supplier
                </button>
                <button className="w-full flex items-center justify-center gap-2 text-stone-500 hover:text-stone-700 font-medium py-2 text-sm transition-colors">
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-bold text-stone-900 mb-3 text-sm">Payment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Method</span>
                  <span className="font-medium text-stone-800">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status</span>
                  <span className="font-bold text-green-600">{order.payment.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Txn ID</span>
                  <span className="font-mono text-xs text-stone-600">{order.payment.transactionId}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-400 flex items-start gap-1.5">
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Payment will be released to supplier after delivery confirmation.
              </div>
            </div>

            {/* Help */}
            <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4">
              <p className="text-sm font-bold text-stone-700 mb-1">Need help with this order?</p>
              <Link href="/contact" className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                Contact Support →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
