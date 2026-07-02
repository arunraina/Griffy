'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';

type ListingType = 'Residential Plot' | 'Agricultural Land' | 'Commercial Plot' | 'Farm House' | 'Industrial';
type SortKey = 'relevance' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc' | 'newest';

interface LandListing {
  id: string;
  title: string;
  type: ListingType;
  city: string;
  locality: string;
  state: string;
  area: number;
  areaUnit: 'sqft' | 'sqyd' | 'bigha' | 'acre' | 'marla' | 'kanal';
  price: number;
  priceUnit: 'total' | 'per_sqft' | 'per_bigha' | 'per_acre';
  facing: string;
  road: string;
  approved: boolean;
  fencing: boolean;
  water: boolean;
  electricity: boolean;
  featured: boolean;
  postedDaysAgo: number;
  ownerName: string;
  ownerType: 'Owner' | 'Dealer' | 'Builder';
  imageUrl: string;
  imageIcon: string;
  regionTag?: string;
}

const LISTINGS: LandListing[] = [
  {
    id: 'l1', title: 'Prime Residential Plot — Sector 45', type: 'Residential Plot',
    city: 'Gurgaon', locality: 'Sector 45', state: 'Haryana',
    area: 200, areaUnit: 'sqyd', price: 8500000, priceUnit: 'total',
    facing: 'East', road: '30ft', approved: true, fencing: false, water: true, electricity: true,
    featured: true, postedDaysAgo: 2, ownerName: 'Ramesh Gupta', ownerType: 'Owner',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop&q=80',
    imageIcon: '🌍',
  },
  {
    id: 'l2', title: 'Agricultural Land with Tube Well', type: 'Agricultural Land',
    city: 'Jaipur', locality: 'Sanganer', state: 'Rajasthan',
    area: 5, areaUnit: 'bigha', price: 1200000, priceUnit: 'per_bigha',
    facing: 'North', road: '15ft', approved: false, fencing: true, water: true, electricity: false,
    featured: false, postedDaysAgo: 5, ownerName: 'Mahesh Sharma', ownerType: 'Owner',
    imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop&q=80',
    imageIcon: '🌾',
  },
  {
    id: 'l3', title: 'Commercial Plot on NH-44', type: 'Commercial Plot',
    city: 'Delhi', locality: 'Narela', state: 'Delhi',
    area: 500, areaUnit: 'sqyd', price: 45000, priceUnit: 'per_sqft',
    facing: 'West', road: '60ft', approved: true, fencing: true, water: true, electricity: true,
    featured: true, postedDaysAgo: 1, ownerName: 'Singh Properties', ownerType: 'Dealer',
    imageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=400&fit=crop&q=80',
    imageIcon: '🏗️',
  },
  {
    id: 'l4', title: 'Scenic Plot with Mountain View', type: 'Residential Plot',
    city: 'Srinagar', locality: 'Nishat', state: 'J&K',
    area: 10, areaUnit: 'marla', price: 2800000, priceUnit: 'total',
    facing: 'South', road: '20ft', approved: true, fencing: false, water: true, electricity: true,
    featured: true, postedDaysAgo: 3, ownerName: 'Farooq Ahmed', ownerType: 'Owner',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&q=80',
    imageIcon: '🏔️',
    regionTag: 'kashmir',
  },
  {
    id: 'l5', title: 'Farm House Plot — Outer Ring Road', type: 'Farm House',
    city: 'Bangalore', locality: 'Devanahalli', state: 'Karnataka',
    area: 1, areaUnit: 'acre', price: 3500000, priceUnit: 'per_acre',
    facing: 'North', road: '40ft', approved: true, fencing: true, water: true, electricity: true,
    featured: false, postedDaysAgo: 7, ownerName: 'GreenAcres Realty', ownerType: 'Builder',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop&q=80',
    imageIcon: '🌳',
  },
  {
    id: 'l6', title: 'Industrial Plot — MIDC Zone', type: 'Industrial',
    city: 'Pune', locality: 'Chakan', state: 'Maharashtra',
    area: 2000, areaUnit: 'sqmt', price: 12000, priceUnit: 'per_sqft',
    facing: 'East', road: '80ft', approved: true, fencing: true, water: true, electricity: true,
    featured: false, postedDaysAgo: 4, ownerName: 'PunePlots Pvt Ltd', ownerType: 'Dealer',
    imageUrl: 'https://images.unsplash.com/photo-1565793979618-a3a4f9bc5a0a?w=600&h=400&fit=crop&q=80',
    imageIcon: '🏭',
  },
  {
    id: 'l7', title: 'Residential Plot — Gated Township', type: 'Residential Plot',
    city: 'Hyderabad', locality: 'Mokila', state: 'Telangana',
    area: 267, areaUnit: 'sqyd', price: 5200000, priceUnit: 'total',
    facing: 'East', road: '33ft', approved: true, fencing: true, water: true, electricity: true,
    featured: true, postedDaysAgo: 1, ownerName: 'Prestige Lands', ownerType: 'Builder',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop&q=80',
    imageIcon: '🌍',
  },
  {
    id: 'l8', title: 'Agricultural Land — Canal Irrigated', type: 'Agricultural Land',
    city: 'Jammu', locality: 'Suchetgarh', state: 'J&K',
    area: 8, areaUnit: 'kanal', price: 900000, priceUnit: 'total',
    facing: 'South', road: '12ft', approved: false, fencing: false, water: true, electricity: false,
    featured: false, postedDaysAgo: 10, ownerName: 'Rajinder Singh', ownerType: 'Owner',
    imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop&q=80',
    imageIcon: '🌾',
    regionTag: 'kashmir',
  },
  {
    id: 'l9', title: 'Corner Plot — Prime Location', type: 'Residential Plot',
    city: 'Lucknow', locality: 'Gomti Nagar Extension', state: 'UP',
    area: 150, areaUnit: 'sqyd', price: 3800000, priceUnit: 'total',
    facing: 'North-East', road: '30ft', approved: true, fencing: false, water: true, electricity: true,
    featured: false, postedDaysAgo: 6, ownerName: 'Verma Estates', ownerType: 'Dealer',
    imageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=400&fit=crop&q=80',
    imageIcon: '🏗️',
  },
  {
    id: 'l10', title: 'Orchard Land — Apple Belt', type: 'Agricultural Land',
    city: 'Srinagar', locality: 'Shopian', state: 'J&K',
    area: 3, areaUnit: 'kanal', price: 1500000, priceUnit: 'total',
    facing: 'South', road: '10ft', approved: false, fencing: true, water: true, electricity: false,
    featured: true, postedDaysAgo: 2, ownerName: 'Bashir Ahmad', ownerType: 'Owner',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop&q=80',
    imageIcon: '🍎',
    regionTag: 'kashmir',
  },
  {
    id: 'l11', title: 'Commercial Showroom Plot — MG Road', type: 'Commercial Plot',
    city: 'Bangalore', locality: 'MG Road', state: 'Karnataka',
    area: 80, areaUnit: 'sqmt', price: 95000, priceUnit: 'per_sqft',
    facing: 'West', road: '100ft', approved: true, fencing: true, water: true, electricity: true,
    featured: false, postedDaysAgo: 3, ownerName: 'Agarwal Commercial', ownerType: 'Dealer',
    imageUrl: 'https://images.unsplash.com/photo-1565793979618-a3a4f9bc5a0a?w=600&h=400&fit=crop&q=80',
    imageIcon: '🏢',
  },
  {
    id: 'l12', title: 'Lake View Farmhouse Plot', type: 'Farm House',
    city: 'Chandigarh', locality: 'Morni Hills', state: 'Haryana',
    area: 2, areaUnit: 'acre', price: 4500000, priceUnit: 'per_acre',
    facing: 'North', road: '24ft', approved: true, fencing: false, water: true, electricity: true,
    featured: false, postedDaysAgo: 8, ownerName: 'Hill Retreats', ownerType: 'Builder',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&q=80',
    imageIcon: '🏕️',
  },
];

