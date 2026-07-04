"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package, Truck, CheckCircle2, Clock, MapPin, Phone, MessageSquare, Download, XCircle, AlertCircle } from "lucide-react";
import { getOrder, Order } from "@/lib/api";
import { ORDER_STATUS, formatDate } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const TYPE_EMOJI: Record<string, string> = {
  material: "📦",
  contractor: "👷",
  labour: "🔧",
};

function buildTimeline(order: Order) {
  const steps = [
    { label: "Order Placed", icon: Package },
    { label: "Order Accepted", icon: CheckCircle2 },
    { label: "In Progress", icon: Truck },
    { label: "Completed / Delivered", icon: CheckCircle2 },
  ];
  const statusOrder = ["pending", "accepted", "in_progress", "completed"];
  const currentIdx = statusOrder.indexOf(order.status);
  return steps.map((s, i) => ({ ...s, done: i <= currentIdx }));
}

function Skeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-8 bg-stone-200 rounded w-1/3 mb-6" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-stone-200 rounded-2xl h-48" />
          <div className="bg-stone-200 rounded-2xl h-32" />
        </div>
        <div className="bg-stone-200 rounded-2xl h-48" />
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getOrder(id)
      .then(setOrder)
      .catch((e) => setError(e.message ?? "Order not found"))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  if (loading || authLoading) return <div className="min-h-screen bg-stone-50"><Skeleton /></div>;

  if (error || !order) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h2 className="font-bold text-stone-700 mb-2">Order not found</h2>
          <p className="text-stone-500 text-sm mb-4">{error}</p>
          <Link href="/orders" className="btn-primary">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const sc = ORDER_STATUS[order.status] ?? { label: order.status, color: "bg-stone-100 text-stone-600" };
  const emoji = TYPE_EMOJI[order.type] ?? "📦";
  const isCancelled = order.status === "cancelled" || order.status === "disputed";
  const timeline = isCancelled ? [] : buildTimeline(order);
  const currentStep = timeline.filter((t) => t.done).length;
  const shortId = order.id.slice(-8).toUpperCase();

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
            <span className="text-stone-900 font-medium">#{shortId}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title row */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">Order #{shortId}</h1>
            <p className="text-sm text-stone-500 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${sc.color}`}>{sc.label}</span>
            <button className="flex items-center gap-2 text-sm font-semibold text-stone-600 border border-stone-200 px-4 py-2 rounded-xl hover:bg-stone-50 transition-colors">
              <Download className="w-4 h-4" /> Invoice
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking */}
            {!isCancelled && timeline.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-stone-900 text-lg">Tracking</h2>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between text-sm text-stone-500 mb-2">
                    <span>Step {currentStep} of {timeline.length}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                      style={{ width: `${(currentStep / timeline.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="relative">
                  {timeline.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <div key={i} className="flex items-start gap-4 mb-4 last:mb-0 relative">
                        {i < timeline.length - 1 && (
                          <div className={`absolute left-4 top-8 w-0.5 h-8 ${step.done ? "bg-orange-300" : "bg-stone-200"}`} />
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${step.done ? "bg-orange-500" : "bg-stone-100"}`}>
                          <Icon className={`w-4 h-4 ${step.done ? "text-white" : "text-stone-400"}`} />
                        </div>
                        <div className="pt-1">
                          <p className={`text-sm font-semibold ${step.done ? "text-stone-900" : "text-stone-400"}`}>{step.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isCancelled && (
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 flex items-start gap-4">
                {order.status === "disputed" ? <AlertCircle className="w-6 h-6 text-orange-500 shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
                <div>
                  <h2 className="font-bold text-stone-900">{sc.label}</h2>
                  <p className="text-stone-500 text-sm mt-1">
                    {order.status === "disputed"
                      ? "This order is under dispute. Our support team will contact you shortly."
                      : "This order was cancelled. If you paid, a refund will be processed within 5–7 business days."}
                  </p>
                </div>
              </div>
            )}

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-4">Order Summary</h2>
              <div className="flex items-center gap-4 pb-4 border-b border-stone-50">
                <span className="text-3xl">{emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-stone-800">
                    {order.type.charAt(0).toUpperCase() + order.type.slice(1)} order
                    {order.quantity ? ` × ${order.quantity}` : ""}
                  </p>
                  {order.notes && <p className="text-sm text-stone-500 mt-0.5">{order.notes}</p>}
                </div>
                <p className="font-bold text-stone-900">₹{order.amount.toLocaleString("en-IN")}</p>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Order amount</span><span>₹{order.amount.toLocaleString("en-IN")}</span>
                </div>
                {order.platformFee > 0 && (
                  <div className="flex justify-between text-stone-500">
                    <span>Platform fee</span><span>₹{order.platformFee.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-stone-900 pt-2 border-t border-stone-100">
                  <span>Total</span><span>₹{(order.amount + order.platformFee).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            {order.deliveryAddress && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="font-bold text-stone-900 text-lg mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" /> Delivery Address
                </h2>
                <p className="text-sm text-stone-600 leading-relaxed">{order.deliveryAddress}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Payment */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-bold text-stone-900 mb-3 text-sm">Payment</h3>
              <div className="space-y-2 text-sm">
                {order.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Method</span>
                    <span className="font-medium text-stone-800 capitalize">{order.paymentMethod}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Status</span>
                  <span className={`font-bold ${order.isEscrowReleased ? "text-green-600" : "text-amber-600"}`}>
                    {order.isEscrowReleased ? "Released" : "In Escrow"}
                  </span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Payment ID</span>
                    <span className="font-mono text-xs text-stone-600 truncate max-w-[120px]">{order.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
              {!order.isEscrowReleased && order.status !== "cancelled" && (
                <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-400 flex items-start gap-1.5">
                  <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  Payment held in escrow — released after delivery confirmation.
                </div>
              )}
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
