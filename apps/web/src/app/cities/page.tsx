import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Browse by City — Griffy',
  description: 'Find contractors, labour, and materials in your district across Jammu & Kashmir.',
};

const DISTRICTS = [
  'Srinagar', 'Baramulla', 'Anantnag', 'Sopore', 'Pulwama', 'Budgam',
  'Kupwara', 'Bandipora', 'Ganderbal', 'Kulgam', 'Shopian', 'Ramban',
];

export default function CitiesHubPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-16 text-center">
        <div className="max-w-[700px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Browse by City
          </h1>
          <p className="text-[#6B5248] text-base">
            Contractors, labour, and materials — filtered for your district.
          </p>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {DISTRICTS.map((district) => (
            <Link
              key={district}
              href={`/cities/${encodeURIComponent(district.toLowerCase())}`}
              className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 text-center hover:border-[#C0593A] transition-colors"
            >
              <p className="text-2xl mb-2">📍</p>
              <p className="font-semibold text-[#2C1810]">{district}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
