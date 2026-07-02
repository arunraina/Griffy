'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock data — in prod this would be fetched by ID
const MOCK_PROPERTY = {
  id: 'p1',
  title: '3 BHK Apartment — DLF Phase 2',
  type: 'Apartment',
  status: 'Ready to Move',
  city: 'Gurgaon',
  locality: 'DLF Phase 2',
  fullAddress: 'Block C, Magnolia, DLF Phase 2, Gurgaon, Haryana 122002',
  bhk: '3 BHK',
  area: 1750,
  areaUnit: 'sq ft',
  carpetArea: 1420,
  price: 18500000,
  pricePerSqft: 10571,
  priceUnit: 'total' as const,
  floor: 8,
  totalFloors: 14,
  facing: 'East',
  age: '5 years',
  furnishing: 'Semi-furnished',
  possession: 'Immediate',
  parking: 2,
  bathrooms: 3,
  balconies: 2,
  ownerName: 'Vikram Singh',
  ownerType: 'Owner',
  ownerPhone: '9876XXXXXX',
  ownerSince: '2019',
  verified: true,
  featured: true,
  postedDaysAgo: 2,
  description: `Beautiful 3 BHK apartment in the prestigious DLF Phase 2, Gurgaon. The apartment is located on the 8th floor with stunning east-facing views. The flat comes semi-furnished with high quality modular kitchen, wardrobes in all bedrooms, and premium Italian marble flooring throughout.

The society offers world-class amenities including a fully equipped gym, swimming pool, 24/7 security, power backup, and a beautifully maintained garden. It is conveniently located just 5 minutes from the Cyber City business hub and 10 minutes from the nearest metro station.

This is an ideal home for a family looking for a premium lifestyle in a prime Gurgaon location.`,
  highlights: [
    '🌅 East-facing with unobstructed views',
    '🚗 2 covered car parkings',
    '🔒 24/7 gated community security',
    '💡 100% power backup',
    '🛗 High-speed lifts in every block',
    '🏊 Temperature-controlled swimming pool',
  ],
  amenities: [
    { icon: '🏊', label: 'Swimming Pool' },
    { icon: '💪', label: 'Gym' },
    { icon: '🏏', label: 'Cricket Pitch' },
    { icon: '🔒', label: '24/7 Security' },
    { icon: '⚡', label: 'Power Backup' },
    { icon: '🌳', label: 'Garden' },
    { icon: '🏠', label: 'Club House' },
    { icon: '🚗', label: 'Covered Parking' },
    { icon: '🏃', label: 'Jogging Track' },
    { icon: '🏓', label: 'Table Tennis' },
  ],
  images: [
    { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop&q=80', label: 'Living Room' },
    { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop&q=80', label: 'Kitchen' },
    { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&q=80', label: 'Master Bedroom' },
    { url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=500&fit=crop&q=80', label: 'Bathroom' },
    { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop&q=80', label: 'Balcony View' },
  ],
};

const SIMILAR = [
  { id: 'p2', title: '4 BHK House — Vasant Kunj', price: 45000000, city: 'Delhi', bhk: '4 BHK', imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop&q=80' },
  { id: 'p3', title: '2 BHK Apartment — Whitefield', price: 8200000, city: 'Bangalore', bhk: '2 BHK', imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop&q=80' },
  { id: 'p6', title: '2 BHK Apartment — Hitech City', price: 7600000, city: 'Hyderabad', bhk: '2 BHK', imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop&q=80' },
];

function fmtPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function calcEmi(price: number, years = 20, rate = 8.5): number {
  const r = rate / 12 / 100;
  const n = years * 12;
  const principal = price * 0.8;
  return Math.round(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
}

const inp = 'w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm text-[#2C1810] outline-none focus:border-[#C0593A] transition-colors';

export default function PropertyDetailPage() {
  const p = MOCK_PROPERTY;
  const [activeImg, setActiveImg]   = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showEmi, setShowEmi]       = useState(false);
  const [emiYears, setEmiYears]     = useState(20);
  const [emiRate, setEmiRate]       = useState(8.5);
  const [enquiry, setEnquiry]       = useState({ name: '', phone: '', message: '' });
  const [sent, setSent]             = useState(false);

  const emi = calcEmi(p.price, emiYears, emiRate);

  function handleEnquiry(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#A08070] mb-5">
          <Link href="/" className="hover:text-[#C0593A]">Home</Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-[#C0593A]">Properties</Link>
          <span>/</span>
          <span className="text-[#2C1810] font-medium">{p.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Image gallery */}
            <div className="rounded-2xl overflow-hidden bg-[#F5EDE8] relative">
              <img src={p.images[activeImg].url} alt={p.images[activeImg].label}
                className="w-full h-80 sm:h-96 object-cover" />
              {p.verified && (
                <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">✓ Verified</span>
              )}
              {p.featured && (
                <span className="absolute top-4 right-4 bg-[#C0593A] text-white text-xs font-bold px-3 py-1 rounded-full">Featured</span>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {p.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-[#C0593A]' : 'border-transparent'}`}>
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Title & basic info */}
            <div>
              <h1 className="text-2xl font-bold text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                {p.title}
              </h1>
              <p className="text-sm text-[#A08070]">📍 {p.fullAddress}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="text-2xl font-bold text-[#C0593A]">{fmtPrice(p.price)}</span>
                <span className="text-sm text-[#A08070]">₹{p.pricePerSqft.toLocaleString('en-IN')}/sq ft</span>
                {p.status && (
                  <span className="text-xs font-semibold bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                    {p.status}
                  </span>
                )}
              </div>
            </div>

            {/* Key details grid */}
            <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
              <h2 className="text-sm font-bold text-[#2C1810] mb-4">Property Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: '🏠', label: 'Type',         value: `${p.bhk} ${p.type}` },
                  { icon: '📐', label: 'Carpet Area',  value: `${p.carpetArea} sq ft` },
                  { icon: '📏', label: 'Super Area',   value: `${p.area} sq ft` },
                  { icon: '🏢', label: 'Floor',        value: `${p.floor} of ${p.totalFloors}` },
                  { icon: '🧭', label: 'Facing',       value: p.facing },
                  { icon: '🛁', label: 'Bathrooms',    value: String(p.bathrooms) },
                  { icon: '🚗', label: 'Parking',      value: `${p.parking} covered` },
                  { icon: '🪟', label: 'Balconies',    value: String(p.balconies) },
                  { icon: '🛋️', label: 'Furnishing',  value: p.furnishing },
                  { icon: '🏡', label: 'Age',          value: p.age },
                  { icon: '📅', label: 'Possession',   value: p.possession },
                ].map(d => (
                  <div key={d.label} className="bg-[#FDF8F5] rounded-xl p-3">
                    <p className="text-xs text-[#A08070] mb-0.5">{d.icon} {d.label}</p>
                    <p className="text-sm font-semibold text-[#2C1810]">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
              <h2 className="text-sm font-bold text-[#2C1810] mb-3">About this Property</h2>
              <p className="text-sm text-[#6B5248] leading-relaxed whitespace-pre-line">{p.description}</p>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
              <h2 className="text-sm font-bold text-[#2C1810] mb-4">Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {p.highlights.map(h => (
                  <div key={h} className="flex items-center gap-2.5 bg-[#FAEEE9] rounded-xl px-4 py-2.5">
                    <span className="text-sm">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
              <h2 className="text-sm font-bold text-[#2C1810] mb-4">Amenities</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {p.amenities.map(a => (
                  <div key={a.label} className="flex flex-col items-center gap-2 p-3 bg-[#FDF8F5] rounded-xl text-center">
                    <span className="text-2xl">{a.icon}</span>
                    <p className="text-[10px] font-medium text-[#6B5248]">{a.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* EMI Calculator */}
            <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
              <button type="button" onClick={() => setShowEmi(e => !e)}
                className="flex items-center justify-between w-full">
                <h2 className="text-sm font-bold text-[#2C1810]">EMI Calculator</h2>
                <span className="text-[#C0593A] text-lg">{showEmi ? '−' : '+'}</span>
              </button>
              {showEmi && (
                <div className="mt-4 space-y-4">
                  <div className="bg-[#FAEEE9] rounded-xl p-4 text-center">
                    <p className="text-xs text-[#6B5248] mb-1">Estimated EMI (80% loan)</p>
                    <p className="text-3xl font-bold text-[#C0593A]">₹{emi.toLocaleString('en-IN')}<span className="text-sm font-normal">/month</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[#6B5248] block mb-1">Loan tenure (years)</label>
                      <select value={emiYears} onChange={e => setEmiYears(Number(e.target.value))} className={inp}>
                        {[5, 10, 15, 20, 25, 30].map(y => <option key={y} value={y}>{y} years</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#6B5248] block mb-1">Interest rate (%)</label>
                      <input type="number" value={emiRate} step="0.1" min="5" max="20"
                        onChange={e => setEmiRate(Number(e.target.value))} className={inp} />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#A08070] text-center">* Approximate estimate. Actual EMI may vary based on lender terms.</p>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
              <h2 className="text-sm font-bold text-[#2C1810] mb-3">Location</h2>
              <div className="bg-[#F5EDE8] rounded-xl h-40 flex items-center justify-center text-4xl">
                🗺️
              </div>
              <p className="text-xs text-[#A08070] mt-2 text-center">{p.fullAddress}</p>
            </div>

            {/* Similar Properties */}
            <div>
              <h2 className="text-sm font-bold text-[#2C1810] mb-4">Similar Properties</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {SIMILAR.map(s => (
                  <Link key={s.id} href={`/properties/${s.id}`}
                    className="flex-shrink-0 w-64 bg-white border border-[#EBE0D8] hover:border-[#C0593A] rounded-2xl overflow-hidden transition-all group">
                    <img src={s.imageUrl} alt={s.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform" />
                    <div className="p-3">
                      <p className="text-xs font-semibold text-[#2C1810] line-clamp-1 group-hover:text-[#C0593A] transition-colors">{s.title}</p>
                      <p className="text-xs text-[#A08070] mt-0.5">{s.city} · {s.bhk}</p>
                      <p className="text-sm font-bold text-[#C0593A] mt-1">{fmtPrice(s.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: STICKY SIDEBAR ── */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-[84px] space-y-4">

              {/* Contact card */}
              <div className="bg-white border border-[#EBE0D8] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F0E8E2]">
                  <div className="w-12 h-12 rounded-xl bg-[#FAEEE9] flex items-center justify-center text-xl font-bold text-[#9E3F24]">
                    {p.ownerName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2C1810]">{p.ownerName}</p>
                    <p className="text-xs text-[#A08070]">{p.ownerType} · Owner since {p.ownerSince}</p>
                    {p.verified && <p className="text-[10px] font-semibold text-green-600 mt-0.5">✓ ID Verified</p>}
                  </div>
                </div>

                <p className="text-2xl font-bold text-[#C0593A] mb-1">{fmtPrice(p.price)}</p>
                <p className="text-xs text-[#A08070] mb-5">₹{p.pricePerSqft.toLocaleString('en-IN')}/sq ft · {p.area} sq ft</p>

                <div className="space-y-3">
                  <button onClick={() => setShowEnquiry(true)}
                    className="w-full bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm py-3.5 rounded-xl transition-colors">
                    Send Enquiry
                  </button>
                  <a href={`tel:${p.ownerPhone}`}
                    className="flex items-center justify-center gap-2 w-full border-2 border-[#C0593A] text-[#C0593A] hover:bg-[#FAEEE9] font-semibold text-sm py-3.5 rounded-xl transition-colors">
                    📞 Call {p.ownerPhone}
                  </a>
                </div>

                <p className="text-center text-[10px] text-[#A08070] mt-3">
                  Posted {p.postedDaysAgo} day{p.postedDaysAgo > 1 ? 's' : ''} ago
                </p>
              </div>

              {/* Quick specs */}
              <div className="bg-white border border-[#EBE0D8] rounded-2xl p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '🏠', label: p.bhk },
                    { icon: '📐', label: `${p.area} sq ft` },
                    { icon: '🛁', label: `${p.bathrooms} Bath` },
                    { icon: '🧭', label: p.facing + ' facing' },
                    { icon: '🛋️', label: p.furnishing },
                    { icon: '🚗', label: `${p.parking} Parking` },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="text-base">{s.icon}</span>
                      <span className="text-xs text-[#6B5248] font-medium">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report */}
              <p className="text-center text-xs text-[#A08070]">
                <button className="hover:text-[#C0593A] transition-colors">🚩 Report this listing</button>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile fixed bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBE0D8] px-4 py-3 flex gap-3 z-40">
        <a href={`tel:${p.ownerPhone}`}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-[#C0593A] text-[#C0593A] font-semibold text-sm py-3 rounded-xl transition-colors hover:bg-[#FAEEE9]">
          📞 Call
        </a>
        <button onClick={() => setShowEnquiry(true)}
          className="flex-1 bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm py-3 rounded-xl transition-colors">
          Send Enquiry
        </button>
      </div>

      {/* Enquiry modal */}
      {showEnquiry && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowEnquiry(false); setSent(false); }} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl z-10">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">✅</div>
                <h2 className="text-lg font-bold text-[#2C1810] mb-2">Enquiry Sent!</h2>
                <p className="text-sm text-[#6B5248] mb-6">
                  {p.ownerName} will contact you within 24 hours.
                </p>
                <button onClick={() => { setShowEnquiry(false); setSent(false); }}
                  className="w-full bg-[#C0593A] text-white font-semibold text-sm py-3 rounded-xl">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-[#2C1810]">Send Enquiry</h2>
                  <button onClick={() => setShowEnquiry(false)} className="text-[#A08070] hover:text-[#2C1810] text-xl">✕</button>
                </div>
                <p className="text-xs text-[#6B5248] bg-[#FDF8F5] border border-[#EBE0D8] rounded-xl px-4 py-2 mb-4">
                  🏠 {p.title} · {p.locality}, {p.city}
                </p>
                <form onSubmit={handleEnquiry} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C1810] mb-1">Your name *</label>
                    <input type="text" value={enquiry.name} onChange={e => setEnquiry(q => ({ ...q, name: e.target.value }))}
                      placeholder="Full name" required className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C1810] mb-1">Phone number *</label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg text-sm text-[#6B5248]">+91</span>
                      <input type="tel" value={enquiry.phone} onChange={e => setEnquiry(q => ({ ...q, phone: e.target.value }))}
                        placeholder="9876543210" required maxLength={10} className={`${inp} flex-1`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C1810] mb-1">Message (optional)</label>
                    <textarea value={enquiry.message} onChange={e => setEnquiry(q => ({ ...q, message: e.target.value }))}
                      rows={3} placeholder="I'm interested in this property. Please contact me."
                      className={`${inp} resize-none`} />
                  </div>
                  <button type="submit"
                    className="w-full bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm py-3.5 rounded-xl transition-colors">
                    Send Enquiry
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
