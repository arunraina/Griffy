'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchOrder, type Order } from '@/lib/orders';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(params.id)
      .then((o) => setOrder(o))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center text-[#A08070] text-sm">Loading order…</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-4">Order not found.</p>
          <Link href="/orders" className="text-[#C0593A] hover:underline font-semibold">Back to Orders →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/orders" className="text-sm text-[#C0593A] hover:underline mb-4 inline-block">← Back to Orders</Link>

        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-bold text-[#2C1810]">Order #{order.id.slice(0, 8)}</h1>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200">
              {order.status}
            </span>
          </div>
          <p className="text-xs text-[#A08070] mb-6">
            Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="space-y-3 mb-5">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b border-[#F0E8E2] pb-3">
                <div className="w-12 h-12 bg-[#FAEEE9] rounded-xl flex items-center justify-center text-xl shrink-0">🏗️</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2C1810] truncate">{item.material?.name ?? 'Material'}</p>
                  <p className="text-xs text-[#A08070]">Qty {item.quantity} × ₹{Number(item.unitPrice).toLocaleString('en-IN')}</p>
                </div>
                <p className="text-sm font-bold text-[#2C1810] shrink-0">₹{Number(item.lineTotal).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-bold text-[#2C1810] mb-6">
            <span>Total</span>
            <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
          </div>

          {order.shippingAddress && (
            <div className="bg-[#FDF8F5] rounded-xl p-4 mb-2">
              <p className="text-xs font-semibold text-[#A08070] uppercase tracking-wide mb-1">Shipping Address</p>
              <p className="text-sm text-[#2C1810]">{order.shippingAddress}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
