'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

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

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + 2 - i);

const emptyForm = {
  name: '',
  email: '',
  resumeUrl: '',
  institute: '',
  courseOrDegree: '',
  degreeStatus: 'PURSUING' as 'PURSUING' | 'COMPLETED',
  graduationYear: String(CURRENT_YEAR),
};

function ApplyModal({ role, onClose }: { role: string; onClose: () => void }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/career-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          name: form.name,
          email: form.email,
          resumeUrl: form.resumeUrl,
          institute: form.institute,
          courseOrDegree: form.courseOrDegree,
          degreeStatus: form.degreeStatus,
          graduationYear: Number(form.graduationYear),
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setError("Something went wrong sending your application — email careers@griffy.in directly instead.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl border border-[#EBE0D8] shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBE0D8]">
          <p className="font-bold text-[#2C1810] text-sm">Apply — {role}</p>
          <button onClick={onClose} aria-label="Close" className="text-[#A08070] hover:text-[#2C1810] text-lg leading-none">✕</button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
            <h3 className="font-bold text-[#2C1810] mb-1">Application received</h3>
            <p className="text-sm text-[#6B5248] mb-5">We&apos;ll reach out at {form.email} if it&apos;s a fit.</p>
            <button onClick={onClose} className="text-sm font-semibold text-[#C0593A] hover:underline">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#6B5248] mb-1">Full name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B5248] mb-1">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B5248] mb-1">Resume link</label>
              <input required type="url" placeholder="Google Drive / Dropbox link — set sharing to 'Anyone with the link'"
                value={form.resumeUrl} onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B5248] mb-1">Education institute</label>
              <input required value={form.institute} onChange={(e) => setForm({ ...form, institute: e.target.value })}
                className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B5248] mb-1">Course / Degree</label>
              <input required placeholder="e.g. B.Tech Computer Science" value={form.courseOrDegree}
                onChange={(e) => setForm({ ...form, courseOrDegree: e.target.value })}
                className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B5248] mb-1">Status</label>
                <select value={form.degreeStatus} onChange={(e) => setForm({ ...form, degreeStatus: e.target.value as 'PURSUING' | 'COMPLETED' })}
                  className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A]">
                  <option value="PURSUING">Pursuing</option>
                  <option value="COMPLETED">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B5248] mb-1">Graduation year</label>
                <select value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                  className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A]">
                  {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button type="submit" disabled={submitting}
              className="w-full bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CareersClient() {
  const [applyRole, setApplyRole] = useState<string | null>(null);

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
                <button
                  onClick={() => setApplyRole(role.title)}
                  className="text-sm font-semibold text-[#C0593A] hover:underline text-left"
                >
                  Apply →
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[#FAEEE9] border border-[#E8C4B0] rounded-2xl p-5 text-center">
            <p className="text-sm text-[#6B5248]">
              Don&apos;t see your area listed but think you could still help build Griffy?{' '}
              <button onClick={() => setApplyRole('General Interest')} className="text-[#C0593A] font-semibold hover:underline">
                Write to us anyway
              </button>.
            </p>
          </div>
        </div>
      </section>

      {applyRole && <ApplyModal role={applyRole} onClose={() => setApplyRole(null)} />}
    </div>
  );
}
