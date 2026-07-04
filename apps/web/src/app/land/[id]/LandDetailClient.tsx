'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LandListing {
  id: string;
  title: string;
  description: string | null;
  landType: string;
  areaSqFt: number;
  price: number;
  location: string;
  city: string;
  state: string;
  isAvailable: boolean;
  createdAt: string;
  ownerName: string;
  ownerPhone: string | null;
}

interface Props { listing: LandListing }

const LAND_TYPE_LABEL: Record<string, string> = {
  AGRICULTURAL: 'Agricultural Land',
  RESIDENTIAL:  'Residential Plot',
  COMMERCIAL:   'Commercial Plot',
  INDUSTRIAL:   'Industrial Land',
  MIXED:        'Mixed-Use Land',
};

const LAND_TYPE_ICON: Record<string, string> = {
  AGRICULTURAL: '🌾', RESIDENTIAL: '🏘️', COMMERCIAL: '🏢', INDUSTRIAL: '🏭', MIXED: '🏙️',
};

function formatArea(sqft: number): string {
  if (sqft >= 43560) return `${(sqft / 43560).toFixed(2)} acres`;
  if (sqft >= 9) return `${sqft.toLocaleString('en-IN')} sq ft`;
  return `${sqft} sq ft`;
}

function formatPrice(p: number): string {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
  return `₹${p.toLocaleString('en-IN')}`;
}

