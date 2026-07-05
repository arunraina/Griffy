'use client';

import Link from 'next/link';

interface Tool {
  href: string;
  icon: string;
  title: string;
  desc: string;
}

const TOOLS: Tool[] = [
  { href: '/estimate/cost', icon: '🧮', title: 'Cost Calculator', desc: 'Whole-project cost breakdown by type, area, and quality.' },
  { href: '/estimate/bricks', icon: '🧱', title: 'Bricks', desc: 'Brick count, cement & sand for a wall.' },
  { href: '/estimate/concrete', icon: '🏗️', title: 'Concrete', desc: 'Cement, sand & aggregate for a slab.' },
  { href: '/estimate/plaster', icon: '🪣', title: 'Plaster', desc: 'Cement & sand for wall plastering.' },
  { href: '/estimate/flooring', icon: '🏠', title: 'Flooring', desc: 'Tile count, adhesive & grout for a room.' },
  { href: '/estimate/paint', icon: '🎨', title: 'Paint', desc: 'Putty, primer & paint for your walls.' },
  { href: '/estimate/steel', icon: '🔩', title: 'Steel', desc: 'TMT steel reinforcement for a slab.' },
];

export default function EstimateHubClient() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="bg-white border-b border-[#EBE0D8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            🧮 Free Estimators
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Plan Your Construction — Free Estimators
          </h1>
          <p className="text-[#6B5248] text-base leading-relaxed max-w-xl mx-auto">
            Ballpark quantities and costs before you talk to a single contractor — pick a tool below.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 hover:border-[#D8B8A8] hover:shadow-md transition-all"
            >
              <span className="text-3xl mb-3 block">{t.icon}</span>
              <h2 className="font-bold text-[#2C1810] mb-1.5">{t.title}</h2>
              <p className="text-sm text-[#6B5248] leading-relaxed">{t.desc}</p>
              <span className="inline-block mt-3 text-sm font-semibold text-[#C0593A]">Open →</span>
            </Link>
          ))}
        </div>

        <p className="text-xs text-[#A08070] text-center mt-10 max-w-lg mx-auto">
          All estimates are thumb-rule approximations based on standard Indian construction practices — actual
          requirements vary by site, material brand, and (for structural work) your engineer&apos;s design.
        </p>
      </div>
    </div>
  );
}
