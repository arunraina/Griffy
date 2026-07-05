'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SaveButton from '@/components/SaveButton';
import TierBadge from '@/components/TierBadge';

// ── Types ─────────────────────────────────────────────────────────────────────

type ContractorType = 'Labour' | 'Sub-Contractor' | 'Full Contractor';
// Kept in sync with the `contractors` category's subcategories in lib/featureFlags.ts —
// these are contractor-level specializations, distinct from Labour's trades and
// Service Experts' on-call services.
type TradeSkill = 'Civil Contractor' | 'Renovation Contractor' | 'Architect' | 'Interior Designer' | 'Structural Engineer' | 'Project Manager';
type SortKey = 'relevance' | 'rating' | 'experience' | 'price';
type ExperienceBand = 'any' | '0-2' | '2-5' | '5-10' | '10+';
type RatingFilter = 'any' | '4' | '4.5';

interface Contractor {
  id: string;
  name: string;
  type: ContractorType;
  skills: TradeSkill[];
  location: string;
  experience: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  available: boolean;
  rateType: 'daily' | 'project';
  rate: number;
  verified: boolean;
  featured: boolean;
}

// ── URL param → filter value maps ─────────────────────────────────────────────

const TYPE_PARAM_MAP: Record<string, ContractorType> = {
  labour:          'Labour',
  sub_contractor:  'Sub-Contractor',
  full_contractor: 'Full Contractor',
};

// Matches the `contractors` category's subcategory keys in lib/featureFlags.ts
const SKILL_PARAM_MAP: Record<string, TradeSkill> = {
  civil_contractor:      'Civil Contractor',
  renovation_contractor: 'Renovation Contractor',
  architect:              'Architect',
  interior_designer:      'Interior Designer',
  structural_engineer:    'Structural Engineer',
  project_manager:        'Project Manager',
};
const TRADE_SKILLS = Object.values(SKILL_PARAM_MAP);

// ── Root export ───────────────────────────────────────────────────────────────

export default function ContractorsClient({ contractors }: { contractors: Contractor[] }) {
  return (
    <Suspense>
      <ContractorsInner contractors={contractors} />
    </Suspense>
  );
}

// ── Inner component (reads search params) ─────────────────────────────────────

