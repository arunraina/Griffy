const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface PublicServiceItem {
  id: string;
  name: string;
  description: string | null;
  price: number; // paise
  priceUnit: 'FIXED' | 'PER_HOUR' | 'PER_DAY' | 'PER_POINT' | 'PER_SQFT' | 'PER_VISIT';
  category: string;
}

const PRICE_UNIT_LABEL: Record<PublicServiceItem['priceUnit'], string> = {
  FIXED: '',
  PER_HOUR: '/hour',
  PER_DAY: '/day',
  PER_POINT: '/point',
  PER_SQFT: '/sqft',
  PER_VISIT: '/visit',
};

export function formatServiceItemPrice(item: PublicServiceItem): string {
  const rupees = (item.price / 100).toLocaleString('en-IN');
  return `₹${rupees}${PRICE_UNIT_LABEL[item.priceUnit]}`;
}

// Public, unauthenticated -- same GET /service-items/:profileType/:profileId
// the admin panel's own service-item manager writes to.
export async function fetchPublicServiceItems(
  profileType: 'contractor' | 'labour' | 'service-expert',
  profileId: string,
): Promise<PublicServiceItem[]> {
  try {
    const res = await fetch(`${API}/service-items/${profileType}/${profileId}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
