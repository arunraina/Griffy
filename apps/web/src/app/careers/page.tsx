import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers — Griffy',
  description: 'Remote internships at Griffy — work on a real construction marketplace, not busywork.',
};

const VALUES = [
  { icon: '🏗️', title: 'Build for the real world', desc: 'Our users are homeowners and tradespeople, not just other tech workers — we design for that.' },
  { icon: '🚀', title: 'Ship and learn', desc: 'We\'d rather put something in front of real users this week than perfect it for a month.' },
  { icon: '🤝', title: 'Small team, real ownership', desc: 'Everyone here owns outcomes, not just tasks — interns included.' },
];

interface Internship {
  icon: string;
  title: string;
  team: string;
  desc: string;
}

const INTERNSHIPS: Internship[] = [
  { icon: '💻', title: 'Frontend Developer', team: 'Engineering', desc: 'Work on the actual Next.js app homeowners and contractors use every day — listings, checkout, the bidding marketplace.' },
  { icon: '🔧', title: 'Backend Developer', team: 'Engineering', desc: 'Build and harden the NestJS/Postgres API behind orders, payments, bookings, and notifications.' },
  { icon: '📱', title: 'Android Developer', team: 'Engineering', desc: 'Help take Griffy to Android from the ground up — a real 0-to-1 mobile build, not maintenance work.' },
  { icon: '🎨', title: 'UX Designer', team: 'Design', desc: 'Research and design flows for users who\'ve never used a marketplace app before — clarity matters more than polish here.' },
  { icon: '🖌️', title: 'Product Designer', team: 'Design', desc: 'Own the visual design system across web and mobile as new features ship.' },
  { icon: '📊', title: 'Product Manager', team: 'Product', desc: 'Scope features, talk to real contractors and homeowners, and help decide what we build next.' },
  { icon: '✍️', title: 'Content', team: 'Marketing', desc: 'Write the words users actually read — FAQ, in-app copy, blog posts on construction costs and hiring contractors.' },
  { icon: '📣', title: 'Social Media', team: 'Marketing', desc: 'Grow Griffy\'s presence where homeowners and contractors already spend time — Instagram, YouTube Shorts, LinkedIn.' },
  { icon: '🎥', title: 'Videographer / Video Editor', team: 'Marketing', desc: 'Shoot and edit contractor spotlights, site visits, and product explainers.' },
  { icon: '📈', title: 'Sales', team: 'Growth', desc: 'Onboard contractors, labour, and material suppliers onto the platform — real conversations, real signups.' },
  { icon: '🗂️', title: 'Operations', team: 'Operations', desc: 'Keep the marketplace running — professional verification, order issues, day-to-day coordination.' },
  { icon: '⚙️', title: 'DevOps / Technical Operations', team: 'Engineering', desc: 'Deployment, monitoring, and infrastructure reliability as we scale beyond a single server.' },
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
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2">Internships</p>
            <h2 className="text-2xl font-bold text-[#2C1810] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Open remote internships
            </h2>
            <p className="text-sm text-[#6B5248] max-w-xl mx-auto">
              For recent graduates and college students who want to work on real problems, not busywork.
              These are unpaid, remote, exposure-based internships — you&apos;ll ship things real users touch.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTERNSHIPS.map((role) => (
              <div key={role.title} className="bg-[#FDF8F5] border border-[#EBE0D8] rounded-2xl p-5 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl shrink-0">{role.icon}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-[#2C1810] text-sm leading-tight">{role.title}</p>
                    <p className="text-[11px] font-semibold text-[#C0593A] uppercase tracking-wide">{role.team} · Remote</p>
                  </div>
                </div>
                <p className="text-sm text-[#6B5248] leading-relaxed mb-4 flex-1">{role.desc}</p>
                <a
                  href={`mailto:careers@griffy.in?subject=${encodeURIComponent(`${role.title} Internship Application`)}`}
                  className="text-sm font-semibold text-[#C0593A] hover:underline"
                >
                  Apply →
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[#FAEEE9] border border-[#E8C4B0] rounded-2xl p-5 text-center">
            <p className="text-sm text-[#6B5248]">
              Don&apos;t see your area listed but think you could still help build Griffy?{' '}
              <a href="mailto:careers@griffy.in?subject=General%20Internship%20Interest" className="text-[#C0593A] font-semibold hover:underline">
                Write to us anyway
              </a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
