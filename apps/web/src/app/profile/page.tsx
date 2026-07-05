'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMe, updateMe, type Me } from '@/lib/users';

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

  useEffect(() => {
    fetchMe()
      .then((data) => {
        setMe(data);
        setForm({ name: data.name, phone: data.phone ?? '' });
      })
      .catch(() => setNeedsAuth(true))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) {
    return <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center text-[#A08070] text-sm">Loading…</div>;
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
          <div className="w-24 h-24 rounded-3xl bg-white border-4 border-white shadow-lg flex items-center justify-center">
            <div className="w-full h-full rounded-[18px] bg-gradient-to-br from-[#C0593A] to-[#9E3F24] flex items-center justify-center">
              <span className="text-2xl font-extrabold text-white">{initials(me.name)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
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
