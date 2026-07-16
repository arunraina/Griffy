'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
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

// ── Image URLs (Unsplash — matched to material type) ─────────────────────────

const I = {
  // Structure
  cement:        'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
  cement2:       'https://images.unsplash.com/photo-1590644454956-90c86f0e3fbc',
  steel:         'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39',
  steel2:        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261',
  bricks:        'https://images.unsplash.com/photo-1587293852726-70cdb56c2866',
  sand:          'https://images.unsplash.com/photo-1499336315816-097655dcfbda',
  aggregate:     'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
  // Tiles
  tile_gvt:      'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
  tile_large:    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  tile_wall:     'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
  tile_antiskid: 'https://images.unsplash.com/photo-1552321554-5fbe4093e25c',
  tile_mosaic:   'https://images.unsplash.com/photo-1484154218962-a197022b5858',
  marble:        'https://images.unsplash.com/photo-1531971543417-edf4c9a47f40',
  marble_floor:  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  granite:       'https://images.unsplash.com/photo-1533090161767-e6ffed986c88',
  kota:          'https://images.unsplash.com/photo-1573935448851-e6e8a5f621f4',
  // Washroom
  wc:            'https://images.unsplash.com/photo-1585771724684-38269d6639fd',
  basin:         'https://images.unsplash.com/photo-1552321554-5fbe4093e25c',
  shower:        'https://images.unsplash.com/photo-1550009158-9ebf69173e03',
  faucet:        'https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f',
  bath_acc:      'https://images.unsplash.com/photo-1552321554-5fbe4093e25c',
  exhaust:       'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
  // Kitchen
  kitchen:       'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
  sink_ss:       'https://images.unsplash.com/photo-1556682671-8dc0a532c38e',
  ktap:          'https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f',
  chimney:       'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
  counter_gran:  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  // Electricals
  wire:          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
  switch:        'https://images.unsplash.com/photo-1558612522-5e88dfd1cf2a',
  led_panel:     'https://images.unsplash.com/photo-1547036967-23d11aacaee0',
  led_strip:     'https://images.unsplash.com/photo-1558612522-5e88dfd1cf2a',
  mcb:           'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
  // Paints
  paint:         'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09',
  paint_wall:    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f',
  paint_ext:     'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09',
  waterproof:    'https://images.unsplash.com/photo-1585773690140-cd4d3573ddcd',
  // Wood & Boards
  plywood:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
  plywood2:      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
  laminate_fl:   'https://images.unsplash.com/photo-1547393379-958b9e0b83f3',
  mdf:           'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
  lam_sheet:     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
  // Doors & Windows
  door_main:     'https://images.unsplash.com/photo-1558369671-2de5f506c859',
  door_int:      'https://images.unsplash.com/photo-1558369671-2de5f506c859',
  window:        'https://images.unsplash.com/photo-1528908929786-ee3b3a33d5c7',
  glass_t:       'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6',
  // Ceiling
  gypsum:        'https://images.unsplash.com/photo-1563061629-f6a8c5a59b67',
  // Stairs
  stairs:        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f',
  railing:       'https://images.unsplash.com/photo-1518998053901-5348d3961a04',
  // Roofing / Exterior
  roofing:       'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
  acp:           'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
  // Kashmir
  timber:        'https://images.unsplash.com/photo-1541123437800-1bb1317badc2',
  insulation:    'https://images.unsplash.com/photo-1585773690140-cd4d3573ddcd',
  chemical:      'https://images.unsplash.com/photo-1609659640218-cef3cf0d0d6f',
};

// ── Products ──────────────────────────────────────────────────────────────────

const P = (o: Product) => o; // identity helper for type-checking

