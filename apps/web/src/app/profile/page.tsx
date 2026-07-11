'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { fetchMe, updateMe, fetchReferralStats, fetchMyAnalytics, type Me, type ReferralStats, type MyAnalytics } from '@/lib/users';
import { uploadImage } from '@/lib/storage';
import { Skeleton } from '@/components/Skeleton';

const ROLE_LABEL: Record<string, string> = {
  HOMEOWNER: '🏠 Homeowner',
  CONTRACTOR: '🏗️ Contractor',
  LABOUR: '👷 Labour',
  SERVICE_EXPERT: '⚡ Service Expert',
  MATERIAL_SUPPLIER: '🧱 Material Supplier',
  LAND_OWNER: '🌍 Land Owner',
  PROPERTY_SELLER: '🏠 Property Seller',
  BUILDER: '🏗️ Builder',
  PROPERTY_AGENT: '🏢 Property Agent',
  ADMIN: '⚙️ Admin',
};

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '' });
  const [referral, setReferral] = useState<ReferralStats | null>(null);
  const [analytics, setAnalytics] = useState<MyAnalytics | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMe()
      .then((data) => {
        setMe(data);
        setForm({ name: data.name, phone: data.phone ?? '' });
        fetchReferralStats().then(setReferral).catch(() => undefined);
        fetchMyAnalytics().then(setAnalytics).catch(() => undefined);
      })
      .catch(() => setNeedsAuth(true))
      .finally(() => setLoading(false));
  }, []);

  function copyReferralLink() {
    if (!referral) return;
    const link = `${window.location.origin}/signup?ref=${referral.code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const updated = await updateMe(form);
      setMe(updated);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarError('');
    try {
      const url = await uploadImage('avatars', file);
      const updated = await updateMe({ avatarUrl: url });
      setMe(updated);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] px-4 py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3 rounded-md" />
              <Skeleton className="h-3.5 w-1/4 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-2/3 rounded-xl" />
        </div>
      </div>
    );
  }

  if (needsAuth || !me) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-4">Log in to view your profile.</p>
          <Link href="/login" className="text-[#C0593A] hover:underline font-semibold">Log In →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      {/* Cover */}
      <div className="relative">
        <div className="h-40 md:h-52 bg-gradient-to-br from-[#C0593A] via-[#B0522F] to-[#9E3F24] relative overflow-hidden">
          <span className="absolute top-6 right-12 text-5xl opacity-15">🏗️</span>
          <span className="absolute bottom-4 left-20 text-4xl opacity-10">🔨</span>
        </div>
        <div className="absolute -bottom-12 left-6 md:left-10">
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative w-24 h-24 rounded-3xl bg-white border-4 border-white shadow-lg flex items-center justify-center group disabled:opacity-70"
          >
            <div className="w-full h-full rounded-[18px] overflow-hidden bg-gradient-to-br from-[#C0593A] to-[#9E3F24] flex items-center justify-center">
              {me.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={me.avatarUrl} alt={me.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-white">{initials(me.name)}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? 'Uploading…' : '📷 Change'}
              </span>
            </div>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        {avatarError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{avatarError}</p>
        )}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#2C1810]">{me.name}</h1>
            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAEEE9] text-[#9E3F24] border border-[#E8C4B0] mt-2">
              {ROLE_LABEL[me.role] ?? me.role}
            </span>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm font-semibold border border-[#C0593A] text-[#C0593A] hover:bg-[#FAEEE9] px-4 py-2 rounded-xl transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A08070] uppercase tracking-wide mb-1.5">Full Name</label>
            {editing ? (
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]"
              />
            ) : (
              <p className="text-sm text-[#2C1810]">{me.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A08070] uppercase tracking-wide mb-1.5">Phone</label>
            {editing ? (
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Add a phone number"
                className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]"
              />
            ) : (
              <p className="text-sm text-[#2C1810]">{me.phone || <span className="text-[#A08070]">Not added</span>}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A08070] uppercase tracking-wide mb-1.5">Email</label>
            <p className="text-sm text-[#2C1810]">{me.email}</p>
            <p className="text-xs text-[#A08070] mt-0.5">Email can&apos;t be changed here.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A08070] uppercase tracking-wide mb-1.5">Member Since</label>
            <p className="text-sm text-[#2C1810]">
              {new Date(me.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          {editing && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setEditing(false); setForm({ name: me.name, phone: me.phone ?? '' }); setError(''); }}
                className="flex-1 border-2 border-[#EBE0D8] text-[#6B5248] font-semibold py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {analytics && (analytics.completedJobs > 0 || analytics.bidsSubmitted > 0 || analytics.totalEarnings > 0) && (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 mt-6">
            <p className="text-sm font-bold text-[#2C1810] mb-4">Your Activity</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xl font-bold text-[#C0593A]">{analytics.completedJobs}</p>
                <p className="text-xs text-[#A08070]">Jobs completed</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#C0593A]">₹{analytics.totalEarnings.toLocaleString('en-IN')}</p>
                <p className="text-xs text-[#A08070]">Total earnings</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#C0593A]">{analytics.bidsSubmitted}</p>
                <p className="text-xs text-[#A08070]">Bids submitted</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#C0593A]">{analytics.bidsWon}</p>
                <p className="text-xs text-[#A08070]">Bids won</p>
              </div>
            </div>
          </div>
        )}

        {referral && (
          <div className="bg-gradient-to-br from-[#C0593A] to-[#9E3F24] rounded-2xl p-6 text-white mt-6">
            <p className="text-sm font-bold mb-1">🎁 Refer &amp; Earn</p>
            <p className="text-[#F5D9CC] text-xs mb-4">Share your link — {referral.referralCount} friend{referral.referralCount !== 1 ? 's have' : ' has'} joined so far.</p>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
              <code className="flex-1 text-sm truncate">griffy.in/signup?ref={referral.code}</code>
              <button
                onClick={copyReferralLink}
                className="text-xs font-semibold bg-white text-[#9E3F24] px-3 py-1.5 rounded-lg hover:bg-[#FAEEE9] transition-colors shrink-0"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          <Link href="/dashboard" className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 hover:border-[#D8B8A8] transition-colors">
            <p className="text-sm font-semibold text-[#2C1810]">Dashboard</p>
            <p className="text-xs text-[#A08070] mt-0.5">Bookings, listings &amp; activity</p>
          </Link>
          <Link href="/orders" className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 hover:border-[#D8B8A8] transition-colors">
            <p className="text-sm font-semibold text-[#2C1810]">Orders</p>
            <p className="text-xs text-[#A08070] mt-0.5">Track your material purchases</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
