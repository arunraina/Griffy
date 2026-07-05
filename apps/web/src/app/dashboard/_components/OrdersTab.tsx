'use client';

import { useEffect, useState } from 'react';
import { fetchIncomingOrders, updateOrderStatus, type Order, type OrderStatusValue } from '@/lib/orders';

const STATUS_BADGE: Record<OrderStatusValue, string> = {
  PLACED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  PACKED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
};

// Supplier-driven next action per current status — mirrors LEGAL_TRANSITIONS
// on the backend (orders.service.ts), just the happy-path forward move.
const NEXT_ACTION: Partial<Record<OrderStatusValue, { label: string; status: OrderStatusValue }>> = {
  PLACED: { label: 'Accept Order', status: 'ACCEPTED' },
  ACCEPTED: { label: 'Mark Packed', status: 'PACKED' },
  PACKED: { label: 'Mark Shipped', status: 'SHIPPED' },
  SHIPPED: { label: 'Mark Delivered', status: 'DELIVERED' },
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  function load() {
    fetchIncomingOrders().then(setOrders).catch(() => setOrders([]));
  }

  useEffect(load, []);

  async function handleAdvance(order: Order) {
    const next = NEXT_ACTION[order.status];
    if (!next) return;
    setUpdating(order.id);
    try {
      await updateOrderStatus(order.id, next.status);
      load();
    } catch {
      /* leave state; retry available */
    } finally {
      setUpdating(null);
    }
  }

  async function handleReject(order: Order) {
    setUpdating(order.id);
    try {
      await updateOrderStatus(order.id, 'REJECTED');
      load();
    } catch {
      /* leave state; retry available */
    } finally {
      setUpdating(null);
    }
  }

  if (orders === null) {
    return <div className="bg-white rounded-2xl border border-[#EBE0D8] p-8 text-center text-sm text-[#A08070]">Loading orders…</div>;
  }

  const visible = filter === 'active' ? orders.filter((o) => !['DELIVERED', 'REJECTED', 'CANCELLED'].includes(o.status)) : orders;

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
        <p className="text-4xl mb-3">📦</p>
        <p className="font-semibold text-[#2C1810] mb-1">No orders yet</p>
        <p className="text-sm text-[#6B5248]">Orders placed for your materials will show up here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['active', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${filter === f ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}>
            {f === 'active' ? 'Active' : 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((o) => {
          const next = NEXT_ACTION[o.status];
          const isUpdating = updating === o.id;
          return (
            <div key={o.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-[#2C1810]">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-[#A08070]">{o.buyer?.name ?? 'Buyer'} · {new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                  <p className="text-xs text-[#6B5248] mt-1">{o.items.map((i) => i.material?.name).filter(Boolean).join(', ')}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_BADGE[o.status]}`}>{o.status}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm font-bold text-[#2C1810]">₹{Number(o.totalAmount).toLocaleString('en-IN')}</p>
                {next && (
                  <div className="flex gap-2">
                    {o.status === 'PLACED' && (
                      <button onClick={() => handleReject(o)} disabled={isUpdating}
                        className="text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50">
                        Reject
                      </button>
                    )}
                    <button onClick={() => handleAdvance(o)} disabled={isUpdating}
                      className="text-xs font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
                      {isUpdating ? '…' : next.label}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
