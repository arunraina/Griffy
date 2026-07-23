'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { getRegionData, type RegionKey } from '@/lib/regionUtils';
import { isSubEnabled } from '@/lib/featureFlags';
import { useCart } from '@/context/CartContext';
import SaveButton from '@/components/SaveButton';
import { trackEvent } from '@/lib/analytics';

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
type RatingFilter = 'any' | '4' | '4.5';

interface Subcategory { id: string; label: string; types: string[] }
interface Category {
  id: string; label: string; badge?: string; regionOnly?: string;
  subcategories: Subcategory[];
}
interface Product {
  id: string; name: string; brand: string;
  categoryId: string; subcategoryId: string; type: string;
  price: number; originalPrice?: number; unit: string; minOrder?: string;
  inStock: boolean; isi: boolean; rating: number; reviewCount: number;
  sellerName: string; sellerCity: string;
  roomTypes: string[];
  regionTag?: string; regionLabel?: string; bulkDiscount?: string; warningId?: string;
  imageUrl: string; imageIcon: string;
}

// ── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'kashmir_special', label: '🏔️ Kashmir Special', badge: '📍 Your Region', regionOnly: 'kashmir',
    subcategories: [
      { id:'snow_roof',    label:'Snow Load Roofing',        types:['Sloped Truss','Heavy GI 0.6mm+','Snow Guard Rails'] },
      { id:'thermal_ins',  label:'Thermal Insulation',       types:['Rockwool','XPS Board 50mm','PIR Panel','Double Glazed'] },
      { id:'cold_found',   label:'Cold Climate Foundation',  types:['Anti-freeze Admixture','Heated Curing Blanket'] },
      { id:'wood_kashmir', label:'Kashmir Wood',             types:['Deodar Cedar','Walnut Wood','Pine Flooring','Kail Wood'] },
      { id:'heating',      label:'Heating Systems',          types:['Underfloor Heating','Radiant Panel','Bukhari Flue Pipe'] },
      { id:'seismic',      label:'Seismic Zone V',           types:['TMT Fe550D Seismic','Shear Wall Material','Ductile Stirrups'] },
    ],
  },
  {
    id: 'structure', label: '🧱 Structure & Foundation',
    subcategories: [
      { id:'cement',    label:'Cement',         types:['OPC 33','OPC 43','OPC 53','PPC','PSC','White Cement','Waterproof Cement'] },
      { id:'sand',      label:'Sand',           types:['River Sand','M-Sand','P-Sand','Coarse Sand'] },
      { id:'aggregate', label:'Aggregate',      types:['6mm Chips','10mm Chips','20mm Aggregate','40mm Aggregate','Gravel'] },
      { id:'bricks',    label:'Bricks',         types:['Red Clay Brick','Fly Ash Brick','AAC Block','Fire Brick','Hollow Brick'] },
    ],
  },
  {
    id: 'steel', label: '🔩 Steel & Iron',
    subcategories: [
      { id:'tmt',        label:'TMT Bars',    types:['8mm Fe500D','10mm Fe500D','12mm Fe500D','16mm Fe500D','20mm Fe550D','25mm Fe600'] },
      { id:'ms_sections',label:'MS Sections', types:['MS Flat','MS Angle','MS Channel','I-Beam','H-Beam','MS Plate'] },
    ],
  },
  {
    id: 'tiles', label: '🪟 Tiles & Flooring',
    subcategories: [
      { id:'vitrified',    label:'Vitrified Tiles',  types:['Full Body','Double Charge','GVT','PGVT','Polished Vitrified','Large Format 800x800'] },
      { id:'ceramic',      label:'Ceramic Tiles',    types:['Wall Tiles 300x450','Wall Tiles 300x600','Floor Tiles','Mosaic','Anti-Skid'] },
      { id:'marble_tile',  label:'Marble',           types:['Italian Statuario','Makrana White','Carrara','Green Marble','Black Marquina'] },
      { id:'granite_tile', label:'Granite',          types:['Black Galaxy','Tan Brown','Kashmir White','Absolute Black','Steel Grey'] },
      { id:'wood_floor',   label:'Wood Flooring',    types:['Laminate','Engineered Wood','SPC Vinyl','Bamboo'] },
      { id:'special_tile', label:'Special',          types:['Kota Stone','Outdoor Anti-Skid','Parking','Acid Resistant','Stair Tread'] },
    ],
  },
  {
    id: 'doors_windows', label: '🚪 Doors & Windows',
    subcategories: [
      { id:'doors',   label:'Doors',   types:['Teak Wood Main Door','Flush Door','WPC Door','PVC Door','Steel Security Door','Fire Door'] },
      { id:'windows', label:'Windows', types:['Aluminium Sliding','UPVC Casement','UPVC Triple Seal','Wooden Window','Skylight'] },
      { id:'glass',   label:'Glass',   types:['Toughened','Frosted','Laminated Safety','Double Glazed','Reflective'] },
    ],
  },
  {
    id: 'plumbing', label: '🚿 Plumbing & Sanitary',
    subcategories: [
      { id:'wc_toilet',     label:'Toilets & WC',    types:['Western WC','Wall-Hung WC','Smart WC Bidet','Squat Pan'] },
      { id:'basins',        label:'Wash Basins',     types:['Counter Top','Wall Hung','Under Counter','Corner Basin'] },
      { id:'shower',        label:'Shower',          types:['Shower Panel','Overhead Shower','Thermostatic Mixer','Rain Shower'] },
      { id:'faucets',       label:'Taps & Faucets',  types:['Basin Mixer','Kitchen Pull-out Tap','Wall Mixer','Anti-freeze Tap'] },
      { id:'pipes_plumb',   label:'Pipes',           types:['CPVC Pipe','PVC Pipe','PPR Pipe','GI Pipe','HDPE Pipe'] },
      { id:'accessories',   label:'Accessories',     types:['Towel Rod','Toilet Paper Holder','Soap Dish','Mirror Cabinet','Exhaust Fan'] },
    ],
  },
  {
    id: 'kitchen', label: '🍳 Kitchen',
    subcategories: [
      { id:'kitchen_sink',    label:'Sinks',          types:['SS Single Bowl','SS Double Bowl','Granite Sink','Undermount Sink'] },
      { id:'kitchen_faucet',  label:'Kitchen Taps',   types:['Single Lever','Pull-out Spray','Wall Mount','Filter Tap'] },
      { id:'chimney',         label:'Chimneys',       types:['Auto-clean 60cm','Auto-clean 90cm','Filterless','T-shape Designer'] },
      { id:'countertop',      label:'Countertops',    types:['Granite Slab','Quartz Surface','Marble Counter','Engineered Stone'] },
      { id:'kitchen_storage', label:'Cabinet Material',types:['BWR Plywood 18mm','PVC Board','WPC Board','Aluminium Profile'] },
    ],
  },
  {
    id: 'electricals', label: '⚡ Electricals',
    subcategories: [
      { id:'wires',   label:'Wires & Cables',     types:['1.5mm FRLS','2.5mm FRLS','4mm','6mm AC Wire','10mm','Armoured Cable'] },
      { id:'switches',label:'Switches & Sockets', types:['Modular Switch 6A','Socket 16A','Fan Regulator','USB Socket','Dimmer'] },
      { id:'panels',  label:'MCB & Panels',       types:['MCB Single Pole','MCB Double Pole','RCCB','Distribution Board','Surge Protector'] },
      { id:'lights',  label:'Lighting',           types:['LED Panel 2x2','LED Downlight','LED Strip 5m','Batten','Floodlight','Emergency Light'] },
    ],
  },
  {
    id: 'paints', label: '🎨 Paints & Finishes',
    subcategories: [
      { id:'interior_paint', label:'Interior Paints',  types:['Luxury Emulsion','Premium Emulsion','Distemper','Texture Paint','Ceiling Paint'] },
      { id:'exterior_paint', label:'Exterior Paints',  types:['Weatherproof Emulsion','Anti-Dust','Elastomeric','Heat Reflective'] },
      { id:'waterproofing',  label:'Waterproofing',    types:['Roof Sealant','Bathroom Waterproofing','Crystalline','Bituminous'] },
      { id:'wood_finish',    label:'Wood Finishes',    types:['PU Polish','Melamine','Wood Stain','Varnish','Damp Proof'] },
    ],
  },
  {
    id: 'roofing', label: '🚧 Roofing & Ceiling',
    subcategories: [
      { id:'roof_sheets',  label:'Roof Sheets',     types:['GI 0.4mm','GI 0.6mm Snow Grade','PPGI Color','Polycarbonate','PUF Sandwich'] },
      { id:'false_ceiling',label:'False Ceiling',   types:['Gyproc Gypsum Board','Mineral Fibre Tile','PVC Panel','Metal Tile'] },
      { id:'truss',        label:'Truss',           types:['Steel Truss','Wooden Truss Deodar','Aluminium Truss'] },
    ],
  },
  {
    id: 'wood', label: '🪵 Wood & Boards',
    subcategories: [
      { id:'plywood',    label:'Plywood',             types:['BWR 12mm','BWR 18mm','Marine Ply','BWP Grade','Shuttering Ply','Fire Retardant'] },
      { id:'boards',     label:'Boards',              types:['MDF 12mm','MDF 18mm','Particle Board','HDF','Cement Board','WPC Board'] },
      { id:'laminates',  label:'Laminates & Veneers', types:['Decorative Laminate','Veneer Sheet','ACP Sheet','HPL','Solid Surface'] },
    ],
  },
  {
    id: 'hardware', label: '🔧 Hardware & Chemicals',
    subcategories: [
      { id:'chem',      label:'Construction Chemicals', types:['Concrete Admixture','Anti-freeze','Curing Compound','Non-shrink Grout','Epoxy Grout','Sealant'] },
      { id:'fasteners', label:'Fasteners',              types:['Nails','Screws','Bolts','Expansion Anchor','Chemical Anchor'] },
    ],
  },
];