const PRODUCTS: Product[] = [

  // ─── CEMENT ──────────────────────────────────────────────────────────────────
  P({ id:'c1', name:'UltraTech OPC 53 Grade', brand:'UltraTech', categoryId:'structure', subcategoryId:'cement', type:'OPC 53', price:380, unit:'per 50kg bag', minOrder:'10 bags', inStock:true, isi:true, rating:4.8, reviewCount:1240, sellerName:'BuildMart', sellerCity:'Delhi', roomTypes:['structure'], imageUrl:I.cement, imageIcon:'🧱', bulkDiscount:'3% off 50+ bags' }),
  P({ id:'c2', name:'ACC Gold PPC Cement', brand:'ACC', categoryId:'structure', subcategoryId:'cement', type:'PPC', price:360, unit:'per 50kg bag', minOrder:'5 bags', inStock:true, isi:true, rating:4.6, reviewCount:820, sellerName:'Metro Cement', sellerCity:'Mumbai', roomTypes:['structure'], imageUrl:I.cement2, imageIcon:'🧱' }),
  P({ id:'c3', name:'Ambuja Plus 43 Grade', brand:'Ambuja', categoryId:'structure', subcategoryId:'cement', type:'OPC 43', price:370, unit:'per 50kg bag', inStock:true, isi:true, rating:4.7, reviewCount:534, sellerName:'Ambuja Depot', sellerCity:'Bangalore', roomTypes:['structure'], imageUrl:I.cement, imageIcon:'🧱' }),
  P({ id:'c4', name:'M-Sand Manufactured', brand:'Local Supply', categoryId:'structure', subcategoryId:'sand', type:'M-Sand', price:45, unit:'per cft', minOrder:'100 cft', inStock:true, isi:false, rating:4.3, reviewCount:156, sellerName:'Sand Depot', sellerCity:'Bangalore', roomTypes:['structure'], imageUrl:I.sand, imageIcon:'🪨' }),
  P({ id:'c5', name:'20mm Stone Aggregate', brand:'Local Supply', categoryId:'structure', subcategoryId:'aggregate', type:'20mm Aggregate', price:38, unit:'per cft', minOrder:'200 cft', inStock:true, isi:false, rating:4.2, reviewCount:88, sellerName:'Stone Yard', sellerCity:'Hyderabad', roomTypes:['structure'], imageUrl:I.aggregate, imageIcon:'🪨' }),
  P({ id:'c6', name:'Fly Ash Brick 9×4×3"', brand:'LocalBricks', categoryId:'structure', subcategoryId:'bricks', type:'Fly Ash Brick', price:8, unit:'per piece', minOrder:'500 pcs', inStock:true, isi:false, rating:4.4, reviewCount:412, sellerName:'Brick Factory', sellerCity:'Delhi', roomTypes:['structure'], imageUrl:I.bricks, imageIcon:'🧱', bulkDiscount:'5% off 1000+' }),
  P({ id:'c7', name:'AAC Block 600×200×200mm', brand:'Siporex', categoryId:'structure', subcategoryId:'bricks', type:'AAC Block', price:52, unit:'per piece', minOrder:'100 pcs', inStock:true, isi:true, rating:4.5, reviewCount:287, sellerName:'Siporex Depot', sellerCity:'Delhi', roomTypes:['structure'], imageUrl:I.bricks, imageIcon:'🧱' }),

  // ─── STEEL / TMT ─────────────────────────────────────────────────────────────
  P({ id:'s1', name:'Tata Tiscon 8mm Fe500D', brand:'Tata Tiscon', categoryId:'steel', subcategoryId:'tmt', type:'8mm Fe500D', price:65, unit:'per kg', minOrder:'100 kg', inStock:true, isi:true, rating:4.9, reviewCount:2310, sellerName:'Tata Steel Depot', sellerCity:'Hyderabad', roomTypes:['structure','stairs'], imageUrl:I.steel, imageIcon:'🔩', bulkDiscount:'2% off 500kg+' }),
  P({ id:'s2', name:'Tata Tiscon 12mm Fe550D', brand:'Tata Tiscon', categoryId:'steel', subcategoryId:'tmt', type:'12mm Fe500D', price:67, unit:'per kg', minOrder:'50 kg', inStock:true, isi:true, rating:4.9, reviewCount:1870, sellerName:'Tata Steel Depot', sellerCity:'Delhi', roomTypes:['structure','stairs'], imageUrl:I.steel, imageIcon:'🔩' }),
  P({ id:'s3', name:'Jindal Panther TMT 10mm Fe500D', brand:'Jindal Panther', categoryId:'steel', subcategoryId:'tmt', type:'10mm Fe500D', price:64, unit:'per kg', minOrder:'100 kg', inStock:true, isi:true, rating:4.7, reviewCount:940, sellerName:'Jindal Steel Hub', sellerCity:'Delhi', roomTypes:['structure','stairs'], imageUrl:I.steel2, imageIcon:'🔩', bulkDiscount:'1.5% off 1 tonne+' }),
  P({ id:'s4', name:'JSW Neo Steel 16mm Fe550D', brand:'JSW', categoryId:'steel', subcategoryId:'tmt', type:'16mm Fe550D', price:69, unit:'per kg', minOrder:'50 kg', inStock:true, isi:true, rating:4.8, reviewCount:720, sellerName:'JSW Steel Store', sellerCity:'Bangalore', roomTypes:['structure'], imageUrl:I.steel2, imageIcon:'🔩' }),
  P({ id:'s5', name:'SAIL TMT 25mm Fe600', brand:'SAIL', categoryId:'steel', subcategoryId:'tmt', type:'25mm Fe600', price:72, unit:'per kg', minOrder:'200 kg', inStock:true, isi:true, rating:4.7, reviewCount:380, sellerName:'SAIL Distributor', sellerCity:'Kolkata', roomTypes:['structure'], imageUrl:I.steel, imageIcon:'🔩' }),

  // ─── TILES — LIVING ROOM ─────────────────────────────────────────────────────
  P({ id:'t1', name:'Kajaria Eternity GVT 600×600', brand:'Kajaria', categoryId:'tiles', subcategoryId:'vitrified', type:'GVT', price:48, unit:'per sqft', inStock:true, isi:false, rating:4.6, reviewCount:890, sellerName:'Kajaria Studio', sellerCity:'Delhi', roomTypes:['living_room','bedroom'], imageUrl:I.tile_gvt, imageIcon:'🪟', originalPrice:55 }),
  P({ id:'t2', name:'Kajaria Alpine Large Format 800×800', brand:'Kajaria', categoryId:'tiles', subcategoryId:'vitrified', type:'Large Format 800x800', price:72, unit:'per sqft', inStock:true, isi:false, rating:4.7, reviewCount:310, sellerName:'Kajaria Studio', sellerCity:'Mumbai', roomTypes:['living_room'], imageUrl:I.tile_large, imageIcon:'🪟' }),
  P({ id:'t3', name:'Somany Duragres Full Body 600×600', brand:'Somany', categoryId:'tiles', subcategoryId:'vitrified', type:'Full Body', price:42, unit:'per sqft', inStock:true, isi:false, rating:4.5, reviewCount:430, sellerName:'Somany Exclusive', sellerCity:'Pune', roomTypes:['living_room','bedroom'], imageUrl:I.tile_gvt, imageIcon:'🪟' }),
  P({ id:'t4', name:'Makrana White Marble Slab 2x4ft', brand:'Indian Marble Co', categoryId:'tiles', subcategoryId:'marble_tile', type:'Makrana White', price:180, unit:'per sqft', inStock:true, isi:false, rating:4.8, reviewCount:210, sellerName:'Marble Palace', sellerCity:'Jaipur', roomTypes:['living_room','bedroom'], imageUrl:I.marble_floor, imageIcon:'🪟' }),
  P({ id:'t5', name:'Italian Statuario Marble', brand:'Italian Marble Co', categoryId:'tiles', subcategoryId:'marble_tile', type:'Italian Statuario', price:480, unit:'per sqft', inStock:true, isi:false, rating:4.9, reviewCount:88, sellerName:'Marble Palace', sellerCity:'Delhi', roomTypes:['living_room'], imageUrl:I.marble, imageIcon:'🪟' }),
  P({ id:'t6', name:'Kota Stone Flooring 18mm', brand:'Kota Quarries', categoryId:'tiles', subcategoryId:'special_tile', type:'Kota Stone', price:28, unit:'per sqft', minOrder:'50 sqft', inStock:true, isi:false, rating:4.5, reviewCount:520, sellerName:'Kota Stone Depot', sellerCity:'Jaipur', roomTypes:['living_room','exterior','stairs'], imageUrl:I.kota, imageIcon:'🪨' }),

  // ─── TILES — WASHROOM ────────────────────────────────────────────────────────
  P({ id:'tw1', name:'Johnson Anti-Skid Floor 300×300', brand:'Johnson Tiles', categoryId:'tiles', subcategoryId:'ceramic', type:'Anti-Skid', price:36, unit:'per sqft', inStock:true, isi:false, rating:4.5, reviewCount:670, sellerName:'Johnson Tile Studio', sellerCity:'Mumbai', roomTypes:['washroom','kitchen'], imageUrl:I.tile_antiskid, imageIcon:'🪟' }),
  P({ id:'tw2', name:'RAK Ceramics Matt Wall 300×600', brand:'RAK Ceramics', categoryId:'tiles', subcategoryId:'ceramic', type:'Wall Tiles 300x600', price:38, unit:'per sqft', inStock:true, isi:false, rating:4.6, reviewCount:440, sellerName:'RAK Tile Studio', sellerCity:'Bangalore', roomTypes:['washroom'], imageUrl:I.tile_wall, imageIcon:'🪟' }),
  P({ id:'tw3', name:'Kajaria Digital Print Bath 300×600', brand:'Kajaria', categoryId:'tiles', subcategoryId:'ceramic', type:'Wall Tiles 300x600', price:42, unit:'per sqft', inStock:true, isi:false, rating:4.7, reviewCount:280, sellerName:'Kajaria Studio', sellerCity:'Chennai', roomTypes:['washroom'], imageUrl:I.tile_wall, imageIcon:'🪟', originalPrice:50 }),

  // ─── TILES — KITCHEN ─────────────────────────────────────────────────────────
  P({ id:'tk1', name:'Kajaria Kitchen Floor Matt 600×600', brand:'Kajaria', categoryId:'tiles', subcategoryId:'ceramic', type:'Floor Tiles', price:44, unit:'per sqft', inStock:true, isi:false, rating:4.6, reviewCount:190, sellerName:'Kajaria Studio', sellerCity:'Hyderabad', roomTypes:['kitchen'], imageUrl:I.tile_gvt, imageIcon:'🪟' }),
  P({ id:'tk2', name:'RAK Subway Mosaic Backsplash', brand:'RAK Ceramics', categoryId:'tiles', subcategoryId:'ceramic', type:'Mosaic', price:55, unit:'per sqft', inStock:true, isi:false, rating:4.5, reviewCount:120, sellerName:'Tile Galaxy', sellerCity:'Pune', roomTypes:['kitchen'], imageUrl:I.tile_mosaic, imageIcon:'🪟' }),
  P({ id:'tk3', name:'Black Galaxy Granite Counter Slab', brand:'Slab World', categoryId:'tiles', subcategoryId:'granite_tile', type:'Black Galaxy', price:220, unit:'per sqft', minOrder:'10 sqft', inStock:true, isi:false, rating:4.7, reviewCount:310, sellerName:'Granite Palace', sellerCity:'Bangalore', roomTypes:['kitchen','stairs'], imageUrl:I.granite, imageIcon:'🪨' }),

  // ─── TILES — STAIRS ──────────────────────────────────────────────────────────
  P({ id:'ts1', name:'Absolute Black Granite Stair Tread', brand:'Stone House', categoryId:'tiles', subcategoryId:'special_tile', type:'Stair Tread', price:145, unit:'per sqft', minOrder:'20 sqft', inStock:true, isi:false, rating:4.6, reviewCount:88, sellerName:'Stone House', sellerCity:'Chennai', roomTypes:['stairs'], imageUrl:I.granite, imageIcon:'🪨' }),
  P({ id:'ts2', name:'Kota Blue Non-Slip Stair Riser', brand:'Kota Quarries', categoryId:'tiles', subcategoryId:'special_tile', type:'Kota Stone', price:32, unit:'per sqft', minOrder:'30 sqft', inStock:true, isi:false, rating:4.4, reviewCount:64, sellerName:'Kota Depot', sellerCity:'Jaipur', roomTypes:['stairs'], imageUrl:I.kota, imageIcon:'🪨' }),

  // ─── WASHROOM / PLUMBING ─────────────────────────────────────────────────────
  P({ id:'p1', name:'Hindware Rimless WC S-Trap', brand:'Hindware', categoryId:'plumbing', subcategoryId:'wc_toilet', type:'Western WC', price:4800, unit:'per piece', inStock:true, isi:false, rating:4.6, reviewCount:880, sellerName:'Bath World', sellerCity:'Delhi', roomTypes:['washroom'], imageUrl:I.wc, imageIcon:'🚿' }),
  P({ id:'p2', name:'Kohler Reve Wall-Hung WC', brand:'Kohler', categoryId:'plumbing', subcategoryId:'wc_toilet', type:'Wall-Hung WC', price:28000, unit:'per piece', inStock:true, isi:false, rating:4.9, reviewCount:124, sellerName:'Kohler Studio', sellerCity:'Mumbai', roomTypes:['washroom'], imageUrl:I.wc, imageIcon:'🚿' }),
  P({ id:'p3', name:'Cera Smart WC with Bidet', brand:'Cera', categoryId:'plumbing', subcategoryId:'wc_toilet', type:'Smart WC Bidet', price:12500, unit:'per piece', inStock:true, isi:false, rating:4.7, reviewCount:210, sellerName:'Cera Gallery', sellerCity:'Bangalore', roomTypes:['washroom'], imageUrl:I.wc, imageIcon:'🚿', originalPrice:15000 }),
  P({ id:'p4', name:'Parryware Wall Hung Basin 550mm', brand:'Parryware', categoryId:'plumbing', subcategoryId:'basins', type:'Wall Hung', price:3200, unit:'per piece', inStock:true, isi:false, rating:4.5, reviewCount:410, sellerName:'Parryware Gallery', sellerCity:'Chennai', roomTypes:['washroom'], imageUrl:I.basin, imageIcon:'🚿' }),
  P({ id:'p5', name:'Cera Corner Basin 470mm White', brand:'Cera', categoryId:'plumbing', subcategoryId:'basins', type:'Corner Basin', price:2400, unit:'per piece', inStock:true, isi:false, rating:4.4, reviewCount:180, sellerName:'Bath World', sellerCity:'Delhi', roomTypes:['washroom'], imageUrl:I.basin, imageIcon:'🚿' }),
  P({ id:'p6', name:'Jaquar Shower Panel 5 Jets', brand:'Jaquar', categoryId:'plumbing', subcategoryId:'shower', type:'Shower Panel', price:18500, unit:'per piece', inStock:true, isi:false, rating:4.8, reviewCount:92, sellerName:'Jaquar Gallery', sellerCity:'Delhi', roomTypes:['washroom'], imageUrl:I.shower, imageIcon:'🚿', originalPrice:22000 }),
  P({ id:'p7', name:'Kohler Rainhead 200mm Overhead Shower', brand:'Kohler', categoryId:'plumbing', subcategoryId:'shower', type:'Overhead Shower', price:5500, unit:'per piece', inStock:true, isi:false, rating:4.8, reviewCount:310, sellerName:'Kohler Studio', sellerCity:'Mumbai', roomTypes:['washroom'], imageUrl:I.shower, imageIcon:'🚿' }),
  P({ id:'p8', name:'Jaquar Single Lever Basin Mixer', brand:'Jaquar', categoryId:'plumbing', subcategoryId:'faucets', type:'Basin Mixer', price:2800, unit:'per piece', inStock:true, isi:false, rating:4.7, reviewCount:640, sellerName:'Jaquar Gallery', sellerCity:'Delhi', roomTypes:['washroom','kitchen'], imageUrl:I.faucet, imageIcon:'🚿' }),
  P({ id:'p9', name:'Hindware 7-Piece Bathroom Accessories', brand:'Hindware', categoryId:'plumbing', subcategoryId:'accessories', type:'Towel Rod', price:3200, unit:'per set', inStock:true, isi:false, rating:4.4, reviewCount:210, sellerName:'Bath World', sellerCity:'Delhi', roomTypes:['washroom'], imageUrl:I.bath_acc, imageIcon:'🚿' }),
  P({ id:'p10', name:'Havells Ventilair 150mm Exhaust Fan', brand:'Havells', categoryId:'plumbing', subcategoryId:'accessories', type:'Exhaust Fan', price:1200, unit:'per piece', inStock:true, isi:false, rating:4.5, reviewCount:1100, sellerName:'Electrical Hub', sellerCity:'Pune', roomTypes:['washroom','kitchen'], imageUrl:I.exhaust, imageIcon:'🚿' }),

  // ─── KITCHEN ─────────────────────────────────────────────────────────────────
  P({ id:'k1', name:'Franke Silk Steel 24×18" SS Sink', brand:'Franke', categoryId:'kitchen', subcategoryId:'kitchen_sink', type:'SS Single Bowl', price:6800, unit:'per piece', inStock:true, isi:false, rating:4.8, reviewCount:430, sellerName:'Franke Studio', sellerCity:'Mumbai', roomTypes:['kitchen'], imageUrl:I.sink_ss, imageIcon:'🍳' }),
  P({ id:'k2', name:'Carysil Double Bowl Granite Sink', brand:'Carysil', categoryId:'kitchen', subcategoryId:'kitchen_sink', type:'Granite Sink', price:9500, unit:'per piece', inStock:true, isi:false, rating:4.7, reviewCount:180, sellerName:'Kitchen World', sellerCity:'Bangalore', roomTypes:['kitchen'], imageUrl:I.sink_ss, imageIcon:'🍳', originalPrice:12000 }),
  P({ id:'k3', name:'Jaquar Pull-out Kitchen Tap Chrome', brand:'Jaquar', categoryId:'kitchen', subcategoryId:'kitchen_faucet', type:'Pull-out Spray', price:4200, unit:'per piece', inStock:true, isi:false, rating:4.7, reviewCount:320, sellerName:'Jaquar Gallery', sellerCity:'Delhi', roomTypes:['kitchen'], imageUrl:I.ktap, imageIcon:'🍳' }),
  P({ id:'k4', name:'Faber Auto-Clean Chimney 60cm 1200m³', brand:'Faber', categoryId:'kitchen', subcategoryId:'chimney', type:'Auto-clean 60cm', price:14500, unit:'per piece', inStock:true, isi:false, rating:4.6, reviewCount:780, sellerName:'Faber Studio', sellerCity:'Delhi', roomTypes:['kitchen'], imageUrl:I.chimney, imageIcon:'🍳', originalPrice:18000 }),
  P({ id:'k5', name:'Elica Auto-Clean T-Shape 90cm', brand:'Elica', categoryId:'kitchen', subcategoryId:'chimney', type:'T-shape Designer', price:19000, unit:'per piece', inStock:true, isi:false, rating:4.7, reviewCount:420, sellerName:'Elica Kitchen', sellerCity:'Mumbai', roomTypes:['kitchen'], imageUrl:I.chimney, imageIcon:'🍳' }),
  P({ id:'k6', name:'Kashmir White Granite Kitchen Counter', brand:'Slab World', categoryId:'kitchen', subcategoryId:'countertop', type:'Granite Slab', price:195, unit:'per sqft', minOrder:'15 sqft', inStock:true, isi:false, rating:4.7, reviewCount:280, sellerName:'Granite Palace', sellerCity:'Hyderabad', roomTypes:['kitchen'], imageUrl:I.counter_gran, imageIcon:'🍳' }),
  P({ id:'k7', name:'Century BWR Ply 18mm Kitchen Cabinet', brand:'Century Ply', categoryId:'kitchen', subcategoryId:'kitchen_storage', type:'BWR Plywood 18mm', price:1850, unit:'per sheet', inStock:true, isi:false, rating:4.6, reviewCount:540, sellerName:'Wood Works', sellerCity:'Chennai', roomTypes:['kitchen','bedroom'], imageUrl:I.plywood, imageIcon:'🍳' }),

  // ─── ELECTRICALS ─────────────────────────────────────────────────────────────
  P({ id:'e1', name:'Havells 2.5mm FRLS Wire 90m', brand:'Havells', categoryId:'electricals', subcategoryId:'wires', type:'2.5mm FRLS', price:1950, unit:'per roll (90m)', inStock:true, isi:true, rating:4.8, reviewCount:1640, sellerName:'Electrical Hub', sellerCity:'Pune', roomTypes:['structure','washroom','kitchen','bedroom','living_room'], imageUrl:I.wire, imageIcon:'⚡' }),
  P({ id:'e2', name:'Polycab 6mm FR AC Wire 90m', brand:'Polycab', categoryId:'electricals', subcategoryId:'wires', type:'6mm AC Wire', price:3200, unit:'per roll (90m)', inStock:true, isi:true, rating:4.7, reviewCount:520, sellerName:'Polycab Depot', sellerCity:'Delhi', roomTypes:['bedroom','living_room'], imageUrl:I.wire, imageIcon:'⚡' }),
  P({ id:'e3', name:'Legrand Arteor 6A Modular Switch', brand:'Legrand', categoryId:'electricals', subcategoryId:'switches', type:'Modular Switch 6A', price:180, unit:'per piece', inStock:true, isi:false, rating:4.7, reviewCount:2200, sellerName:'Electrical Hub', sellerCity:'Bangalore', roomTypes:['bedroom','living_room','kitchen','washroom'], imageUrl:I.switch, imageIcon:'⚡' }),
  P({ id:'e4', name:'Anchor Roma 6A Switch Board 6M', brand:'Anchor', categoryId:'electricals', subcategoryId:'switches', type:'Modular Switch 6A', price:320, unit:'per piece', inStock:true, isi:false, rating:4.5, reviewCount:980, sellerName:'Anchor Store', sellerCity:'Delhi', roomTypes:['bedroom','living_room'], imageUrl:I.switch, imageIcon:'⚡' }),
  P({ id:'e5', name:'Havells 48W LED Panel 600×600', brand:'Havells', categoryId:'electricals', subcategoryId:'lights', type:'LED Panel 2x2', price:1850, unit:'per piece', inStock:true, isi:false, rating:4.7, reviewCount:740, sellerName:'LED World', sellerCity:'Delhi', roomTypes:['washroom','kitchen','bedroom','living_room'], imageUrl:I.led_panel, imageIcon:'⚡' }),
  P({ id:'e6', name:'Philips 12W LED Downlight 6"', brand:'Philips', categoryId:'electricals', subcategoryId:'lights', type:'LED Downlight', price:320, unit:'per piece', inStock:true, isi:false, rating:4.6, reviewCount:3100, sellerName:'Lighting Hub', sellerCity:'Mumbai', roomTypes:['living_room','bedroom','washroom'], imageUrl:I.led_panel, imageIcon:'⚡' }),
  P({ id:'e7', name:'Wipro Garnet LED Strip 5m 24W', brand:'Wipro', categoryId:'electricals', subcategoryId:'lights', type:'LED Strip 5m', price:680, unit:'per set', inStock:true, isi:false, rating:4.5, reviewCount:1420, sellerName:'LED World', sellerCity:'Bangalore', roomTypes:['living_room','stairs','exterior'], imageUrl:I.led_strip, imageIcon:'⚡' }),
  P({ id:'e8', name:'Schneider Acti9 MCB 20A DP', brand:'Schneider', categoryId:'electricals', subcategoryId:'panels', type:'MCB Double Pole', price:850, unit:'per piece', inStock:true, isi:true, rating:4.8, reviewCount:310, sellerName:'Electrical Hub', sellerCity:'Delhi', roomTypes:['structure'], imageUrl:I.mcb, imageIcon:'⚡' }),

  // ─── PAINTS ──────────────────────────────────────────────────────────────────
  P({ id:'pa1', name:'Asian Paints Royale Luxury 20L', brand:'Asian Paints', categoryId:'paints', subcategoryId:'interior_paint', type:'Luxury Emulsion', price:5800, unit:'per 20L', inStock:true, isi:false, rating:4.8, reviewCount:2800, sellerName:'Colour World', sellerCity:'Delhi', roomTypes:['living_room','bedroom'], imageUrl:I.paint_wall, imageIcon:'🎨', originalPrice:6400 }),
  P({ id:'pa2', name:'Berger Silk Premium Interior 20L', brand:'Berger', categoryId:'paints', subcategoryId:'interior_paint', type:'Premium Emulsion', price:4200, unit:'per 20L', inStock:true, isi:false, rating:4.7, reviewCount:1640, sellerName:'Berger Gallery', sellerCity:'Kolkata', roomTypes:['bedroom','living_room'], imageUrl:I.paint_wall, imageIcon:'🎨' }),
  P({ id:'pa3', name:'Asian Paints Apex Exterior 20L', brand:'Asian Paints', categoryId:'paints', subcategoryId:'exterior_paint', type:'Weatherproof Emulsion', price:3400, unit:'per 20L', inStock:true, isi:false, rating:4.6, reviewCount:1920, sellerName:'Colour World', sellerCity:'Bangalore', roomTypes:['exterior'], imageUrl:I.paint_ext, imageIcon:'🎨', originalPrice:3800 }),
  P({ id:'pa4', name:'Dulux Weathershield Max 20L', brand:'Dulux', categoryId:'paints', subcategoryId:'exterior_paint', type:'Anti-Dust', price:4100, unit:'per 20L', inStock:true, isi:false, rating:4.7, reviewCount:820, sellerName:'AkzoNobel Store', sellerCity:'Mumbai', roomTypes:['exterior'], imageUrl:I.paint_ext, imageIcon:'🎨' }),
  P({ id:'pa5', name:'Dr. Fixit Roofseal Roof Waterproofing 4L', brand:'Dr. Fixit', categoryId:'paints', subcategoryId:'waterproofing', type:'Roof Sealant', price:1200, unit:'per 4L', inStock:true, isi:false, rating:4.7, reviewCount:1100, sellerName:'Waterproof Pro', sellerCity:'Mumbai', roomTypes:['exterior','washroom'], imageUrl:I.waterproof, imageIcon:'🎨' }),
  P({ id:'pa6', name:'Asian Paints SmartCare Damp Proof 4L', brand:'Asian Paints', categoryId:'paints', subcategoryId:'waterproofing', type:'Bathroom Waterproofing', price:880, unit:'per 4L', inStock:true, isi:false, rating:4.5, reviewCount:740, sellerName:'Colour World', sellerCity:'Delhi', roomTypes:['washroom','kitchen'], imageUrl:I.waterproof, imageIcon:'🎨' }),

  // ─── WOOD & BOARDS ───────────────────────────────────────────────────────────
  P({ id:'w1', name:'Century BWP Plywood 18mm 8×4ft', brand:'Century Ply', categoryId:'wood', subcategoryId:'plywood', type:'BWP Grade', price:1850, unit:'per sheet', inStock:true, isi:false, rating:4.7, reviewCount:1240, sellerName:'Wood Works', sellerCity:'Chennai', roomTypes:['kitchen','bedroom'], imageUrl:I.plywood, imageIcon:'🪵' }),
  P({ id:'w2', name:'Greenply Platinum Interior 12mm 8×4ft', brand:'Greenply', categoryId:'wood', subcategoryId:'plywood', type:'BWR 12mm', price:980, unit:'per sheet', inStock:true, isi:false, rating:4.6, reviewCount:870, sellerName:'Green Ply Depot', sellerCity:'Bangalore', roomTypes:['bedroom','living_room'], imageUrl:I.plywood2, imageIcon:'🪵' }),
  P({ id:'w3', name:'MDF Board 18mm 8×4ft', brand:'Durian', categoryId:'wood', subcategoryId:'boards', type:'MDF 18mm', price:720, unit:'per sheet', inStock:true, isi:false, rating:4.4, reviewCount:620, sellerName:'Board World', sellerCity:'Delhi', roomTypes:['bedroom','kitchen'], imageUrl:I.mdf, imageIcon:'🪵' }),
  P({ id:'w4', name:'Pergo Laminate Flooring Oak 8mm', brand:'Pergo', categoryId:'wood', subcategoryId:'boards', type:'Laminate', price:95, unit:'per sqft', inStock:true, isi:false, rating:4.6, reviewCount:480, sellerName:'Floor Studio', sellerCity:'Delhi', roomTypes:['bedroom','living_room'], imageUrl:I.laminate_fl, imageIcon:'🪵', originalPrice:110 }),
  P({ id:'w5', name:'Merino Sunmica Decorative Laminate', brand:'Merino', categoryId:'wood', subcategoryId:'laminates', type:'Decorative Laminate', price:180, unit:'per sheet', inStock:true, isi:false, rating:4.5, reviewCount:380, sellerName:'Laminate Hub', sellerCity:'Mumbai', roomTypes:['kitchen','bedroom'], imageUrl:I.lam_sheet, imageIcon:'🪵' }),

  // ─── DOORS & WINDOWS ─────────────────────────────────────────────────────────
  P({ id:'d1', name:'Teak Burma Teak Main Door 7×3.5ft', brand:'Teak Mart', categoryId:'doors_windows', subcategoryId:'doors', type:'Teak Wood Main Door', price:28000, unit:'per piece', inStock:true, isi:false, rating:4.8, reviewCount:120, sellerName:'Timber House', sellerCity:'Chennai', roomTypes:['living_room'], imageUrl:I.door_main, imageIcon:'🚪' }),
  P({ id:'d2', name:'Greenply WPC Door 7×3ft Bedroom', brand:'Greenply', categoryId:'doors_windows', subcategoryId:'doors', type:'WPC Door', price:5500, unit:'per piece', inStock:true, isi:false, rating:4.5, reviewCount:320, sellerName:'Door Studio', sellerCity:'Bangalore', roomTypes:['bedroom'], imageUrl:I.door_int, imageIcon:'🚪' }),
  P({ id:'d3', name:'Godrej Steel Security Door 7×3ft', brand:'Godrej', categoryId:'doors_windows', subcategoryId:'doors', type:'Steel Security Door', price:18000, unit:'per piece', inStock:true, isi:false, rating:4.7, reviewCount:540, sellerName:'Steel Door Hub', sellerCity:'Mumbai', roomTypes:['living_room'], imageUrl:I.door_main, imageIcon:'🚪' }),
  P({ id:'d4', name:'Aluminium Sliding Window 4×4ft', brand:'Jindal Aluminium', categoryId:'doors_windows', subcategoryId:'windows', type:'Aluminium Sliding', price:4800, unit:'per piece', inStock:true, isi:false, rating:4.5, reviewCount:680, sellerName:'Window World', sellerCity:'Delhi', roomTypes:['bedroom','living_room'], imageUrl:I.window, imageIcon:'🪟' }),
  P({ id:'d5', name:'Saint-Gobain Toughened Glass 10mm', brand:'Saint-Gobain', categoryId:'doors_windows', subcategoryId:'glass', type:'Toughened', price:85, unit:'per sqft', minOrder:'20 sqft', inStock:true, isi:true, rating:4.8, reviewCount:240, sellerName:'Glass World', sellerCity:'Bangalore', roomTypes:['living_room','washroom'], imageUrl:I.glass_t, imageIcon:'🪟' }),

  // ─── STAIRS ──────────────────────────────────────────────────────────────────
  P({ id:'st1', name:'SS 304 Glass Railing System 10ft', brand:'Dorset', categoryId:'hardware', subcategoryId:'fasteners', type:'SS Railing', price:8500, unit:'per 10ft set', inStock:true, isi:false, rating:4.7, reviewCount:88, sellerName:'Railing Pro', sellerCity:'Delhi', roomTypes:['stairs'], imageUrl:I.railing, imageIcon:'🪜' }),
  P({ id:'st2', name:'MS Powder Coated Baluster Set', brand:'MS Decor', categoryId:'hardware', subcategoryId:'fasteners', type:'MS Baluster', price:3200, unit:'per set', inStock:true, isi:false, rating:4.4, reviewCount:54, sellerName:'Iron Art', sellerCity:'Jaipur', roomTypes:['stairs'], imageUrl:I.railing, imageIcon:'🪜' }),
  P({ id:'st3', name:'GRP Anti-Skid Stair Nosing Strip', brand:'Gripsure', categoryId:'hardware', subcategoryId:'fasteners', type:'Anti-Skid', price:280, unit:'per metre', inStock:true, isi:false, rating:4.3, reviewCount:44, sellerName:'Safety Store', sellerCity:'Delhi', roomTypes:['stairs'], imageUrl:I.stairs, imageIcon:'🪜' }),

  // ─── CEILING / INTERIOR ───────────────────────────────────────────────────────
  P({ id:'f1', name:'Saint-Gobain Gyproc GN13 Gypsum Board', brand:'Saint-Gobain', categoryId:'roofing', subcategoryId:'false_ceiling', type:'Gyproc Gypsum Board', price:38, unit:'per sqft', inStock:true, isi:false, rating:4.7, reviewCount:640, sellerName:'Gyproc Dealer', sellerCity:'Delhi', roomTypes:['living_room','bedroom'], imageUrl:I.gypsum, imageIcon:'🏗️' }),
  P({ id:'f2', name:'Armstrong Mineral Fibre Ceiling Tile 2×2', brand:'Armstrong', categoryId:'roofing', subcategoryId:'false_ceiling', type:'Mineral Fibre Tile', price:42, unit:'per sqft', inStock:true, isi:false, rating:4.5, reviewCount:280, sellerName:'Ceiling World', sellerCity:'Mumbai', roomTypes:['washroom','kitchen','living_room'], imageUrl:I.gypsum, imageIcon:'🏗️' }),

  // ─── EXTERIOR / ROOFING ──────────────────────────────────────────────────────
  P({ id:'r1', name:'Tata Bluescope Zintec Color Roof Sheet', brand:'TATA Bluescope', categoryId:'roofing', subcategoryId:'roof_sheets', type:'PPGI Color', price:92, unit:'per sqft', minOrder:'100 sqft', inStock:true, isi:true, rating:4.7, reviewCount:320, sellerName:'Roofing Pro', sellerCity:'Hyderabad', roomTypes:['exterior'], imageUrl:I.roofing, imageIcon:'🚧' }),
  P({ id:'r2', name:'Aica Sunmica ACP Sheet 4mm 8×4ft', brand:'Aica', categoryId:'wood', subcategoryId:'laminates', type:'ACP Sheet', price:1200, unit:'per sheet', inStock:true, isi:false, rating:4.5, reviewCount:140, sellerName:'Cladding World', sellerCity:'Mumbai', roomTypes:['exterior'], imageUrl:I.acp, imageIcon:'🏗️' }),

  // ─── KASHMIR SPECIAL ─────────────────────────────────────────────────────────
  P({ id:'ks1', name:'Deodar Cedar Structural Beam 4×4"', brand:'Kashmir Timber', categoryId:'wood', subcategoryId:'plywood', type:'Deodar Cedar', price:180, unit:'per running ft', minOrder:'20 rft', inStock:true, isi:false, rating:4.9, reviewCount:63, sellerName:'Valley Timber', sellerCity:'Srinagar', roomTypes:['structure','exterior'], regionTag:'kashmir', regionLabel:'🏔️ Local Kashmir Wood', imageUrl:I.timber, imageIcon:'🪵' }),
  P({ id:'ks2', name:'GI Roofing Sheet 0.6mm Snow Grade', brand:'TATA Bluescope', categoryId:'roofing', subcategoryId:'roof_sheets', type:'GI Sheet 0.6mm Snow Grade', price:95, unit:'per sqft', minOrder:'100 sqft', inStock:true, isi:true, rating:4.8, reviewCount:48, sellerName:'Valley Building Mats', sellerCity:'Srinagar', roomTypes:['exterior'], regionTag:'kashmir', regionLabel:'❄️ Snow Load Rated 150kg/sqm', imageUrl:I.roofing, imageIcon:'🚧' }),
  P({ id:'ks3', name:'XPS Thermal Insulation Board 50mm', brand:'Dow', categoryId:'roofing', subcategoryId:'roof_sheets', type:'XPS Board', price:65, unit:'per sqft', minOrder:'50 sqft', inStock:true, isi:false, rating:4.6, reviewCount:31, sellerName:'Insulation Pro', sellerCity:'Srinagar', roomTypes:['exterior','structure'], regionTag:'kashmir', regionLabel:'🌡️ Rated to -20°C', imageUrl:I.insulation, imageIcon:'🏔️' }),
  P({ id:'ks4', name:'UPVC Triple Seal Window 4×4ft', brand:'Fenesta', categoryId:'doors_windows', subcategoryId:'windows', type:'UPVC Triple Seal', price:12000, unit:'per piece', inStock:true, isi:false, rating:4.5, reviewCount:22, sellerName:'Kashmir Windows', sellerCity:'Srinagar', roomTypes:['bedroom','living_room'], regionTag:'kashmir', regionLabel:'❄️ Cold Climate', imageUrl:I.window, imageIcon:'🪟' }),
  P({ id:'ks5', name:'Anti-freeze Concrete Admixture 5L', brand:'Fosroc', categoryId:'hardware', subcategoryId:'chem', type:'Anti-freeze Admixture', price:850, unit:'per 5L can', inStock:true, isi:false, rating:4.7, reviewCount:57, sellerName:'Chem Solutions', sellerCity:'Srinagar', roomTypes:['structure'], regionTag:'kashmir', regionLabel:'❄️ For temps below 5°C', imageUrl:I.chemical, imageIcon:'🔧' }),
  P({ id:'ks6', name:'Seismic Grade TMT Fe550D 12mm', brand:'SAIL', categoryId:'steel', subcategoryId:'tmt', type:'Seismic Grade Fe600', price:72, unit:'per kg', minOrder:'100 kg', inStock:true, isi:true, rating:4.8, reviewCount:89, sellerName:'Kashmir Steel Depot', sellerCity:'Jammu', roomTypes:['structure'], regionTag:'kashmir', regionLabel:'🏔️ Zone V Certified', imageUrl:I.steel, imageIcon:'🔩' }),

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
                    onAdd={() => addToCart(p)} onRemove={() => removeFromCart(p.id)} />
                ))}
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

function ProductCard({ product: p, region, priceFactor, warning, cartQty, onAdd, onRemove }: {
  product: Product; region: RegionKey; priceFactor: number; warning: string | null;
  cartQty: number; onAdd: () => void; onRemove: () => void;
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
        {!imgFailed ? (
          <img src={`${p.imageUrl}?w=480&h=360&fit=crop&q=80&auto=format`} alt={p.name}
            className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
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
