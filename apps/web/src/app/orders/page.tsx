'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyOrders, type Order } from '@/lib/orders';

const STATUS_STYLE: Record<Order['status'], string> = {
  PLACED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  PACKED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    fetchMyOrders()
      .then((o) => setOrders(o))
      .catch(() => setNeedsAuth(true))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && needsAuth) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-4">Log in to view your orders.</p>
          <Link href="/login" className="text-[#C0593A] hover:underline font-semibold">Log In →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-[#2C1810] mb-6" style={{ fontFamily: 'Georgia, serif' }}>Your Orders</h1>

        {loading ? (
          <p className="text-[#A08070] text-sm">Loading orders…</p>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-10 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold text-[#2C1810] mb-1">No orders yet</p>
            <p className="text-sm text-[#6B5248] mb-4">Orders you place for materials will show up here.</p>
            <Link href="/materials" className="text-[#C0593A] font-semibold hover:underline">Browse Materials →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link key={o.id} href={`/orders/${o.id}`}
                className="block bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 hover:border-[#D8B8A8] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-[#2C1810]">Order #{o.id.slice(0, 8)}</p>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[o.status]}`}>
                    {o.status}
                  </span>
                </div>
                <p className="text-xs text-[#A08070] mb-2">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p className="text-sm text-[#6B5248] truncate">
                  {o.items.map((i) => i.material?.name).filter(Boolean).join(', ')}
                </p>
                <p className="text-sm font-bold text-[#C0593A] mt-2">₹{Number(o.totalAmount).toLocaleString('en-IN')}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
