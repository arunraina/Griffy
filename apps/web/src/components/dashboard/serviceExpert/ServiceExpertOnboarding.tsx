'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import { greeting, firstName } from '@/lib/dashboard';
import { QUICK_ADD_SERVICES, type PriceUnit } from '@/lib/quickAddServices';
import { createMyServiceItem, deleteMyServiceItem, formatServiceItemPrice, type PublicServiceItem } from '@/lib/serviceItems';
import { toSkillKey, type MyServiceExpertProfile } from '@/lib/serviceExpertProfiles';
import { formatBenchmark } from '@/lib/serviceBenchmarks';

const MENU_READY_THRESHOLD = 3;

export default function ServiceExpertOnboarding({
  me, profile, services, onServicesChange,
}: {
  state: UserState; me: Me; profile: MyServiceExpertProfile; services: PublicServiceItem[];
  onServicesChange: (services: PublicServiceItem[]) => void;
}) {
  const [adding, setAdding] = useState<{ name: string; category: string; unit: PriceUnit } | null>(null);
  const [price, setPrice] = useState('');
  const [busy, setBusy] = useState(false);

  const skillKey = toSkillKey(profile.expertiseType);
  const chips = QUICK_ADD_SERVICES[skillKey] ?? [];
  const addedNames = new Set(services.map((s) => s.name));

  async function confirmAdd() {
    if (!adding || !price) return;
    setBusy(true);
    try {
      const created = await createMyServiceItem({
        profileType: 'service-expert',
        name: adding.name,
        category: adding.category,
        priceUnit: adding.unit,
        price: Math.round(Number(price) * 100), // rupees -> paise
      });
      onServicesChange([...services, created]);
      setAdding(null);
      setPrice('');
    } finally {
      setBusy(false);
    }
  }

  async function removeService(id: string) {
    await deleteMyServiceItem(id);
    onServicesChange(services.filter((s) => s.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[700px] mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6">
          <h1 className="text-lg font-bold text-[#2C1810] mb-1">
            {greeting()}, {firstName(me.name)} — set up your service menu 🔧
          </h1>
          <p className="text-sm text-[#6B5248]">
            {services.length === 0
              ? 'Add at least 3 services so customers know exactly what you offer and what it costs.'
              : `${services.length}/${MENU_READY_THRESHOLD} added — a few more and your menu goes live.`}
          </p>
        </div>

        {services.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6">
            <p className="text-sm font-bold text-[#2C1810] mb-3">Your services</p>
            <div className="space-y-2">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3">
                  <p className="text-sm text-[#2C1810]">{s.name} — <span className="text-[#6B5248]">{formatServiceItemPrice(s)}</span></p>
                  <button onClick={() => removeService(s.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6">
          <p className="text-sm font-bold text-[#2C1810] mb-1">Quick-add for {profile.expertiseType}</p>
          <p className="text-xs text-[#6B5248] mb-4">Tap a service, set your price</p>
          <div className="flex flex-wrap gap-2">
            {chips.filter((c) => !addedNames.has(c.name)).map((chip) => (
              <button
                key={chip.name}
                onClick={() => { setAdding(chip); setPrice(''); }}
                className="text-xs font-semibold bg-[#FAEEE9] text-[#9E3F24] border border-[#E8C4B0] px-3 py-1.5 rounded-full hover:bg-[#F5DFD3] transition-colors"
              >
                + {chip.name}
              </button>
            ))}
            {chips.length === 0 && (
              <p className="text-xs text-[#A08070]">No quick-add suggestions for this specialization yet — add services manually from the dashboard.</p>
            )}
          </div>

          {adding && (
            <div className="mt-4 bg-[#FDF8F5] border border-[#EBE0D8] rounded-xl p-4">
              <p className="text-sm font-semibold text-[#2C1810] mb-1">{adding.name}</p>
              {formatBenchmark(adding.name) && (
                <p className="text-xs text-[#A08070] mb-3">Typical range in your area: {formatBenchmark(adding.name)}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Your price (₹)"
                  className="flex-1 bg-white border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]"
                />
                <button onClick={confirmAdd} disabled={busy || !price} className="bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white text-sm font-semibold px-4 rounded-lg transition-colors">
                  Add
                </button>
                <button onClick={() => setAdding(null)} className="text-sm text-[#6B5248] px-2">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {services.length >= MENU_READY_THRESHOLD && (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6 text-center">
            <p className="text-sm font-bold text-[#2C1810] mb-2">Your service menu is live! 🎉</p>
            <Link href={`/service-experts/${profile.id}`} className="text-xs font-semibold text-[#C0593A] hover:underline">
              View your public profile →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
