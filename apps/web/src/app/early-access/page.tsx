'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const INTERESTS = [
  { id: 'homeowner', label: 'Hiring contractors / buying materials' },
  { id: 'professional', label: 'Working as a contractor, labour, or service expert' },
  { id: 'supplier', label: 'Selling materials on Griffy' },
  { id: 'other', label: 'Something else' },
];

const PERKS = [
  { icon: '📱', title: 'First on the app', desc: 'Be first to try the Griffy mobile app before it\'s publicly available.' },
  { icon: '🏷️', title: 'Founding member perks', desc: 'Early sign-ups get priority verification and launch-only pricing when we roll out new cities and features.' },
  { icon: '🗣️', title: 'Shape the roadmap', desc: 'We reach out to early sign-ups directly for feedback on what to build next.' },
];

export default function EarlyAccessPage() {
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState(INTERESTS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/early-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interest }),
      });
      if (res.status === 409) {
        setError('That email is already on the list — we\'ve got you!');
        return;
      }
      if (!res.ok) throw new Error('failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong — please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-16 text-center">
        <div className="max-w-[700px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            🚀 Early Access
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Get early access to the Griffy app
          </h1>
          <p className="text-[#6B5248] text-base leading-relaxed max-w-xl mx-auto">
            The web marketplace is live today. Leave your email and we&apos;ll notify you the moment the mobile
            app and new features are ready to try.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-[500px] mx-auto">
          <div className="bg-white border border-[#EBE0D8] rounded-2xl p-7 shadow-sm">
            {submitted ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
                <h2 className="text-lg font-bold text-[#2C1810] mb-1">You&apos;re on the list</h2>
                <p className="text-sm text-[#6B5248]">We&apos;ll email {email} as soon as early access opens up.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B5248] mb-1.5">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-[#EBE0D8] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B5248] mb-1.5">What brings you to Griffy?</label>
                  <select
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="w-full border border-[#EBE0D8] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]"
                  >
                    {INTERESTS.map((i) => (
                      <option key={i.id} value={i.id}>{i.label}</option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white text-sm font-semibold py-3 rounded-lg transition-colors"
                >
                  {submitting ? 'Joining…' : 'Get Early Access'}
                </button>
                <p className="text-[11px] text-[#A08070] text-center">No spam — just launch updates. Unsubscribe anytime.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-[#EBE0D8] px-6 py-16">
        <div className="max-w-[900px] mx-auto">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2 text-center">Why join early</p>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-10 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            What early access gets you
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {PERKS.map((p) => (
              <div key={p.title} className="text-center">
                <span className="text-3xl mb-3 block">{p.icon}</span>
                <h3 className="font-bold text-[#2C1810] mb-1.5">{p.title}</h3>
                <p className="text-sm text-[#6B5248] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