// Maps category IDs to materials subcategory flag keys (undefined = always show)
const CATEGORY_FLAG_MAP: Record<string, string | undefined> = {
  kashmir_special: 'kashmir_special',
  structure:       'cement',
  steel:           'steel_tmt',
  tiles:           'tiles_flooring',
  doors_windows:   'doors_windows',
  plumbing:        'plumbing_pipes',
  kitchen:         undefined,
  electricals:     'electricals',
  paints:          'paints',
  roofing:         'roofing',
  wood:            'wood_plywood',
  hardware:        'hardware',
};

// ── Brands ────────────────────────────────────────────────────────────────────

const BRANDS: Record<string, { label: string; brands: string[] }> = {
  structure:   { label: 'Cement Brands',     brands: ['UltraTech','ACC','Ambuja','Shree','Dalmia','JK'] },
  steel:       { label: 'Steel Brands',      brands: ['Tata Tiscon','JSW','SAIL','Jindal Panther','Vizag','Kamdhenu'] },
  tiles:       { label: 'Tile Brands',       brands: ['Kajaria','Somany','RAK','Johnson','Asian Granito','Nitco','Simpolo'] },
  kitchen:     { label: 'Kitchen Brands',    brands: ['Franke','Carysil','Hindware','Faber','Kutchina','Elica'] },
  paints:      { label: 'Paint Brands',      brands: ['Asian Paints','Berger','Nerolac','Dulux','Indigo','Dr. Fixit'] },
  plumbing:    { label: 'Sanitary Brands',   brands: ['Hindware','Jaquar','Cera','Parryware','Kohler','Roca','Duravit'] },
  electricals: { label: 'Electrical Brands', brands: ['Havells','Finolex','Polycab','Anchor','Legrand','Schneider','Wipro'] },
  wood:        { label: 'Wood Brands',       brands: ['Century Ply','Greenply','Kitply','National Ply','Merino'] },
};

