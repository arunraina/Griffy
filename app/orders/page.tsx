"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ChevronRight, Truck, CheckCircle2, Clock, XCircle, AlertCircle, Star } from "lucide-react";
import { listMyOrders, Order } from "@/lib/api";
import { ORDER_STATUS, formatDate } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ReviewModal from "@/components/ReviewModal";

const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  accepted: CheckCircle2,
  in_progress: Truck,
  completed: CheckCircle2,
  cancelled: XCircle,
  disputed: AlertCircle,
};

const TYPE_EMOJI: Record<string, string> = {
  material: "📦",
  contractor: "👷",
  labour: "🔧",
};

function SkeletonRow() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-stone-200 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-stone-200 rounded w-1/2" />
          <div className="h-3 bg-stone-200 rounded w-1/3" />
        </div>
        <div className="h-6 bg-stone-200 rounded w-20" />
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        setLoading(true);
        const res = await listMyOrders(1, 20);
        setOrders(res.data);
        setTotal(res.total);
      } catch (e: any) {
        setError(e.message ?? "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated]);

  async function loadMore() {
    const next = page + 1;
    try {
      setLoadingMore(true);
      const res = await listMyOrders(next, 20);
      setOrders((prev) => [...prev, ...res.data]);
      setPage(next);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }

  const hasMore = orders.length < total;

  return (
    <div className="min-h-screen bg-stone-50">
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h2 className="font-bold text-stone-700 mb-2">No orders yet</h2>
            <p className="text-stone-500 text-sm mb-6">Browse materials or hire contractors to get started.</p>
            <Link href="/materials" className="btn-primary">Browse Materials</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const sc = ORDER_STATUS[order.status] ?? { label: order.status, color: "bg-stone-100 text-stone-600" };
              const Icon = STATUS_ICONS[order.status] ?? Clock;
              const emoji = TYPE_EMOJI[order.type] ?? "📦";
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-50 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-stone-900">#{order.id.slice(-8).toUpperCase()}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${sc.color}`}>
                        <Icon className="w-3 h-3" /> {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-stone-500">
                      <span>Ordered: {formatDate(order.createdAt)}</span>
                      <span className="text-stone-300">·</span>
                      <span>{emoji} {order.type.charAt(0).toUpperCase() + order.type.slice(1)}</span>
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-800 text-sm">
                          {order.type.charAt(0).toUpperCase() + order.type.slice(1)} order
                          {order.quantity ? ` × ${order.quantity}` : ""}
                        </p>
                        {order.notes && <p className="text-xs text-stone-400 mt-0.5 truncate">{order.notes}</p>}
                      </div>
                      <p className="font-bold text-stone-900 text-sm shrink-0">₹{order.amount.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-5 py-4 bg-stone-50 flex-wrap gap-3">
                    <div className="text-sm text-stone-500">
                      <span className="font-semibold text-stone-900">₹{order.amount.toLocaleString("en-IN")}</span>
                      {order.platformFee > 0 && <span className="ml-2 text-xs text-stone-400">(incl. ₹{order.platformFee} fee)</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      {order.status === "completed" && (
                        <button
                          onClick={() => setReviewOrder(order)}
                          className="flex items-center gap-1.5 text-sm text-yellow-600 hover:text-yellow-700 font-semibold"
                        >
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Leave a Review
                        </button>
                      )}
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

        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button onClick={loadMore} disabled={loadingMore} className="btn-secondary px-10 disabled:opacity-50">
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>

      {reviewOrder && (
        <ReviewModal
          orderId={reviewOrder.id}
          targetType={reviewOrder.type as "material" | "contractor" | "labour"}
          targetId={reviewOrder.itemId}
          targetName={`${reviewOrder.type.charAt(0).toUpperCase() + reviewOrder.type.slice(1)} order #${reviewOrder.id.slice(-8).toUpperCase()}`}
          onClose={() => setReviewOrder(null)}
          onSubmitted={() => setReviewOrder(null)}
        />
      )}
    </div>
  );
}
