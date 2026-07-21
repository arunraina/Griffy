'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchMe, NotAuthenticatedError, type Me } from '@/lib/users';
import {
  fetchMyBookings, fetchIncomingBookings,
  confirmBooking, cancelBooking,
  type Booking,
} from '@/lib/bookings';
import { fetchMyOrders, type Order } from '@/lib/orders';
import KycSection from './_components/KycSection';
import OrdersTab from './_components/OrdersTab';
import ListingsTab from './_components/ListingsTab';
import PortfolioTab from './_components/PortfolioTab';
import { SkeletonListRows } from '@/components/Skeleton';

type Role = Me['role'];

interface TabDef { id: string; label: string; icon: string }

function tabsForRole(role: Role): TabDef[] {
  switch (role) {
    case 'HOMEOWNER':
      return [
        { id: 'overview', label: 'Overview', icon: '🏠' },
        { id: 'bookings', label: 'My Bookings', icon: '📅' },
        { id: 'orders', label: 'My Orders', icon: '📦' },
        { id: 'saved', label: 'Saved', icon: '♡' },
      ];
    case 'CONTRACTOR':
    case 'LABOUR':
    case 'SERVICE_EXPERT':
      return [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'bookings', label: 'Bookings', icon: '📅' },
        { id: 'portfolio', label: 'My Work', icon: '🖼️' },
        { id: 'kyc', label: 'KYC & Bank', icon: '🪪' },
      ];
    case 'MATERIAL_SUPPLIER':
      return [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'orders', label: 'Orders', icon: '📦' },
        { id: 'kyc', label: 'KYC & Bank', icon: '🪪' },
      ];
    case 'LAND_OWNER':
    case 'PROPERTY_SELLER':
    case 'BUILDER':
    case 'PROPERTY_AGENT':
      return [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'listings', label: 'My Listings', icon: '🏘️' },
        { id: 'leads', label: 'Leads', icon: '💬' },
        { id: 'kyc', label: 'KYC & Bank', icon: '🪪' },
      ];
    default:
      return [{ id: 'overview', label: 'Overview', icon: '📊' }];
  }
}

const ROLE_LABEL: Record<string, string> = {
  HOMEOWNER: 'Homeowner', CONTRACTOR: 'Contractor', LABOUR: 'Labour',
  SERVICE_EXPERT: 'Service Expert', MATERIAL_SUPPLIER: 'Material Supplier',
  LAND_OWNER: 'Land Owner', PROPERTY_SELLER: 'Property Seller',
  BUILDER: 'Builder', PROPERTY_AGENT: 'Property Agent',
};

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardPageInner />
    </Suspense>
  );
}

function DashboardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Lets cards elsewhere (e.g. /dashboard/home) deep-link straight into a
  // specific tab, e.g. /dashboard?tab=bookings — falls back to the default
  // Overview tab when absent or unrecognized.
  const [tab, setTab] = useState(searchParams.get('tab') || 'overview');

  useEffect(() => {
    // Admin access (adminRole) is independent of role (the marketplace user
    // type) — an admin still has their own homeowner/contractor/etc.
    // dashboard and isn't redirected away from it. The Navbar's "Admin"
    // link is how they reach /admin instead.
    fetchMe()
      .then((data) => {
        setMe(data);
      })
      .catch((e) => {
        if (e instanceof NotAuthenticatedError) router.replace('/login?redirect=/dashboard');
        else setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-2">Could not load your dashboard.</p>
          <p className="text-sm text-[#6B5248]">Check your connection and try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (loading || !me) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <svg className="animate-spin h-7 w-7 text-[#C0593A]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  const tabs = tabsForRole(me.role as Role);

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]" style={{ fontFamily: 'Georgia, serif' }}>
            Welcome, {me.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{ROLE_LABEL[me.role] ?? me.role} dashboard</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                tab === t.id ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab role={me.role as Role} />}
        {tab === 'bookings' && me.role === 'HOMEOWNER' && <MyBookingsTab />}
        {tab === 'bookings' && me.role !== 'HOMEOWNER' && <IncomingBookingsTab />}
        {tab === 'orders' && me.role === 'HOMEOWNER' && <MyOrdersTab />}
        {tab === 'orders' && me.role === 'MATERIAL_SUPPLIER' && <OrdersTab />}
        {tab === 'saved' && <SavedTab />}
        {tab === 'listings' && (
          <ListingsTab kind={me.role === 'LAND_OWNER' ? 'land' : me.role === 'PROPERTY_SELLER' ? 'property' : 'unavailable'} />
        )}
        {tab === 'leads' && <LeadsComingSoon />}
        {tab === 'portfolio' && <PortfolioTab role={me.role} />}
        {tab === 'kyc' && <KycSection />}
      </main>
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────

function OverviewTab({ role }: { role: Role }) {
  const isHomeowner = role === 'HOMEOWNER';
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (isHomeowner) {
      fetchMyBookings().then(setBookings).catch(() => setBookings([]));
      fetchMyOrders().then(setOrders).catch(() => setOrders([]));
    } else if (['CONTRACTOR', 'LABOUR', 'SERVICE_EXPERT'].includes(role)) {
      fetchIncomingBookings().then(setBookings).catch(() => setBookings([]));
    }
  }, [role, isHomeowner]);

  const stats: { icon: string; value: string; label: string }[] = [];

  if (isHomeowner) {
    stats.push(
      { icon: '📅', value: String(bookings?.filter((b) => b.status === 'PENDING').length ?? 0), label: 'Pending Bookings' },
      { icon: '✅', value: String(bookings?.filter((b) => b.status === 'CONFIRMED').length ?? 0), label: 'Confirmed Bookings' },
      { icon: '📦', value: String(orders?.length ?? 0), label: 'Material Orders' },
    );
  } else if (['CONTRACTOR', 'LABOUR', 'SERVICE_EXPERT'].includes(role)) {
    stats.push(
      { icon: '📢', value: String(bookings?.filter((b) => b.status === 'PENDING').length ?? 0), label: 'New Requests' },
      { icon: '📅', value: String(bookings?.filter((b) => b.status === 'CONFIRMED').length ?? 0), label: 'Active Bookings' },
      { icon: '✅', value: String(bookings?.filter((b) => b.status === 'COMPLETED').length ?? 0), label: 'Completed' },
    );
  }

  return (
    <div className="space-y-6">
      {stats.length > 0 && (
        <div className={`grid gap-4 grid-cols-2 ${stats.length >= 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-[#EBE0D8] p-5 flex flex-col gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold text-[#1a1a1a]">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {isHomeowner ? (
            <>
              <Link href="/contractors" className="flex items-center gap-2 bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">🔨 Find Contractors</Link>
              <Link href="/materials" className="flex items-center gap-2 bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">🧱 Browse Materials</Link>
              <Link href="/post-project?type=turnkey" className="flex items-center gap-2 bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">🔑 Post a Turnkey Project</Link>
            </>
          ) : (
            <Link href="/profile" className="flex items-center gap-2 bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">✏️ Update Profile</Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Bookings ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Pending', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-green-50 text-green-700 border-green-200' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  COMPLETED: { label: 'Completed', cls: 'bg-gray-50 text-gray-600 border-gray-200' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-50 text-red-600 border-red-200' },
};

function MyBookingsTab() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  useEffect(() => { fetchMyBookings().then(setBookings).catch(() => setBookings([])); }, []);

  if (bookings === null) return <SkeletonListRows count={4} />;
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
        <p className="text-4xl mb-3">📅</p>
        <p className="font-semibold text-[#2C1810] mb-1">No bookings yet</p>
        <Link href="/contractors" className="text-sm font-semibold text-[#C0593A] border border-[#C0593A] px-4 py-2 rounded-lg hover:bg-[#FAEEE9] inline-block mt-2">Find Contractors</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const badge = STATUS_BADGE[b.status] ?? STATUS_BADGE.PENDING;
        return (
          <div key={b.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FAEEE9] text-[#C0593A] text-xs font-bold flex items-center justify-center shrink-0">
              {(b.provider?.name ?? 'P').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#2C1810]">{b.provider?.name ?? 'Provider'}</p>
                  <p className="text-xs text-[#A08070] mt-0.5">📅 {new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${badge.cls}`}>{badge.label}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IncomingBookingsTab() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  function load() { fetchIncomingBookings().then(setBookings).catch(() => setBookings([])); }
  useEffect(load, []);

  async function handleConfirm(id: string) {
    setUpdating(id);
    try { await confirmBooking(id); load(); } finally { setUpdating(null); }
  }
  async function handleCancel(id: string) {
    setUpdating(id);
    try { await cancelBooking(id); load(); } finally { setUpdating(null); }
  }

  if (bookings === null) return <SkeletonListRows count={4} />;
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
        <p className="text-4xl mb-3">📢</p>
        <p className="font-semibold text-[#2C1810] mb-1">No booking requests yet</p>
        <Link href="/profile" className="text-sm font-semibold text-[#C0593A] border border-[#C0593A] px-4 py-2 rounded-lg hover:bg-[#FAEEE9] inline-block mt-2">Update Profile</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const badge = STATUS_BADGE[b.status] ?? STATUS_BADGE.PENDING;
        const isPending = b.status === 'PENDING';
        return (
          <div key={b.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                {(b.customer?.name ?? 'C').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#2C1810]">{b.customer?.name ?? 'Customer'}</p>
                    {b.customer?.phone && <p className="text-xs text-[#A08070]">📞 {b.customer.phone}</p>}
                    <p className="text-xs text-[#A08070] mt-0.5">📅 {new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${badge.cls}`}>{badge.label}</span>
                </div>
                {isPending && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleConfirm(b.id)} disabled={updating === b.id}
                      className="flex-1 text-xs font-semibold bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white py-2 rounded-lg transition-colors">
                      {updating === b.id ? '…' : '✓ Confirm'}
                    </button>
                    <button onClick={() => handleCancel(b.id)} disabled={updating === b.id}
                      className="flex-1 text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 py-2 rounded-lg transition-colors">
                      {updating === b.id ? '…' : '✕ Decline'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── My Orders (homeowner) ─────────────────────────────────────────────────────

function MyOrdersTab() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => { fetchMyOrders().then(setOrders).catch(() => setOrders([])); }, []);

  if (orders === null) return <SkeletonListRows count={4} />;
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
        <p className="text-4xl mb-3">📦</p>
        <p className="font-semibold text-[#2C1810] mb-1">No orders yet</p>
        <Link href="/materials" className="text-sm font-semibold text-[#C0593A] border border-[#C0593A] px-4 py-2 rounded-lg hover:bg-[#FAEEE9] inline-block mt-2">Browse Materials</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Link key={o.id} href={`/orders/${o.id}`} className="block bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4 hover:border-[#D8B8A8] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#2C1810]">Order #{o.id.slice(0, 8)}</p>
              <p className="text-xs text-[#A08070]">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#2C1810]">₹{Number(o.totalAmount).toLocaleString('en-IN')}</p>
              <span className="text-[11px] font-semibold text-[#C0593A]">{o.status}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ── Saved ─────────────────────────────────────────────────────────────────────

function SavedTab() {
  return (
    <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
      <p className="text-4xl mb-3">♡</p>
      <p className="font-semibold text-[#2C1810] mb-1">Your saved items</p>
      <p className="text-sm text-[#6B5248] mb-4">Materials, contractors, labour, and service experts you&apos;ve saved.</p>
      <Link href="/saved" className="text-sm font-semibold text-[#C0593A] border border-[#C0593A] px-4 py-2 rounded-lg hover:bg-[#FAEEE9] inline-block">
        View Saved →
      </Link>
    </div>
  );
}

// ── Leads (not yet built) ─────────────────────────────────────────────────────

function LeadsComingSoon() {
  return (
    <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
      <p className="text-4xl mb-3">💬</p>
      <p className="font-semibold text-[#2C1810] mb-1">Coming soon</p>
      <p className="text-sm text-[#6B5248]">Enquiries from homeowners interested in your listings will show up here.</p>
    </div>
  );
}
