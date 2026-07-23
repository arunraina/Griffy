'use client';

import { useState } from 'react';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import { greeting, firstName } from '@/lib/dashboard';
import { StateCitySelect } from '@/components/LocationPicker';
import { stateForCity } from '@/lib/geoConstants';
import { createMyProperty, type PropertyListing } from '@/lib/properties';

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Apartment / Flat', icon: '🏢' },
  { value: 'INDEPENDENT_HOUSE', label: 'Independent House', icon: '🏡' },
  { value: 'VILLA', label: 'Villa', icon: '🏘️' },
  { value: 'PLOT', label: 'Plot', icon: '🌍' },
  { value: 'COMMERCIAL', label: 'Commercial', icon: '🏬' },
];

const FURNISHING_OPTIONS = [
  { value: 'UNFURNISHED', label: 'Unfurnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
  { value: 'FULLY_FURNISHED', label: 'Fully Furnished' },
];

export default function PropertySellerOnboarding({
  me, onCreated,
}: {
  state: UserState; me: Me; onCreated: (property: PropertyListing) => void;
}) {
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [title, setTitle] = useState('');
  const [furnishing, setFurnishing] = useState('UNFURNISHED');
  const [areaSqFt, setAreaSqFt] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [state, setStateVal] = useState(() => stateForCity(''));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !areaSqFt || !price || !location || !city || !state) return;
    setBusy(true);
    setError('');
    try {
      const created = await createMyProperty({
        title, propertyType, furnishing,
        areaSqFt: Number(areaSqFt), price: Number(price),
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        location, city, state,
      });
      onCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[700px] mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6">
          <h1 className="text-lg font-bold text-[#2C1810] mb-1">
            {greeting()}, {firstName(me.name)} — list your property in 3 steps
          </h1>
          <p className="text-sm text-[#6B5248]">The more detail you give, the faster you'll get real enquiries.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6 space-y-4">
            <p className="text-sm font-bold text-[#2C1810]">Step 1 — What are you selling?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setPropertyType(t.value)}
                  className={`text-sm font-semibold px-3 py-2.5 rounded-xl border transition-colors ${
                    propertyType === t.value ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-[#FDF8F5] text-[#6B5248] border-[#EBE0D8]'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6 space-y-3">
            <p className="text-sm font-bold text-[#2C1810] mb-1">Step 2 — Details</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Listing title (e.g. 3BHK Apartment in Srinagar)"
              className="w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" required />
            <StateCitySelect state={state} city={city} onStateChange={setStateVal} onCityChange={setCity} />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Locality / address"
              className="w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" required />
            <div className="grid grid-cols-2 gap-3">
              <input value={areaSqFt} onChange={(e) => setAreaSqFt(e.target.value)} type="number" placeholder="Area (sqft)"
                className="bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" required />
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price (₹)"
                className="bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" required />
              <input value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} type="number" placeholder="Bedrooms"
                className="bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" />
              <input value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} type="number" placeholder="Bathrooms"
                className="bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" />
            </div>
            <select value={furnishing} onChange={(e) => setFurnishing(e.target.value)}
              className="w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]">
              {FURNISHING_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6">
            <p className="text-sm font-bold text-[#2C1810] mb-3">Step 3 — Boost your listing</p>
            <ul className="space-y-1.5 text-xs text-[#6B5248] mb-4">
              <li>✅ Add photos after publishing — listings with photos get 8x more enquiries</li>
              <li>✅ Mention nearby landmarks in your description</li>
              <li>✅ Keep your price competitive for faster enquiries</li>
            </ul>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <button type="submit" disabled={busy}
              className="w-full bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white text-sm font-bold py-3 rounded-xl transition-colors">
              {busy ? 'Publishing…' : 'Finish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
