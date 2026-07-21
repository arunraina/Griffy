'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  fetchAdminUserDetail, createAdminPortfolioItem, createAdminServiceItem,
  fetchAdminUserBookings, fetchAdminUserReviews,
  type AdminUserDetail, type AdminProviderBooking, type AdminProviderReview,
} from '@/lib/admin';
import { SkeletonListRows } from '@/components/Skeleton';

const PRICE_UNITS = ['FIXED', 'PER_HOUR', 'PER_DAY', 'PER_POINT', 'PER_SQFT', 'PER_VISIT'] as const;
type PriceUnit = typeof PRICE_UNITS[number];

// Profile rows we don't want in the generic key/value dump below — either
// redundant with the header (name lives on User, not the profile row) or
// internal bookkeeping the admin doesn't need to see here.
const HIDDEN_PROFILE_FIELDS = new Set([
  'id', 'userId', 'createdAt', 'updatedAt', 'approvalStatus', 'approvedBy', 'approvedAt',
  'rejectionReason', 'portfolioImages', 'avgRating', 'totalReviews', 'totalOrders', 'user',
]);

// Keyed by LabourProfile.skillType / ServiceExpertProfile.expertiseType (see
// featureFlags.ts's labour/service_experts subcategories — these are the
// real values used in this app, not a separate role). Lets the admin add a
// realistic set of services in a couple of taps instead of typing every
// field by hand for each one.
const QUICK_ADD_SERVICES: Record<string, { name: string; category: string; unit: PriceUnit }[]> = {
  plumber: [
    { name: 'Tap repair', category: 'Repair', unit: 'FIXED' },
    { name: 'Tap replacement', category: 'Repair', unit: 'FIXED' },
    { name: 'Pipe fitting', category: 'Fitting', unit: 'PER_POINT' },
    { name: 'Pipe leakage fix', category: 'Fitting', unit: 'FIXED' },
    { name: 'Basin installation', category: 'Installation', unit: 'FIXED' },
    { name: 'WC installation', category: 'Installation', unit: 'FIXED' },
    { name: 'Drain cleaning', category: 'Cleaning', unit: 'FIXED' },
    { name: 'Burst pipe fix', category: 'Emergency', unit: 'FIXED' },
  ],
  electrician: [
    { name: 'Switch repair', category: 'Repair', unit: 'FIXED' },
    { name: 'Socket repair', category: 'Repair', unit: 'FIXED' },
    { name: 'Fan installation', category: 'Installation', unit: 'FIXED' },
    { name: 'Light installation', category: 'Installation', unit: 'FIXED' },
    { name: 'House wiring', category: 'Wiring', unit: 'PER_POINT' },
    { name: 'MCB installation', category: 'Wiring', unit: 'FIXED' },
    { name: 'Inverter installation', category: 'Installation', unit: 'FIXED' },
  ],
  mason: [
    { name: 'Brickwork', category: 'Brickwork', unit: 'PER_SQFT' },
    { name: 'Internal plaster', category: 'Plastering', unit: 'PER_SQFT' },
    { name: 'External plaster', category: 'Plastering', unit: 'PER_SQFT' },
    { name: 'Terrace waterproofing', category: 'Waterproofing', unit: 'PER_SQFT' },
    { name: 'Crack filling', category: 'Repair', unit: 'FIXED' },
  ],
  carpenter: [
    { name: 'Door installation', category: 'Doors', unit: 'FIXED' },
    { name: 'Door repair', category: 'Doors', unit: 'FIXED' },
    { name: 'Furniture repair', category: 'Furniture', unit: 'PER_VISIT' },
    { name: 'Wardrobe fitting', category: 'Furniture', unit: 'FIXED' },
    { name: 'Wooden flooring', category: 'Flooring', unit: 'PER_SQFT' },
    { name: 'False ceiling (POP)', category: 'False ceiling', unit: 'PER_SQFT' },
  ],
  painter: [
    { name: 'Putty application', category: 'Interior', unit: 'PER_SQFT' },
    { name: 'Primer coat', category: 'Interior', unit: 'PER_SQFT' },
    { name: 'Full interior painting', category: 'Interior', unit: 'PER_SQFT' },
    { name: 'Exterior paint', category: 'Exterior', unit: 'PER_SQFT' },
    { name: 'Texture paint', category: 'Special', unit: 'PER_SQFT' },
  ],
  tile_fixer: [
    { name: 'Floor tile fixing', category: 'Flooring', unit: 'PER_SQFT' },
    { name: 'Wall tile fixing', category: 'Wall', unit: 'PER_SQFT' },
    { name: 'Bathroom tiling', category: 'Wall', unit: 'FIXED' },
    { name: 'Tile replacement', category: 'Repair', unit: 'FIXED' },
  ],
  ac_technician: [
    { name: 'AC service (split)', category: 'Service', unit: 'FIXED' },
    { name: 'AC service (window)', category: 'Service', unit: 'FIXED' },
    { name: 'AC installation (split)', category: 'Installation', unit: 'FIXED' },
    { name: 'Gas recharge', category: 'Gas', unit: 'FIXED' },
    { name: 'Gas leak check', category: 'Gas', unit: 'FIXED' },
  ],
  welder: [
    { name: 'Gate fabrication', category: 'Fabrication', unit: 'FIXED' },
    { name: 'Railing fabrication', category: 'Fabrication', unit: 'PER_SQFT' },
    { name: 'Grill work', category: 'Fabrication', unit: 'PER_SQFT' },
    { name: 'Gate repair', category: 'Repair', unit: 'FIXED' },
  ],
  scaffolding: [
    { name: 'Scaffolding rental', category: 'Rental', unit: 'PER_DAY' },
    { name: 'Scaffolding erection', category: 'Setup', unit: 'FIXED' },
    { name: 'Scaffolding dismantling', category: 'Setup', unit: 'FIXED' },
  ],
};

