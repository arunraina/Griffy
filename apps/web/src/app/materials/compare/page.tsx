import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface MaterialDetail {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: string;
  unit: string;
  stock: number;
  imageUrls: string[];
  supplier?: {
    businessName: string;
    approvalStatus: string;
    avgRating: number;
    totalReviews: number;
  };
}

async function fetchMaterial(id: string): Promise<MaterialDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/materials/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const ROWS: { label: string; render: (m: MaterialDetail) => React.ReactNode }[] = [
  { label: 'Price', render: (m) => `₹${Number(m.price).toLocaleString('en-IN')} / ${m.unit}` },
  { label: 'Category', render: (m) => `${m.category} — ${m.subcategory}` },
  { label: 'Supplier', render: (m) => m.supplier?.businessName ?? '—' },
  {
    label: 'Quality Check',
    render: (m) => (m.supplier?.approvalStatus === 'APPROVED' ? '✓ Verified supplier' : 'Pending verification'),
  },
  {
    label: 'Rating',
    render: (m) => (m.supplier?.totalReviews ? `★ ${m.supplier.avgRating.toFixed(1)} (${m.supplier.totalReviews} reviews)` : 'No reviews yet'),
  },
  { label: 'Stock', render: (m) => (m.stock > 0 ? `${m.stock} available` : 'Out of stock') },
];

export default async function MaterialsComparePage({ searchParams }: { searchParams: { ids?: string } }) {
  const ids = (searchParams.ids ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3);

  if (ids.length < 2) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-4xl mb-4">⚖️</p>
          <p className="text-lg font-semibold text-[#2C1810] mb-2">Pick at least 2 materials to compare</p>
          <p className="text-sm text-[#6B5248] mb-6">
            Go to the materials list, tick &ldquo;Compare&rdquo; on a couple of products, then hit Compare.
          </p>
          <Link href="/materials" className="text-[#C0593A] font-semibold hover:underline">Browse Materials →</Link>
        </div>
      </div>
    );
  }

  const materials = (await Promise.all(ids.map(fetchMaterial))).filter((m): m is MaterialDetail => !!m);

  if (materials.length < 2) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-[#2C1810] mb-2">Some of these materials couldn&apos;t be found</p>
          <Link href="/materials" className="text-[#C0593A] font-semibold hover:underline">Browse Materials →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-[#2C1810] mb-6" style={{ fontFamily: 'Georgia, serif' }}>Compare Materials</h1>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-2xl border border-[#EBE0D8] shadow-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-[#A08070] uppercase p-4 w-32">&nbsp;</th>
                {materials.map((m) => (
                  <th key={m.id} className="text-left p-4 border-l border-[#EBE0D8] min-w-[180px]">
                    <Link href={`/materials/${m.id}`} className="font-semibold text-[#2C1810] hover:text-[#C0593A]">
                      {m.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t border-[#EBE0D8]">
                  <td className="text-xs font-semibold text-[#A08070] uppercase p-4">{row.label}</td>
                  {materials.map((m) => (
                    <td key={m.id} className="text-sm text-[#2C1810] p-4 border-l border-[#EBE0D8]">{row.render(m)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Link href="/materials" className="inline-block mt-6 text-sm font-semibold text-[#C0593A] hover:underline">
          ← Back to Materials
        </Link>
      </div>
    </div>
  );
}
