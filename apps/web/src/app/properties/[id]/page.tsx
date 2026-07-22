import type { Metadata } from 'next';
import PropertyDetailClient from './PropertyDetailClient';
import { buildMetadata } from '@/lib/seo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchProperty(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/properties/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const raw = await fetchProperty(params.id);
  if (!raw) return buildMetadata({ title: 'Property not found', description: 'This listing may have been removed or is unavailable.', path: `/properties/${params.id}` });

  const price = raw.price != null ? `₹${Number(raw.price).toLocaleString('en-IN')}` : null;
  const bhk = raw.bedrooms ? `${raw.bedrooms}BHK ` : '';
  const action = raw.listingType === 'rent' ? 'for rent' : 'for sale';

  return buildMetadata({
    title: `${bhk}${raw.title} — ${action} in ${raw.city ?? 'India'}`,
    description: `${raw.title}${price ? ` ${action} at ${price}` : ` ${action}`} in ${raw.city ?? ''}${raw.state ? `, ${raw.state}` : ''}. ${raw.description ?? ''}`.trim(),
    path: `/properties/${params.id}`,
  });
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const raw = await fetchProperty(params.id);

  if (!raw) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🏠</p>
          <p className="text-lg font-semibold text-[#2C1810]">Property not found</p>
          <p className="text-sm text-[#A08070] mt-2">This listing may have been removed or is unavailable.</p>
        </div>
      </div>
    );
  }

  const listing = {
    id:           raw.id,
    title:        raw.title,
    description:  raw.description ?? null,
    propertyType: raw.propertyType ?? 'APARTMENT',
    furnishing:   raw.furnishing ?? 'UNFURNISHED',
    areaSqFt:     Number(raw.areaSqFt ?? 0),
    price:        Number(raw.price ?? 0),
    bedrooms:     raw.bedrooms ?? null,
    bathrooms:    raw.bathrooms ?? null,
    location:     raw.location ?? '',
    city:         raw.city ?? '',
    state:        raw.state ?? '',
    isAvailable:  raw.isAvailable ?? true,
    listingType:  raw.listingType ?? 'buy',
    createdAt:    raw.createdAt ?? new Date().toISOString(),
    sellerId:     raw.seller?.user?.id ?? null,
    sellerName:   raw.seller?.user?.name ?? 'Property Seller',
    sellerPhone:  raw.seller?.user?.phone ?? null,
  };

  return <PropertyDetailClient listing={listing} />;
}
