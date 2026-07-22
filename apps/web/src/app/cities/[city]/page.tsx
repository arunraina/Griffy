import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

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
  return buildMetadata({
    title: `Contractors & Labour in ${district}`,
    description: `Find verified contractors, labour, service experts, and building materials in ${district}, Jammu & Kashmir.`,
    path: `/cities/${params.city}`,
  });
}

export function generateStaticParams() {
  return DISTRICTS.map((d) => ({ city: d.toLowerCase() }));
}

const CATEGORIES = [
  { emoji: '🔨', label: 'Contractors', hrefBase: '/contractors', key: 'contractors' as const },
  { emoji: '👷', label: 'Labour', hrefBase: '/labour', key: 'labour' as const },
  { emoji: '⚡', label: 'Service Experts', hrefBase: '/service-experts', key: 'experts' as const },
  { emoji: '🧱', label: 'Materials', hrefBase: '/materials', key: null },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function fetchCityCounts(district: string) {
  const [contractors, labour, experts] = await Promise.all([
    fetch(`${API_BASE}/contractor-profiles?city=${encodeURIComponent(district)}`, { next: { revalidate: 300 } })
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []),
    fetch(`${API_BASE}/labour-profiles?city=${encodeURIComponent(district)}`, { next: { revalidate: 300 } })
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []),
    fetch(`${API_BASE}/service-expert-profiles?city=${encodeURIComponent(district)}`, { next: { revalidate: 300 } })
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []),
  ]);

  return {
    contractors: Array.isArray(contractors) ? contractors.length : 0,
    labour: Array.isArray(labour) ? labour.length : 0,
    experts: Array.isArray(experts) ? experts.length : 0,
  };
}

export default async function CityPage({ params }: { params: { city: string } }) {
  const district = findDistrict(params.city);
  if (!district) notFound();

  const counts = await fetchCityCounts(district);
  const totalPros = counts.contractors + counts.labour + counts.experts;

  const countByKey: Record<'contractors' | 'labour' | 'experts', number> = counts;

  const faqs = [
    {
      q: `Is Griffy available in ${district}?`,
      a: `Yes. Griffy operates across ${district}, Jammu & Kashmir, connecting homeowners with verified contractors, labour, service experts, and building material suppliers.`,
    },
    {
      q: `How many contractors are listed in ${district}?`,
      a: totalPros > 0
        ? `There are currently ${counts.contractors} verified contractor${counts.contractors === 1 ? '' : 's'}, ${counts.labour} labour professional${counts.labour === 1 ? '' : 's'}, and ${counts.experts} service expert${counts.experts === 1 ? '' : 's'} listed for ${district} on Griffy.`
        : `Griffy is actively onboarding verified professionals in ${district} — check back soon, or browse nearby districts.`,
    },
    {
      q: `How do I contact a contractor in ${district}?`,
      a: `Browse contractors in ${district}, view their profile, ratings, and past reviews, then reach out directly through Griffy to discuss your project.`,
    },
    {
      q: `Is it free to browse professionals on Griffy?`,
      a: `Yes, browsing contractor, labour, and service expert profiles on Griffy is completely free for homeowners.`,
    },
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://griffy.in' },
      { '@type': 'ListItem', position: 2, name: 'Cities', item: 'https://griffy.in/cities' },
      { '@type': 'ListItem', position: 3, name: district, item: `https://griffy.in/cities/${params.city}` },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const otherDistricts = DISTRICTS.filter((d) => d !== district);

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-16 text-center">
        <div className="max-w-[700px] mx-auto">
          <Link href="/cities" className="text-xs text-[#A08070] hover:text-[#C0593A]">← All Cities</Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mt-3 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Contractors &amp; Materials in {district}
          </h1>
          <p className="text-[#6B5248] text-base">
            {totalPros > 0
              ? `${totalPros} verified professional${totalPros === 1 ? '' : 's'} and building material suppliers, ready to help with your project in ${district}, Jammu & Kashmir.`
              : `Verified professionals and building materials, filtered for ${district}, Jammu & Kashmir.`}
          </p>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              href={c.key ? `${c.hrefBase}?city=${encodeURIComponent(district)}` : c.hrefBase}
              className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 flex items-center gap-4 hover:border-[#C0593A] transition-colors"
            >
              <span className="text-3xl">{c.emoji}</span>
              <div>
                <p className="font-semibold text-[#2C1810]">{c.label} in {district}</p>
                <p className="text-sm text-[#6B5248]">
                  {c.key ? `${countByKey[c.key]} listed →` : `Browse ${c.label.toLowerCase()} →`}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="text-xl font-bold text-[#2C1810] mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-white rounded-xl border border-[#EBE0D8] p-5">
                <p className="font-semibold text-[#2C1810] mb-1.5">{f.q}</p>
                <p className="text-sm text-[#6B5248]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Also estimate your project cost
          </h2>
          <div className="flex flex-wrap gap-2 mb-8">
            <Link href="/estimate/cost" className="text-sm text-[#C0593A] hover:underline">Construction cost calculator</Link>
            <span className="text-[#EBE0D8]">·</span>
            <Link href="/estimate/bricks" className="text-sm text-[#C0593A] hover:underline">Brick calculator</Link>
            <span className="text-[#EBE0D8]">·</span>
            <Link href="/estimate/concrete" className="text-sm text-[#C0593A] hover:underline">Concrete calculator</Link>
            <span className="text-[#EBE0D8]">·</span>
            <Link href="/estimate/paint" className="text-sm text-[#C0593A] hover:underline">Paint calculator</Link>
          </div>

          <h2 className="text-xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Nearby districts
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherDistricts.map((d) => (
              <Link
                key={d}
                href={`/cities/${d.toLowerCase()}`}
                className="text-sm text-[#6B5248] bg-white border border-[#EBE0D8] rounded-full px-3 py-1 hover:border-[#C0593A] hover:text-[#C0593A]"
              >
                {d}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
