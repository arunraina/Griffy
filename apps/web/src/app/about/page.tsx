import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us — Griffy',
  description: 'Griffy is India\'s one-stop construction marketplace — connecting homeowners with contractors, labour, service experts, materials, and land, all in one place.',
};

const VALUES = [
  { icon: '✅', title: 'Verified professionals', desc: 'Every contractor, labourer, and service expert goes through an approval process before they can list on Griffy.' },
  { icon: '🔒', title: 'Secure payments', desc: 'Razorpay-backed checkout for materials and bookings, so money only moves when work is confirmed.' },
  { icon: '📍', title: 'Built for real Indian cities', desc: 'From Delhi NCR to Srinagar, our materials pricing and filters account for regional differences — not a one-size-fits-all catalogue.' },
  { icon: '🤝', title: 'No middleman markups', desc: 'Homeowners and professionals connect directly. Griffy earns from the platform, not by inflating quotes.' },
];

const WHAT_WE_DO = [
  { icon: '🏗️', title: 'Contractors', desc: 'Civil contractors, architects, interior designers, structural engineers and project managers.' },
  { icon: '👷', title: 'Labour', desc: 'Masons, carpenters, painters, tile fixers, and daily-wage workers, hired directly.' },
  { icon: '⚡', title: 'Service Experts', desc: 'Electricians, plumbers, AC technicians, waterproofing and solar specialists.' },
  { icon: '🧱', title: 'Materials', desc: 'Cement, steel, tiles and building materials at factory-direct prices, delivered pan-India.' },
  { icon: '🏠', title: 'Properties & Land', desc: 'Buy, sell, or rent homes and land — including new builder projects.' },
  { icon: '🧮', title: 'Cost Estimator', desc: 'A free tool to ballpark your project cost before you talk to a single contractor.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-20 text-center">
        <div className="max-w-[700px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            🏗️ About Griffy
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-[#2C1810] leading-tight mb-5"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Building shouldn&apos;t require a hundred phone calls
          </h1>
          <p className="text-[#6B5248] text-base leading-relaxed max-w-xl mx-auto">
            Griffy brings contractors, labour, service experts, materials, and land into one platform —
            so building or renovating a home in India means fewer middlemen and more certainty.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2 text-center">Our Story</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-6 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            Why we built Griffy
          </h2>
          <div className="max-w-[720px] mx-auto text-[#4A3528] text-base leading-relaxed space-y-4">
            <p>
              Construction in India runs on word-of-mouth and guesswork — a homeowner asks a neighbour for a
              contractor&apos;s number, gets three wildly different quotes, and has no way to compare material
              prices without visiting five shops in person.
            </p>
            <p>
              Griffy started as an attempt to fix that: put verified contractors, labour, service experts,
              and material suppliers on one platform, with real prices and real reviews, so a homeowner can
              make an informed decision from their phone instead of a hundred phone calls.
            </p>
            <p>
              We&apos;re still building — new capabilities like the open project marketplace, cost estimator,
              and turnkey construction packages have all shipped as we&apos;ve learned what homeowners and
              professionals actually need.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-[#EBE0D8] px-6 py-16">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2 text-center">What we do</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-10 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            One platform, every part of the build
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {WHAT_WE_DO.map((item) => (
              <div key={item.title} className="bg-[#FDF8F5] border border-[#EBE0D8] rounded-2xl p-6">
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-[#2C1810] mb-1.5">{item.title}</h3>
                <p className="text-sm text-[#6B5248] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2 text-center">What we stand for</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-10 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            Our principles
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4">
                <span className="text-2xl shrink-0">{v.icon}</span>
                <div>
                  <h3 className="font-bold text-[#2C1810] mb-1">{v.title}</h3>
                  <p className="text-sm text-[#6B5248] leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-[#EBE0D8] px-6 py-16 text-center">
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-2xl font-bold text-[#2C1810] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Ready to build?
          </h2>
          <p className="text-[#6B5248] mb-8">Whether you have land, a renovation in mind, or just want a cost estimate — start here.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold px-8 py-3 rounded-xl transition-colors">
              Get Started Free
            </Link>
            <Link href="/contact" className="border-2 border-[#EBE0D8] hover:border-[#C0593A] text-[#6B5248] hover:text-[#C0593A] font-semibold px-8 py-3 rounded-xl transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