const TYPES: ListingType[] = ['Residential Plot', 'Agricultural Land', 'Commercial Plot', 'Farm House', 'Industrial'];
const STATES = ['Delhi', 'Haryana', 'Rajasthan', 'J&K', 'Karnataka', 'Maharashtra', 'Telangana', 'UP'];
const FACINGS = ['East', 'West', 'North', 'South', 'North-East', 'North-West'];

function fmtPrice(p: number, unit: LandListing['priceUnit']): string {
  const label = unit === 'per_sqft' ? '/sqft' : unit === 'per_bigha' ? '/bigha' : unit === 'per_acre' ? '/acre' : '';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr${label}`;
  if (p >= 100000)   return `₹${(p / 100000).toFixed(1)} L${label}`;
  return `₹${p.toLocaleString('en-IN')}${label}`;
}

export default function LandPage() {
  return <Suspense><LandInner /></Suspense>;
}

function LandInner() {
  const [search,       setSearch]       = useState('');
  const [sort,         setSort]         = useState<SortKey>('relevance');
  const [selTypes,     setSelTypes]     = useState<Set<ListingType>>(new Set());
  const [selStates,    setSelStates]    = useState<Set<string>>(new Set());
  const [selFacings,   setSelFacings]   = useState<Set<string>>(new Set());
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [ownerOnly,    setOwnerOnly]    = useState(false);
  const [priceMin,     setPriceMin]     = useState('');
  const [priceMax,     setPriceMax]     = useState('');
  const [filtersOpen,  setFiltersOpen]  = useState(false);

  function toggle<T>(s: Set<T>, v: T): Set<T> {
    const n = new Set(s); n.has(v) ? n.delete(v) : n.add(v); return n;
  }

  const listings = useMemo(() => {
    let list = [...LISTINGS];
    if (selTypes.size)   list = list.filter(l => selTypes.has(l.type));
    if (selStates.size)  list = list.filter(l => selStates.has(l.state));
    if (selFacings.size) list = list.filter(l => selFacings.has(l.facing));
    if (approvedOnly)    list = list.filter(l => l.approved);
    if (ownerOnly)       list = list.filter(l => l.ownerType === 'Owner');
    if (priceMin)        list = list.filter(l => l.price >= Number(priceMin) * 100000);
    if (priceMax)        list = list.filter(l => l.price <= Number(priceMax) * 100000);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.title.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) ||
        l.locality.toLowerCase().includes(q) || l.type.toLowerCase().includes(q)
      );
    }
    if (sort === 'price_asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'newest')     list = [...list].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    // featured first for relevance
    if (sort === 'relevance')  list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [search, sort, selTypes, selStates, selFacings, approvedOnly, ownerOnly, priceMin, priceMax]);

  function clearAll() {
    setSelTypes(new Set()); setSelStates(new Set()); setSelFacings(new Set());
    setApprovedOnly(false); setOwnerOnly(false); setPriceMin(''); setPriceMax('');
  }

  const hasFilters = !!(selTypes.size || selStates.size || selFacings.size || approvedOnly || ownerOnly || priceMin || priceMax);

  const Sidebar = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-[#F0E8E2]">
      <div className="flex items-center justify-between px-5 py-4">
        <p className="text-sm font-semibold text-[#2C1810]">Filters</p>
        <div className="flex items-center gap-3">
          {hasFilters && <button onClick={clearAll} className="text-xs text-[#C0593A] hover:underline font-medium">Clear all</button>}
          <button onClick={() => setFiltersOpen(false)} className="md:hidden text-gray-400">✕</button>
        </div>
      </div>

      {/* Type */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">Land Type</p>
        {TYPES.map(t => (
          <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={selTypes.has(t)} onChange={() => setSelTypes(toggle(selTypes, t))}
              className="w-4 h-4 rounded accent-[#C0593A]" />
            <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{t}</span>
          </label>
        ))}
      </div>

      {/* Price */}
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest">Budget (₹ Lakhs)</p>
        <div className="flex gap-2 items-center">
          <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="Min"
            className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2 outline-none focus:border-[#C0593A]" />
          <span className="text-gray-300">—</span>
          <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="Max"
            className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2 outline-none focus:border-[#C0593A]" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[['<20L','','20'], ['20–50L','20','50'], ['50L–1Cr','50','100'], ['>1Cr','100','']] .map(([label, min, max]) => (
            <button key={label} onClick={() => { setPriceMin(min); setPriceMax(max); }}
              className={`text-[10px] px-2.5 py-1 rounded-lg font-medium border transition-all ${
                priceMin === min && priceMax === max ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#C0593A]'
              }`}>{label}</button>
          ))}
        </div>
      </div>

      {/* State */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">State</p>
        {STATES.map(s => (
          <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={selStates.has(s)} onChange={() => setSelStates(toggle(selStates, s))}
              className="w-4 h-4 rounded accent-[#C0593A]" />
            <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{s}</span>
          </label>
        ))}
      </div>

      {/* Facing */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">Facing</p>
        {FACINGS.map(f => (
          <label key={f} className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={selFacings.has(f)} onChange={() => setSelFacings(toggle(selFacings, f))}
              className="w-4 h-4 rounded accent-[#C0593A]" />
            <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{f}</span>
          </label>
        ))}
      </div>

      {/* Toggles */}
      <div className="px-5 py-4 space-y-3">
        <Toggle label="RERA / Authority Approved" checked={approvedOnly} onChange={() => setApprovedOnly(v => !v)} />
        <Toggle label="Direct from Owner"          checked={ownerOnly}    onChange={() => setOwnerOnly(v => !v)} />
      </div>

      {filtersOpen && (
        <div className="px-5 py-4">
          <button onClick={() => setFiltersOpen(false)}
            className="w-full bg-[#C0593A] text-white text-sm font-semibold py-2.5 rounded-xl">
            Show {listings.length} listing{listings.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>Land & Plots</h1>
          <p className="text-sm text-[#6B5248] mt-0.5">{listings.length} listings across India</p>
        </div>

        {/* Search + sort */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by city, locality or land type…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#EBE0D8] rounded-xl bg-white outline-none focus:border-[#C0593A]" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
            className="text-sm border border-[#EBE0D8] rounded-xl bg-white px-3 py-2.5 outline-none focus:border-[#C0593A] text-[#2C1810] cursor-pointer">
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
          <button onClick={() => setFiltersOpen(true)}
            className="md:hidden flex items-center gap-1.5 text-sm border border-[#EBE0D8] bg-white px-4 py-2.5 rounded-xl font-medium">
            ⚙️ Filters {hasFilters && <span className="bg-[#C0593A] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">!</span>}
          </button>
        </div>

        {/* Type chips */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1 min-w-max">
            <button onClick={() => setSelTypes(new Set())}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                !selTypes.size ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#C0593A]'
              }`}>All Types</button>
            {TYPES.map(t => (
              <button key={t} onClick={() => setSelTypes(toggle(selTypes, t))}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                  selTypes.has(t) ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#C0593A]'
                }`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Sidebar + grid */}
        <div className="flex gap-6 items-start">

          {filtersOpen && (
            <div className="md:hidden fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
              <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl">
                {Sidebar}
              </div>
            </div>
          )}

          <aside className="hidden md:block w-60 flex-shrink-0 sticky top-[80px] max-h-[calc(100vh-96px)] overflow-y-auto">
            {Sidebar}
          </aside>

          <div className="flex-1 min-w-0">
            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">🌍</div>
                <p className="text-base font-semibold text-[#2C1810] mb-1">No listings found</p>
                <p className="text-sm text-[#6B5248]">Try adjusting your filters</p>
                <button onClick={clearAll} className="mt-4 text-sm text-[#C0593A] hover:underline font-medium">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {listings.map(l => <LandCard key={l.id} listing={l} />)}
              </div>
            )}
          </div>
        </div>

        {/* Post CTA */}
        <div className="bg-[#2C1810] rounded-2xl px-8 py-10 text-center mt-4">
          <p className="text-white/60 text-sm mb-2">Own land or a plot?</p>
          <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            List your land for free on Griffy
          </h2>
          <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
            Reach thousands of serious buyers and investors across India
          </p>
          <Link href="/signup?type=professional"
            className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold text-sm px-8 py-3 rounded-xl transition-colors">
            Post Land Listing Free →
          </Link>
        </div>

      </div>
    </div>
  );
}

// ── LandCard ──────────────────────────────────────────────────────────────────

function LandCard({ listing: l }: { listing: LandListing }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-all ${
      l.featured ? 'border-2 border-[#C0593A]/20' : 'border border-gray-100'
    }`}>
      {/* Image */}
      <div className="relative rounded-t-2xl overflow-hidden" style={{ height: '180px' }}>
        {!imgFailed ? (
          <img src={l.imageUrl} alt={l.title} className="w-full h-full object-cover"
            onError={() => setImgFailed(true)} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FAEEE9] to-[#F5EDE8] flex items-center justify-center">
            <span className="text-5xl">{l.imageIcon}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        {l.featured && (
          <span className="absolute top-2 left-2 bg-[#C0593A] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">⭐ Featured</span>
        )}
        {l.approved && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">✓ Approved</span>
        )}
        <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm font-medium">
          {l.type}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-sm font-bold text-[#2C1810] leading-snug">{l.title}</p>
        <p className="text-xs text-[#A08070]">📍 {l.locality}, {l.city}, {l.state}</p>

        {/* Area + facing + road */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] bg-[#F5EDE8] text-[#7A3E27] px-2 py-0.5 rounded-md font-medium">
            📐 {l.area} {l.areaUnit}
          </span>
          <span className="text-[10px] bg-[#F5EDE8] text-[#7A3E27] px-2 py-0.5 rounded-md font-medium">
            🧭 {l.facing} facing
          </span>
          <span className="text-[10px] bg-[#F5EDE8] text-[#7A3E27] px-2 py-0.5 rounded-md font-medium">
            🛣️ {l.road} road
          </span>
        </div>

        {/* Amenities */}
        <div className="flex gap-2">
          {l.water       && <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded font-medium">💧 Water</span>}
          {l.electricity && <span className="text-[10px] text-yellow-600 bg-yellow-50 border border-yellow-100 px-1.5 py-0.5 rounded font-medium">⚡ Electricity</span>}
          {l.fencing     && <span className="text-[10px] text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded font-medium">🔒 Fenced</span>}
        </div>

        {/* Price */}
        <p className="text-xl font-bold text-[#C0593A] mt-1">{fmtPrice(l.price, l.priceUnit)}</p>

        {/* Owner + posted */}
        <div className="flex items-center justify-between text-xs text-[#A08070]">
          <span>{l.ownerType === 'Owner' ? '👤' : l.ownerType === 'Builder' ? '🏗️' : '🏢'} {l.ownerName} · {l.ownerType}</span>
          <span>{l.postedDaysAgo === 1 ? 'Today' : `${l.postedDaysAgo}d ago`}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <Link href={`/land/${l.id}`}
            className="flex-1 text-center text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white py-2 rounded-xl transition-colors">
            View Details
          </Link>
          <button className="px-3 py-2 text-sm font-semibold border border-[#C0593A] text-[#C0593A] hover:bg-[#FAEEE9] rounded-xl transition-colors">
            📞 Contact
          </button>
          <button className="px-3 py-2 text-sm text-gray-400 hover:text-red-500 border border-gray-100 hover:border-red-200 rounded-xl transition-colors">♡</button>
        </div>
      </div>
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────────────────

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-[#3D2B22]">{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={onChange}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-3 ${checked ? 'bg-[#C0593A]' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  );
}
