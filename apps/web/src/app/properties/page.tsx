'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

type TabKey = 'land' | 'buy' | 'rent' | 'new';
type PropertyType = 'Apartment' | 'Independent House' | 'Villa' | 'Builder Floor' | 'Studio' | 'Row House';
type SortKey = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

interface Property {
  id: string;
  tab: 'buy' | 'rent' | 'new';
  type: PropertyType;
  title: string;
  city: string;
  locality: string;
  bhk: string;
  area: number;
  areaUnit: string;
  price: number;
  priceUnit: 'total' | 'per_month';
  floor?: string;
  totalFloors?: number;
  age?: string;
  furnishing: 'Furnished' | 'Semi-furnished' | 'Unfurnished';
  parking: boolean;
  lift: boolean;
  featured: boolean;
  postedDaysAgo: number;
  ownerName: string;
  ownerType: 'Owner' | 'Agent' | 'Builder';
  imageUrl: string;
  amenities: string[];
  verified: boolean;
  rera?: string;
}

const PROPERTIES: Property[] = [
  {
    id: 'p1', tab: 'buy', type: 'Apartment', title: '3 BHK Apartment — DLF Phase 2',
    city: 'Gurgaon', locality: 'DLF Phase 2', bhk: '3 BHK', area: 1750, areaUnit: 'sq ft',
    price: 18500000, priceUnit: 'total', floor: '8', totalFloors: 14, age: '5 years',
    furnishing: 'Semi-furnished', parking: true, lift: true, featured: true, postedDaysAgo: 2,
    ownerName: 'Vikram Singh', ownerType: 'Owner',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop&q=80',
    amenities: ['Gym', 'Swimming Pool', 'Security', 'Power Backup'],
    verified: true,
  },
  {
    id: 'p2', tab: 'buy', type: 'Independent House', title: '4 BHK Independent House — Vasant Kunj',
    city: 'Delhi', locality: 'Vasant Kunj', bhk: '4 BHK', area: 3200, areaUnit: 'sq ft',
    price: 45000000, priceUnit: 'total', age: '10 years',
    furnishing: 'Unfurnished', parking: true, lift: false, featured: true, postedDaysAgo: 1,
    ownerName: 'Meenakshi Sharma', ownerType: 'Owner',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop&q=80',
    amenities: ['Garden', 'Car Parking', 'Security'],
    verified: true,
  },
  {
    id: 'p3', tab: 'buy', type: 'Apartment', title: '2 BHK Ready-to-Move — Whitefield',
    city: 'Bangalore', locality: 'Whitefield', bhk: '2 BHK', area: 1150, areaUnit: 'sq ft',
    price: 8200000, priceUnit: 'total', floor: '4', totalFloors: 12, age: '2 years',
    furnishing: 'Semi-furnished', parking: true, lift: true, featured: false, postedDaysAgo: 4,
    ownerName: 'Rahul Krishnan', ownerType: 'Agent',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop&q=80',
    amenities: ['Gym', 'Club House', 'Power Backup'],
    verified: false,
  },
  {
    id: 'p4', tab: 'buy', type: 'Villa', title: '5 BHK Luxury Villa — Baner',
    city: 'Pune', locality: 'Baner', bhk: '5 BHK', area: 4800, areaUnit: 'sq ft',
    price: 62000000, priceUnit: 'total', age: '3 years',
    furnishing: 'Furnished', parking: true, lift: false, featured: true, postedDaysAgo: 3,
    ownerName: 'Prestige Homes', ownerType: 'Builder',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop&q=80',
    amenities: ['Swimming Pool', 'Garden', 'Security', 'Club House', 'Gym'],
    verified: true,
  },
  {
    id: 'p5', tab: 'buy', type: 'Builder Floor', title: '3 BHK Builder Floor — South Extension',
    city: 'Delhi', locality: 'South Extension', bhk: '3 BHK', area: 1600, areaUnit: 'sq ft',
    price: 28000000, priceUnit: 'total', floor: '2', totalFloors: 4, age: '8 years',
    furnishing: 'Semi-furnished', parking: true, lift: false, featured: false, postedDaysAgo: 6,
    ownerName: 'Tarun Bhatia', ownerType: 'Owner',
    imageUrl: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop&q=80',
    amenities: ['Car Parking', 'Security'],
    verified: false,
  },
  {
    id: 'p6', tab: 'buy', type: 'Apartment', title: '2 BHK Apartment — Hitech City',
    city: 'Hyderabad', locality: 'Hitech City', bhk: '2 BHK', area: 1080, areaUnit: 'sq ft',
    price: 7600000, priceUnit: 'total', floor: '10', totalFloors: 20, age: '1 year',
    furnishing: 'Unfurnished', parking: true, lift: true, featured: false, postedDaysAgo: 5,
    ownerName: 'Naveen Reddy', ownerType: 'Owner',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop&q=80',
    amenities: ['Gym', 'Power Backup', 'Security'],
    verified: true,
  },
  // Rent listings
  {
    id: 'r1', tab: 'rent', type: 'Apartment', title: '2 BHK for Rent — Koramangala',
    city: 'Bangalore', locality: 'Koramangala', bhk: '2 BHK', area: 1100, areaUnit: 'sq ft',
    price: 35000, priceUnit: 'per_month', floor: '3', totalFloors: 8,
    furnishing: 'Furnished', parking: true, lift: true, featured: true, postedDaysAgo: 1,
    ownerName: 'Suresh Nair', ownerType: 'Owner',
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop&q=80',
    amenities: ['Gym', 'Power Backup', 'Security', 'Club House'],
    verified: true,
  },
  {
    id: 'r2', tab: 'rent', type: 'Apartment', title: '3 BHK for Rent — Powai',
    city: 'Mumbai', locality: 'Powai', bhk: '3 BHK', area: 1400, areaUnit: 'sq ft',
    price: 65000, priceUnit: 'per_month', floor: '15', totalFloors: 28,
    furnishing: 'Semi-furnished', parking: true, lift: true, featured: true, postedDaysAgo: 2,
    ownerName: 'Priya Joshi', ownerType: 'Owner',
    imageUrl: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop&q=80',
    amenities: ['Swimming Pool', 'Gym', 'Security', 'Power Backup'],
    verified: false,
  },
  {
    id: 'r3', tab: 'rent', type: 'Independent House', title: '4 BHK House for Rent — Jubilee Hills',
    city: 'Hyderabad', locality: 'Jubilee Hills', bhk: '4 BHK', area: 2800, areaUnit: 'sq ft',
    price: 55000, priceUnit: 'per_month',
    furnishing: 'Furnished', parking: true, lift: false, featured: false, postedDaysAgo: 3,
    ownerName: 'Srinivas Rao', ownerType: 'Owner',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop&q=80',
    amenities: ['Garden', 'Security', 'Car Parking'],
    verified: true,
  },
  {
    id: 'r4', tab: 'rent', type: 'Studio', title: 'Studio for Rent — Sector 48',
    city: 'Gurgaon', locality: 'Sector 48', bhk: '1 RK', area: 450, areaUnit: 'sq ft',
    price: 18000, priceUnit: 'per_month', floor: '6', totalFloors: 18,
    furnishing: 'Furnished', parking: false, lift: true, featured: false, postedDaysAgo: 5,
    ownerName: 'Amit Arora', ownerType: 'Agent',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop&q=80',
    amenities: ['Security', 'Power Backup'],
    verified: false,
  },
  // New project listings
  {
    id: 'n1', tab: 'new', type: 'Apartment', title: 'Lodha Bellavista — Premium 2 & 3 BHK',
    city: 'Mumbai', locality: 'Thane', bhk: '2-3 BHK', area: 900, areaUnit: 'sq ft',
    price: 12500000, priceUnit: 'total',
    furnishing: 'Unfurnished', parking: true, lift: true, featured: true, postedDaysAgo: 7,
    ownerName: 'Lodha Group', ownerType: 'Builder', rera: 'P51700025846',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop&q=80',
    amenities: ['Swimming Pool', 'Gym', 'Club House', 'Security', 'Garden'],
    verified: true,
  },
  {
    id: 'n2', tab: 'new', type: 'Villa', title: 'Brigade Valencia — Luxury Villas',
    city: 'Bangalore', locality: 'Hosur Road', bhk: '3-4 BHK', area: 2400, areaUnit: 'sq ft',
    price: 35000000, priceUnit: 'total',
    furnishing: 'Unfurnished', parking: true, lift: false, featured: true, postedDaysAgo: 10,
    ownerName: 'Brigade Group', ownerType: 'Builder', rera: 'PRM/KA/RERA/1251/446',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop&q=80',
    amenities: ['Swimming Pool', 'Gym', 'Security', 'Club House', 'Garden'],
    verified: true,
  },
  {
    id: 'n3', tab: 'new', type: 'Apartment', title: 'Prestige Skyline — High-Rise 2 BHK',
    city: 'Hyderabad', locality: 'Gachibowli', bhk: '2-3 BHK', area: 1200, areaUnit: 'sq ft',
    price: 9800000, priceUnit: 'total',
    furnishing: 'Unfurnished', parking: true, lift: true, featured: false, postedDaysAgo: 14,
    ownerName: 'Prestige Group', ownerType: 'Builder', rera: 'P02400004454',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop&q=80',
    amenities: ['Gym', 'Club House', 'Swimming Pool', 'Power Backup'],
    verified: true,
  },
];

