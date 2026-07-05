'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FAQ, FAQ_CATEGORIES } from '@/lib/faq-data';

export default function HelpCenterPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [openQ, setOpenQ] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return FAQ.filter((f) => {
      if (category !== 'All' && f.category !== category) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q) || f.keywords.some((k) => k.includes(q));
    });
  }, [query, category]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof FAQ>();
    for (const f of filtered) {
      if (!map.has(f.category)) map.set(f.category, []);
      map.get(f.category)!.push(f);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-16 text-center">
        <div className="max-w-[700px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            How can we help?
          </h1>
          <p className="text-[#6B5248] text-base mb-6">
            Search our FAQ, or use the chat bubble in the corner for an instant answer.
          </p>
          <div className="relative max-w-lg mx-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search — e.g. &ldquo;how do I post a project&rdquo;"
              className="w-full pl-5 pr-4 py-3.5 border border-[#EBE0D8] rounded-2xl text-[#2C1810] placeholder-[#A08070] focus:outline-none focus:border-[#C0593A] focus:ring-2 focus:ring-[#C0593A]/10 bg-[#FDF8F5] focus:bg-white transition-all"
            />
          </div>
        </div>
      </section>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setCategory('All')}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${category === 'All' ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}
          >
            All
          </button>
          {FAQ_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${category === c ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {grouped.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-[#2C1810] mb-1">No matching questions</p>
            <p className="text-sm text-[#6B5248]">
              Try different words, or{' '}
              <Link href="/contact" className="text-[#C0593A] hover:underline font-semibold">contact us</Link> directly.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(([cat, items]) => (
              <div key={cat}>
                <p className="text-sm font-bold text-[#2C1810] mb-3">{cat}</p>
                <div className="space-y-2">
                  {items.map((f) => {
                    const isOpen = openQ === f.question;
                    return (
                      <div key={f.question} className="bg-white rounded-2xl border border-[#EBE0D8] overflow-hidden">
                        <button
                          onClick={() => setOpenQ(isOpen ? null : f.question)}
                          className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                        >
                          <span className="text-sm font-semibold text-[#2C1810]">{f.question}</span>
                          <span className={`text-[#A08070] shrink-0 transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        {isOpen && (
                          <p className="px-5 pb-4 text-sm text-[#6B5248] leading-relaxed">{f.answer}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 bg-white rounded-2xl border border-[#EBE0D8] p-6 text-center">
          <p className="text-sm text-[#6B5248] mb-3">Still stuck?</p>
          <Link href="/contact" className="text-[#C0593A] font-semibold hover:underline">Contact our team →</Link>
        </div>
      </div>
    </div>
  );
}
