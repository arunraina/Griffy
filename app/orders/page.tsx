import Link from "next/link";
import { Package, ChevronRight, Truck, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending:     { label: "Pending",     color: "bg-amber-100 text-amber-700",  icon: Clock },
  confirmed:   { label: "Confirmed",   color: "bg-blue-100 text-blue-700",    icon: CheckCircle2 },
  in_transit:  { label: "In Transit",  color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered:   { label: "Delivered",   color: "bg-green-100 text-green-700",  icon: CheckCircle2 },
  cancelled:   { label: "Cancelled",   color: "bg-red-100 text-red-700",      icon: XCircle },
  disputed:    { label: "Disputed",    color: "bg-orange-100 text-orange-700", icon: AlertCircle },
} as const;

type OrderStatus = keyof typeof STATUS_CONFIG;

const orders = [
  {
    id: "GRF847291",
    date: "24 Jun 2025",
    type: "material",
    status: "in_transit" as OrderStatus,
    items: [
      { emoji: "🧱", name: "Red Clay Bricks (Class A)", qty: "500 pcs", amount: 6500 },
      { emoji: "🪨", name: "River Sand (M-Sand)", qty: "2 tonnes", amount: 3800 },
    ],
    total: 10300,
    deliveryDate: "28 Jun 2025",
    supplier: "Shree Building Materials",
  },
  {
    id: "GRF712843",
    date: "18 Jun 2025",
    type: "material",
    status: "delivered" as OrderStatus,
    items: [
      { emoji: "🏗️", name: "TMT Steel Bars (Fe500D)", qty: "500 kg", amount: 28000 },
    ],
    total: 28000,
    deliveryDate: "21 Jun 2025",
    supplier: "Tata Steel Distributors",
  },
  {
    id: "GRF603921",
    date: "10 Jun 2025",
    type: "contractor",
    status: "pending" as OrderStatus,
    items: [
      { emoji: "👷", name: "Civil Contractor — Rajan Constructions", qty: "Full project", amount: 180000 },
    ],
    total: 180000,
    deliveryDate: "Starts Jul 5, 2025",
    supplier: "Rajan Constructions",
  },
  {
    id: "GRF499102",
    date: "2 Jun 2025",
    type: "material",
    status: "cancelled" as OrderStatus,
    items: [
      { emoji: "🪵", name: "Teak Wood Planks", qty: "10 pieces", amount: 12000 },
    ],
    total: 12000,
    deliveryDate: "—",
    supplier: "Krishna Timber Works",
  },
];

export const metadata = {
  title: "My Orders | Griffy",
  description: "Track and manage your material orders and bookings on Griffy.",
};

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-stone-900 font-medium">My Orders</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-extrabold text-stone-900 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h2 className="font-bold text-stone-700 mb-2">No orders yet</h2>
            <p className="text-stone-500 text-sm mb-6">Browse materials or hire contractors to get started.</p>
            <Link href="/materials" className="btn-primary">Browse Materials</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const sc = STATUS_CONFIG[order.status];
              const Icon = sc.icon;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  {/* Order header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-50 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-stone-900">{order.id}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${sc.color}`}>
                        <Icon className="w-3 h-3" /> {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-stone-500">
                      <span>Ordered: {order.date}</span>
                      <span className="text-stone-300">·</span>
                      <span>{order.type === "material" ? "📦 Materials" : "👷 Service"}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-4 space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-2xl">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-800 text-sm">{item.name}</p>
                          <p className="text-xs text-stone-400">{item.qty} · {order.supplier}</p>
                        </div>
                        <p className="font-bold text-stone-900 text-sm shrink-0">₹{item.amount.toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-4 bg-stone-50 flex-wrap gap-3">
                    <div className="text-sm text-stone-500">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-orange-500" />
                        {order.status === "delivered" ? "Delivered on " : "Expected: "}{order.deliveryDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-stone-900">₹{order.total.toLocaleString("en-IN")}</span>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1"
                      >
                        View Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
