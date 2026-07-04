import MaterialsClient from './MaterialsClient';

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMaterial(m: any): Product {
  return {
    id: m.id,
    name: m.name,
    brand: m.supplier?.user?.name ?? 'Supplier',
    categoryId: m.category ?? 'structure',
    subcategoryId: m.subcategory ?? 'cement',
    type: m.subcategory ?? '',
    price: Number(m.price ?? 0),
    unit: m.unit ?? 'per unit',
    inStock: (m.stock ?? 0) > 0,
    isi: false,
    rating: Number(m.avgRating ?? 0),
    reviewCount: m.reviewCount ?? 0,
    sellerName: m.supplier?.user?.name ?? 'Unknown',
    sellerCity: m.supplier?.serviceCities?.[0] ?? '',
    roomTypes: [],
    imageUrl: m.imageUrls?.[0] ?? '',
    imageIcon: '🏗️',
  };
}

async function fetchMaterials(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/materials`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data ?? []).map(mapMaterial);
  } catch {
    return [];
  }
}

export default async function MaterialsPage() {
  const products = await fetchMaterials();
  return <MaterialsClient sourceProducts={products} />;
}
