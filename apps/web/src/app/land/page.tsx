import LandClient from './LandClient';

type ListingType = 'Residential Plot' | 'Agricultural Land' | 'Commercial Plot' | 'Farm House' | 'Industrial';

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const LAND_TYPE_MAP: Record<string, ListingType> = {
  AGRICULTURAL: 'Agricultural Land',
  RESIDENTIAL: 'Residential Plot',
  COMMERCIAL: 'Commercial Plot',
  INDUSTRIAL: 'Industrial',
  MIXED: 'Residential Plot',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLand(l: any): LandListing {
  const daysAgo = Math.max(0, Math.floor((Date.now() - new Date(l.createdAt).getTime()) / 86400000));
  return {
    id: l.id,
    title: l.title,
    type: LAND_TYPE_MAP[l.landType] ?? 'Residential Plot',
    city: l.city ?? '',
    locality: l.location ?? l.city ?? '',
    state: l.state ?? '',
    area: Number(l.areaSqFt ?? 0),
    areaUnit: 'sqft',
    price: Number(l.price ?? 0),
    priceUnit: 'total',
    facing: 'East',
    road: '30ft',
    approved: false,
    fencing: false,
    water: false,
    electricity: false,
    featured: false,
    postedDaysAgo: daysAgo,
    ownerName: l.owner?.user?.name ?? 'Land Owner',
    ownerType: 'Owner',
    imageUrl: l.imageUrls?.[0] ?? '',
    imageIcon: '🌍',
  };
}

async function fetchLands(): Promise<LandListing[]> {
  try {
    const res = await fetch(`${API_BASE}/lands`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data ?? []).map(mapLand);
  } catch {
    return [];
  }
}

export default async function LandPage() {
  const listings = await fetchLands();
  return <LandClient initialListings={listings} />;
}