export default function LandDetailClient({ listing: l }: Props) {
  const [modalOpen, setModalOpen]     = useState(false);
  const [name, setName]               = useState('');
  const [phone, setPhone]             = useState('');
  const [message, setMessage]         = useState('');
  const [submitted, setSubmitted]     = useState(false);

  const typeLabel = LAND_TYPE_LABEL[l.landType] ?? l.landType;
  const typeIcon  = LAND_TYPE_ICON[l.landType] ?? '🌍';
  const postedDaysAgo = Math.max(0, Math.floor((Date.now() - new Date(l.createdAt).getTime()) / 86400000));
  const pricePerSqft  = l.areaSqFt > 0 ? Math.round(l.price / l.areaSqFt) : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#A08070] mb-6">
          <Link href="/" className="hover:text-[#C0593A]">Home</Link>
          <span>›</span>
          <Link href="/land" className="hover:text-[#C0593A]">Land &amp; Plots</Link>
          <span>›</span>
          <span className="text-[#2C1810] font-medium truncate max-w-xs">{l.title}</span>
        </div>

        <div className="flex gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Cover image placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-56 bg-gradient-to-br from-emerald-100 to-emerald-200 relative flex items-center justify-center">
                <span className="text-7xl opacity-40">{typeIcon}</span>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="text-xs bg-white/90 text-[#C0593A] border border-[#E8C4B0] px-3 py-1 rounded-full font-semibold">{typeLabel}</span>
                  {l.isAvailable
                    ? <span className="text-xs bg-green-50/90 text-green-700 border border-green-200 px-3 py-1 rounded-full font-semibold">Available</span>
                    : <span className="text-xs bg-red-50/90 text-red-700 border border-red-200 px-3 py-1 rounded-full font-semibold">Sold</span>
                  }
                </div>
                <div className="absolute bottom-4 right-4 text-xs text-white/80 bg-black/30 px-2 py-1 rounded-lg">
                  Posted {postedDaysAgo === 0 ? 'today' : `${postedDaysAgo}d ago`}
                </div>
              </div>

              <div className="p-6">
                <h1 className="text-2xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>{l.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B5248]">
                  <span>📍 {l.location}, {l.city}, {l.state}</span>
                </div>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: '📐', value: formatArea(l.areaSqFt), label: 'Total Area' },
                { icon: '💰', value: formatPrice(l.price), label: 'Total Price' },
                { icon: '📊', value: pricePerSqft > 0 ? `₹${pricePerSqft.toLocaleString('en-IN')}` : '—', label: 'Per Sq Ft' },
                { icon: typeIcon, value: typeLabel.split(' ')[0], label: 'Land Type' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="text-lg font-bold text-[#C0593A] leading-tight">{s.value}</p>
                  <p className="text-xs text-[#A08070] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {l.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-bold text-[#2C1810] mb-3" style={{ fontFamily: 'Georgia, serif' }}>About This Listing</h2>
                <p className="text-sm text-[#6B5248] leading-relaxed">{l.description}</p>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>Land Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Land Type',   value: typeLabel },
                  { label: 'Area',        value: formatArea(l.areaSqFt) },
                  { label: 'Area (sq ft)', value: `${l.areaSqFt.toLocaleString('en-IN')} sq ft` },
                  { label: 'City',        value: l.city },
                  { label: 'State',       value: l.state },
                  { label: 'Availability', value: l.isAvailable ? 'Available' : 'Sold' },
                ].map(d => (
                  <div key={d.label} className="flex flex-col gap-0.5">
                    <span className="text-xs text-[#A08070] font-medium">{d.label}</span>
                    <span className="text-sm text-[#2C1810] font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-[#2C1810] mb-3" style={{ fontFamily: 'Georgia, serif' }}>Location</h2>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">📍</span>
                <div>
                  <p className="text-sm font-semibold text-[#2C1810]">{l.location}</p>
                  <p className="text-xs text-[#6B5248] mt-0.5">{l.city}, {l.state}</p>
                </div>
              </div>
              <div className="mt-4 h-36 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 border border-green-100 flex items-center justify-center">
                <p className="text-sm text-[#A08070]">Map view coming soon</p>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-4">

              {/* Price card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
                <div>
                  <p className="text-3xl font-bold text-[#C0593A]">{formatPrice(l.price)}</p>
                  {pricePerSqft > 0 && (
                    <p className="text-xs text-[#A08070] mt-0.5">₹{pricePerSqft.toLocaleString('en-IN')} per sq ft</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base">📐</span>
                  <span className="text-[#6B5248] font-medium">{formatArea(l.areaSqFt)}</span>
                  <span className="text-[#A08070]">({l.areaSqFt.toLocaleString('en-IN')} sq ft)</span>
                </div>

                {l.isAvailable ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <span>🟢</span><span className="font-medium">Available for purchase</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <span>🔴</span><span className="font-medium">Already sold</span>
                  </div>
                )}

                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
                >
                  Contact Owner
                </button>
                <button className="w-full border-2 border-[#C0593A] text-[#C0593A] hover:bg-[#FAEEE9] font-semibold py-3 rounded-xl transition-colors text-sm">
                  Schedule Site Visit
                </button>

                <div className="border-t border-[#F0E8E2] pt-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-[#6B5248]">
                    <span>👤</span><span>Listed by <strong className="text-[#2C1810]">{l.ownerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6B5248]">
                    <span>📍</span><span>{l.city}, {l.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6B5248]">
                    <span>🗓️</span><span>Posted {postedDaysAgo === 0 ? 'today' : `${postedDaysAgo} days ago`}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button className="flex-1 text-xs border border-[#EBE0D8] text-[#6B5248] hover:border-[#C0593A] hover:text-[#C0593A] py-2 rounded-lg transition-colors">
                    🔗 Share
                  </button>
                  <button className="flex-1 text-xs border border-[#EBE0D8] text-gray-400 hover:text-red-500 hover:border-red-200 py-2 rounded-lg transition-colors">
                    ⚑ Report
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Mobile CTA bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBE0D8] px-4 py-3 flex gap-3 z-30 shadow-lg">
          <div className="flex-1">
            <p className="text-xs text-[#A08070]">Total Price</p>
            <p className="text-base font-bold text-[#C0593A]">{formatPrice(l.price)}</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Contact Owner
          </button>
        </div>

      </div>

      {/* Enquiry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            {submitted ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-lg font-bold text-[#2C1810] mb-2">Enquiry Sent!</h3>
                <p className="text-sm text-[#6B5248] mb-6">The owner will contact you shortly.</p>
                <button onClick={() => { setModalOpen(false); setSubmitted(false); }} className="w-full bg-[#C0593A] text-white font-bold py-3 rounded-xl text-sm">
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>Contact Owner</h3>
                  <button onClick={() => setModalOpen(false)} className="text-[#A08070] hover:text-[#2C1810] text-xl leading-none">×</button>
                </div>
                <div className="bg-[#FAEEE9] rounded-xl p-3 mb-5 text-xs text-[#6B5248]">
                  <p className="font-semibold text-[#2C1810]">{l.title}</p>
                  <p className="mt-0.5">{l.city} · {formatPrice(l.price)} · {formatArea(l.areaSqFt)}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5248] mb-1">Your Name</label>
                    <input
                      required value={name} onChange={e => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm text-[#2C1810] placeholder-[#C4A99A] focus:outline-none focus:ring-2 focus:ring-[#C0593A]/30 focus:border-[#C0593A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5248] mb-1">Phone Number</label>
                    <input
                      required value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210" type="tel"
                      className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm text-[#2C1810] placeholder-[#C4A99A] focus:outline-none focus:ring-2 focus:ring-[#C0593A]/30 focus:border-[#C0593A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5248] mb-1">Message (optional)</label>
                    <textarea
                      value={message} onChange={e => setMessage(e.target.value)}
                      rows={3} placeholder="I'm interested in this property…"
                      className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm text-[#2C1810] placeholder-[#C4A99A] focus:outline-none focus:ring-2 focus:ring-[#C0593A]/30 focus:border-[#C0593A] resize-none"
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
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
