import type { Metadata } from 'next';
import MaterialDetailClient from './MaterialDetailClient';
import { buildMetadata } from '@/lib/seo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchMaterial(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/materials/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchReviews(id: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/reviews?targetType=MATERIAL&targetId=${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const raw = await fetchMaterial(params.id);
  if (!raw) return buildMetadata({ title: 'Material not found', description: 'This listing may have been removed or is unavailable.', path: `/materials/${params.id}` });

  const city = raw.supplier?.deliveryCities?.[0];
  const price = raw.price != null ? `₹${Number(raw.price).toLocaleString('en-IN')}${raw.unit ? `/${raw.unit}` : ''}` : null;

  return buildMetadata({
    title: `${raw.name} — ${raw.category ?? 'Material'}${city ? ` in ${city}` : ''}`,
    description: `Buy ${raw.name}${price ? ` at ${price}` : ''}${city ? ` in ${city}` : ''} on Griffy — India's construction marketplace. ${raw.description ?? ''}`.trim(),
    path: `/materials/${params.id}`,
    image: raw.imageUrls?.[0] ?? undefined,
  });
}

export default async function MaterialDetailPage({ params }: { params: { id: string } }) {
  const [raw, reviews] = await Promise.all([
    fetchMaterial(params.id),
    fetchReviews(params.id),
  ]);

  if (!raw) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-[#2C1810]">Material not found</p>
          <p className="text-sm text-[#A08070] mt-2">This listing may have been removed or is unavailable.</p>
        </div>
      </div>
    );
  }

  const material = {
    id:               raw.id,
    name:             raw.name,
    description:      raw.description ?? null,
    category:         raw.category ?? 'Uncategorised',
    subcategory:      raw.subcategory ?? '',
    price:            Number(raw.price ?? 0),
    unit:             raw.unit ?? 'per unit',
    stock:            raw.stock ?? 0,
    imageUrls:        raw.imageUrls ?? [],
    availableRegions: raw.availableRegions ?? [],
    brand:            raw.brand ?? null,
    sku:              raw.sku ?? null,
    avgRating:        Number(raw.avgRating ?? 0),
    totalReviews:     raw.reviewCount ?? raw.totalReviews ?? 0,
    supplier: raw.supplier
      ? {
          id:            raw.supplier.id,
          name:          raw.supplier.user?.name ?? raw.supplier.businessName ?? 'Supplier',
          city:          raw.supplier.deliveryCities?.[0] ?? '',
          phone:         raw.supplier.user?.phone ?? null,
          verified:      raw.supplier.approvalStatus === 'APPROVED',
          avgRating:     Number(raw.supplier.avgRating ?? 0),
          totalReviews:  raw.supplier.totalReviews ?? 0,
          totalOrders:   raw.supplier.totalOrders ?? 0,
        }
      : null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: material.name,
    description: material.description ?? undefined,
    ...(material.brand ? { brand: { '@type': 'Brand', name: material.brand } } : {}),
    ...(material.sku ? { sku: material.sku } : {}),
    ...(material.imageUrls[0] ? { image: material.imageUrls[0] } : {}),
    offers: {
      '@type': 'Offer',
      price: material.price,
      priceCurrency: 'INR',
      availability: material.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: material.supplier?.name ?? 'Griffy' },
    },
    ...(material.totalReviews > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: material.avgRating,
            reviewCount: material.totalReviews,
            bestRating: 5,
          },
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MaterialDetailClient material={material} reviews={reviews} />
    </>
  );
}