function formatFieldName(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  return String(value);
}

type Tab = 'profile' | 'listings' | 'bookings' | 'reviews';
const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'listings', label: 'Services & Portfolio' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'reviews', label: 'Reviews' },
];

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('profile');
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [showAddService, setShowAddService] = useState(false);

  const [bookings, setBookings] = useState<AdminProviderBooking[] | null>(null);
  const [reviews, setReviews] = useState<AdminProviderReview[] | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAdminUserDetail(userId)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(load, [load]);

  // Lazy-load each tab's data only once, the first time it's opened.
  useEffect(() => {
    if (tab === 'bookings' && bookings === null) {
      fetchAdminUserBookings(userId).then(setBookings).catch(() => setBookings([]));
    }
    if (tab === 'reviews' && reviews === null) {
      fetchAdminUserReviews(userId).then(setReviews).catch(() => setReviews([]));
    }
  }, [tab, userId, bookings, reviews]);

  if (loading) {
    return (
      <div className="max-w-3xl">
        <SkeletonListRows count={4} />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
        <p className="text-[#2C1810] font-semibold mb-2">Could not load this user.</p>
        <p className="text-sm text-[#6B5248]">{error}</p>
      </div>
    );
  }

  const { user, profileType, profile, portfolio, services } = detail;
  const canHavePortfolio = profileType === 'contractor' || profileType === 'labour' || profileType === 'service-expert';
  const canHaveServices = profileType === 'labour' || profileType === 'service-expert';
  const skillKey = (profile?.skillType ?? profile?.expertiseType) as string | undefined;
  const quickAdd = skillKey ? QUICK_ADD_SERVICES[skillKey.toLowerCase().replace(/\s+/g, '_')] : undefined;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/users" className="text-sm text-[#A08070] hover:text-[#C0593A] inline-block">
        ← Back to Users
      </Link>

      <div className="bg-[#F3E8FF] border border-[#E4CCFF] rounded-xl px-4 py-2.5 text-sm text-[#6B2FB3] font-medium">
        ⚙️ Managing on behalf of {user.name}
      </div>

      <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-[#2C1810]">#{user.userNumber} · {user.name}</h1>
            <p className="text-sm text-[#6B5248] mt-1">{user.email}{user.phone ? ` · ${user.phone}` : ''}</p>
            <p className="text-xs text-[#A08070] mt-1">
              {user.role}{user.city ? ` · ${user.city}${user.state ? `, ${user.state}` : ''}` : ''}
            </p>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${user.isSuspended ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
            {user.isSuspended ? 'Suspended' : 'Active'}
          </span>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[#EBE0D8]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-[#C0593A] text-[#C0593A]' : 'border-transparent text-[#A08070] hover:text-[#6B5248]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
          {!profileType && (
            <p className="text-sm text-[#A08070]">This role has no professional profile to manage.</p>
          )}
          {profileType && !profile && (
            <p className="text-sm text-[#A08070]">No {profileType} profile found for this user.</p>
          )}
          {profile && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {Object.entries(profile)
                .filter(([key]) => !HIDDEN_PROFILE_FIELDS.has(key))
                .map(([key, value]) => (
                  <div key={key}>
                    <p className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">{formatFieldName(key)}</p>
                    <p className="text-sm text-[#2C1810] mt-0.5">{formatFieldValue(value)}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {tab === 'listings' && (
        <>
          {canHavePortfolio && (
            <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#2C1810]">Portfolio</h2>
                <button
                  onClick={() => setShowAddPortfolio((s) => !s)}
                  className="text-sm font-semibold text-[#C0593A] border border-[#C0593A] px-3 py-1.5 rounded-lg hover:bg-[#FAEEE9]"
                >
                  {showAddPortfolio ? 'Cancel' : '+ Add Portfolio Item'}
                </button>
              </div>

              {showAddPortfolio && (
                <AddPortfolioForm
                  userId={userId}
                  profileType={profileType as 'contractor' | 'labour' | 'service-expert'}
                  onCreated={() => { setShowAddPortfolio(false); load(); }}
                />
              )}

              {portfolio.length === 0 ? (
                <p className="text-sm text-[#A08070]">No portfolio items yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map((p) => (
                    <div key={p.id} className="border border-[#EBE0D8] rounded-xl overflow-hidden">
                      {p.imageUrls[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrls[0]} alt={p.title} className="w-full h-24 object-cover" />
                      )}
                      <div className="p-2">
                        <p className="text-xs font-semibold text-[#2C1810] truncate">{p.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {canHaveServices && (
            <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#2C1810]">Services & Rates</h2>
                <button
                  onClick={() => setShowAddService(true)}
                  className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-3 py-1.5 rounded-lg"
                >
                  + Add Service
                </button>
              </div>

              {services.length === 0 ? (
                <p className="text-sm text-[#A08070]">No services listed yet.</p>
              ) : (
                <div className="space-y-2">
                  {services.map((s) => (
                    <div key={s.id} className="flex items-center justify-between border border-[#EBE0D8] rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-[#2C1810]">{s.name}</p>
                        <p className="text-xs text-[#A08070]">{s.category}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#C0593A]">₹{s.price} <span className="text-xs text-[#A08070] font-normal">{s.priceUnit.replace('_', ' ').toLowerCase()}</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
          {bookings === null ? (
            <SkeletonListRows count={3} />
          ) : bookings.length === 0 ? (
            <p className="text-sm text-[#A08070]">No bookings yet.</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between border border-[#EBE0D8] rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#2C1810]">{b.customer?.name ?? 'Customer'}</p>
                    <p className="text-xs text-[#A08070]">{new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#2C1810]">₹{Number(b.amount).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-[#A08070]">{b.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
          {reviews === null ? (
            <SkeletonListRows count={3} />
          ) : reviews.length === 0 ? (
            <p className="text-sm text-[#A08070]">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="border border-[#EBE0D8] rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#2C1810]">{r.reviewer?.name ?? 'Anonymous'}</p>
                    <p className="text-sm font-semibold text-[#C0593A]">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                  </div>
                  {r.comment && <p className="text-sm text-[#6B5248] mt-1">{r.comment}</p>}
                  <p className="text-xs text-[#A08070] mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddService && canHaveServices && (
        <ServiceSlideOver
          userId={userId}
          profileType={profileType as 'labour' | 'service-expert'}
          quickAdd={quickAdd}
          onClose={() => setShowAddService(false)}
          onCreated={() => load()}
        />
      )}
    </div>
  );
}

function AddPortfolioForm({
  userId, profileType, onCreated,
}: { userId: string; profileType: 'contractor' | 'labour' | 'service-expert'; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) { setError('Title and at least one image URL are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await createAdminPortfolioItem(userId, {
        profileType, title: title.trim(), description: description.trim() || undefined, imageUrls: [imageUrl.trim()],
      });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add portfolio item');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAEEE9] rounded-xl p-4 mb-4 space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
        className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)"
        className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
      <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL"
        className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={saving}
        className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white px-4 py-2 rounded-lg">
        {saving ? 'Saving…' : 'Add Item'}
      </button>
    </form>
  );
}

// Slides in from the right with the main page still visible/scrollable
// behind it, and — unlike the old inline form — stays open after a
// successful add so the admin can add several services back to back
// without re-opening anything.
function ServiceSlideOver({
  userId, profileType, quickAdd, onClose, onCreated,
}: {
  userId: string;
  profileType: 'labour' | 'service-expert';
  quickAdd?: { name: string; category: string; unit: PriceUnit }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState<PriceUnit>('FIXED');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [justAdded, setJustAdded] = useState('');

  function applyChip(chip: { name: string; category: string; unit: PriceUnit }) {
    setName(chip.name);
    setCategory(chip.category);
    setPriceUnit(chip.unit);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceNum = Number(price);
    if (!name.trim() || !category.trim() || !priceNum || priceNum <= 0) {
      setError('Name, category, and a price greater than 0 are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createAdminServiceItem(userId, {
        profileType, name: name.trim(), category: category.trim(),
        description: description.trim() || undefined, price: priceNum, priceUnit,
      });
      setJustAdded(name.trim());
      setName(''); setCategory(''); setDescription(''); setPrice(''); setPriceUnit('FIXED');
      onCreated();
      setTimeout(() => setJustAdded(''), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add service');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBE0D8] sticky top-0 bg-white">
          <h2 className="font-semibold text-[#2C1810]">Add Service</h2>
          <button onClick={onClose} className="text-[#A08070] hover:text-[#C0593A] text-xl leading-none">✕</button>
        </div>

        <div className="p-5 space-y-5">
          {quickAdd && quickAdd.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide mb-2">Quick add — tap to fill, then set the price</p>
              <div className="flex flex-wrap gap-2">
                {quickAdd.map((chip) => (
                  <button
                    key={chip.name}
                    onClick={() => applyChip(chip)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      name === chip.name ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-[#FAEEE9] text-[#9E3F24] border-[#EBE0D8] hover:border-[#C0593A]'
                    }`}
                  >
                    {chip.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name (e.g. Wiring installation)"
              className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. Electrical)"
              className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" maxLength={100}
              className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
            <div className="flex gap-2">
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="1" placeholder="Price (₹)"
                className="flex-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
              <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value as PriceUnit)}
                className="text-sm border border-[#EBE0D8] rounded-lg px-3 py-2">
                {PRICE_UNITS.map((u) => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}
              </select>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            {justAdded && <p className="text-xs text-green-700">✓ Added &ldquo;{justAdded}&rdquo; — add another or close when done.</p>}
            <button type="submit" disabled={saving}
              className="w-full text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white px-4 py-2.5 rounded-lg">
              {saving ? 'Saving…' : 'Add Service'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
