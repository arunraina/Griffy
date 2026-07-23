'use client';

import { useEffect, useMemo, useState } from 'react';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import { greeting, firstName } from '@/lib/dashboard';
import { fetchIncomingOrders, updateOrderStatus, type Order, type OrderStatusValue } from '@/lib/orders';
import { updateMyMaterial, type Material } from '@/lib/materials';

const LOW_STOCK_THRESHOLD = 10;

const STATUS_PRIORITY: Record<OrderStatusValue, number> = {
  PLACED: 0, ACCEPTED: 1, PACKED: 2, SHIPPED: 3, DELIVERED: 4, REJECTED: 5, CANCELLED: 5,
};
const NEXT_ACTION: Partial<Record<OrderStatusValue, { label: string; next: OrderStatusValue }>> = {
  PLACED: { label: 'Accept Order', next: 'ACCEPTED' },
  ACCEPTED: { label: 'Mark Packed', next: 'PACKED' },
  PACKED: { label: 'Mark Shipped', next: 'SHIPPED' },
  SHIPPED: { label: 'Mark Delivered', next: 'DELIVERED' },
};

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export default function MaterialSupplierActiveView({
  me, materials, onMaterialsChange,
}: {
  state: UserState; me: Me; materials: Material[]; onMaterialsChange: (materials: Material[]) => void;
}) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchIncomingOrders().then(setOrders);
  }, []);

  const myMaterialIds = useMemo(() => new Set(materials.map((m) => m.id)), [materials]);

  async function advance(order: Order) {
    const action = NEXT_ACTION[order.status];
    if (!action) return;
    setBusyId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, action.next);
      setOrders((prev) => prev && prev.map((o) => (o.id === order.id ? updated : o)));
    } finally {
      setBusyId(null);
    }
  }

  async function halvePrice(material: Material) {
    const newPrice = Math.round(Number(material.price) * 0.9 * 100) / 100;
    const updated = await updateMyMaterial(material.id, { price: newPrice });
    onMaterialsChange(materials.map((m) => (m.id === material.id ? updated : m)));
  }

  if (orders === null) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
        <div className="max-w-[700px] mx-auto animate-pulse space-y-4">
          <div className="h-6 w-48 bg-[#EBE0D8]/60 rounded-lg" />
          <div className="h-32 bg-[#EBE0D8]/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  const loadedOrders = orders;
  const activeOrders = loadedOrders
    .filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED')
    .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const queueCounts = {
    new: loadedOrders.filter((o) => o.status === 'PLACED').length,
    accepted: loadedOrders.filter((o) => o.status === 'ACCEPTED').length,
    packed: loadedOrders.filter((o) => o.status === 'PACKED').length,
    shipped: loadedOrders.filter((o) => o.status === 'SHIPPED').length,
  };

  const lowStock = materials.filter((m) => m.stock > 0 && m.stock < LOW_STOCK_THRESHOLD);
  const outOfStock = materials.filter((m) => m.stock === 0);

  // Revenue: sum only THIS supplier's own line items (an order can span
  // multiple suppliers, so order.totalAmount would over-count).
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  function myRevenueSince(start: Date): number {
    return loadedOrders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED' && new Date(o.createdAt) >= start)
      .flatMap((o) => o.items)
      .filter((i) => myMaterialIds.has(i.materialId))
      .reduce((sum, i) => sum + Number(i.lineTotal), 0);
  }
  const revenueToday = myRevenueSince(todayStart);
  const revenueWeek = myRevenueSince(weekStart);
  const revenueMonth = myRevenueSince(monthStart);
  const revenueTotal = myRevenueSince(new Date(0));

  const topProducts = useMemo(() => {
    const byMaterial = new Map<string, { name: string; total: number }>();
    loadedOrders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED' && new Date(o.createdAt) >= monthStart)
      .flatMap((o) => o.items)
      .filter((i) => myMaterialIds.has(i.materialId))
      .forEach((i) => {
        const existing = byMaterial.get(i.materialId);
        byMaterial.set(i.materialId, {
          name: i.material?.name ?? 'Product',
          total: (existing?.total ?? 0) + Number(i.lineTotal),
        });
      });
    return [...byMaterial.values()].sort((a, b) => b.total - a.total).slice(0, 3);
  }, [loadedOrders, monthStart]);

  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[700px] mx-auto space-y-6">
        <h1 className="text-xl font-bold text-[#2C1810]">{greeting()}, {firstName(me.name)}</h1>

        <div>
          <h3 className="text-sm font-bold text-[#2C1810] mb-3">📦 Order Queue</h3>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-white rounded-xl border border-[#EBE0D8] p-2 text-center">
              <p className="text-lg font-bold text-red-600">{queueCounts.new}</p>
              <p className="text-[10px] text-[#A08070]">New</p>
            </div>
            <div className="bg-white rounded-xl border border-[#EBE0D8] p-2 text-center">
              <p className="text-lg font-bold text-yellow-600">{queueCounts.accepted}</p>
              <p className="text-[10px] text-[#A08070]">Accepted</p>
            </div>
            <div className="bg-white rounded-xl border border-[#EBE0D8] p-2 text-center">
              <p className="text-lg font-bold text-orange-600">{queueCounts.packed}</p>
              <p className="text-[10px] text-[#A08070]">Packed</p>
            </div>
            <div className="bg-white rounded-xl border border-[#EBE0D8] p-2 text-center">
              <p className="text-lg font-bold text-blue-600">{queueCounts.shipped}</p>
              <p className="text-[10px] text-[#A08070]">Shipped</p>
            </div>
          </div>
          <div className="space-y-3">
            {activeOrders.length === 0 && (
              <p className="text-sm text-[#A08070] bg-white rounded-2xl border border-[#EBE0D8] p-4 text-center">No active orders</p>
            )}
            {activeOrders.slice(0, 10).map((o) => {
              const action = NEXT_ACTION[o.status];
              return (
                <div key={o.id} className="bg-white rounded-2xl border border-[#EBE0D8] p-4">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-semibold text-sm text-[#2C1810]">#{o.id.slice(0, 8).toUpperCase()} · {o.buyer?.name ?? 'Customer'}</p>
                    <span className="text-xs font-semibold text-[#9E3F24] bg-[#FAEEE9] px-2 py-0.5 rounded-full">{o.status}</span>
                  </div>
                  <p className="text-xs text-[#A08070] mb-3">
                    {o.items.map((i) => `${i.material?.name ?? 'item'} x${i.quantity}`).join(', ')} · ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                  </p>
                  {action && (
                    <button
                      onClick={() => advance(o)}
                      disabled={busyId === o.id}
                      className="text-xs font-bold bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {action.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {(lowStock.length > 0 || outOfStock.length > 0) && (
          <div>
            <h3 className="text-sm font-bold text-[#2C1810] mb-3">⚠️ Inventory Alerts</h3>
            <div className="space-y-2">
              {outOfStock.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-red-200 p-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-[#2C1810]">🔴 {m.name} — out of stock</p>
                  <button onClick={() => updateMyMaterial(m.id, { stock: 10 }).then((u) => onMaterialsChange(materials.map((x) => x.id === u.id ? u : x)))}
                    className="text-xs font-semibold text-[#C0593A] hover:underline whitespace-nowrap">Mark in stock →</button>
                </div>
              ))}
              {lowStock.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-[#EBE0D8] p-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-[#2C1810]">📦 {m.name} — only {m.stock} left</p>
                  <button onClick={() => halvePrice(m)} className="text-xs font-semibold text-[#C0593A] hover:underline whitespace-nowrap">Reduce price 10% →</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
          <h3 className="text-sm font-bold text-[#2C1810] mb-3">💰 Revenue</h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-[#2C1810]">
            <p>Today: <span className="font-bold">₹{revenueToday.toLocaleString('en-IN')}</span></p>
            <p>This week: <span className="font-bold">₹{revenueWeek.toLocaleString('en-IN')}</span></p>
            <p>This month: <span className="font-bold">₹{revenueMonth.toLocaleString('en-IN')}</span></p>
            <p>Total: <span className="font-bold">₹{revenueTotal.toLocaleString('en-IN')}</span></p>
          </div>
          {topProducts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#EBE0D8]">
              <p className="text-xs font-semibold text-[#A08070] uppercase mb-2">Top products this month</p>
              {topProducts.map((p, i) => (
                <p key={p.name} className="text-sm text-[#2C1810]">{i + 1}. {p.name} — ₹{p.total.toLocaleString('en-IN')}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
