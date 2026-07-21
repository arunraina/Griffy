'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchAll, type GroupedSearchResults } from '@/lib/search';

const GROUP_LABELS: Record<keyof GroupedSearchResults, string> = {
  contractors: 'Contractors',
  labour: 'Labour',
  experts: 'Service Experts',
  materials: 'Materials',
  properties: 'Properties',
  lands: 'Land',
};

export default function SearchBar() {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupedSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults(null); return; }
    setLoading(true);
    const t = setTimeout(() => {
      searchAll(query).then(setResults).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goToResults() {
    const q = query.trim();
    if (!q) return;
    setFocused(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const groups = results
    ? (Object.keys(results) as (keyof GroupedSearchResults)[]).filter((k) => results[k].length > 0)
    : [];

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center bg-[#FAEEE9] rounded-lg overflow-hidden w-52 lg:w-64">
        <span className="pl-3 text-gray-500 text-sm shrink-0">🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => e.key === 'Enter' && goToResults()}
          placeholder="Search Griffy…"
          className="flex-1 bg-transparent pl-2 pr-3 py-2 text-sm text-[#2C1810] placeholder-[#A08070] focus:outline-none min-w-0"
        />
      </div>

      {focused && query.trim() && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <div className="bg-white border border-[#EBE0D8] rounded-xl shadow-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-sm text-[#A08070] px-4 py-6 text-center">Searching…</p>
              ) : groups.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-[#6B5248]">No results for &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                groups.map((key) => (
                  <div key={key} className="border-b border-[#F5EFEA] last:border-b-0">
                    <p className="px-4 pt-3 pb-1 text-[11px] font-bold text-[#A08070] uppercase tracking-wide">
                      {GROUP_LABELS[key]}
                    </p>
                    {results![key].map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setFocused(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FAEEE9] transition-colors"
                      >
                        <span className="text-lg shrink-0">{item.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#2C1810] truncate">{item.title}</p>
                          <p className="text-xs text-[#A08070] truncate">{item.subtitle}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ))
              )}
            </div>
            {groups.length > 0 && (
              <button
                onClick={goToResults}
                className="w-full text-center text-xs font-semibold text-[#C0593A] hover:underline py-3 border-t border-[#F0E8E2]"
              >
                View all results →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
