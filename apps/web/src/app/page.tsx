// Griffy — Landing Page
// Drop this file into: apps/web/src/app/page.tsx
// Requires Tailwind CSS. Add custom colors to tailwind.config.ts (see bottom of file).

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5] font-sans">

      {/* ── NAV ── */}
      <nav className="bg-white border-b border-[#EBE0D8] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C0593A] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <span className="text-[#2C1810] text-base font-bold tracking-tight">Griffy</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/materials" className="text-[#6B5248] text-sm hover:text-[#C0593A] transition-colors">Materials</Link>
            <Link href="/services" className="text-[#6B5248] text-sm hover:text-[#C0593A] transition-colors">Services</Link>
            <Link href="/how-it-works" className="text-[#6B5248] text-sm hover:text-[#C0593A] transition-colors">How it works</Link>
            <Link href="/sell" className="text-[#A08070] text-xs underline decoration-dashed underline-offset-4 hover:text-[#C0593A] transition-colors">
              Sell on Griffy
            </Link>
            <Link
              href="/signup"
              className="bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
            >
              Get started
            </Link>
          </div>
          {/* Mobile nav CTA */}
          <Link
            href="/signup"
            className="md:hidden bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-14 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded mb-5">
            <span>🏠</span> For homemakers across India
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C1810] leading-tight mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Build your{" "}
            <em className="not-italic text-[#C0593A]">dream home</em>{" "}
            with people who care
          </h1>
          <p className="text-[#6B5248] text-base leading-relaxed mb-8 max-w-md mx-auto">
            Find verified contractors and architects. Shop construction materials delivered straight to your site — no middlemen, no surprises.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contractors"
              className="bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm px-6 py-3 rounded-md flex items-center gap-2 transition-colors"
            >
              <span>🔨</span> Find a contractor
            </Link>
            <Link
              href="/materials"
              className="bg-white hover:border-[#C0593A] hover:text-[#C0593A] text-[#2C1810] text-sm border border-[#D4B5A0] px-5 py-3 rounded-md flex items-center gap-2 transition-colors"
            >
              <span>📦</span> Shop materials
            </Link>
            <Link
              href="/turnkey"
              className="bg-white hover:border-[#C0593A] hover:text-[#C0593A] text-[#2C1810] text-sm border border-[#D4B5A0] px-5 py-3 rounded-md flex items-center gap-2 transition-colors"
            >
              <span>🗝️</span> Go turnkey
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5">
            {[
              { icon: "✅", label: "Verified pros" },
              { icon: "🚚", label: "Doorstep delivery" },
              { icon: "⭐", label: "Rated & reviewed" },
              { icon: "🔒", label: "Secure payments" },
            ].map((t) => (
              <span key={t.label} className="flex items-center gap-1.5 text-xs text-[#A08070]">
                <span className="text-[#C0593A]">{t.icon}</span> {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEARCH ── */}
      <section className="bg-white border-b border-[#EBE0D8] px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 bg-[#FDF8F5] border-2 border-[#E8C4B0] rounded-xl px-5 py-3">
            <span className="text-[#C0593A] text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search contractors, architects, tiles, cement..."
              className="flex-1 bg-transparent text-sm text-[#2C1810] placeholder-[#B09080] outline-none"
            />
            <button className="text-xs font-semibold text-[#C0593A] whitespace-nowrap flex items-center gap-1">
              📍 Near me ▾
            </button>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-[#FDF8F5] px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-4">Browse by category</p>
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="bg-white border border-[#EBE0D8] rounded-xl p-3 md:p-4 text-center hover:border-[#C0593A] hover:bg-[#FAEEE9] transition-all group"
              >
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="text-xs font-semibold text-[#2C1810] leading-snug">{cat.name}</div>
                <div className="text-[10px] text-[#A08070] mt-1">{cat.count}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── DELIVERY BAND ── */}
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto bg-[#FAEEE9] border border-[#E8C4B0] rounded-xl p-6 flex gap-5 items-start">
          <span className="text-4xl flex-shrink-0 mt-1">🚚</span>
          <div>
            <h3 className="text-base font-bold text-[#2C1810] mb-1">Materials delivered straight to your site</h3>
            <p className="text-sm text-[#6B5248] leading-relaxed">
              Order from our catalog and we deliver directly to your construction site anywhere in India. No store runs, no middlemen, no markup.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { icon: "⏱", label: "2–5 day delivery" },
                { icon: "📦", label: "Bulk orders welcome" },
                { icon: "🔄", label: "7-day returns" },
                { icon: "📍", label: "Pan India" },
              ].map((b) => (
                <span
                  key={b.label}
                  className="bg-white text-[#9E3F24] text-xs font-medium px-3 py-1.5 rounded border border-[#E8C4B0] flex items-center gap-1.5"
                >
                  <span>{b.icon}</span> {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO WAYS ── */}
      <section className="bg-white border-t border-b border-[#EBE0D8] px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-1">Two ways to build</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-1" style={{ fontFamily: "Georgia, serif" }}>Pick what works for you</h2>
          <p className="text-sm text-[#6B5248] mb-6 leading-relaxed">Buy materials yourself and manage the build, or hand everything to a verified contractor.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-[#EBE0D8] rounded-xl p-5 bg-white">
              <div className="text-2xl mb-3">🛍️</div>
              <h3 className="text-sm font-bold text-[#2C1810] mb-2">Buy materials</h3>
              <p className="text-xs text-[#6B5248] leading-relaxed mb-4">Order and get delivered to your site. You manage the build at your own pace.</p>
              <ul className="space-y-2">
                {["Wide catalog, best prices", "Doorstep delivery", "Bulk discounts", "Compare brands & specs"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[#6B5248]">
                    <span className="text-[#C0593A] mt-0.5 flex-shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-2 border-[#C0593A] rounded-xl p-5 bg-[#FAEEE9]">
              <div className="text-2xl mb-3">🗝️</div>
              <h3 className="text-sm font-bold text-[#2C1810] mb-2">Go turnkey</h3>
              <p className="text-xs text-[#6B5248] leading-relaxed mb-4">One contractor handles materials, labour, and delivery end to end.</p>
              <ul className="space-y-2">
                {["Single point of contact", "Milestone-based payments", "Real-time progress tracking", "Quality guarantee"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[#6B5248]">
                    <span className="text-[#C0593A] mt-0.5 flex-shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white px-6 py-10 border-b border-[#EBE0D8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-1">How it works</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-1" style={{ fontFamily: "Georgia, serif" }}>From idea to move-in, simplified</h2>
          <p className="text-sm text-[#6B5248] mb-8 leading-relaxed">Three steps whether you're buying materials or booking a full build.</p>
          <div className="space-y-6">
            {STEPS.map((step) => (
              <div key={step.num} className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-[#C0593A] text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#2C1810] mb-1">{step.title}</h3>
                  <p className="text-sm text-[#6B5248] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP RATED ── */}
      <section className="bg-white px-6 py-10 border-b border-[#EBE0D8]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-1">Top-rated this week</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-6" style={{ fontFamily: "Georgia, serif" }}>Trusted by homemakers across India</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROVIDERS.map((p) => (
              <Link
                key={p.name}
                href={`/providers/${p.slug}`}
                className="bg-white border border-[#EBE0D8] rounded-xl p-4 hover:border-[#C0593A] transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FAEEE9] border border-[#E8C4B0] flex items-center justify-center text-sm font-bold text-[#9E3F24] flex-shrink-0">
                    {p.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#2C1810]">{p.name}</div>
                    <div className="text-xs text-[#A08070]">{p.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#6B5248] mb-3">
                  <span className="text-[#E8922A]">★</span> {p.rating} · {p.reviews} reviews
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-[#FAEEE9] text-[#9E3F24] border border-[#E8C4B0] px-2 py-0.5 rounded font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="px-6 py-10">
        <div className="max-w-3xl mx-auto bg-[#F7F1EC] border border-[#EBE0D8] rounded-xl p-6">
          <div className="grid grid-cols-3 gap-4 pb-5 mb-5 border-b border-[#EBE0D8]">
            {[
              { num: "4,200+", label: "Projects done" },
              { num: "680+", label: "Verified pros" },
              { num: "4.8★", label: "Avg. rating" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-[#C0593A]">{s.num}</div>
                <div className="text-xs text-[#A08070] mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#EBE0D8]">
            <p className="text-sm text-[#6B5248] leading-relaxed italic mb-4">
              "Found our contractor through Griffy in two days. Ordered all tiles and sanitary ware — delivered to the site in 3 days. Saved us weeks of running around to different shops."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C0593A] text-white text-xs font-bold flex items-center justify-center">NK</div>
              <div>
                <div className="text-sm font-semibold text-[#2C1810]">Nisha Kapoor</div>
                <div className="text-xs text-[#A08070]">3BHK construction · Gurugram</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SELLER BAND ── */}
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto bg-white border border-[#EBE0D8] rounded-xl p-5 flex gap-4 items-center">
          <div className="w-12 h-12 bg-[#FAEEE9] border border-[#E8C4B0] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            🏪
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#2C1810] mb-1">Sell construction materials on Griffy</h3>
            <p className="text-xs text-[#6B5248] leading-relaxed mb-3">
              List your products and reach homemakers and contractors across India. Zero listing fees to start.
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#C0593A] border border-[#C0593A] px-3 py-1.5 rounded hover:bg-[#FAEEE9] transition-colors"
            >
              Start selling for free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto bg-[#C0593A] rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
            Ready to start building?
          </h2>
          <p className="text-sm text-white/80 leading-relaxed mb-6 max-w-sm mx-auto">
            Join thousands of homemakers who found the right people and materials — on time, within budget.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#9E3F24] font-bold text-sm px-7 py-3 rounded-md hover:bg-[#FAEEE9] transition-colors"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#5C4A3A] border-t border-white/10 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#C0593A] rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span className="text-white/40 text-xs">Griffy © 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-white/40 text-xs hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-white/40 text-xs hover:text-white/70 transition-colors">Terms</Link>
            <Link href="/contact" className="text-white/40 text-xs hover:text-white/70 transition-colors">Contact</Link>
            <Link href="/sell" className="text-[#E8A98E] text-xs font-semibold hover:text-white transition-colors">Sell on Griffy →</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ── DATA ──

const CATEGORIES = [
  { name: "Contractors", icon: "🏗️", count: "240+ listed", href: "/contractors" },
  { name: "Architects", icon: "📐", count: "80+ listed", href: "/architects" },
  { name: "Cement & steel", icon: "🧱", count: "50+ brands", href: "/materials/cement" },
  { name: "Tiles & flooring", icon: "🪵", count: "300+ items", href: "/materials/tiles" },
  { name: "Sanitary ware", icon: "🚿", count: "200+ items", href: "/materials/sanitary" },
  { name: "Electricals", icon: "⚡", count: "180+ items", href: "/materials/electricals" },
  { name: "Doors & windows", icon: "🚪", count: "100+ items", href: "/materials/doors" },
  { name: "Hardware & tools", icon: "🔧", count: "400+ items", href: "/materials/hardware" },
];

const STEPS = [
  {
    num: 1,
    title: "Describe your project",
    desc: "Tell us what you're building — new home, renovation, or interiors. Set your budget and location.",
  },
  {
    num: 2,
    title: "Get matched with pros or order materials",
    desc: "Browse vetted contractors and architects near you, or add materials to cart for doorstep delivery.",
  },
  {
    num: 3,
    title: "Pay safely, track everything",
    desc: "Milestone payments for services — money releases only when you approve. Real-time tracking for deliveries.",
  },
];

const PROVIDERS = [
  { name: "Rajesh Sharma", initials: "RS", role: "Civil contractor · Delhi NCR", rating: "4.9", reviews: "63", tags: ["New construction", "Renovation"], slug: "rajesh-sharma" },
  { name: "Priya Mehta", initials: "PM", role: "Architect · Mumbai", rating: "4.8", reviews: "41", tags: ["Interior design", "3D plans"], slug: "priya-mehta" },
  { name: "Anil Kumar", initials: "AK", role: "Electrician · Bangalore", rating: "4.7", reviews: "88", tags: ["Wiring", "Solar setup"], slug: "anil-kumar" },
  { name: "Suresh Verma", initials: "SV", role: "Plumber · Pune", rating: "4.9", reviews: "52", tags: ["Sanitary", "Waterproofing"], slug: "suresh-verma" },
];

/*
── TAILWIND CONFIG (tailwind.config.ts) ──
Add these to your theme.extend.colors:

colors: {
  terracotta: {
    DEFAULT: '#C0593A',
    dark:    '#9E3F24',
    deeper:  '#7A2E18',
    light:   '#FAEEE9',
    mid:     '#E8A98E',
  },
  sand: {
    warm:  '#FDF8F5',
    stone: '#F7F1EC',
  },
  brown: {
    deep:   '#2C1810',
    mid:    '#6B5248',
    muted:  '#A08070',
    border: '#EBE0D8',
    stone:  '#5C4A3A',
  },
}
*/
