import PropertiesClient from './PropertiesClient';

type PropertyType = 'Apartment' | 'Independent House' | 'Villa' | 'Builder Floor' | 'Studio' | 'Row House';

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const PROPERTY_TYPE_MAP: Record<string, PropertyType> = {
  APARTMENT: 'Apartment',
  VILLA: 'Villa',
  PLOT: 'Apartment',
  COMMERCIAL: 'Independent House',
  INDEPENDENT_HOUSE: 'Independent House',
};

const FURNISHING_MAP: Record<string, Property['furnishing']> = {
  UNFURNISHED: 'Unfurnished',
  SEMI_FURNISHED: 'Semi-furnished',
  FURNISHED: 'Furnished',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProperty(p: any): Property {
  const daysAgo = Math.max(0, Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86400000));
  const bedrooms = p.bedrooms ?? 2;
  const listingType = (p.listingType ?? 'buy') as 'buy' | 'rent' | 'new';
  return {
    id: p.id,
    tab: listingType,
    type: PROPERTY_TYPE_MAP[p.propertyType] ?? 'Apartment',
    title: p.title,
    city: p.city ?? '',
    locality: p.location ?? p.city ?? '',
    bhk: bedrooms > 0 ? `${bedrooms} BHK` : '2 BHK',
    area: Number(p.areaSqFt ?? 0),
    areaUnit: 'sq ft',
    price: Number(p.price ?? 0),
    priceUnit: listingType === 'rent' ? 'per_month' : 'total',
    furnishing: FURNISHING_MAP[p.furnishing] ?? 'Unfurnished',
    parking: false,
    lift: false,
    featured: false,
    postedDaysAgo: daysAgo,
    ownerName: p.seller?.user?.name ?? 'Property Seller',
    ownerType: listingType === 'new' ? 'Builder' : 'Owner',
    imageUrl: p.imageUrls?.[0] ?? '',
    amenities: [],
    verified: false,
  };
}

async function fetchProperties(): Promise<Property[]> {
  try {
    const res = await fetch(`${API_BASE}/properties`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data ?? []).map(mapProperty);
  } catch {
    return [];
  }
}

export default async function PropertiesPage() {
  const properties = await fetchProperties();
  return <PropertiesClient initialProperties={properties} />;
}
