'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchByType, type SearchResult, type SearchType } from '@/lib/search';
import { SkeletonListRows } from '@/components/Skeleton';

type Tab = 'all' | SearchType;

const POPULAR = ['electrician', 'plumber', 'cement', 'mason', 'painter', 'TMT steel', 'civil contractor'];
const CATEGORIES = [
  { label: 'Sand & Aggregate', emoji: '🏖️', href: '/materials' },
  { label: 'Bricks & Blocks', emoji: '🧱', href: '/materials' },
  { label: 'Find Contractors', emoji: '🏗️', href: '/contractors' },
  { label: 'Labour & Mistri', emoji: '👷', href: '/labour' },
  { label: 'Service Experts', emoji: '⚡', href: '/service-experts' },
  { label: 'Properties', emoji: '🏠', href: '/properties' },
];

const GROUP_DEFS: { key: SearchType; label: string }[] = [
  { key: 'materials', label: 'Materials' },
  { key: 'contractors', label: 'Contractors' },
  { key: 'labour', label: 'Labour' },
  { key: 'experts', label: 'Service Experts' },
  { key: 'properties', label: 'Properties' },
  { key: 'lands', label: 'Land' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [input, setInput] = useState(searchParams.get('q') ?? '');
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<SearchType, { items: SearchResult[]; total: number }>>({
    materials: { items: [], total: 0 },
    contractors: { items: [], total: 0 },
    labour: { items: [], total: 0 },
    experts: { items: [], total: 0 },
    properties: { items: [], total: 0 },
    lands: { items: [], total: 0 },
  });

  const searched = query.trim().length > 0;
  const total = GROUP_DEFS.reduce((sum, g) => sum + results[g.key].total, 0);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    Promise.all(GROUP_DEFS.map((g) => searchByType(query, g.key, 1, 20)))
      .then((pages) => {
        const next = {} as Record<SearchType, { items: SearchResult[]; total: number }>;
        GROUP_DEFS.forEach((g, i) => { next[g.key] = { items: pages[i].items, total: pages[i].total }; });
        setResults(next);
      })
      .finally(() => setLoading(false));
  }, [query]);

  function runSearch(term?: string) {
    const q = (term ?? input).trim();
    if (!q) return;
    setQuery(q);
    setInput(q);
    router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="bg-white border-b border-[#EBE0D8] sticky top-16 z-30 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Search materials, contractors, labour, service experts, properties, land…"
            autoFocus
            className="flex-1 px-4 py-3 border border-[#EBE0D8] rounded-2xl text-[#2C1810] placeholder-[#A08070] focus:outline-none focus:border-[#C0593A] focus:ring-2 focus:ring-[#C0593A]/10 transition-all bg-[#FDF8F5] focus:bg-white"
          />
          <button
            onClick={() => runSearch()}
            className="bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold px-6 rounded-2xl transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!searched ? (
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-[#2C1810] mb-3">Popular on Griffy</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {POPULAR.map((s) => (
                <button
                  key={s}
                  onClick={() => runSearch(s)}
                  className="px-4 py-2 bg-[#FAEEE9] hover:bg-[#F5DFD3] text-[#C0593A] text-sm font-medium rounded-full border border-[#E8C4B0] transition-colors"
                >
                  🔥 {s}
                </button>
              ))}
            </div>
            <p className="text-sm font-bold text-[#2C1810] mb-4">Browse by Category</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#EBE0D8] hover:border-[#D8B8A8] hover:shadow-sm transition-all"
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-sm font-semibold text-[#2C1810]">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setTab('all')}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${tab === 'all' ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#D8B8A8]'}`}
              >
                All ({total})
              </button>
              {GROUP_DEFS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setTab(g.key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${tab === g.key ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8] hover:border-[#D8B8A8]'}`}
                >
                  {g.label} ({results[g.key].total})
                </button>
              ))}
            </div>

            {loading ? (
              <SkeletonListRows count={6} />
            ) : total === 0 ? (
              <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-[#2C1810] mb-1">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-sm text-[#6B5248] mb-4">Try a different keyword, or browse a category below.</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      className="px-3 py-1.5 bg-[#FAEEE9] hover:bg-[#F5DFD3] text-[#C0593A] text-xs font-semibold rounded-full border border-[#E8C4B0] transition-colors"
                    >
                      {cat.emoji} {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {GROUP_DEFS
                  .filter((g) => tab === 'all' || tab === g.key)
                  .filter((g) => results[g.key].items.length > 0)
                  .map((g) => (
                    <div key={g.key}>
                      <p className="text-sm font-bold text-[#2C1810] mb-3">{g.label} ({results[g.key].total})</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {results[g.key].items.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#EBE0D8] hover:border-[#D8B8A8] hover:shadow-sm transition-all"
                          >
                            <span className="text-2xl shrink-0">{item.emoji}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#2C1810] truncate">{item.title}</p>
                              <p className="text-xs text-[#A08070] truncate">{item.subtitle}</p>
                              {item.price && <p className="text-xs font-bold text-[#C0593A] mt-0.5">{item.price}</p>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDF8F5]" />}>
      <SearchContent />
    </Suspense>
  );
}
