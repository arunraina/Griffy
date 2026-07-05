'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProject } from '@/lib/projects';
import { fetchMe } from '@/lib/users';

const PROJECT_TYPES = [
  { id: 'civil', label: 'Civil / Structure', emoji: '🏗️' },
  { id: 'electrical', label: 'Electrical', emoji: '⚡' },
  { id: 'plumbing', label: 'Plumbing', emoji: '🔧' },
  { id: 'interior', label: 'Interior Work', emoji: '🛋️' },
  { id: 'structural', label: 'Structural', emoji: '🏛️' },
  { id: 'painting', label: 'Painting', emoji: '🎨' },
  { id: 'architecture', label: 'Architecture', emoji: '📐' },
  { id: 'other', label: 'Other', emoji: '🔨' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Jammu and Kashmir', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other',
];

const TIMELINES = ['ASAP (within 1 week)', '1–2 months', '2–4 months', '4–6 months', '6+ months', 'Not decided yet'];

const STEPS = ['Project Details', 'Location & Budget', 'Review & Post'];

export default function PostProjectPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    projectType: '', title: '', description: '', city: '', state: '',
    budgetMin: '', budgetMax: '', timeline: '',
  });

  useEffect(() => {
    fetchMe().catch(() => router.replace('/login?redirect=/post-project')).finally(() => setAuthChecked(true));
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#C0593A] border-t-transparent animate-spin" />
      </div>
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      await createProject({
        title: form.title,
        description: form.description,
        projectType: form.projectType,
        city: form.city,
        state: form.state,
        budgetMin: Number(form.budgetMin) || 0,
        budgetMax: Number(form.budgetMax) || 0,
        timeline: form.timeline,
      });
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to post project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-[#EBE0D8] p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">✅</div>
          <h1 className="text-xl font-bold text-[#2C1810] mb-2">Project Posted!</h1>
          <p className="text-[#6B5248] mb-1">
            Your project &ldquo;<strong className="text-[#2C1810]">{form.title}</strong>&rdquo; is now live.
          </p>
          <p className="text-sm text-[#A08070] mb-6">Contractors can now submit bids. Manage them from your dashboard.</p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold py-3 rounded-xl text-center transition-colors">
              Go to Dashboard
            </Link>
            <Link href="/projects" className="border-2 border-[#EBE0D8] text-[#6B5248] font-semibold py-3 rounded-xl text-center">
              Browse All Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Post Your Project</h1>
          <p className="text-[#6B5248]">Get bids from contractors. It&apos;s free!</p>
        </div>

        {/* Step bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => {
            const active = step === i + 1;
            const done = step > i + 1;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 ${active ? 'text-[#C0593A]' : done ? 'text-green-600' : 'text-[#D8C4B8]'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${active ? 'border-[#C0593A] bg-[#FAEEE9] text-[#C0593A]' : done ? 'border-green-500 bg-green-50 text-green-600' : 'border-[#EBE0D8] text-[#D8C4B8]'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold">{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${done ? 'bg-green-400' : 'bg-[#EBE0D8]'}`} />}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-bold text-[#2C1810] text-lg">Tell us about your project</h2>

              <div>
                <label className="block text-sm font-bold text-[#2C1810] mb-3">Project Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setForm({ ...form, projectType: pt.id })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${form.projectType === pt.id ? 'border-[#C0593A] bg-[#FAEEE9] text-[#9E3F24]' : 'border-[#EBE0D8] text-[#6B5248] hover:border-[#D8B8A8]'}`}
                    >
                      <span className="text-2xl">{pt.emoji}</span>
                      <span className="text-center text-xs leading-tight">{pt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2C1810] mb-1.5">Project Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 3BHK home construction in HSR Layout"
                  className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C0593A] focus:ring-2 focus:ring-[#C0593A]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2C1810] mb-1.5">Project Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your project — size, requirements, special considerations…"
                  className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C0593A] focus:ring-2 focus:ring-[#C0593A]/10 resize-none"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.projectType || !form.title.trim()}
                className="w-full bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-bold text-[#2C1810] text-lg">Location &amp; Budget</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#2C1810] mb-1.5">📍 City</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Srinagar"
                    className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C0593A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2C1810] mb-1.5">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C0593A] bg-white"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2C1810] mb-1.5">₹ Budget Range</label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A08070] text-sm">Min ₹</span>
                    <input
                      type="number" min={0} value={form.budgetMin}
                      onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                      placeholder="e.g. 500000"
                      className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 pl-14 text-sm focus:outline-none focus:border-[#C0593A]"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A08070] text-sm">Max ₹</span>
                    <input
                      type="number" min={0} value={form.budgetMax}
                      onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                      placeholder="e.g. 2000000"
                      className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 pl-14 text-sm focus:outline-none focus:border-[#C0593A]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2C1810] mb-3">📅 When do you want to start?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TIMELINES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, timeline: t })}
                      className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${form.timeline === t ? 'border-[#C0593A] bg-[#FAEEE9] text-[#9E3F24]' : 'border-[#EBE0D8] text-[#6B5248] hover:border-[#D8B8A8]'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border-2 border-[#EBE0D8] text-[#6B5248] font-semibold py-3 rounded-xl">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold py-3 rounded-xl transition-colors">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-bold text-[#2C1810] text-lg">Review &amp; Post</h2>

              <div className="bg-[#FDF8F5] rounded-xl border border-[#EBE0D8] p-5 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-[#A08070]">Type</span><span className="font-semibold text-[#2C1810]">{PROJECT_TYPES.find((p) => p.id === form.projectType)?.label}</span></div>
                <div className="flex justify-between"><span className="text-[#A08070]">Title</span><span className="font-semibold text-[#2C1810] text-right">{form.title}</span></div>
                {form.city && <div className="flex justify-between"><span className="text-[#A08070]">Location</span><span className="font-semibold text-[#2C1810]">{form.city}{form.state ? `, ${form.state}` : ''}</span></div>}
                {(form.budgetMin || form.budgetMax) && (
                  <div className="flex justify-between">
                    <span className="text-[#A08070]">Budget</span>
                    <span className="font-semibold text-[#2C1810]">₹{Number(form.budgetMin || 0).toLocaleString('en-IN')} – ₹{Number(form.budgetMax || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {form.timeline && <div className="flex justify-between"><span className="text-[#A08070]">Timeline</span><span className="font-semibold text-[#2C1810]">{form.timeline}</span></div>}
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border-2 border-[#EBE0D8] text-[#6B5248] font-semibold py-3 rounded-xl">
                  Back
                </button>
                <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                  {submitting ? 'Posting…' : 'Post Project'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
