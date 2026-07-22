'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { UserState } from '@griffy/shared';
import { greeting } from '@/lib/dashboard';
import { fetchMyBookings, type Booking } from '@/lib/bookings';
import { fetchMyOrders, type Order } from '@/lib/orders';

const ACTIVE_BOOKING_STATUSES = new Set(['PENDING', 'CONFIRMED', 'IN_PROGRESS']);
const INACTIVE_ORDER_STATUSES = new Set(['DELIVERED', 'CANCELLED', 'REJECTED']);

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
};

const ROLE_LABEL: Record<string, string> = {
  CONTRACTOR: 'Contractor', LABOUR: 'Skilled Labour', SERVICE_EXPERT: 'Service Expert',
};

const QUICK_ACTIONS = [
  { icon: '🏗️', label: 'Contractors', href: '/contractors' },
  { icon: '🧱', label: 'Materials', href: '/materials' },
  { icon: '📐', label: 'Estimate', href: '/estimate' },
  { icon: '📋', label: 'Dashboard', href: '/dashboard' },
];

export default function ActiveHomeownerDashboard({ state, name }: { state: UserState; name: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (state.hasBookings) fetchMyBookings().then((all) => setBookings(all.filter((b) => ACTIVE_BOOKING_STATUSES.has(b.status))));
    if (state.hasOrders) fetchMyOrders().then((all) => setOrders(all.filter((o) => !INACTIVE_ORDER_STATUSES.has(o.status))));
  }, [state.hasBookings, state.hasOrders]);

  const totalActive = state.activeBookingsCount + state.activeOrdersCount;

  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[900px] mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#2C1810]">{greeting()}, {name}</h1>
          <p className="text-sm text-[#6B5248] mt-0.5">
            You have {totalActive} active {totalActive === 1 ? 'item' : 'items'}
          </p>
        </div>

        {state.hasBookings && (
          <div>
            <h3 className="text-sm font-bold text-[#2C1810] mb-3">🔴 Active Bookings</h3>
            <div className="space-y-3">
              {bookings.slice(0, 2).map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-[#EBE0D8] p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#FAEEE9] flex items-center justify-center text-[#C0593A] font-bold shrink-0">
                      {(b.provider?.name ?? '?').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#2C1810] truncate">{b.provider?.name ?? 'Provider'}</p>
                      <p className="text-xs text-[#A08070]">
                        {ROLE_LABEL[b.providerRole] ?? b.providerRole} • {new Date(b.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {b.status}
                    </span>
                    <Link href="/dashboard?tab=bookings" className="text-xs font-semibold text-[#C0593A] hover:underline whitespace-nowrap">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
              {state.activeBookingsCount > 2 && (
                <Link href="/dashboard?tab=bookings" className="block text-center text-xs font-semibold text-[#C0593A] hover:underline">
                  + {state.activeBookingsCount - 2} more booking{state.activeBookingsCount - 2 > 1 ? 's' : ''}
                </Link>
              )}
            </div>
          </div>
        )}

        {state.hasOrders && (
          <div>
            <h3 className="text-sm font-bold text-[#2C1810] mb-3">📦 Your Orders</h3>
            <div className="space-y-3">
              {orders.slice(0, 2).map((o) => (
                <div key={o.id} className="bg-white rounded-2xl border border-[#EBE0D8] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm text-[#2C1810]">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                    <span className="text-xs font-semibold text-[#9E3F24] bg-[#FAEEE9] px-2 py-0.5 rounded-full">{o.status}</span>
                  </div>
                  <p className="text-xs text-[#A08070] mb-3">
                    {o.items.length} item{o.items.length !== 1 ? 's' : ''} • ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                  </p>
                  <Link href="/dashboard?tab=orders" className="text-xs font-semibold text-[#C0593A] hover:underline">
                    Track Order →
                  </Link>
                </div>
              ))}
              {state.activeOrdersCount > 2 && (
                <Link href="/dashboard?tab=orders" className="block text-center text-xs font-semibold text-[#C0593A] hover:underline">
                  + {state.activeOrdersCount - 2} more order{state.activeOrdersCount - 2 > 1 ? 's' : ''}
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.href} href={a.href}
              className="bg-white hover:border-[#C0593A] border border-[#EBE0D8] rounded-xl p-3 text-center transition-colors">
              <span className="text-lg block">{a.icon}</span>
              <span className="text-[11px] font-semibold text-[#2C1810]">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
