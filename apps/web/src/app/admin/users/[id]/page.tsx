'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  fetchAdminUserDetail, createAdminPortfolioItem, createAdminServiceItem,
  type AdminUserDetail,
} from '@/lib/admin';
import { SkeletonListRows } from '@/components/Skeleton';

const PRICE_UNITS = ['FIXED', 'PER_HOUR', 'PER_DAY', 'PER_POINT', 'PER_SQFT', 'PER_VISIT'] as const;

// Profile rows we don't want in the generic key/value dump below — either
// redundant with the header (name lives on User, not the profile row) or
// internal bookkeeping the admin doesn't need to see here.
const HIDDEN_PROFILE_FIELDS = new Set([
  'id', 'userId', 'createdAt', 'updatedAt', 'approvalStatus', 'approvedBy', 'approvedAt',
  'rejectionReason', 'portfolioImages', 'avgRating', 'totalReviews', 'totalOrders', 'user',
]);

function formatFieldName(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  return String(value);
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [showAddService, setShowAddService] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAdminUserDetail(userId)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(load, [load]);

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

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/users" className="text-sm text-[#A08070] hover:text-[#C0593A] inline-block">
        ← Back to Users
      </Link>

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

        {!profileType && (
          <p className="text-sm text-[#A08070] mt-4">This role has no professional profile to manage.</p>
        )}

        {profileType && !profile && (
          <p className="text-sm text-[#A08070] mt-4">No {profileType} profile found for this user.</p>
        )}

        {profile && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-5 pt-5 border-t border-[#F0E8E2]">
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
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#2C1810]">Services</h2>
            <button
              onClick={() => setShowAddService((s) => !s)}
              className="text-sm font-semibold text-[#C0593A] border border-[#C0593A] px-3 py-1.5 rounded-lg hover:bg-[#FAEEE9]"
            >
              {showAddService ? 'Cancel' : '+ Add Service'}
            </button>
          </div>

          {showAddService && (
            <AddServiceForm
              userId={userId}
              profileType={profileType as 'labour' | 'service-expert'}
              onCreated={() => { setShowAddService(false); load(); }}
            />
          )}

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

function AddServiceForm({
  userId, profileType, onCreated,
}: { userId: string; profileType: 'labour' | 'service-expert'; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState<typeof PRICE_UNITS[number]>('FIXED');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add service');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAEEE9] rounded-xl p-4 mb-4 space-y-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name (e.g. Wiring installation)"
        className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. Electrical)"
        className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)"
        className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
      <div className="flex gap-2">
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="1" placeholder="Price (₹)"
          className="flex-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
        <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value as typeof priceUnit)}
          className="text-sm border border-[#EBE0D8] rounded-lg px-3 py-2">
          {PRICE_UNITS.map((u) => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}
        </select>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={saving}
        className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white px-4 py-2 rounded-lg">
        {saving ? 'Saving…' : 'Add Service'}
      </button>
    </form>
  );
}
