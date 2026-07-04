'use client';

import { useState } from 'react';
import Link from 'next/link';

type ProjectType = 'new_build' | 'renovation' | 'interior' | 'electrical' | 'plumbing';
type Quality = 'basic' | 'standard' | 'premium';

interface CostItem {
  label: string;
  emoji: string;
  costPerSqft: { basic: number; standard: number; premium: number };
}

const PROJECTS: { id: ProjectType; label: string; emoji: string; desc: string }[] = [
  { id: 'new_build', label: 'New Construction', emoji: '🏗️', desc: 'Ground-up residential or commercial build' },
  { id: 'renovation', label: 'Renovation', emoji: '🔨', desc: 'Structural changes, additions, or major repairs' },
  { id: 'interior', label: 'Interior Fit-out', emoji: '🛋️', desc: 'Flooring, false ceiling, modular kitchen & more' },
  { id: 'electrical', label: 'Electrical Work', emoji: '⚡', desc: 'Wiring, panels, fixtures & earthing' },
  { id: 'plumbing', label: 'Plumbing', emoji: '🔧', desc: 'Pipes, fixtures, bathrooms & drainage' },
];

const COST_ITEMS: Record<ProjectType, CostItem[]> = {
  new_build: [
    { label: 'Foundation & RCC Structure', emoji: '🏛️', costPerSqft: { basic: 450, standard: 650, premium: 1100 } },
    { label: 'Masonry & Plastering', emoji: '🧱', costPerSqft: { basic: 220, standard: 320, premium: 520 } },
    { label: 'Plumbing', emoji: '🔧', costPerSqft: { basic: 110, standard: 165, premium: 280 } },
    { label: 'Electrical', emoji: '⚡', costPerSqft: { basic: 90, standard: 140, premium: 240 } },
    { label: 'Flooring', emoji: '🏠', costPerSqft: { basic: 90, standard: 180, premium: 420 } },
    { label: 'Doors & Windows', emoji: '🚪', costPerSqft: { basic: 100, standard: 180, premium: 350 } },
    { label: 'Painting & Finishing', emoji: '🎨', costPerSqft: { basic: 70, standard: 115, premium: 200 } },
    { label: 'Labour Charges', emoji: '👷', costPerSqft: { basic: 320, standard: 430, premium: 620 } },
  ],
  renovation: [
    { label: 'Demolition & Disposal', emoji: '⛏️', costPerSqft: { basic: 60, standard: 90, premium: 130 } },
    { label: 'Masonry & Plastering', emoji: '🧱', costPerSqft: { basic: 150, standard: 230, premium: 380 } },
    { label: 'Plumbing Upgrades', emoji: '🔧', costPerSqft: { basic: 80, standard: 120, premium: 200 } },
    { label: 'Electrical Upgrades', emoji: '⚡', costPerSqft: { basic: 70, standard: 110, premium: 180 } },
    { label: 'Flooring', emoji: '🏠', costPerSqft: { basic: 100, standard: 200, premium: 450 } },
    { label: 'Painting & Finishing', emoji: '🎨', costPerSqft: { basic: 80, standard: 130, premium: 220 } },
    { label: 'Labour Charges', emoji: '👷', costPerSqft: { basic: 160, standard: 230, premium: 340 } },
  ],
  interior: [
    { label: 'False Ceiling', emoji: '⬆️', costPerSqft: { basic: 80, standard: 130, premium: 280 } },
    { label: 'Flooring', emoji: '🏠', costPerSqft: { basic: 120, standard: 220, premium: 500 } },
    { label: 'Modular Kitchen', emoji: '🍳', costPerSqft: { basic: 150, standard: 280, premium: 600 } },
    { label: 'Wardrobes & Storage', emoji: '🪟', costPerSqft: { basic: 120, standard: 240, premium: 550 } },
    { label: 'Electrical & Lighting', emoji: '💡', costPerSqft: { basic: 80, standard: 130, premium: 250 } },
    { label: 'Painting', emoji: '🎨', costPerSqft: { basic: 70, standard: 120, premium: 220 } },
    { label: 'Labour Charges', emoji: '👷', costPerSqft: { basic: 180, standard: 280, premium: 400 } },
  ],
  electrical: [
    { label: 'Wiring & Conduits', emoji: '🔌', costPerSqft: { basic: 50, standard: 80, premium: 140 } },
    { label: 'Electrical Panel', emoji: '⚡', costPerSqft: { basic: 30, standard: 50, premium: 90 } },
    { label: 'Switches & Fixtures', emoji: '💡', costPerSqft: { basic: 40, standard: 70, premium: 150 } },
    { label: 'Earthing & Safety', emoji: '🛡️', costPerSqft: { basic: 20, standard: 35, premium: 60 } },
    { label: 'Labour Charges', emoji: '👷', costPerSqft: { basic: 60, standard: 85, premium: 120 } },
  ],
  plumbing: [
    { label: 'Water Supply Lines', emoji: '💧', costPerSqft: { basic: 40, standard: 65, premium: 120 } },
    { label: 'Drainage & Sewage', emoji: '🔩', costPerSqft: { basic: 35, standard: 55, premium: 100 } },
    { label: 'Bathroom Fixtures', emoji: '🛁', costPerSqft: { basic: 50, standard: 90, premium: 200 } },
    { label: 'Kitchen Plumbing', emoji: '🚰', costPerSqft: { basic: 30, standard: 50, premium: 90 } },
    { label: 'Labour Charges', emoji: '👷', costPerSqft: { basic: 55, standard: 80, premium: 110 } },
  ],
};

