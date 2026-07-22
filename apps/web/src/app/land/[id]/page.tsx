import LandDetailClient from './LandDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchLand(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/lands/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function LandDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { contact?: string } }) {
  const raw = await fetchLand(params.id);

  if (!raw) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🌍</p>
          <p className="text-lg font-semibold text-[#2C1810]">Land listing not found</p>
          <p className="text-sm text-[#A08070] mt-2">This listing may have been removed or is unavailable.</p>
        </div>
      </div>
    );
  }

  const listing = {
    id:          raw.id,
    title:       raw.title,
    description: raw.description ?? null,
    landType:    raw.landType ?? 'RESIDENTIAL',
    areaSqFt:    Number(raw.areaSqFt ?? 0),
    price:       Number(raw.price ?? 0),
    location:    raw.location ?? '',
    city:        raw.city ?? '',
    state:       raw.state ?? '',
    isAvailable: raw.isAvailable ?? true,
    createdAt:   raw.createdAt ?? new Date().toISOString(),
    ownerName:   raw.owner?.user?.name ?? 'Land Owner',
    ownerPhone:  raw.owner?.user?.phone ?? null,
  };

  return <LandDetailClient listing={listing} openContact={searchParams.contact === '1'} />;
}
