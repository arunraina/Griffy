'use client';

import { useState } from 'react';
import { LEGAL_ENTITY_NAME, SUPPORT_EMAIL, SUPPORT_PHONE, OFFICE_ADDRESS } from '@/lib/brand';

const CHANNELS = [
  { icon: '📧', label: 'Email', value: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
  { icon: '📞', label: 'Phone', value: SUPPORT_PHONE, href: `tel:${SUPPORT_PHONE.replace(/\s/g, '')}` },
  { icon: '📍', label: 'Office', value: `${LEGAL_ENTITY_NAME}, ${OFFICE_ADDRESS}`, href: undefined },
];

const TOPICS = ['General question', 'Report a problem', 'Contractor / supplier onboarding', 'Partnership', 'Press'];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: TOPICS[0], message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-16 text-center">
        <div className="max-w-[700px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Get in touch
          </h1>
          <p className="text-[#6B5248] text-base">
            Questions, feedback, or something not working right — we&apos;d rather hear about it than have you guess.
          </p>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          {CHANNELS.map((c) => (
            <div key={c.label} className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
              <span className="text-2xl mb-2 block">{c.icon}</span>
              <p className="text-xs font-semibold text-[#A08070] uppercase tracking-wide mb-1">{c.label}</p>
              {c.href ? (
                <a href={c.href} className="text-sm font-semibold text-[#2C1810] hover:text-[#C0593A] transition-colors">
                  {c.value}
                </a>
              ) : (
                <p className="text-sm font-semibold text-[#2C1810]">{c.value}</p>
              )}
            </div>
          ))}
          <p className="text-xs text-[#A08070] px-1">
            We typically respond within 1–2 business days. For urgent issues with an active order or booking,
            email is fastest.
          </p>
        </div>

        <div className="md:col-span-3">
          {submitted ? (
            <div className="bg-white rounded-2xl border border-[#EBE0D8] p-8 text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
              <h2 className="text-lg font-bold text-[#2C1810] mb-1">Message received</h2>
              <p className="text-sm text-[#6B5248]">
                Thanks, {form.name.split(' ')[0] || 'there'} — we&apos;ll get back to you at {form.email}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#EBE0D8] p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#2C1810] mb-1.5">Name</label>
                  <input
                    required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2C1810] mb-1.5">Email</label>
                  <input
                    required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#2C1810] mb-1.5">Topic</label>
                <select
                  value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A] bg-white"
                >
                  {TOPICS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#2C1810] mb-1.5">Message</label>
                <textarea
                  required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what's going on…"
                  className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A] resize-none"
                />
              </div>
              <button type="submit" className="w-full bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold py-3 rounded-xl transition-colors">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