const UNITS = ['Per Bag','Per KG','Per Sqft','Per Piece','Per Bundle','Per CFT','Per Litre','Per Running Foot','Per Sheet','Per Metre'];

// ── Room types ────────────────────────────────────────────────────────────────

const ROOM_TYPES = [
  { id: 'all',        label: '🏠 All Rooms' },
  { id: 'washroom',   label: '🚿 Washroom' },
  { id: 'kitchen',    label: '🍳 Kitchen' },
  { id: 'bedroom',    label: '🛏️ Bedroom' },
  { id: 'living_room',label: '🛋️ Living Room' },
  { id: 'stairs',     label: '🪜 Stairs' },
  { id: 'exterior',   label: '🏠 Exterior' },
  { id: 'structure',  label: '🏗️ Structure' },
];

// ── City price factors ────────────────────────────────────────────────────────

const CITY_PRICE_FACTORS: Record<string, { factor: number; label: string }> = {
  srinagar:   { factor: 1.22, label: 'Srinagar' },
  baramulla:  { factor: 1.24, label: 'Baramulla' },
  leh:        { factor: 1.35, label: 'Leh' },
  jammu:      { factor: 1.14, label: 'Jammu' },
  shimla:     { factor: 1.12, label: 'Shimla' },
  manali:     { factor: 1.18, label: 'Manali' },
  dehradun:   { factor: 1.04, label: 'Dehradun' },
  darjeeling: { factor: 1.15, label: 'Darjeeling' },
  delhi:      { factor: 1.00, label: 'Delhi' },
  gurgaon:    { factor: 1.02, label: 'Gurgaon' },
  noida:      { factor: 1.01, label: 'Noida' },
  mumbai:     { factor: 1.08, label: 'Mumbai' },
  bangalore:  { factor: 1.05, label: 'Bangalore' },
  hyderabad:  { factor: 0.97, label: 'Hyderabad' },
  chennai:    { factor: 1.03, label: 'Chennai' },
  pune:       { factor: 1.04, label: 'Pune' },
  jaipur:     { factor: 0.95, label: 'Jaipur' },
  ahmedabad:  { factor: 0.97, label: 'Ahmedabad' },
  kolkata:    { factor: 1.04, label: 'Kolkata' },
  lucknow:    { factor: 0.98, label: 'Lucknow' },
  chandigarh: { factor: 1.00, label: 'Chandigarh' },
  guwahati:   { factor: 1.12, label: 'Guwahati' },
  kochi:      { factor: 1.06, label: 'Kochi' },
};

function getCityPriceFactor(city: string): { factor: number; label: string } {
  if (!city) return { factor: 1.0, label: 'India' };
  const c = city.toLowerCase().trim();
  for (const [key, val] of Object.entries(CITY_PRICE_FACTORS)) {
    if (c.includes(key) || key.includes(c)) return val;
  }
  return { factor: 1.0, label: city };
}
function cityPrice(base: number, factor: number) { return Math.round(base * factor); }

// ── Price ticker base data ────────────────────────────────────────────────────