function ContractorsInner({ contractors }: { contractors: Contractor[] }) {
  const params = useSearchParams();

  const initialTypes: ContractorType[] = (() => {
    const t = params.get('type');
    return t && TYPE_PARAM_MAP[t] ? [TYPE_PARAM_MAP[t]] : [];
  })();
  const initialSkills: TradeSkill[] = (() => {
    const s = params.get('skill');
    return s && SKILL_PARAM_MAP[s] ? [SKILL_PARAM_MAP[s]] : [];
  })();

  const [selectedTypes,  setSelectedTypes]  = useState<ContractorType[]>(initialTypes);
  const [selectedSkills, setSelectedSkills] = useState<TradeSkill[]>(initialSkills);
  const [experience,     setExperience]     = useState<ExperienceBand>('any');
  const [location,       setLocation]       = useState('');
  const [availableNow,   setAvailableNow]   = useState(false);
  const [ratingFilter,   setRatingFilter]   = useState<RatingFilter>('any');
  const [search,         setSearch]         = useState('');
  const [sort,           setSort]           = useState<SortKey>('relevance');
  const [filtersOpen,    setFiltersOpen]    = useState(false);

  const results = useMemo(() => {
    let list = contractors.filter(c => {
      if (selectedTypes.length  && !selectedTypes.includes(c.type))                              return false;
      if (selectedSkills.length && !c.skills.some(s => selectedSkills.includes(s)))             return false;
      if (availableNow && !c.available)                                                          return false;
      if (location.trim() && !c.location.toLowerCase().includes(location.toLowerCase()))         return false;
      if (experience !== 'any') {
        const e = c.experience;
        if (experience === '0-2'  && e > 2)              return false;
        if (experience === '2-5'  && (e <= 2 || e > 5))  return false;
        if (experience === '5-10' && (e <= 5 || e > 10)) return false;
        if (experience === '10+'  && e <= 10)             return false;
      }
      if (ratingFilter !== 'any' && c.rating < parseFloat(ratingFilter))                         return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) &&
            !c.skills.some(s => s.toLowerCase().includes(q)) &&
            !c.location.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // Featured contractors always float to top
    list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    if (sort === 'rating')     list = [...list].sort((a, b) => (b.featured === a.featured ? b.rating - a.rating : (b.featured ? 1 : -1)));
    if (sort === 'experience') list = [...list].sort((a, b) => (b.featured === a.featured ? b.experience - a.experience : (b.featured ? 1 : -1)));
    if (sort === 'price')      list = [...list].sort((a, b) => (b.featured === a.featured ? a.rate - b.rate : (b.featured ? 1 : -1)));

    return list;
  }, [contractors, selectedTypes, selectedSkills, experience, location, availableNow, ratingFilter, search, sort]);

  function toggleType(t: ContractorType) {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }
  function toggleSkill(s: TradeSkill) {
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }
  function clearAll() {
    setSelectedTypes([]); setSelectedSkills([]); setExperience('any');
    setLocation(''); setAvailableNow(false); setRatingFilter('any');
  }

  const hasFilters = selectedTypes.length || selectedSkills.length || experience !== 'any' ||
    location.trim() || availableNow || ratingFilter !== 'any';
  const filterCount = [selectedTypes.length, selectedSkills.length,
    experience !== 'any' ? 1 : 0, location ? 1 : 0,
    availableNow ? 1 : 0, ratingFilter !== 'any' ? 1 : 0].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>
            Find Contractors
          </h1>
          <p className="text-sm text-[#6B5248] mt-1">
            {results.length} contractor{results.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search + sort bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search contractors by name, skill, or location..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#EBE0D8] rounded-xl bg-white outline-none focus:border-[#C0593A] focus:ring-1 focus:ring-[#C0593A]/20" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
            className="text-sm border border-[#EBE0D8] rounded-xl bg-white px-3 py-2.5 outline-none focus:border-[#C0593A] text-[#2C1810] cursor-pointer">
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="experience">Experience</option>
            <option value="price">Price: Low to High</option>
          </select>
          <button onClick={() => setFiltersOpen(f => !f)}
            className="md:hidden flex items-center gap-1.5 text-sm border border-[#EBE0D8] bg-white text-[#2C1810] px-4 py-2.5 rounded-xl font-medium">
            ⚙️ Filters
            {filterCount > 0 && (
              <span className="bg-[#C0593A] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {filterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6 items-start">

          {/* ── SIDEBAR ── */}
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

              <FilterSection title="Contractor Type">
                {(['Labour', 'Sub-Contractor', 'Full Contractor'] as ContractorType[]).map(t => (
                  <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => toggleType(t)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#C0593A] cursor-pointer" />
                    <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{t}</span>
                  </label>
                ))}
              </FilterSection>

              <FilterSection title="Specialization">
                {TRADE_SKILLS.map(s => (
                  <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={selectedSkills.includes(s)} onChange={() => toggleSkill(s)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#C0593A] cursor-pointer" />
                    <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{s}</span>
                  </label>
                ))}
              </FilterSection>

              <FilterSection title="Experience">
                {([['any','Any'],['0-2','0–2 yrs'],['2-5','2–5 yrs'],['5-10','5–10 yrs'],['10+','10+ yrs']] as [ExperienceBand,string][]).map(([val,label]) => (
                  <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="radio" name="experience" value={val} checked={experience === val} onChange={() => setExperience(val)}
                      className="w-4 h-4 accent-[#C0593A] cursor-pointer" />
                    <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{label}</span>
                  </label>
                ))}
              </FilterSection>

              <FilterSection title="Location">
                <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="Search by city…"
                  className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2 outline-none focus:border-[#C0593A]" />
              </FilterSection>

              <FilterSection title="Availability">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-[#3D2B22]">Available Now only</span>
                  <button type="button" role="switch" aria-checked={availableNow} onClick={() => setAvailableNow(v => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${availableNow ? 'bg-[#C0593A]' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${availableNow ? 'translate-x-5' : ''}`} />
                  </button>
                </label>
              </FilterSection>

              <FilterSection title="Rating">
                {([['any','Any'],['4','4★ & above'],['4.5','4.5★ & above']] as [RatingFilter,string][]).map(([val,label]) => (
                  <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="radio" name="rating" value={val} checked={ratingFilter === val} onChange={() => setRatingFilter(val)}
                      className="w-4 h-4 accent-[#C0593A] cursor-pointer" />
                    <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{label}</span>
                  </label>
                ))}
              </FilterSection>

              {filtersOpen && (
                <button onClick={() => setFiltersOpen(false)}
                  className="w-full bg-[#C0593A] text-white text-sm font-semibold py-2.5 rounded-xl">
                  Show {results.length} Result{results.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </aside>

          {/* ── GRID ── */}
          <div className="flex-1 min-w-0">
            {results.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((c, idx) => (
                  <ContractorCard key={c.id} contractor={c} rank={idx} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">{title}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

const TYPE_BADGE: Record<ContractorType, string> = {
  'Labour':          'bg-orange-100 text-orange-700 border-orange-200',
  'Sub-Contractor':  'bg-blue-100   text-blue-700   border-blue-200',
  'Full Contractor': 'bg-green-100  text-green-700  border-green-200',
};

function ContractorCard({ contractor: c, rank }: { contractor: Contractor; rank: number }) {
  const initials   = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const rateLabel  = c.rateType === 'daily'
    ? `₹${c.rate.toLocaleString('en-IN')}/day`
    : `₹${(c.rate / 1000).toFixed(0)}k/project`;
  const isBestMatch = rank < 3;

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-all
      ${c.featured ? 'border-2 border-[#C0593A]/40' : 'border border-gray-100'}`}>

      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-[#FAEEE9] border border-[#E8C4B0] flex items-center justify-center text-sm font-bold text-[#9E3F24]">
            {initials}
          </div>
          {c.verified && (
            <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
              title="Verified by Griffy">✓</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-[#2C1810] truncate">{c.name}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_BADGE[c.type]}`}>
              {c.type}
            </span>
            <TierBadge completedJobs={c.completedJobs} rating={c.rating} />
            {isBestMatch && (
              <span className="relative group inline-flex items-center gap-1 text-[10px] font-semibold bg-[#C0593A]/10 text-[#C0593A] border border-[#C0593A]/20 px-2 py-0.5 rounded-full cursor-default">
                🎯 Best Match
                <span className="absolute left-0 top-6 z-10 hidden group-hover:block bg-[#2C1810] text-white text-xs px-3 py-2 rounded-lg shadow-lg w-52 font-normal normal-case">
                  Recommended based on your location and project type
                </span>
              </span>
            )}
            {c.featured && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700">
                ⭐ Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.available ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-500">{c.available ? 'Available' : 'Unavailable'}</span>
            {c.verified && <span className="text-xs text-blue-600 font-medium">✅ Verified</span>}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {c.skills.map(s => (
          <span key={s} className="text-[11px] bg-[#F5EDE8] text-[#7A3E27] px-2 py-0.5 rounded-md font-medium">
            {s}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-[#6B5248]">
        <span>📍 {c.location}</span>
        <span>🏗️ {c.experience} yr{c.experience !== 1 ? 's' : ''}</span>
        <span>⭐ {c.rating > 0 ? c.rating : '—'} ({c.reviewCount})</span>
      </div>

      {/* Rate */}
      <div>
        <p className="text-[11px] text-gray-400 uppercase tracking-wide">
          {c.rateType === 'daily' ? 'Daily Rate' : 'Project Rate'}
        </p>
        <p className="text-base font-bold text-[#2C1810]">{rateLabel}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Link href={`/contractors/${c.id}`}
          className="flex-1 text-center text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white py-2 rounded-xl transition-colors">
          View Profile
        </Link>
        <button className="flex-1 text-sm font-semibold border border-[#C0593A] text-[#C0593A] hover:bg-[#FAEEE9] py-2 rounded-xl transition-colors">
          Contact
        </button>
        <SaveButton type="contractor" id={c.id} title={c.name} subtitle={c.type} href={`/contractors/${c.id}`} emoji="🏗️" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
        <span className="text-4xl">🔍</span>
      </div>
      <p className="text-base font-semibold text-[#2C1810] mb-1">No contractors found</p>
      <p className="text-sm text-[#6B5248]">Try adjusting your filters or search terms</p>
    </div>
  );
}