const QUALITY_OPTIONS: { id: Quality; label: string; desc: string }[] = [
  { id: 'basic', label: 'Basic', desc: 'Economy grade — functional & durable' },
  { id: 'standard', label: 'Standard', desc: 'Mid-range — popular choice for most homes' },
  { id: 'premium', label: 'Premium', desc: 'Luxury grade — high-end finishes & brands' },
];

const QUALITY_MULTIPLIER: Record<Quality, string> = {
  basic: '₹1,400–1,800/sqft',
  standard: '₹2,000–2,800/sqft',
  premium: '₹3,500–5,000/sqft',
};

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function EstimateClient() {
  const [projectType, setProjectType] = useState<ProjectType>('new_build');
  const [area, setArea] = useState<number | ''>(1000);
  const [quality, setQuality] = useState<Quality>('standard');

  const items = COST_ITEMS[projectType];
  const sqft = Number(area) || 0;

  const breakdown = items.map((item) => ({
    ...item,
    total: item.costPerSqft[quality] * sqft,
    rate: item.costPerSqft[quality],
  }));

  const grandTotal = breakdown.reduce((s, i) => s + i.total, 0);
  const low = Math.round(grandTotal * 0.9);
  const high = Math.round(grandTotal * 1.15);
  const maxBar = Math.max(...breakdown.map((i) => i.total), 1);

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      {/* Hero */}
      <div className="bg-white border-b border-[#EBE0D8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            🧮 Free Cost Estimator
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#2C1810] mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            How much will your project cost?
          </h1>
          <p className="text-[#6B5248] text-base leading-relaxed max-w-xl mx-auto">
            Get a detailed ballpark estimate based on project type, area, and quality. Actual costs vary by city and contractor.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left — inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project type */}
            <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5">
              <p className="font-bold text-[#2C1810] mb-3">Project Type</p>
              <div className="space-y-2">
                {PROJECTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProjectType(p.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      projectType === p.id
                        ? 'border-[#C0593A] bg-[#FAEEE9]'
                        : 'border-[#EBE0D8] hover:border-[#D8B8A8] bg-white'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{p.emoji}</span>
                    <div>
                      <p className={`font-semibold text-sm ${projectType === p.id ? 'text-[#C0593A]' : 'text-[#2C1810]'}`}>{p.label}</p>
                      <p className="text-xs text-[#A08070] mt-0.5">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Area */}
            <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5">
              <p className="font-bold text-[#2C1810] mb-3">Built-up Area</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={100}
                  max={100000}
                  value={area}
                  onChange={(e) => setArea(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 1200"
                  className="flex-1 border border-[#EBE0D8] rounded-xl px-4 py-3 text-lg font-bold text-[#2C1810] focus:outline-none focus:border-[#C0593A] focus:ring-1 focus:ring-[#C0593A]/20"
                />
                <span className="text-[#A08070] font-semibold shrink-0">sq ft</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[500, 1000, 2000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setArea(v)}
                    className={`py-1.5 text-sm font-semibold rounded-lg border transition-all ${
                      area === v ? 'border-[#C0593A] bg-[#FAEEE9] text-[#C0593A]' : 'border-[#EBE0D8] text-[#6B5248] hover:border-[#D8B8A8]'
                    }`}
                  >
                    {v.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5">
              <p className="font-bold text-[#2C1810] mb-3">Quality Level</p>
              <div className="space-y-2">
                {QUALITY_OPTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setQuality(q.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      quality === q.id ? 'border-[#C0593A] bg-[#FAEEE9] text-[#9E3F24]' : 'border-[#EBE0D8] bg-white text-[#2C1810]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${quality === q.id ? 'border-[#C0593A] bg-[#C0593A]' : 'border-[#D8B8A8]'}`} />
                    <div>
                      <p className="font-semibold text-sm">{q.label}</p>
                      <p className="text-xs text-[#A08070] mt-0.5">{q.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-[#A08070] flex items-start gap-1.5">
                <span className="shrink-0">ℹ️</span>
                Typical {PROJECTS.find((p) => p.id === projectType)?.label.toLowerCase()} cost: {QUALITY_MULTIPLIER[quality]}
              </p>
            </div>
          </div>

          {/* Right — result */}
          <div className="lg:col-span-3 space-y-6">
            {/* Total estimate */}
            <div className="bg-gradient-to-br from-[#C0593A] to-[#9E3F24] rounded-2xl p-6 text-white shadow-sm">
              <p className="text-[#F5D9CC] text-sm font-semibold mb-1">Estimated Project Cost</p>
              {sqft > 0 ? (
                <>
                  <p className="text-4xl font-extrabold mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                    {fmt(low)} – {fmt(high)}
                  </p>
                  <p className="text-[#F5D9CC] text-sm">
                    For {sqft.toLocaleString('en-IN')} sq ft · {PROJECTS.find((p) => p.id === projectType)?.label} · {quality.charAt(0).toUpperCase() + quality.slice(1)} quality
                  </p>
                  <p className="text-[#EFC4B0] text-xs mt-3">
                    Midpoint: {fmt(grandTotal)} · ₹{Math.round(grandTotal / sqft).toLocaleString('en-IN')}/sqft
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-[#F5D9CC]">Enter area to see estimate</p>
              )}
            </div>

            {/* Breakdown */}
            {sqft > 0 && (
              <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5">
                <h2 className="font-bold text-[#2C1810] mb-4">Cost Breakdown</h2>
                <div className="space-y-3">
                  {breakdown.map((item) => {
                    const pct = maxBar > 0 ? (item.total / maxBar) * 100 : 0;
                    const share = grandTotal > 0 ? ((item.total / grandTotal) * 100).toFixed(0) : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#3D2B22] flex items-center gap-1.5">
                            {item.emoji} {item.label}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#2C1810]">{fmt(item.total)}</span>
                            <span className="text-xs text-[#A08070] ml-1.5">({share}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-[#F5EDE8] rounded-full h-2">
                          <div className="bg-[#C0593A] h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Disclaimer + CTAs */}
            <div className="bg-[#FDF8F5] rounded-2xl border border-[#EBE0D8] p-5">
              <p className="text-xs text-[#A08070] mb-4">
                <strong>Disclaimer:</strong> These are approximate estimates based on average Indian market rates (2025–26).
                Actual costs vary by city, material brand, site conditions, and contractor. Always get 3+ quotes before starting.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Link
                  href="/contractors"
                  className="flex items-center justify-center gap-2 bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Get Contractor Quotes <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/materials"
                  className="flex items-center justify-center gap-2 bg-white border-2 border-[#EBE0D8] hover:border-[#C0593A] text-[#6B5248] hover:text-[#C0593A] font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Browse Materials <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
