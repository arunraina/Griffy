import type { Metadata } from 'next';
import Link from 'next/link';
import { SEO_KEYWORDS } from '@/lib/seo';
import { isEnabled, isSubEnabled } from '@/lib/featureFlags';
import { HomePriceTicker, CostCalculator } from './_components/HomeClientSections';

export const metadata: Metadata = {
  title: 'Griffy — Build Your Home with Trusted Contractors & Materials',
  description: 'India\'s one-stop construction platform. Find verified contractors, hire skilled labour, book service experts, source building materials at best prices and discover land — all in one place. Serving 100+ cities.',
  keywords: [
    ...SEO_KEYWORDS.global,
    ...SEO_KEYWORDS.near_me,
    ...SEO_KEYWORDS.construction_cost,
    ...SEO_KEYWORDS.cement_price,
    ...SEO_KEYWORDS.steel_price,
    ...SEO_KEYWORDS.land_price,
    ...SEO_KEYWORDS.contractors,
    ...SEO_KEYWORDS.kashmir,
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">

      {/* ── SECTION 1: HERO ── */}
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-20 text-center">
        <div className="max-w-[700px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            🏠 For homeowners across India
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C1810] leading-tight mb-5"
            style={{ fontFamily: 'Georgia, serif' }}>
            Build your dream home with{' '}
            <em className="not-italic text-[#C0593A]">trusted professionals</em>
          </h1>
          <p className="text-[#6B5248] text-base leading-relaxed mb-8 max-w-xl mx-auto">
            India's one-stop platform for construction — find contractors, hire labour, book service experts, source materials and discover land
          </p>

          {/* Primary CTA */}
          <Link href="/signup"
            className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold text-base px-10 py-4 rounded-xl transition-colors shadow-sm mb-6">
            Get Started Free
          </Link>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-gray-500 mb-8">
            {([
              isEnabled('contractors')     && { label: 'Find Contractors', href: '/contractors' },
              isEnabled('labour')          && { label: 'Hire Labour',      href: '/labour' },
              isEnabled('service_experts') && { label: 'Book Experts',     href: '/service-experts' },
              isEnabled('materials')       && { label: 'Materials',        href: '/materials' },
              (isEnabled('land') && !isEnabled('properties')) && { label: 'Land', href: '/land' },
              (isEnabled('properties') && isSubEnabled('properties', 'buy_home'))  && { label: 'Buy Home', href: '/properties?tab=buy' },
              (isEnabled('properties') && isSubEnabled('properties', 'rent_home')) && { label: 'Rent',     href: '/properties?tab=rent' },
            ].filter(Boolean) as { label: string; href: string }[]).map((link, i, arr) => (
              <span key={link.label} className="flex items-center gap-3">
                <Link href={link.href} className="hover:text-[#C0593A] transition-colors font-medium">
                  {link.label}
                </Link>
                {i < arr.length - 1 && <span className="text-gray-300">·</span>}
              </span>
            ))}
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: '✅', label: 'Verified Professionals' },
              { icon: '🚚', label: 'Pan India Delivery' },
              { icon: '⭐', label: 'Rated & Reviewed' },
              { icon: '🔒', label: 'Secure Payments' },
            ].map(t => (
              <span key={t.label} className="flex items-center gap-1.5 text-xs text-[#A08070]">
                <span>{t.icon}</span> {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: 5 SERVICE CARDS ── */}
      <section className="px-6 py-16">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2 text-center">Our Services</p>
          <h2 className="text-3xl font-bold text-[#2C1810] mb-3 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            What are you looking for?
          </h2>
          <p className="text-sm text-[#6B5248] text-center mb-10">
            Everything you need to build, renovate or buy
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            {SERVICE_CARDS.slice(0, 3).map(card => (
              <ServiceCard key={card.title} {...card} />
            ))}
          </div>
          {SERVICE_CARDS.slice(3).length > 0 && (
            <div className={[
              'grid grid-cols-1 gap-5',
              SERVICE_CARDS.slice(3).length === 1 ? 'sm:grid-cols-1' :
              SERVICE_CARDS.slice(3).length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
            ].join(' ')}>
              {SERVICE_CARDS.slice(3).map(card => (
                <ServiceCard key={card.title} {...card} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ── */}
      <section className="bg-white border-y border-[#EBE0D8] px-6 py-16">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2 text-center">Simple process</p>
          <h2 className="text-3xl font-bold text-[#2C1810] mb-3 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            How Griffy Works
          </h2>
          <p className="text-sm text-[#6B5248] text-center mb-12">
            From requirement to results in three simple steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="bg-white border border-[#EBE0D8] rounded-2xl p-7 text-center hover:border-[#C0593A] hover:shadow-sm transition-all">
                  <div className="w-12 h-12 rounded-full bg-[#C0593A] text-white text-base font-bold flex items-center justify-center mx-auto mb-4">
                    {step.num}
                  </div>
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-base font-bold text-[#2C1810] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#6B5248] leading-relaxed">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 w-8 h-8 bg-[#FDF8F5] border border-[#EBE0D8] rounded-full items-center justify-center">
                    <span className="text-[#C0593A] font-bold text-xs">→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: PRICE TICKER ── */}
      <section className="px-6 py-12">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2">Market rates</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Today's Material Prices
          </h2>
          <p className="text-sm text-[#6B5248] mb-5">Live rates updated daily across India</p>
          <HomePriceTicker />
          <div className="mt-4 text-right">
            <Link href="/materials" className="text-sm text-[#C0593A] hover:underline font-medium">
              View all materials & prices →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: COST CALCULATOR ── */}
      <section className="bg-white border-y border-[#EBE0D8] px-6 py-16">
        <div className="max-w-[900px] mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2 text-center">Free tool</p>
          <h2 className="text-3xl font-bold text-[#2C1810] mb-3 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            Estimate Your Construction Cost
          </h2>
          <p className="text-sm text-[#6B5248] text-center mb-8">
            Get an instant estimate for your home construction project
          </p>
          <CostCalculator />
          <p className="text-center mt-6">
            <Link href="/contractors"
              className="inline-block text-sm font-semibold text-white bg-[#C0593A] hover:bg-[#9E3F24] px-6 py-3 rounded-xl transition-colors">
              Get Exact Quotes from Verified Contractors →
            </Link>
          </p>
        </div>
      </section>

      {/* ── SECTION 6: TRUST BAR ── */}
      <section className="bg-[#C0593A] px-6 py-14">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-white text-center divide-y md:divide-y-0 divide-white/20">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-4xl mb-2">{s.icon}</p>
                <p className="text-3xl font-bold mb-1">{s.value}</p>
                <p className="text-white/80 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: CITY QUICK LINKS ── */}
      <section className="px-6 py-14">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2">Pan India</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Find Contractors, Materials & Properties in Your City
          </h2>
          <p className="text-sm text-[#6B5248] mb-6">Verified professionals, suppliers and real estate listings in 100+ cities</p>

          <p className="text-xs font-semibold text-[#A08070] uppercase tracking-wider mb-3">Contractors & Labour</p>
          <div className="flex flex-wrap gap-3 mb-6">
            {CITIES.map(c => (
              <Link key={c.name} href={`/contractors?city=${encodeURIComponent(c.name)}`}
                className="group flex items-center gap-2 bg-white border border-[#EBE0D8] hover:border-[#C0593A] rounded-xl px-4 py-2.5 text-sm font-medium text-[#3D2B22] hover:text-[#C0593A] transition-all shadow-sm">
                <span>{c.flag}</span> {c.name}
                <span className="text-xs text-[#A08070] group-hover:text-[#C0593A]">{c.count}</span>
              </Link>
            ))}
          </div>

          {isEnabled('properties') && (
            <>
              <p className="text-xs font-semibold text-[#A08070] uppercase tracking-wider mb-3">Properties for Sale &amp; Rent</p>
              <div className="flex flex-wrap gap-3">
                {PROPERTY_CITIES.map(c => (
                  <Link key={c.name} href={`/properties?city=${encodeURIComponent(c.name)}`}
                    className="group flex items-center gap-2 bg-white border border-[#EBE0D8] hover:border-[#C0593A] rounded-xl px-4 py-2.5 text-sm font-medium text-[#3D2B22] hover:text-[#C0593A] transition-all shadow-sm">
                    <span>{c.flag}</span> {c.name}
                    <span className="text-xs text-[#A08070] group-hover:text-[#C0593A]">{c.props}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── SECTION 8: TOP RATED PROVIDERS ── */}
      <section className="bg-white border-t border-[#EBE0D8] px-6 py-14">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2">Top rated</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-8" style={{ fontFamily: 'Georgia, serif' }}>
            Trusted by homeowners across India
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROVIDERS.map(p => (
              <Link key={p.name} href={`/providers/${p.slug}`}
                className="bg-white border border-[#EBE0D8] rounded-2xl p-5 hover:border-[#C0593A] hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAEEE9] border border-[#E8C4B0] flex items-center justify-center text-sm font-bold text-[#9E3F24] flex-shrink-0">
                    {p.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2C1810]">{p.name}</p>
                    <p className="text-xs text-[#A08070]">{p.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#6B5248] mb-3">
                  <span className="text-yellow-500">★</span> {p.rating} · {p.reviews} reviews
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-[#FAEEE9] text-[#9E3F24] border border-[#E8C4B0] px-2 py-0.5 rounded font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: JOIN CTA ── */}
      <section className="px-6 py-14">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-[#2C1810] rounded-2xl px-8 py-14 text-center">
            <p className="text-white/60 text-sm font-medium mb-3">Are you a contractor, supplier or property professional?</p>
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Join Griffy and grow your business
            </h2>
            <p className="text-white/70 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Get discovered by thousands of homeowners. List your services, manage bookings, and get paid — all in one place. Free to join.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup?type=professional"
                className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-colors">
                Join as Professional →
              </Link>
              <Link href="/signup?type=professional"
                className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-colors border border-white/20">
                List Your Materials
              </Link>
              {isEnabled('properties') && (
                <Link href="/signup?type=professional"
                  className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-colors border border-white/20">
                  List a Property
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SERVICE_CARDS = [
  isEnabled('contractors') && {
    icon: '🏗️', title: 'Find Contractors',
    desc: 'Architects, interior designers, civil & renovation contractors for your project',
    stats: '500+ verified contractors', href: '/contractors',
  },
  isEnabled('labour') && {
    icon: '👷', title: 'Hire Labour',
    desc: 'Masons, carpenters, painters, tile fixers & daily wage workers near you',
    stats: '2,000+ skilled workers', href: '/labour',
  },
  isEnabled('service_experts') && {
    icon: '⚡', title: 'Book Service Experts',
    desc: 'Electricians, plumbers, AC technicians, waterproofing & specialist services',
    stats: '800+ service experts', href: '/service-experts',
  },
  isEnabled('materials') && {
    icon: '🧱', title: 'Buy Materials',
    desc: 'Cement, TMT steel, tiles, sand, doors, windows & all building materials',
    stats: '10,000+ products listed', href: '/materials',
  },
  (isEnabled('land') && !isEnabled('properties')) && {
    icon: '🌍', title: 'Find Land',
    desc: 'Residential plots, agricultural land & commercial properties for sale or rent',
    stats: '1,000+ land listings', href: '/land',
  },
  isEnabled('properties') && {
    icon: '🏠', title: 'Buy / Rent Homes',
    desc: 'Apartments, villas, independent houses — ready to move or under construction',
    stats: '5,000+ properties listed', href: '/properties',
  },
].filter(Boolean) as { icon: string; title: string; desc: string; stats: string; href: string }[];

function ServiceCard({ icon, title, desc, stats, href }: {
  icon: string; title: string; desc: string; stats: string; href: string;
}) {
  return (
    <Link href={href}
      className="group bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-[#C0593A] hover:scale-105 transition-all duration-200 flex flex-col gap-3">
      <div className="text-5xl">{icon}</div>
      <div>
        <p className="text-lg font-bold text-[#2C1810] mb-1">{title}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
      <p className="text-xs text-gray-400">{stats}</p>
      <p className="text-sm font-semibold text-[#C0593A] group-hover:underline mt-auto">Explore →</p>
    </Link>
  );
}

const STEPS = [
  {
    num: 1, icon: '📋',
    title: 'Post your requirement',
    desc: 'Tell us what you need — contractor, labour, material or land. Set your budget and location.',
  },
  {
    num: 2, icon: '🎯',
    title: 'Get matched instantly',
    desc: 'We show you verified professionals and suppliers based on your location and requirement.',
  },
  {
    num: 3, icon: '✅',
    title: 'Pay securely & build',
    desc: 'Compare, hire and pay securely after the work is done. Money releases only when you approve.',
  },
];

const STATS = [
  { icon: '🏗️', value: '500+',    label: 'Verified Contractors' },
  { icon: '👷', value: '2,000+',  label: 'Skilled Workers' },
  { icon: '🧱', value: '10,000+', label: 'Materials Listed' },
  { icon: '🌍', value: '1,000+',  label: 'Land Listings' },
  { icon: '🏠', value: '5,000+',  label: 'Properties' },
];

const CITIES = [
  { name: 'Delhi NCR',   flag: '🏙️', count: '120+ pros' },
  { name: 'Mumbai',      flag: '🌆', count: '90+ pros' },
  { name: 'Bangalore',   flag: '🌇', count: '85+ pros' },
  { name: 'Srinagar',    flag: '🏔️', count: '40+ pros' },
  { name: 'Jammu',       flag: '🌄', count: '25+ pros' },
  { name: 'Hyderabad',   flag: '🏛️', count: '70+ pros' },
  { name: 'Pune',        flag: '🏘️', count: '60+ pros' },
  { name: 'Chennai',     flag: '🌊', count: '55+ pros' },
  { name: 'Kolkata',     flag: '🌉', count: '45+ pros' },
  { name: 'Jaipur',      flag: '🏯', count: '35+ pros' },
  { name: 'Ahmedabad',   flag: '🏟️', count: '40+ pros' },
  { name: 'Chandigarh',  flag: '🌳', count: '30+ pros' },
  { name: 'Lucknow',     flag: '🕌', count: '28+ pros' },
  { name: 'Dehradun',    flag: '🏕️', count: '22+ pros' },
  { name: 'Shimla',      flag: '⛷️', count: '15+ pros' },
];

const PROPERTY_CITIES = [
  { name: 'Delhi NCR',  flag: '🏙️', props: '1,200+ props' },
  { name: 'Mumbai',     flag: '🌆', props: '980+ props' },
  { name: 'Bangalore',  flag: '🌇', props: '860+ props' },
  { name: 'Hyderabad',  flag: '🏛️', props: '720+ props' },
  { name: 'Pune',       flag: '🏘️', props: '540+ props' },
  { name: 'Chennai',    flag: '🌊', props: '480+ props' },
  { name: 'Srinagar',   flag: '🏔️', props: '180+ props' },
  { name: 'Jaipur',     flag: '🏯', props: '260+ props' },
  { name: 'Chandigarh', flag: '🌳', props: '210+ props' },
  { name: 'Lucknow',    flag: '🕌', props: '190+ props' },
];

const PROVIDERS = [
  { name: 'Rajesh Sharma', initials: 'RS', role: 'Civil contractor · Delhi NCR', rating: '4.9', reviews: '63', tags: ['New construction', 'Renovation'],  slug: 'rajesh-sharma' },
  { name: 'Priya Mehta',   initials: 'PM', role: 'Architect · Mumbai',           rating: '4.8', reviews: '41', tags: ['Interior design', '3D plans'],     slug: 'priya-mehta' },
  { name: 'Anil Kumar',    initials: 'AK', role: 'Electrician · Bangalore',      rating: '4.7', reviews: '88', tags: ['Wiring', 'Solar setup'],            slug: 'anil-kumar' },
  { name: 'Suresh Verma',  initials: 'SV', role: 'Plumber · Pune',               rating: '4.9', reviews: '52', tags: ['Sanitary', 'Waterproofing'],        slug: 'suresh-verma' },
];
