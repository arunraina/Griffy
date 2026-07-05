import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Team — Griffy',
  description: 'Meet the team building Griffy, and the leadership roles we\'re hiring for.',
};

interface OpenRole {
  title: string;
  abbr: string;
  desc: string;
}

const OPEN_ROLES: OpenRole[] = [
  { title: 'Chief Technology Officer', abbr: 'CTO', desc: 'Own the technical roadmap across web, mobile, and backend as Griffy scales past its founding architecture.' },
  { title: 'Chief Financial Officer', abbr: 'CFO', desc: 'Build the financial backbone for a marketplace business — unit economics, fundraising, and compliance.' },
  { title: 'Chief Operating Officer', abbr: 'COO', desc: 'Run the engine behind supplier onboarding, verification, and day-to-day marketplace operations.' },
  { title: 'Chief Marketing Officer', abbr: 'CMO', desc: 'Build the Griffy brand and growth engine — from homeowner acquisition to contractor supply-side growth.' },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-16 text-center">
        <div className="max-w-[700px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            👋 Team
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            The people building Griffy
          </h1>
          <p className="text-[#6B5248] text-base leading-relaxed max-w-xl mx-auto">
            A small founding team today — and a handful of leadership seats still open for the right people.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="px-6 py-16">
        <div className="max-w-[900px] mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2 text-center">Leadership</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-10 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            Founder
          </h2>

          <div className="bg-white border border-[#EBE0D8] rounded-2xl p-8 flex flex-col sm:flex-row gap-6 sm:gap-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FAEEE9] border border-[#E8C4B0] flex items-center justify-center text-3xl font-bold text-[#9E3F24] shrink-0">
              AR
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-[#2C1810]">Arun Raina</h3>
              <p className="text-sm font-semibold text-[#C0593A] mb-1">Founder &amp; CEO</p>
              <p className="text-xs text-[#A08070] mb-4">IIM Calcutta · Stanford Graduate School of Business</p>
              <p className="text-sm text-[#4A3528] leading-relaxed">
                10+ years building and scaling startups. Built SaaS data and retail products for global
                retailers including Tesco, Walmart, and Foodstuffs at Dunnhumby. Prior to Griffy, built and
                scaled Nojoto — India&apos;s largest storytelling platform — to 30 million monthly active
                users. Started Griffy to bring that same rigor around trust, verification, and pricing
                transparency to how India hires contractors and buys construction materials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open leadership roles */}
      <section className="bg-white border-y border-[#EBE0D8] px-6 py-16">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2">Open Leadership Roles</p>
            <h2 className="text-2xl font-bold text-[#2C1810] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              This could be you
            </h2>
            <p className="text-sm text-[#6B5248] max-w-xl mx-auto">
              We&apos;re looking for founding leadership to help take Griffy from a small team to a category-defining
              marketplace. If one of these sounds like you, we want to hear from you — even if the title ends up
              looking a little different.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {OPEN_ROLES.map((role) => (
              <div key={role.abbr} className="bg-[#FDF8F5] border border-[#EBE0D8] rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-11 h-11 rounded-xl bg-[#FAEEE9] border border-[#E8C4B0] flex items-center justify-center text-sm font-bold text-[#9E3F24] shrink-0">
                    {role.abbr}
                  </span>
                  <p className="font-bold text-[#2C1810]">{role.title}</p>
                </div>
                <p className="text-sm text-[#6B5248] leading-relaxed mb-4 flex-1">{role.desc}</p>
                <a
                  href={`mailto:careers@griffy.in?subject=${encodeURIComponent(`Interested in ${role.abbr} at Griffy`)}`}
                  className="text-sm font-semibold text-[#C0593A] hover:underline"
                >
                  Get in touch →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 text-center">
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-2xl font-bold text-[#2C1810] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Not a leadership fit, but want in?
          </h2>
          <p className="text-[#6B5248] mb-8">We also run open remote internships across engineering, design, product, and growth.</p>
          <Link href="/careers" className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold px-8 py-3 rounded-xl transition-colors">
            View Open Internships
          </Link>
        </div>
      </section>
    </div>
  );
}
