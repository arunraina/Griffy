import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const DISTRICTS = [
  'Srinagar', 'Baramulla', 'Anantnag', 'Sopore', 'Pulwama', 'Budgam',
  'Kupwara', 'Bandipora', 'Ganderbal', 'Kulgam', 'Shopian', 'Ramban',
];

function findDistrict(slug: string): string | undefined {
  return DISTRICTS.find((d) => d.toLowerCase() === decodeURIComponent(slug).toLowerCase());
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const district = findDistrict(params.city);
  if (!district) return {};
  return {
    title: `Contractors & Labour in ${district} — Griffy`,
    description: `Find verified contractors, labour, service experts, and building materials in ${district}, Jammu & Kashmir.`,
  };
}

export function generateStaticParams() {
  return DISTRICTS.map((d) => ({ city: d.toLowerCase() }));
}

const CATEGORIES = [
  { emoji: '🔨', label: 'Contractors', hrefBase: '/contractors', cityParam: true },
  { emoji: '👷', label: 'Labour', hrefBase: '/labour', cityParam: true },
  { emoji: '⚡', label: 'Service Experts', hrefBase: '/service-experts', cityParam: true },
  { emoji: '🧱', label: 'Materials', hrefBase: '/materials', cityParam: false },
];

export default function CityPage({ params }: { params: { city: string } }) {
  const district = findDistrict(params.city);
  if (!district) notFound();

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-16 text-center">
        <div className="max-w-[700px] mx-auto">
          <Link href="/cities" className="text-xs text-[#A08070] hover:text-[#C0593A]">← All Cities</Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mt-3 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Contractors &amp; Materials in {district}
          </h1>
          <p className="text-[#6B5248] text-base">
            Verified professionals and building materials, filtered for {district}, Jammu &amp; Kashmir.
          </p>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              href={c.cityParam ? `${c.hrefBase}?city=${encodeURIComponent(district)}` : c.hrefBase}
              className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 flex items-center gap-4 hover:border-[#C0593A] transition-colors"
            >
              <span className="text-3xl">{c.emoji}</span>
              <div>
                <p className="font-semibold text-[#2C1810]">{c.label} in {district}</p>
                <p className="text-sm text-[#6B5248]">Browse {c.label.toLowerCase()} →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
