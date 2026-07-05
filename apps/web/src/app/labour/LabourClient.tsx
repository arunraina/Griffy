'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SaveButton from '@/components/SaveButton';
import TierBadge from '@/components/TierBadge';

type SortKey = 'relevance' | 'rating' | 'price';
type RatingFilter = 'any' | '4' | '4.5';

interface LabourProfile {
  id: string;
  name: string;
  skillType: string;
  experience: string;
  location: string;
  dailyRate: number;
  available: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  verified: boolean;
}

export default function LabourClient({ profiles }: { profiles: LabourProfile[] }) {
  return (
    <Suspense>
      <LabourInner profiles={profiles} />
    </Suspense>
  );
}

function LabourInner({ profiles }: { profiles: LabourProfile[] }) {
  const params = useSearchParams();
  const [search, setSearch]             = useState('');
  const [sort, setSort]                 = useState<SortKey>('relevance');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('any');
  const [location, setLocation]         = useState(params.get('city') ?? '');
  const [availableNow, setAvailableNow] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen]   = useState(false);

  // Matches the `labour` category's subcategories in lib/featureFlags.ts.
  // Electrical/Plumbing are deliberately excluded — those are Service Experts, not Labour.
  const SKILLS = ['Mason', 'Carpenter', 'Painter', 'Tile Fixer', 'Helper', 'Welder', 'Scaffolding'];

  function toggleSkill(s: string) {
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  const results = useMemo(() => {
    let list = profiles.filter(p => {
      if (availableNow && !p.available) return false;
      if (location.trim() && !p.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (selectedSkills.length && !selectedSkills.some(s => p.skillType.toLowerCase().includes(s.toLowerCase()))) return false;
      if (ratingFilter !== 'any' && p.rating < parseFloat(ratingFilter)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.skillType.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'price')  list = [...list].sort((a, b) => a.dailyRate - b.dailyRate);

    return list;
  }, [profiles, search, sort, ratingFilter, location, availableNow, selectedSkills]);

  function clearAll() {
    setSearch(''); setRatingFilter('any'); setLocation('');
    setAvailableNow(false); setSelectedSkills([]);
  }

  const hasFilters = !!(search || ratingFilter !== 'any' || location || availableNow || selectedSkills.length);

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>
            Find Labour
          </h1>
          <p className="text-sm text-[#6B5248] mt-1">
            {results.length} worker{results.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Search + sort bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, skill, or location..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#EBE0D8] rounded-xl bg-white outline-none focus:border-[#C0593A] focus:ring-1 focus:ring-[#C0593A]/20" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
            className="text-sm border border-[#EBE0D8] rounded-xl bg-white px-3 py-2.5 outline-none focus:border-[#C0593A] text-[#2C1810] cursor-pointer">
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="price">Price: Low to High</option>
          </select>
          <button onClick={() => setFiltersOpen(f => !f)}
            className="md:hidden flex items-center gap-1.5 text-sm border border-[#EBE0D8] bg-white text-[#2C1810] px-4 py-2.5 rounded-xl font-medium">
            ⚙️ Filters
          </button>
        </div>

        <div className="flex gap-6 items-start">

          {/* Sidebar */}
          <aside className={`w-64 flex-shrink-0 md:block md:sticky md:top-[80px] ${filtersOpen ? 'block fixed inset-0 z-40 overflow-y-auto' : 'hidden'}`}>
            {filtersOpen && (
              <div className="md:hidden fixed inset-0 bg-black/40 z-[-1]" onClick={() => setFiltersOpen(false)} />
            )}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6 ${filtersOpen ? 'mx-4 my-4' : ''}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#2C1810]">Filters</p>
                {hasFilters && (
                  <button onClick={clearAll} className="text-xs text-[#C0593A] hover:underline font-medium">Clear all</button>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">Skill Type</p>
                <div className="space-y-2.5">
                  {SKILLS.map(s => (
                    <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={selectedSkills.includes(s)} onChange={() => toggleSkill(s)}
                        className="w-4 h-4 rounded border-gray-300 accent-[#C0593A] cursor-pointer" />
                      <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">Location</p>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="Search by city…"
                  className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2 outline-none focus:border-[#C0593A]" />
              </div>

              <div>
                <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">Availability</p>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-[#3D2B22]">Available Now only</span>
                  <button type="button" role="switch" aria-checked={availableNow} onClick={() => setAvailableNow(v => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${availableNow ? 'bg-[#C0593A]' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${availableNow ? 'translate-x-5' : ''}`} />
                  </button>
                </label>
              </div>

              <div>
                <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">Rating</p>
                <div className="space-y-2.5">
                  {([['any','Any'],['4','4★ & above'],['4.5','4.5★ & above']] as [RatingFilter,string][]).map(([val,label]) => (
                    <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="radio" name="labour_rating" value={val} checked={ratingFilter === val} onChange={() => setRatingFilter(val)}
                        className="w-4 h-4 accent-[#C0593A] cursor-pointer" />
                      <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {filtersOpen && (
                <button onClick={() => setFiltersOpen(false)}
                  className="w-full bg-[#C0593A] text-white text-sm font-semibold py-2.5 rounded-xl">
                  Show {results.length} Result{results.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-4xl">🔍</span>
                </div>
                <p className="text-base font-semibold text-[#2C1810] mb-1">No workers found</p>
                <p className="text-sm text-[#6B5248]">Try adjusting your filters or search terms</p>
                {hasFilters && (
                  <button onClick={clearAll} className="mt-4 text-sm text-[#C0593A] hover:underline font-medium">Clear all filters</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((p, idx) => (
                  <LabourCard key={p.id} profile={p} rank={idx} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function LabourCard({ profile: p, rank }: { profile: LabourProfile; rank: number }) {
  const initials = p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const isBestMatch = rank < 3;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-all border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-[#FAEEE9] border border-[#E8C4B0] flex items-center justify-center text-sm font-bold text-[#9E3F24]">
            {initials}
          </div>
          {p.verified && (
            <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
              title="Verified by Griffy">✓</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-[#2C1810] truncate">{p.name}</p>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-orange-100 text-orange-700 border-orange-200">
              {p.skillType}
            </span>
            <TierBadge completedJobs={p.completedJobs} rating={p.rating} />
            {isBestMatch && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#C0593A]/10 text-[#C0593A] border border-[#C0593A]/20 px-2 py-0.5 rounded-full">
                🎯 Best Match
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.available ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-500">{p.available ? 'Available' : 'Unavailable'}</span>
            {p.verified && <span className="text-xs text-blue-600 font-medium">✅ Verified</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-[#6B5248]">
        <span>📍 {p.location}</span>
        <span>🏗️ {p.experience}</span>
        <span>⭐ {p.rating > 0 ? p.rating.toFixed(1) : '—'} ({p.reviewCount})</span>
      </div>

      <div>
        <p className="text-[11px] text-gray-400 uppercase tracking-wide">Daily Rate</p>
        <p className="text-base font-bold text-[#2C1810]">
          {p.dailyRate > 0 ? `₹${p.dailyRate.toLocaleString('en-IN')}/day` : 'Rate on request'}
        </p>
      </div>

      <div className="flex gap-2 pt-1">
        <Link href={`/labour/${p.id}`}
          className="flex-1 text-center text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white py-2 rounded-xl transition-colors">
          View Profile
        </Link>
        <button className="flex-1 text-sm font-semibold border border-[#C0593A] text-[#C0593A] hover:bg-[#FAEEE9] py-2 rounded-xl transition-colors">
          Contact
        </button>
        <SaveButton type="labour" id={p.id} title={p.name} subtitle={p.skillType} href={`/labour/${p.id}`} emoji="👷" />
      </div>
    </div>
  );
}