const PRICE_TICKER_BASE = [
  { label: 'UltraTech Cement', base: 380,   suffix: '/bag',   change: '+₹5',   up: true  },
  { label: 'Tata TMT 12mm',    base: 67,    suffix: '/kg',    change: '-₹2',   up: false },
  { label: 'Kajaria 600×600',  base: 48,    suffix: '/sqft',  change: '0',     up: null  },
  { label: 'River Sand',       base: 45,    suffix: '/cft',   change: '+₹3',   up: true  },
  { label: 'Fly Ash Brick',    base: 8,     suffix: '/pc',    change: '0',     up: null  },
  { label: 'Asian Paints Apex',base: 3400,  suffix: '/can',   change: '-₹100', up: false },
  { label: 'JSW TMT Fe500',    base: 65,    suffix: '/kg',    change: '+₹1',   up: true  },
  { label: 'Deodar Wood',      base: 180,   suffix: '/rft',   change: '+₹10',  up: true  },
  { label: 'Jaquar Faucet',    base: 2800,  suffix: '/pc',    change: '0',     up: null  },
  { label: 'Havells Wire 2.5', base: 1950,  suffix: '/roll',  change: '-₹50',  up: false },
  { label: 'UPVC Window 4×4',  base: 12000, suffix: '/pc',    change: '0',     up: null  },
  { label: 'Century Ply 18mm', base: 1850,  suffix: '/sheet', change: '+₹50',  up: true  },
];

// ── Chip order per region ─────────────────────────────────────────────────────

const CHIP_ORDER: Record<string, string[]> = {
  kashmir:   ['kashmir_special','roofing','wood','steel','structure','tiles','plumbing','kitchen','electricals','paints','doors_windows','hardware'],
  himalayan: ['roofing','wood','structure','paints','tiles','steel','plumbing','kitchen','electricals','doors_windows','hardware'],
  coastal:   ['steel','paints','plumbing','structure','tiles','roofing','doors_windows','kitchen','electricals','wood','hardware'],
  desert:    ['structure','paints','doors_windows','roofing','tiles','steel','plumbing','kitchen','electricals','wood','hardware'],
  northeast: ['roofing','structure','plumbing','paints','tiles','steel','doors_windows','kitchen','electricals','wood','hardware'],
  plains:    ['structure','steel','tiles','kitchen','doors_windows','plumbing','electricals','paints','roofing','wood','hardware'],
};

// ── Root export ───────────────────────────────────────────────────────────────

export default function MaterialsClient({ sourceProducts }: { sourceProducts: Product[] }) {
  return <Suspense><MaterialsInner sourceProducts={sourceProducts} /></Suspense>;
}

// ── Main component ────────────────────────────────────────────────────────────

