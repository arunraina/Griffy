'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { isEnabled, isSubEnabled } from '@/lib/featureFlags';
import {
  fetchMyBookings, fetchIncomingBookings,
  confirmBooking, cancelBooking,
  type Booking,
} from '@/lib/bookings';

type Role = 'CUSTOMER' | 'SERVICE_PROVIDER' | 'MATERIAL_SELLER' | 'LAND_OWNER' | 'ADMIN' | 'PROPERTY_SELLER' | 'BUILDER' | 'PROPERTY_AGENT';

interface UserInfo {
  name: string;
  role: Role;
  contractorType: string;
  contractorStatus: string;
  contractorVerified: boolean;
  contractorFeatured: boolean;
  rejectionReason: string;
}

export default function DashboardPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [user, setUser]       = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // DEV: overrides for testing — remove before prod
  const [devRole,             setDevRole]             = useState<Role | null>(null);
  const [devContractorType,   setDevContractorType]   = useState<string>('labour');
  const [devContractorStatus, setDevContractorStatus] = useState<string>('pending');
  const role              = devRole ?? user?.role ?? 'CUSTOMER';
  const contractorType    = devRole === 'SERVICE_PROVIDER' ? devContractorType   : (user?.contractorType   ?? 'labour');
  const contractorStatus  = devRole === 'SERVICE_PROVIDER' ? devContractorStatus : (user?.contractorStatus ?? 'pending');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      // TODO: restore redirects before prod — bypassed for testing
      setUser({
        name:               u?.user_metadata?.name ?? u?.email?.split('@')[0] ?? 'Guest',
        role:               (u?.user_metadata?.role ?? 'CUSTOMER') as Role,
        contractorType:     u?.user_metadata?.contractor_type     ?? '',
        contractorStatus:   u?.user_metadata?.contractor_status   ?? 'pending',
        contractorVerified: u?.user_metadata?.contractor_verified ?? false,
        contractorFeatured: u?.user_metadata?.contractor_featured ?? false,
        rejectionReason:    u?.user_metadata?.rejection_reason    ?? '',
      });
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <svg className="animate-spin h-7 w-7 text-[#C0593A]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

        {/* DEV: switchers — remove before prod */}
        <div className="space-y-2 mb-6">
          <div className="flex gap-2 p-1 bg-[#F0E8E2] rounded-xl max-w-2xl flex-wrap">
            {([
              ['CUSTOMER', '🏠'], ['SERVICE_PROVIDER', '🔨'], ['MATERIAL_SELLER', '📦'],
              ['LAND_OWNER', '🌍'], ['PROPERTY_SELLER', '🏠S'], ['BUILDER', '🏢'], ['PROPERTY_AGENT', '🤝'], ['ADMIN', '⚙️'],
            ] as [Role, string][]).map(([r, icon]) => (
              <button key={r} type="button" onClick={() => setDevRole(r)}
                className={`flex-1 py-1 text-[10px] font-semibold rounded-lg transition-colors min-w-[40px] ${
                  role === r ? 'bg-white text-[#C0593A] shadow-sm' : 'text-[#6B5248] hover:text-[#2C1810]'
                }`}>
                {icon}
              </button>
            ))}
          </div>
          {role === 'SERVICE_PROVIDER' && (
            <>
              <div className="flex gap-2 p-1 bg-[#F0E8E2] rounded-xl max-w-sm">
                {['labour', 'sub_contractor', 'full_contractor'].map(ct => (
                  <button key={ct} type="button" onClick={() => setDevContractorType(ct)}
                    className={`flex-1 py-1 text-[10px] font-semibold rounded-lg transition-colors ${
                      contractorType === ct ? 'bg-white text-[#C0593A] shadow-sm' : 'text-[#6B5248]'
                    }`}>
                    {ct === 'labour' ? '👷 Labour' : ct === 'sub_contractor' ? '🏗️ Sub' : '🏢 Full'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 p-1 bg-[#F0E8E2] rounded-xl max-w-sm">
                {['pending', 'approved', 'rejected', 'suspended'].map(s => (
                  <button key={s} type="button" onClick={() => setDevContractorStatus(s)}
                    className={`flex-1 py-1 text-[10px] font-semibold rounded-lg transition-colors ${
                      contractorStatus === s ? 'bg-white text-[#C0593A] shadow-sm' : 'text-[#6B5248]'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {role === 'CUSTOMER'         && <HomeownerDashboard name={user?.name ?? ''} />}
        {role === 'SERVICE_PROVIDER' && <ContractorDashboard
          name={user?.name ?? ''}
          contractorType={contractorType}
          status={contractorStatus}
          verified={user?.contractorVerified ?? false}
          featured={user?.contractorFeatured ?? false}
          rejectionReason={user?.rejectionReason ?? ''}
        />}
        {role === 'MATERIAL_SELLER'  && <SellerDashboard name={user?.name ?? ''} />}
        {role === 'LAND_OWNER'       && <LandOwnerDashboard name={user?.name ?? ''} />}
        {role === 'PROPERTY_SELLER'  && <PropertySellerDashboard name={user?.name ?? ''} />}
        {role === 'BUILDER'          && <BuilderDashboard name={user?.name ?? ''} />}
        {role === 'PROPERTY_AGENT'   && <PropertyAgentDashboard name={user?.name ?? ''} />}
        {role === 'ADMIN'            && <AdminDashboard />}

      </main>
    </div>
  );
}

// ── HOMEOWNER DASHBOARD ───────────────────────────────────────────────────────

function HomeownerDashboard({ name }: { name: string }) {
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    fetchMyBookings().then(setBookings).catch(() => setBookings([]));
  }, []);

  const pendingCount   = bookings?.filter(b => b.status === 'PENDING').length   ?? 0;
  const confirmedCount = bookings?.filter(b => b.status === 'CONFIRMED').length ?? 0;

  return (
    <div className="space-y-8">
      <WelcomeHeader emoji="👋" title={`Welcome back, ${name}`} subtitle="Here's what's happening with your projects." />

      <StatGrid stats={[
        { icon: '📅', value: String(pendingCount),   label: 'Pending Bookings' },
        { icon: '✅', value: String(confirmedCount), label: 'Confirmed' },
        { icon: '🏗️', value: '0',                   label: 'Active Projects' },
        { icon: '📦', value: '0',                   label: 'Material Orders' },
      ]} />

      <QuickActions actions={([
        isEnabled('contractors')     && { label: 'Find Contractors', href: '/contractors',     icon: '🔨' },
        isEnabled('materials')       && { label: 'Browse Materials', href: '/materials',       icon: '🧱' },
        isEnabled('service_experts') && { label: 'Book a Service',   href: '/service-experts', icon: '📅' },
        isEnabled('labour')          && { label: 'Hire Labour',      href: '/labour',          icon: '👷' },
        (isEnabled('properties') && isSubEnabled('properties', 'buy_home'))  && { label: 'Buy Home',    href: '/properties?tab=buy',  icon: '🏠' },
        (isEnabled('properties') && isSubEnabled('properties', 'rent_home')) && { label: 'Rent a Home', href: '/properties?tab=rent', icon: '🔑' },
      ].filter(Boolean) as { label: string; href: string; icon: string }[])} />

      <MyBookingsList bookings={bookings} />
    </div>
  );
}

// ── CONTRACTOR DASHBOARD ──────────────────────────────────────────────────────

function ContractorDashboard({ name, contractorType, status, verified, featured, rejectionReason }: {
  name: string; contractorType: string; status: string;
  verified: boolean; featured: boolean; rejectionReason: string;
}) {
  const isLabour = contractorType === 'labour';
  return (
    <div className="space-y-6">

      {/* Status banners */}
      {status === 'pending' && (
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4">
          <span className="text-xl flex-shrink-0">⏳</span>
          <div>
            <p className="text-sm font-semibold text-yellow-800">Profile under review</p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Our team will review and approve your profile within 24–48 hours. You'll receive a WhatsApp notification once approved.
            </p>
          </div>
        </div>
      )}
      {status === 'rejected' && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <span className="text-xl flex-shrink-0">❌</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Profile not approved</p>
            {rejectionReason && <p className="text-xs text-red-700 mt-0.5">Reason: {rejectionReason}</p>}
            <Link href="/profile"
              className="inline-block mt-2 text-xs font-semibold text-red-700 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors">
              Update Profile
            </Link>
          </div>
        </div>
      )}
      {status === 'suspended' && (
        <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4">
          <span className="text-xl flex-shrink-0">⛔</span>
          <div>
            <p className="text-sm font-semibold text-gray-700">Profile suspended</p>
            <p className="text-xs text-gray-500 mt-0.5">Your profile has been suspended. Please contact support for details.</p>
          </div>
        </div>
      )}
      {status === 'approved' && (
        <div className="flex items-center gap-3 flex-wrap">
          {verified && (
            <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              ✅ Verified Contractor
            </span>
          )}
          {featured && (
            <span className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              ⭐ Featured
            </span>
          )}
          {!verified && !featured && (
            <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              ✅ Profile Approved
            </span>
          )}
        </div>
      )}

      <div className="space-y-8">
      <WelcomeHeader
        emoji={isLabour ? '👷' : '🏗️'}
        title={`Welcome, ${name}`}
        subtitle={isLabour ? 'Find daily work, track your jobs and earnings.' : 'Manage your leads, bookings and earnings.'}
      />

      {/* Available for Work toggle — labour only */}
      {isLabour && <AvailableToggle />}

      <StatGrid stats={isLabour ? [
        { icon: '📢', value: '0', label: 'Job Requests' },
        { icon: '🕐', value: '0', label: 'Active Jobs' },
        { icon: '✅', value: '0', label: 'Completed Jobs' },
        { icon: '₹',  value: '₹0', label: 'Total Earned' },
      ] : [
        { icon: '📢', value: '0', label: 'New Leads' },
        { icon: '📅', value: '0', label: 'Active Bookings' },
        { icon: '✅', value: '0', label: 'Completed Jobs' },
        { icon: '₹',  value: '₹0', label: 'Total Earnings' },
      ]} />

      <QuickActions actions={isLabour ? [
        { label: 'Browse Jobs',    href: '/jobs',    icon: '🔍' },
        { label: 'My Schedule',   href: '/schedule', icon: '📅' },
        { label: 'Update Skills', href: '/profile',  icon: '✏️' },
      ] : [
        { label: 'Update Profile', href: '/profile',  icon: '✏️' },
        { label: 'View Bookings',  href: '/bookings', icon: '📅' },
      ]} />

      <IncomingBookingsList />
      </div>
    </div>
  );
}

function AvailableToggle() {
  const supabase = createClient();
  const [available, setAvailable] = useState(false);
  const [saving, setSaving]       = useState(false);

  async function toggle() {
    setSaving(true);
    const next = !available;
    await supabase.auth.updateUser({ data: { available: next } });
    setAvailable(next);
    setSaving(false);
  }

  return (
    <div className="bg-white border border-[#EBE0D8] rounded-2xl p-4 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-sm font-semibold text-[#1a1a1a]">Available for Work</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {available ? 'Customers can see and contact you' : 'You are hidden from job requests'}
        </p>
      </div>
      <button type="button" onClick={toggle} disabled={saving}
        className={`relative w-12 h-6 rounded-full transition-colors ${available ? 'bg-[#C0593A]' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${available ? 'translate-x-6' : ''}`} />
      </button>
    </div>
  );
}

// ── MATERIAL SELLER DASHBOARD ─────────────────────────────────────────────────

function SellerDashboard({ name }: { name: string }) {
  return (
    <div className="space-y-8">
      <WelcomeHeader emoji="🏪" title={`Welcome, ${name}`} subtitle="Track your listings, orders and revenue." />

      <StatGrid stats={[
        { icon: '📋', value: '0', label: 'Active Listings' },
        { icon: '🕐', value: '0', label: 'Pending Orders' },
        { icon: '✅', value: '0', label: 'Completed Orders' },
        { icon: '₹',  value: '₹0', label: 'Total Revenue' },
      ]} />

      <QuickActions actions={[
        { label: 'Add Listing', href: '/listings/new', icon: '➕' },
        { label: 'View Orders', href: '/orders',       icon: '📦' },
      ]} />

      <RecentSection title="Recent Orders">
        <EmptyState icon="📦" message="No orders yet. Add your first material listing!" cta="Add Listing" href="/listings/new" />
      </RecentSection>
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────

function AdminDashboard() {
  return (
    <div className="space-y-8">
      <WelcomeHeader emoji="⚙️" title="Admin Panel" subtitle="Monitor platform activity and manage users." />

      <StatGrid stats={[
        { icon: '👥', value: '0', label: 'Total Users' },
        { icon: '🔨', value: '0', label: 'Contractors' },
        { icon: '🏠', value: '0', label: 'Properties' },
        { icon: '🌍', value: '0', label: 'Land Listings' },
        { icon: '🛒', value: '0', label: 'Orders' },
      ]} />

      <QuickActions actions={[
        { label: 'Manage Users',       href: '/admin/users',       icon: '👥' },
        { label: 'Manage Properties',  href: '/admin/properties',  icon: '🏠' },
        { label: 'View Reports',       href: '/admin/reports',     icon: '📊' },
      ]} />
    </div>
  );
}

// ── PROPERTY SELLER DASHBOARD ─────────────────────────────────────────────────

function PropertySellerDashboard({ name }: { name: string }) {
  return (
    <div className="space-y-8">
      <WelcomeHeader emoji="🏠" title={`Welcome, ${name}`} subtitle="Manage your property listings and leads." />

      <StatGrid stats={[
        { icon: '📋', value: '0', label: 'Active Listings' },
        { icon: '💬', value: '0', label: 'Enquiries Received' },
        { icon: '👁️', value: '0', label: 'Profile Views' },
        { icon: '📞', value: '0', label: 'Contact Requests' },
      ]} />

      <QuickActions actions={[
        { label: 'Add Property',    href: '/properties/new', icon: '➕' },
        { label: 'View Enquiries',  href: '/enquiries',      icon: '💬' },
        { label: 'Browse Properties', href: '/properties',   icon: '🔍' },
      ]} />

      <RecentSection title="Your Listings">
        <EmptyState
          icon="🏠"
          message="No listings yet. Add your first property to start receiving enquiries!"
          cta="Add Property"
          href="/properties/new"
        />
      </RecentSection>
    </div>
  );
}

// ── BUILDER DASHBOARD ─────────────────────────────────────────────────────────

function BuilderDashboard({ name }: { name: string }) {
  return (
    <div className="space-y-8">
      <WelcomeHeader emoji="🏢" title={`Welcome, ${name}`} subtitle="Manage your projects, units and buyer enquiries." />

      <StatGrid stats={[
        { icon: '🏗️', value: '0', label: 'Active Projects' },
        { icon: '🏠', value: '0', label: 'Units Listed' },
        { icon: '💬', value: '0', label: 'Buyer Enquiries' },
        { icon: '✅', value: '0', label: 'Units Sold' },
      ]} />

      <QuickActions actions={[
        { label: 'Add Project',       href: '/projects/new',   icon: '➕' },
        { label: 'View Enquiries',    href: '/enquiries',      icon: '💬' },
        { label: 'Browse Properties', href: '/properties',     icon: '🔍' },
      ]} />

      <RecentSection title="Your Projects">
        <EmptyState
          icon="🏢"
          message="No projects yet. Add your first project to attract buyers!"
          cta="Add Project"
          href="/projects/new"
        />
      </RecentSection>
    </div>
  );
}

// ── PROPERTY AGENT DASHBOARD ──────────────────────────────────────────────────

function PropertyAgentDashboard({ name }: { name: string }) {
  return (
    <div className="space-y-8">
      <WelcomeHeader emoji="🤝" title={`Welcome, ${name}`} subtitle="Track your leads, listings and commissions." />

      <StatGrid stats={[
        { icon: '📋', value: '0', label: 'Active Listings' },
        { icon: '💬', value: '0', label: 'Active Leads' },
        { icon: '✅', value: '0', label: 'Deals Closed' },
        { icon: '₹',  value: '₹0', label: 'Commission Earned' },
      ]} />

      <QuickActions actions={[
        { label: 'Add Listing',       href: '/properties/new', icon: '➕' },
        { label: 'View Leads',        href: '/leads',          icon: '💬' },
        { label: 'Browse Properties', href: '/properties',     icon: '🔍' },
      ]} />

      <RecentSection title="Your Listings">
        <EmptyState
          icon="🤝"
          message="No listings yet. Add properties you're representing to generate leads!"
          cta="Add Listing"
          href="/properties/new"
        />
      </RecentSection>
    </div>
  );
}

// ── LAND OWNER DASHBOARD ─────────────────────────────────────────────────────

function LandOwnerDashboard({ name }: { name: string }) {
  return (
    <div className="space-y-8">
      <WelcomeHeader emoji="🌍" title={`Welcome, ${name}`} subtitle="Manage your land listings, enquiries and profile." />

      <StatGrid stats={[
        { icon: '📋', value: '0', label: 'Active Listings' },
        { icon: '💬', value: '0', label: 'Enquiries Received' },
        { icon: '👁️', value: '0', label: 'Profile Views' },
        { icon: '📐', value: '0 sq ft', label: 'Total Listed Area' },
      ]} />

      <QuickActions actions={[
        { label: 'Add New Listing', href: '/land/new',    icon: '➕' },
        { label: 'View Enquiries',  href: '/enquiries',   icon: '💬' },
      ]} />

      <RecentSection title="Your Listings">
        <EmptyState
          icon="🌍"
          message="No listings yet. Add your first land or plot listing to start receiving enquiries!"
          cta="Add New Listing"
          href="/land/new"
        />
      </RecentSection>
    </div>
  );
}

// ── BOOKING COMPONENTS ────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  PENDING:     { label: 'Pending',     cls: 'bg-yellow-50  text-yellow-700  border-yellow-200'  },
  CONFIRMED:   { label: 'Confirmed',   cls: 'bg-green-50   text-green-700   border-green-200'   },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-50    text-blue-700    border-blue-200'    },
  COMPLETED:   { label: 'Completed',   cls: 'bg-gray-50    text-gray-600    border-gray-200'    },
  CANCELLED:   { label: 'Cancelled',   cls: 'bg-red-50     text-red-600     border-red-200'     },
};

function MyBookingsList({ bookings }: { bookings: Booking[] | null }) {
  if (bookings === null) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">My Bookings</h2>
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm flex items-center justify-center py-10">
          <svg className="animate-spin h-6 w-6 text-[#C0593A]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <RecentSection title="My Bookings">
        <EmptyState icon="📅" message="No bookings yet. Find a contractor or service expert to get started!" cta="Find Contractors" href="/contractors" />
      </RecentSection>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">My Bookings</h2>
      <div className="space-y-3">
        {bookings.map(b => {
          const badge = STATUS_BADGE[b.status] ?? STATUS_BADGE['PENDING'];
          const date  = new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          const providerInitials = (b.provider?.name ?? 'P').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div key={b.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FAEEE9] text-[#C0593A] text-xs font-bold flex items-center justify-center flex-shrink-0">
                {providerInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#2C1810]">{b.provider?.name ?? 'Provider'}</p>
                    <p className="text-xs text-[#A08070] mt-0.5">📅 {date}</p>
                    {b.notes && <p className="text-xs text-[#6B5248] mt-1 line-clamp-2">{b.notes}</p>}
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IncomingBookingsList() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchIncomingBookings().then(setBookings).catch(() => setBookings([]));
  }, []);

  async function handleConfirm(id: string) {
    if (updating) return;
    setUpdating(id);
    setBookings(prev => prev?.map(b => b.id === id ? { ...b, status: 'CONFIRMED' as const } : b) ?? null);
    try {
      await confirmBooking(id);
    } catch {
      setBookings(prev => prev?.map(b => b.id === id ? { ...b, status: 'PENDING' as const } : b) ?? null);
    } finally {
      setUpdating(null);
    }
  }

  async function handleCancel(id: string) {
    if (updating) return;
    setUpdating(id);
    setBookings(prev => prev?.map(b => b.id === id ? { ...b, status: 'CANCELLED' as const } : b) ?? null);
    try {
      await cancelBooking(id);
    } catch {
      setBookings(prev => prev?.map(b => b.id === id ? { ...b, status: 'PENDING' as const } : b) ?? null);
    } finally {
      setUpdating(null);
    }
  }

  if (bookings === null) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Incoming Bookings</h2>
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm flex items-center justify-center py-10">
          <svg className="animate-spin h-6 w-6 text-[#C0593A]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <RecentSection title="Incoming Bookings">
        <EmptyState icon="📢" message="No booking requests yet. Complete your profile to get discovered!" cta="Update Profile" href="/profile" />
      </RecentSection>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Incoming Bookings</h2>
      <div className="space-y-3">
        {bookings.map(b => {
          const badge = STATUS_BADGE[b.status] ?? STATUS_BADGE['PENDING'];
          const date  = new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          const customerInitials = (b.customer?.name ?? 'C').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          const isPending = b.status === 'PENDING';
          const isUpdating = updating === b.id;
          return (
            <div key={b.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {customerInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#2C1810]">{b.customer?.name ?? 'Customer'}</p>
                      {b.customer?.phone && <p className="text-xs text-[#A08070]">📞 {b.customer.phone}</p>}
                      <p className="text-xs text-[#A08070] mt-0.5">📅 {date}</p>
                      {b.notes && <p className="text-xs text-[#6B5248] mt-1 line-clamp-2">{b.notes}</p>}
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  {isPending && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleConfirm(b.id)}
                        disabled={isUpdating}
                        className="flex-1 text-xs font-semibold bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white py-2 rounded-lg transition-colors">
                        {isUpdating ? '…' : '✓ Confirm'}
                      </button>
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={isUpdating}
                        className="flex-1 text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 py-2 rounded-lg transition-colors">
                        {isUpdating ? '…' : '✕ Decline'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────

function WelcomeHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]" style={{ fontFamily: 'Georgia, serif' }}>
        {title} {emoji}
      </h1>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function StatGrid({ stats }: { stats: { icon: string; value: string; label: string }[] }) {
  return (
    <div className={`grid gap-4 grid-cols-2 ${stats.length === 5 ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-[#EBE0D8] p-5 flex flex-col gap-3">
          <span className="text-2xl">{s.icon}</span>
          <div>
            <p className="text-2xl font-bold text-[#1a1a1a]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickActions({ actions }: { actions: { label: string; href: string; icon: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Quick Actions</h2>
      <div className="flex flex-wrap gap-3">
        {actions.map(a => (
          <Link key={a.href} href={a.href}
            className="flex items-center gap-2 bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
            <span>{a.icon}</span>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function RecentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">{title}</h2>
      <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm">
        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon, message, cta, href }: { icon: string; message: string; cta: string; href: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-sm text-gray-500 mb-4 max-w-xs">{message}</p>
      <Link href={href}
        className="text-sm font-semibold text-[#C0593A] border border-[#C0593A] px-4 py-2 rounded-lg hover:bg-[#FAEEE9] transition-colors">
        {cta}
      </Link>
    </div>
  );
}
