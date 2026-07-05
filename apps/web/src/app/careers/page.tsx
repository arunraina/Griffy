import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers — Griffy',
  description: 'Open roles at Griffy.',
};

const VALUES = [
  { icon: '🏗️', title: 'Build for the real world', desc: 'Our users are homeowners and tradespeople, not just other tech workers — we design for that.' },
  { icon: '🚀', title: 'Ship and learn', desc: 'We\'d rather put something in front of real users this week than perfect it for a month.' },
  { icon: '🤝', title: 'Small team, real ownership', desc: 'Everyone here owns outcomes, not just tasks.' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-16 text-center">
        <div className="max-w-[700px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Join us in rebuilding how India builds
          </h1>
          <p className="text-[#6B5248] text-base">
            We&apos;re a small team working on a genuinely large problem — connecting millions of homeowners
            with the contractors, labour, and materials they need.
          </p>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="max-w-[900px] mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2 text-center">How we work</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-10 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            What it&apos;s like here
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="text-center">
                <span className="text-3xl mb-3 block">{v.icon}</span>
                <h3 className="font-bold text-[#2C1810] mb-1.5">{v.title}</h3>
                <p className="text-sm text-[#6B5248] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-[#EBE0D8] px-6 py-16">
        <div className="max-w-[700px] mx-auto text-center">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2">Open Roles</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            Current openings
          </h2>
          <div className="bg-[#FDF8F5] border border-[#EBE0D8] rounded-2xl p-10">
            <span className="text-4xl mb-4 block">📭</span>
            <p className="font-semibold text-[#2C1810] mb-1.5">No open positions right now</p>
            <p className="text-sm text-[#6B5248] max-w-md mx-auto">
              We&apos;re not actively hiring at the moment, but we&apos;re always happy to hear from people
              who care about this problem. Send your resume and a note about why Griffy interests you to{' '}
              <a href="mailto:careers@griffy.in" className="text-[#C0593A] font-semibold hover:underline">
                careers@griffy.in
              </a>{' '}
              and we&apos;ll keep it on file for when a relevant role opens up.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
