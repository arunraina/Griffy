'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PROJECTS, QUALITY_OPTIONS, ROOM_DRIVEN_TYPES, UNIT_LABEL,
  calculateCostEstimate, formatIndianCurrency as fmt,
  type ProjectType, type Quality,
} from '@griffy/shared';

export default function EstimateClient() {
  const [projectType, setProjectType] = useState<ProjectType>('new_build');
  const [area, setArea] = useState<number | ''>(1000);
  const [rooms, setRooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [quality, setQuality] = useState<Quality>('standard');

  const sqft = Number(area) || 0;
  const isRoomDriven = ROOM_DRIVEN_TYPES.includes(projectType);

  const { breakdown, grandTotal, low, high } = calculateCostEstimate({
    projectType, area: sqft, rooms, bathrooms, quality,
  });
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

            {/* Rooms & bathrooms — only for room-driven trades */}
            {isRoomDriven && (
              <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5">
                <p className="font-bold text-[#2C1810] mb-1">Rooms &amp; Bathrooms</p>
                <p className="text-xs text-[#A08070] mb-3">
                  {projectType === 'plumbing'
                    ? 'Fixtures and kitchen plumbing scale with these, not just area.'
                    : projectType === 'electrical'
                    ? 'Switches, sockets & fixtures scale with room count, not just area.'
                    : 'Modular kitchen and wardrobes scale with these, not just area.'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A08070] uppercase tracking-wide mb-1.5">Bedrooms / Rooms</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setRooms((r) => Math.max(1, r - 1))} className="w-9 h-9 rounded-lg border border-[#EBE0D8] text-[#C0593A] font-bold hover:bg-[#FAEEE9]">−</button>
                      <span className="flex-1 text-center font-bold text-[#2C1810]">{rooms}</span>
                      <button onClick={() => setRooms((r) => Math.min(20, r + 1))} className="w-9 h-9 rounded-lg border border-[#EBE0D8] text-[#C0593A] font-bold hover:bg-[#FAEEE9]">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A08070] uppercase tracking-wide mb-1.5">Bathrooms</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setBathrooms((b) => Math.max(1, b - 1))} className="w-9 h-9 rounded-lg border border-[#EBE0D8] text-[#C0593A] font-bold hover:bg-[#FAEEE9]">−</button>
                      <span className="flex-1 text-center font-bold text-[#2C1810]">{bathrooms}</span>
                      <button onClick={() => setBathrooms((b) => Math.min(10, b + 1))} className="w-9 h-9 rounded-lg border border-[#EBE0D8] text-[#C0593A] font-bold hover:bg-[#FAEEE9]">+</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                {isRoomDriven
                  ? 'Estimate updates live as you adjust rooms & bathrooms above.'
                  : sqft > 0
                  ? `Works out to ₹${Math.round(grandTotal / sqft).toLocaleString('en-IN')}/sqft at ${quality} quality.`
                  : 'Enter your area to see a per-sqft rate.'}
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
                    For {sqft.toLocaleString('en-IN')} sq ft
                    {isRoomDriven ? ` · ${rooms} room${rooms !== 1 ? 's' : ''} · ${bathrooms} bathroom${bathrooms !== 1 ? 's' : ''}` : ''}
                    {' '}· {PROJECTS.find((p) => p.id === projectType)?.label} · {quality.charAt(0).toUpperCase() + quality.slice(1)} quality
                  </p>
                  <p className="text-[#EFC4B0] text-xs mt-3">
                    Midpoint: {fmt(grandTotal)}
                    {!isRoomDriven && ` · ₹${Math.round(grandTotal / sqft).toLocaleString('en-IN')}/sqft`}
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
                            {item.unit !== 'sqft' && (
                              <span className="text-[10px] text-[#A08070] font-normal">(₹{item.rate.toLocaleString('en-IN')} {UNIT_LABEL[item.unit]})</span>
                            )}
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

            {/* Cross-link to material estimators */}
            <div className="text-center">
              <Link href="/estimate" className="text-sm font-semibold text-[#C0593A] hover:underline">
                ← Back to all estimators
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