const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Independent House', 'Villa', 'Builder Floor', 'Studio', 'Row House'];
const BHK_FILTER = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK+'];
const FURNISHING_OPTIONS = ['Furnished', 'Semi-furnished', 'Unfurnished'];
const CITIES_LIST = ['Delhi', 'Gurgaon', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Srinagar'];

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'land', label: 'Land & Plots', icon: '🌍' },
  { key: 'buy',  label: 'Buy Home',     icon: '🏠' },
  { key: 'rent', label: 'Rent',         icon: '🔑' },
  { key: 'new',  label: 'New Projects', icon: '🏗️' },
];

function fmtPrice(price: number, unit: Property['priceUnit']): string {
  if (unit === 'per_month') return `₹${price.toLocaleString('en-IN')}/mo`;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function PropertiesPage() {
  return <Suspense><PropertiesInner /></Suspense>;
}

function PropertiesInner() {
  const params = useSearchParams();
  const router = useRouter();

  const [tab, setTab]           = useState<TabKey>((params.get('tab') as TabKey) ?? 'buy');
  const [search, setSearch]     = useState('');
  const [sort, setSort]         = useState<SortKey>('relevance');
  const [selTypes, setSelTypes] = useState<Set<PropertyType>>(new Set());
  const [selBhk, setSelBhk]     = useState<Set<string>>(new Set());
  const [selFurn, setSelFurn]   = useState<Set<string>>(new Set());
  const [selCity, setSelCity]   = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const t = params.get('tab') as TabKey;
    if (t) setTab(t);
    const c = params.get('city');
    if (c) setSelCity(new Set([c]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleSet<T>(s: Set<T>, v: T): Set<T> {
    const n = new Set(s); n.has(v) ? n.delete(v) : n.add(v); return n;
  }

  function handleTabChange(t: TabKey) {
    setTab(t);
    setSearch(''); setSelTypes(new Set()); setSelBhk(new Set());
    setSelFurn(new Set()); setMaxPrice('');
    router.replace(`/properties?tab=${t}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    if (tab === 'land') return [];
    let list = PROPERTIES.filter(p => p.tab === (tab === 'new' ? 'new' : tab));
    if (selTypes.size) list = list.filter(p => selTypes.has(p.type));
    if (selBhk.size)   list = list.filter(p => selBhk.has(p.bhk));
    if (selFurn.size)  list = list.filter(p => selFurn.has(p.furnishing));
    if (selCity.size)  list = list.filter(p => selCity.has(p.city));
    if (maxPrice)      list = list.filter(p => p.price <= Number(maxPrice) * (p.priceUnit === 'per_month' ? 1 : 100000));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) || p.bhk.toLowerCase().includes(q)
      );
    }
    if (sort === 'price_asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'newest')     list = [...list].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    if (sort === 'relevance')  list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [tab, search, sort, selTypes, selBhk, selFurn, selCity, maxPrice]);

  const hasFilters = !!(selTypes.size || selBhk.size || selFurn.size || selCity.size || maxPrice);

  function clearAll() {
    setSelTypes(new Set()); setSelBhk(new Set()); setSelFurn(new Set());
    setSelCity(new Set()); setMaxPrice('');
  }

  const Sidebar = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-[#F0E8E2]">
      <div className="flex items-center justify-between px-5 py-4">
        <p className="text-sm font-semibold text-[#2C1810]">Filters</p>
        <div className="flex items-center gap-3">
          {hasFilters && <button onClick={clearAll} className="text-xs text-[#C0593A] hover:underline font-medium">Clear all</button>}
          <button onClick={() => setFiltersOpen(false)} className="md:hidden text-gray-400">✕</button>
        </div>
      </div>

      {/* City */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">City</p>
        {CITIES_LIST.map(c => (
          <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={selCity.has(c)} onChange={() => setSelCity(toggleSet(selCity, c))}
              className="w-4 h-4 rounded accent-[#C0593A]" />
            <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{c}</span>
          </label>
        ))}
      </div>

      {/* Property Type */}
      {tab !== 'land' && (
        <div className="px-5 py-4 space-y-2">
          <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">Property Type</p>
          {PROPERTY_TYPES.map(t => (
            <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={selTypes.has(t)} onChange={() => setSelTypes(toggleSet(selTypes, t))}
                className="w-4 h-4 rounded accent-[#C0593A]" />
              <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{t}</span>
            </label>
          ))}
        </div>
      )}

      {/* BHK */}
      {tab !== 'land' && (
        <div className="px-5 py-4">
          <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">BHK</p>
          <div className="flex flex-wrap gap-2">
            {BHK_FILTER.map(b => (
              <button key={b} onClick={() => setSelBhk(toggleSet(selBhk, b))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                  selBhk.has(b) ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#C0593A]'
                }`}>{b}</button>
            ))}
          </div>
        </div>
      )}

      {/* Furnishing */}
      {tab === 'rent' && (
        <div className="px-5 py-4 space-y-2">
          <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">Furnishing</p>
          {FURNISHING_OPTIONS.map(f => (
            <label key={f} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={selFurn.has(f)} onChange={() => setSelFurn(toggleSet(selFurn, f))}
                className="w-4 h-4 rounded accent-[#C0593A]" />
              <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{f}</span>
            </label>
          ))}
        </div>
      )}

      {/* Max price */}
      <div className="px-5 py-4">
        <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">
          {tab === 'rent' ? 'Max Rent (₹/mo)' : 'Max Budget (₹ in Lakhs)'}
        </p>
        <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0"
          placeholder={tab === 'rent' ? 'e.g. 50000' : 'e.g. 100'}
          className="w-full px-3 py-2 text-sm border border-[#EBE0D8] rounded-lg outline-none focus:border-[#C0593A] bg-white" />
      </div>

      {/* Show results btn (mobile) */}
      <div className="px-5 py-4 md:hidden">
        <button onClick={() => setFiltersOpen(false)}
          className="w-full bg-[#C0593A] text-white text-sm font-semibold py-2.5 rounded-xl">
          Show {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>Properties</h1>
          <p className="text-sm text-[#6B5248] mt-0.5">Buy, rent or discover new projects across India</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-[#EBE0D8] rounded-2xl p-1.5 w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => handleTabChange(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-[#C0593A] text-white shadow-sm'
                  : 'text-[#6B5248] hover:text-[#2C1810] hover:bg-[#FDF8F5]'
              }`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Land tab — redirect */}
        {tab === 'land' && (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-12 text-center">
            <div className="text-5xl mb-4">🌍</div>
            <h2 className="text-xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Looking for Land & Plots?
            </h2>
            <p className="text-sm text-[#6B5248] mb-6 max-w-sm mx-auto">
              We have 1,000+ land and plot listings across India — residential, agricultural, commercial and more.
            </p>
            <Link href="/land"
              className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm px-8 py-3 rounded-xl transition-colors">
              Browse Land & Plots →
            </Link>
          </div>
        )}

        {/* Property tabs — filters + grid */}
        {tab !== 'land' && (
          <>
            {/* Search + sort */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by city, locality, BHK type…"
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

            {/* Mobile filter drawer */}
            {filtersOpen && (
              <div className="md:hidden fixed inset-0 z-40">
                <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
                <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl">
                  {Sidebar}
                </div>
              </div>
            )}

            {/* Sidebar + grid */}
            <div className="flex gap-6 items-start">
              <aside className="hidden md:block w-60 flex-shrink-0 sticky top-[80px] max-h-[calc(100vh-96px)] overflow-y-auto">
                {Sidebar}
              </aside>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#A08070] mb-4 font-medium">{filtered.length} properties found</p>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-5xl mb-4">🏠</div>
                    <p className="text-base font-semibold text-[#2C1810] mb-1">No properties found</p>
                    <p className="text-sm text-[#6B5248]">Try adjusting your filters</p>
                    <button onClick={clearAll} className="mt-4 text-sm text-[#C0593A] hover:underline font-medium">Clear all filters</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* List CTA */}
        <div className="bg-[#2C1810] rounded-2xl px-8 py-10 text-center mt-4">
          <p className="text-white/60 text-sm mb-2">Own or managing a property?</p>
          <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            List your property for free on Griffy
          </h2>
          <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
            Reach thousands of buyers and renters. No brokerage, no hidden charges.
          </p>
          <Link href="/signup?type=professional"
            className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm px-8 py-3 rounded-xl transition-colors">
            List Your Property →
          </Link>
        </div>

      </div>
    </div>
  );
}

// ── PropertyCard ──────────────────────────────────────────────────────────────

function PropertyCard({ property: p }: { property: Property }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link href={`/properties/${p.id}`}
      className="group bg-white rounded-2xl border border-[#EBE0D8] hover:border-[#C0593A] hover:shadow-md transition-all overflow-hidden">

      {/* Image */}
      <div className="relative h-48 bg-[#F5EDE8] overflow-hidden">
        {!imgFailed ? (
          <img src={p.imageUrl} alt={p.title} onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
        )}
        {p.featured && (
          <span className="absolute top-3 left-3 bg-[#C0593A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}
        {p.verified && (
          <span className="absolute top-3 right-3 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            ✓ Verified
          </span>
        )}
        {p.tab === 'new' && p.rera && (
          <span className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            RERA: {p.rera}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm font-bold text-[#2C1810] leading-snug group-hover:text-[#C0593A] transition-colors line-clamp-1">
            {p.title}
          </p>
          <p className="text-xs text-[#A08070] mt-0.5">{p.locality}, {p.city}</p>
        </div>

        <p className="text-xl font-bold text-[#C0593A]">{fmtPrice(p.price, p.priceUnit)}</p>

        <div className="flex flex-wrap gap-2 text-xs text-[#6B5248]">
          <span className="bg-[#F5EDE8] px-2 py-0.5 rounded-full font-medium">{p.bhk}</span>
          <span className="bg-[#F5EDE8] px-2 py-0.5 rounded-full">{p.area} {p.areaUnit}</span>
          <span className="bg-[#F5EDE8] px-2 py-0.5 rounded-full">{p.furnishing}</span>
          {p.floor && <span className="bg-[#F5EDE8] px-2 py-0.5 rounded-full">Floor {p.floor}/{p.totalFloors}</span>}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {p.parking && <span className="text-[10px] bg-white border border-[#EBE0D8] text-[#6B5248] px-2 py-0.5 rounded">🚗 Parking</span>}
          {p.lift    && <span className="text-[10px] bg-white border border-[#EBE0D8] text-[#6B5248] px-2 py-0.5 rounded">🛗 Lift</span>}
          {p.amenities.slice(0, 2).map(a => (
            <span key={a} className="text-[10px] bg-white border border-[#EBE0D8] text-[#6B5248] px-2 py-0.5 rounded">{a}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#F0E8E2]">
          <div>
            <p className="text-xs font-medium text-[#2C1810]">{p.ownerName}</p>
            <p className="text-[10px] text-[#A08070]">{p.ownerType} · {p.postedDaysAgo}d ago</p>
          </div>
          <span className="text-xs font-semibold text-[#C0593A] group-hover:underline">View →</span>
        </div>
      </div>
    </Link>
  );
}