function MaterialsInner({ sourceProducts }: { sourceProducts: Product[] }) {
  const supabase = createClient();
  const router = useRouter();

  const [loggedIn,        setLoggedIn]       = useState(false);
  const [city,           setCity]           = useState('');
  const { factor: priceFactor, label: priceCity } = getCityPriceFactor(city);
  const [bannerDismissed,setBannerDismissed] = useState(false);
  const [tipsOpen,       setTipsOpen]       = useState(false);
  const [search,         setSearch]         = useState('');
  const [sort,           setSort]           = useState<SortKey>('relevance');
  const [selectedRoom,   setSelectedRoom]   = useState('all');
  const [activeChip,     setActiveChip]     = useState<string | null>(null);
  const [openCats,       setOpenCats]       = useState<Set<string>>(new Set(['structure']));
  const [checkedSubcats, setCheckedSubcats] = useState<Set<string>>(new Set());
  const [checkedTypes,   setCheckedTypes]   = useState<Set<string>>(new Set());
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedUnit,   setSelectedUnit]   = useState('');
  const [priceMin,       setPriceMin]       = useState('');
  const [priceMax,       setPriceMax]       = useState('');
  const [inStockOnly,    setInStockOnly]    = useState(false);
  const [compareIds,     setCompareIds]     = useState<string[]>([]);

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // cap at 3 to keep the table readable
      return [...prev, id];
    });
  }
  const [certifiedOnly,  setCertifiedOnly]  = useState(false);
  const [ratingFilter,   setRatingFilter]   = useState<RatingFilter>('any');
  const [nearMe,         setNearMe]         = useState(false);
  const [filtersOpen,    setFiltersOpen]    = useState(false);
  const { addItem, setQty, qtyOf, count: totalCartItems } = useCart();

  const regionData = getRegionData(city);
  const { region, label: regionLabel, icon: regionIcon, alerts, tips, warningMaterials } = regionData;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCity(user?.user_metadata?.city ?? '');
      setLoggedIn(!!user);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!city) return;
    setBannerDismissed(localStorage.getItem(`griffy_banner_dismissed_${region}`) === 'true');
  }, [city, region]);

  function dismissBanner() {
    localStorage.setItem(`griffy_banner_dismissed_${region}`, 'true');
    setBannerDismissed(true);
  }

  function getWarning(p: Product): string | null {
    if (!p.warningId) return null;
    return (warningMaterials as readonly { id: string; message: string }[])
      .find(w => w.id === p.warningId)?.message ?? null;
  }

  const orderedCategories = useMemo(() => {
    const order = CHIP_ORDER[region] ?? CHIP_ORDER.plains;
    return [...CATEGORIES]
      .filter(cat => !cat.regionOnly || cat.regionOnly === region)
      .filter(cat => {
        const flagKey = CATEGORY_FLAG_MAP[cat.id];
        return flagKey === undefined || isSubEnabled('materials', flagKey);
      })
      .sort((a, b) => {
        const ai = order.indexOf(a.id); const bi = order.indexOf(b.id);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
  }, [region]);

  const products = useMemo(() => {
    let list = [...sourceProducts];

    // Kashmir products first for kashmir users
    if (region === 'kashmir') {
      list.sort((a, b) => (b.regionTag === 'kashmir' ? 1 : 0) - (a.regionTag === 'kashmir' ? 1 : 0));
    }

    if (selectedRoom !== 'all') list = list.filter(p => p.roomTypes.includes(selectedRoom));
    if (activeChip)             list = list.filter(p => p.categoryId === activeChip);
    if (checkedSubcats.size)    list = list.filter(p => checkedSubcats.has(p.subcategoryId));
    if (checkedTypes.size)      list = list.filter(p => checkedTypes.has(p.type));
    if (selectedBrands.size)    list = list.filter(p => selectedBrands.has(p.brand));
    if (priceMin)               list = list.filter(p => p.price >= Number(priceMin));
    if (priceMax)               list = list.filter(p => p.price <= Number(priceMax));
    if (inStockOnly)            list = list.filter(p => p.inStock);
    if (certifiedOnly)          list = list.filter(p => p.isi);
    if (ratingFilter !== 'any') list = list.filter(p => p.rating >= parseFloat(ratingFilter));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    }

    if (sort === 'price_asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'popular')    list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);

    return list;
  }, [sourceProducts, region, selectedRoom, activeChip, checkedSubcats, checkedTypes, selectedBrands, priceMin, priceMax, inStockOnly, certifiedOnly, ratingFilter, search, sort]);

  function toggleSet<T>(s: Set<T>, v: T): Set<T> {
    const next = new Set(s); next.has(v) ? next.delete(v) : next.add(v); return next;
  }
  function toggleCat(id: string) { setOpenCats(prev => toggleSet(prev, id)); }
  function toggleSubcat(id: string) { setCheckedSubcats(prev => toggleSet(prev, id)); }
  function toggleType(t: string) { setCheckedTypes(prev => toggleSet(prev, t)); }
  function toggleBrand(b: string) { setSelectedBrands(prev => toggleSet(prev, b)); }
  function addToCart(p: Product) {
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    addItem({ id: p.id, name: p.name, imageIcon: p.imageIcon, price: p.price, unit: p.unit, sellerName: p.sellerName });
    trackEvent('add_to_cart', { item_id: p.id, item_category: 'material', item_name: p.name, value: p.price });
  }
  function removeFromCart(id: string) {
    setQty(id, qtyOf(id) - 1);
  }
  function clearAll() {
    setSelectedRoom('all'); setActiveChip(null); setCheckedSubcats(new Set());
    setCheckedTypes(new Set()); setSelectedBrands(new Set()); setSelectedUnit('');
    setPriceMin(''); setPriceMax(''); setInStockOnly(false); setCertifiedOnly(false);
    setRatingFilter('any'); setNearMe(false);
  }

  const hasFilters = !!(selectedRoom !== 'all' || activeChip || checkedSubcats.size || checkedTypes.size ||
    selectedBrands.size || priceMin || priceMax || inStockOnly || certifiedOnly ||
    ratingFilter !== 'any' || nearMe);

  const relevantBrands = useMemo(() => {
    const targetCats = activeChip ? [activeChip] : [...openCats];
    return targetCats.filter(id => BRANDS[id]).map(id => ({ id, ...BRANDS[id] }));
  }, [activeChip, openCats]);

  // ── Sidebar ─────────────────────────────────────────────────────────────────

  const SidebarContent = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-[#F0E8E2]">
      <div className="flex items-center justify-between px-5 py-4">
        <p className="text-sm font-semibold text-[#2C1810]">Filters</p>
        <div className="flex items-center gap-3">
          {hasFilters && <button onClick={clearAll} className="text-xs text-[#C0593A] hover:underline font-medium">Clear all</button>}
          <button onClick={() => setFiltersOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">✕</button>
        </div>
      </div>

      {/* Room type filter in sidebar */}
      <div className="px-5 py-4">
        <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">By Room</p>
        <div className="space-y-1">
          {ROOM_TYPES.map(r => (
            <button key={r.id} onClick={() => setSelectedRoom(r.id)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                selectedRoom === r.id
                  ? 'bg-[#FAEEE9] text-[#C0593A] font-semibold'
                  : 'text-[#3D2B22] hover:bg-[#FDF8F5]'
              }`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category accordion */}
      <div className="py-2">
        {orderedCategories.map(cat => (
          <div key={cat.id} className={cat.regionOnly ? 'border-l-4 border-[#C0593A] ml-1' : ''}>
            <button onClick={() => toggleCat(cat.id)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-[#FDF8F5] transition-colors">
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#2C1810]">{cat.label}</span>
                {cat.badge && <span className="text-[10px] bg-[#C0593A] text-white px-1.5 py-0.5 rounded-full font-semibold">{cat.badge}</span>}
              </span>
              <span className={`text-xs text-gray-400 transition-transform ${openCats.has(cat.id) ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openCats.has(cat.id) && (
              <div className="px-5 pb-3 space-y-3">
                {cat.subcategories.map(sub => (
                  <div key={sub.id}>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={checkedSubcats.has(sub.id)} onChange={() => toggleSubcat(sub.id)}
                        className="w-4 h-4 rounded accent-[#C0593A] cursor-pointer" />
                      <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{sub.label}</span>
                    </label>
                    {checkedSubcats.has(sub.id) && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-6">
                        {sub.types.map(t => (
                          <button key={t} onClick={() => toggleType(t)}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium border transition-all ${
                              checkedTypes.has(t) ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#C0593A]'
                            }`}>{t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Brands */}
      {relevantBrands.length > 0 && (
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest">Brand</p>
          {relevantBrands.map(grp => (
            <div key={grp.id}>
              <p className="text-[10px] font-semibold text-[#A08070] mb-1.5 uppercase tracking-wide">{grp.label}</p>
              <div className="space-y-1.5">
                {grp.brands.map(b => (
                  <label key={b} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={selectedBrands.has(b)} onChange={() => toggleBrand(b)}
                      className="w-4 h-4 rounded accent-[#C0593A] cursor-pointer" />
                    <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Price range */}
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest">Price Range (₹)</p>
        <div className="flex gap-2 items-center">
          <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="Min"
            className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2 outline-none focus:border-[#C0593A]" />
          <span className="text-gray-300">—</span>
          <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="Max"
            className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2 outline-none focus:border-[#C0593A]" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['<₹500||500', '₹500–5K|500|5000', '₹5K–20K|5000|20000', '>₹20K|20000|'] as const).map(entry => {
            const [label, min, max] = entry.split('|');
            return (
              <button key={label} onClick={() => { setPriceMin(min); setPriceMax(max); }}
                className={`text-[10px] px-2.5 py-1 rounded-lg font-medium border transition-all ${
                  priceMin === min && priceMax === max ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#C0593A]'
                }`}>{label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="px-5 py-4 space-y-3">
        <ToggleFilter label="In Stock only"        checked={inStockOnly}   onChange={() => setInStockOnly(v => !v)} />
        <ToggleFilter label="ISI / BIS Certified"  checked={certifiedOnly} onChange={() => setCertifiedOnly(v => !v)} />
        <ToggleFilter label="Suppliers near me"    checked={nearMe}        onChange={() => setNearMe(v => !v)} />
      </div>

      {/* Rating */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-3">Rating</p>
        {([['any','Any'],['4','4★ & above'],['4.5','4.5★ & above']] as [RatingFilter,string][]).map(([val,label]) => (
          <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
            <input type="radio" name="mat_rating" value={val} checked={ratingFilter === val} onChange={() => setRatingFilter(val)}
              className="w-4 h-4 accent-[#C0593A] cursor-pointer" />
            <span className="text-sm text-[#3D2B22] group-hover:text-[#C0593A] transition-colors">{label}</span>
          </label>
        ))}
      </div>

      {filtersOpen && (
        <div className="px-5 py-4">
          <button onClick={() => setFiltersOpen(false)}
            className="w-full bg-[#C0593A] text-white text-sm font-semibold py-2.5 rounded-xl">
            Show {products.length} Product{products.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>Building Materials</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-sm text-[#6B5248]">{products.length} products</p>
              {city && (
                <span className="text-xs bg-[#FAEEE9] text-[#C0593A] border border-[#E8C4B0] px-2 py-0.5 rounded-full font-medium">
                  📍 Prices for {priceCity}
                </span>
              )}
              {selectedRoom !== 'all' && (
                <span className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full font-medium">
                  {ROOM_TYPES.find(r => r.id === selectedRoom)?.label}
                </span>
              )}
            </div>
          </div>
          {totalCartItems > 0 && (
            <div className="flex items-center gap-2 bg-[#C0593A] text-white text-sm font-semibold px-4 py-2 rounded-xl">
              🛒 {totalCartItems} item{totalCartItems !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Regional banner */}
        {region !== 'plains' && !bannerDismissed && alerts.length > 0 && (
          <RegionalBanner regionIcon={regionIcon} regionLabel={regionLabel}
            alerts={alerts as readonly string[]} tips={tips as readonly string[]}
            tipsOpen={tipsOpen} setTipsOpen={setTipsOpen} onDismiss={dismissBanner} />
        )}

        {/* Price ticker */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Today's Prices {city ? `in ${priceCity}` : 'across India'}
            </span>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">● Live</span>
            {priceFactor !== 1.0 && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                {priceFactor > 1 ? `+${Math.round((priceFactor - 1) * 100)}%` : `-${Math.round((1 - priceFactor) * 100)}%`} transport
              </span>
            )}
          </div>
          <div className="flex gap-6 overflow-x-auto pb-1 scrollbar-hide">
            {PRICE_TICKER_BASE.map(item => (
              <div key={item.label} className="flex-shrink-0 flex items-center gap-2 border-r border-gray-100 pr-6 last:border-0">
                <div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">{item.label}</p>
                  <p className="text-sm font-bold text-gray-900">₹{cityPrice(item.base, priceFactor).toLocaleString('en-IN')}{item.suffix}</p>
                </div>
                {item.change !== '0' && (
                  <span className={`text-xs font-medium ${item.up ? 'text-red-500' : 'text-green-500'}`}>{item.change}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Search + sort */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search Kajaria tiles, Tata TMT, cement, paint..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#EBE0D8] rounded-xl bg-white outline-none focus:border-[#C0593A] focus:ring-1 focus:ring-[#C0593A]/20" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
            className="text-sm border border-[#EBE0D8] rounded-xl bg-white px-3 py-2.5 outline-none focus:border-[#C0593A] text-[#2C1810] cursor-pointer">
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
          </select>
          <button onClick={() => setFiltersOpen(true)}
            className="md:hidden flex items-center gap-1.5 text-sm border border-[#EBE0D8] bg-white px-4 py-2.5 rounded-xl font-medium">
            ⚙️ Filters {hasFilters && <span className="bg-[#C0593A] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">!</span>}
          </button>
        </div>

        {/* Room type chips */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1 min-w-max">
            {ROOM_TYPES.map(r => (
              <button key={r.id} onClick={() => setSelectedRoom(r.id)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                  selectedRoom === r.id
                    ? 'bg-[#2C1810] text-white border-[#2C1810]'
                    : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#2C1810]'
                }`}>{r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1 min-w-max">
            <button onClick={() => setActiveChip(null)}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                !activeChip ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#C0593A]'
              }`}>All Categories
            </button>
            {orderedCategories.map(cat => (
              <button key={cat.id} onClick={() => setActiveChip(activeChip === cat.id ? null : cat.id)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                  activeChip === cat.id
                    ? 'bg-[#C0593A] text-white border-[#C0593A]'
                    : cat.regionOnly
                      ? 'bg-orange-50 text-orange-700 border-orange-200 hover:border-[#C0593A]'
                      : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#C0593A]'
                }`}>
                {cat.label}
                {cat.regionOnly && activeChip !== cat.id && (
                  <span className="ml-1 bg-[#C0593A] text-white text-[8px] px-1 py-0.5 rounded-full">📍</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar + grid */}
        <div className="flex gap-6 items-start">

          {filtersOpen && (
            <div className="md:hidden fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
              <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl">
                {SidebarContent}
              </div>
            </div>
          )}

          <aside className="hidden md:block w-64 flex-shrink-0 sticky top-[80px] max-h-[calc(100vh-96px)] overflow-y-auto">
            {SidebarContent}
          </aside>

          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5 text-4xl">🔍</div>
                <p className="text-base font-semibold text-[#2C1810] mb-1">No products found</p>
                <p className="text-sm text-[#6B5248]">Try a different room or category</p>
                <button onClick={clearAll} className="mt-4 text-sm text-[#C0593A] hover:underline font-medium">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} region={region} priceFactor={priceFactor}
                    warning={getWarning(p)} cartQty={qtyOf(p.id)}
                    onAdd={() => addToCart(p)} onRemove={() => removeFromCart(p.id)}
                    compared={compareIds.includes(p.id)} onToggleCompare={() => toggleCompare(p.id)} />
                ))}
              </div>
            )}
            {compareIds.length >= 2 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBE0D8] shadow-lg px-4 py-3 z-40 flex items-center justify-between gap-3">
                <p className="text-sm text-[#2C1810]"><strong>{compareIds.length}</strong> materials selected to compare</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCompareIds([])} className="text-sm text-[#6B5248] hover:underline">Clear</button>
                  <a href={`/materials/compare?ids=${compareIds.join(',')}`}
                    className="bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                    Compare →
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── RegionalBanner ────────────────────────────────────────────────────────────

function RegionalBanner({ regionIcon, regionLabel, alerts, tips, tipsOpen, setTipsOpen, onDismiss }: {
  regionIcon: string; regionLabel: string; alerts: readonly string[]; tips: readonly string[];
  tipsOpen: boolean; setTipsOpen: (v: boolean) => void; onDismiss: () => void;
}) {
  return (
    <div className="bg-orange-50 border-l-4 border-[#C0593A] rounded-r-xl p-4">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">{regionIcon}</span>
          <div>
            <p className="text-sm font-bold text-[#2C1810]">Showing materials for {regionLabel}</p>
            <p className="text-xs text-[#6B5248]">Region-specific products shown first</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 flex-1">
          {alerts.map(a => (
            <span key={a} className="text-[11px] bg-white border border-orange-200 text-orange-800 px-2.5 py-1 rounded-full font-medium">{a}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {tips.length > 0 && (
            <button onClick={() => setTipsOpen(!tipsOpen)} className="text-xs font-semibold text-[#C0593A] hover:underline whitespace-nowrap">
              {tipsOpen ? 'Hide tips ▲' : 'See building tips ▼'}
            </button>
          )}
          <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-1">✕</button>
        </div>
      </div>
      {tipsOpen && tips.length > 0 && (
        <div className="mt-3 bg-white/70 rounded-xl p-4">
          <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-2">Building Tips for {regionLabel}</p>
          <ul className="space-y-1.5">
            {tips.map(tip => (
              <li key={tip} className="flex items-start gap-2 text-sm text-[#3D2B22]">
                <span className="text-[#C0593A] flex-shrink-0 mt-0.5">•</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── ProductCard ───────────────────────────────────────────────────────────────

function ProductCard({ product: p, region, priceFactor, warning, cartQty, onAdd, onRemove, compared, onToggleCompare }: {
  product: Product; region: RegionKey; priceFactor: number; warning: string | null;
  cartQty: number; onAdd: () => void; onRemove: () => void;
  compared: boolean; onToggleCompare: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const isRegionalMatch = !!p.regionTag && p.regionTag === region;
  const displayPrice = cityPrice(p.price, priceFactor);
  const displayOriginal = p.originalPrice ? cityPrice(p.originalPrice, priceFactor) : undefined;
  const discount = displayOriginal ? Math.round((1 - displayPrice / displayOriginal) * 100) : 0;

  return (
    <div className={`bg-white rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-all ${
      isRegionalMatch ? 'border-2 border-[#C0593A]/30' : 'border border-gray-100'
    }`}>
      {/* Image */}
      <div className="relative rounded-t-2xl overflow-hidden" style={{ height: '180px' }}>
        {!imgFailed && p.imageUrl ? (
          <Image src={p.imageUrl} alt={p.name} fill sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover" onError={() => setImgFailed(true)} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FAEEE9] to-[#F5EDE8] flex items-center justify-center">
            <span className="text-5xl">{p.imageIcon}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
        {isRegionalMatch && (
          <span className="absolute top-2 left-2 bg-[#C0593A] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow">📍 Popular here</span>
        )}
        {warning && (
          <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-yellow-200 shadow">⚠️ Check suitability</span>
        )}
        {discount > 0 && (
          <span className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">{discount}% OFF</span>
        )}
        {/* Room type pills */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {p.roomTypes.slice(0, 2).map(r => {
            const room = ROOM_TYPES.find(rt => rt.id === r);
            if (!room || room.id === 'structure') return null;
            return (
              <span key={r} className="text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">{room.label.split(' ')[0]}</span>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <p className="text-[10px] text-[#A08070] font-medium uppercase tracking-wide">
          {CATEGORIES.find(c => c.id === p.categoryId)?.label?.replace(/^[^\s]+ /, '') ?? p.categoryId}
        </p>
        <div>
          <p className="text-xs text-[#C0593A] font-semibold">{p.brand}</p>
          <p className="text-sm font-bold text-[#2C1810] leading-snug mt-0.5">{p.name}</p>
        </div>
        <span className="inline-flex w-fit text-[10px] bg-[#F5EDE8] text-[#7A3E27] px-2 py-0.5 rounded-md font-medium">{p.type}</span>
        {p.regionLabel && (
          <span className="inline-flex w-fit text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium">{p.regionLabel}</span>
        )}
        {warning && (
          <p className="text-[10px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-2.5 py-2 leading-relaxed">{warning}</p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {p.isi && <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">✓ ISI</span>}
          {p.bulkDiscount && <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">📦 {p.bulkDiscount}</span>}
          {!p.inStock && <span className="text-[10px] bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">Out of stock</span>}
        </div>
        <div className="flex items-end gap-2 mt-auto">
          <p className="text-xl font-bold text-[#C0593A]">₹{displayPrice.toLocaleString('en-IN')}</p>
          {displayOriginal && <p className="text-sm text-gray-400 line-through mb-0.5">₹{displayOriginal.toLocaleString('en-IN')}</p>}
          <p className="text-xs text-gray-400 mb-0.5">{p.unit}</p>
        </div>
        {p.minOrder && <p className="text-xs text-[#A08070]">Min: {p.minOrder}</p>}
        <div className="flex items-center gap-1.5 text-xs text-[#6B5248]">
          <span className="text-yellow-500">★</span><span>{p.rating}</span>
          <span className="text-gray-300">·</span><span>{p.reviewCount.toLocaleString()} reviews</span>
          <span className="text-gray-300">·</span><span>📍 {p.sellerCity}</span>
        </div>
        <p className="text-xs text-[#A08070]">{p.sellerName}</p>
        <div className="flex gap-2 mt-1">
          {cartQty === 0 ? (
            <button onClick={onAdd} disabled={!p.inStock}
              className="flex-1 text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white py-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Add to Cart
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-between bg-[#FAEEE9] rounded-xl px-3 py-1.5">
              <button onClick={onRemove} className="text-[#C0593A] text-xl font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F0D8CC]">−</button>
              <span className="text-sm font-bold text-[#C0593A]">{cartQty}</span>
              <button onClick={onAdd} className="text-[#C0593A] text-xl font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F0D8CC]">+</button>
            </div>
          )}
          <Link href={`/materials/${p.id}`}
            className="px-3 py-2 text-sm font-semibold border border-[#C0593A] text-[#C0593A] hover:bg-[#FAEEE9] rounded-xl transition-colors whitespace-nowrap">
            Details
          </Link>
          <SaveButton type="material" id={p.id} title={p.name} subtitle={p.brand} href={`/materials/${p.id}`} emoji="🧱" />
        </div>
        <label className="flex items-center gap-1.5 text-xs text-[#6B5248] cursor-pointer mt-0.5">
          <input type="checkbox" checked={compared} onChange={onToggleCompare} className="accent-[#C0593A]" />
          Compare
        </label>
      </div>
    </div>
  );
}

// ── ToggleFilter ──────────────────────────────────────────────────────────────

function ToggleFilter({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
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
