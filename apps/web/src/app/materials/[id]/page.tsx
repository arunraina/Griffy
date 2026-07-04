import MaterialDetailClient from './MaterialDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchMaterial(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/materials/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchReviews(id: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/reviews?targetType=MATERIAL&targetId=${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
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
          id:       raw.supplier.id,
          name:     raw.supplier.user?.name ?? 'Supplier',
          city:     raw.supplier.serviceCities?.[0] ?? '',
          phone:    raw.supplier.user?.phone ?? null,
          verified: raw.supplier.approvalStatus === 'APPROVED',
        }
      : null,
  };

  return <MaterialDetailClient material={material} reviews={reviews} />;
}
