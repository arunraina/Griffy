import Link from 'next/link';
import type { UserState } from '@griffy/shared';
import PopularContractors from './PopularContractors';

const QUICK_ACTIONS = [
  { icon: '🏗️', label: 'Find a Contractor', href: '/contractors' },
  { icon: '🧱', label: 'Browse Materials', href: '/materials' },
  { icon: '📐', label: 'Calculate Costs', href: '/estimate' },
  { icon: '🏠', label: 'Request Turnkey Project', href: '/post-project?type=turnkey' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Tell us what you need', desc: 'Post a project or browse professionals directly.' },
  { step: '2', title: 'Compare & choose', desc: 'Review profiles, ratings, and quotes from verified pros.' },
  { step: '3', title: 'Book & pay securely', desc: 'Track progress and pay safely through Griffy.' },
];

export default function NewHomeownerWelcome({ state, name }: { state: UserState; name: string }) {
  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[900px] mx-auto space-y-8">
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 sm:p-8 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <h1 className="text-2xl font-bold text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Welcome to Griffy, {name}!
          </h1>
          <p className="text-sm text-[#6B5248] mb-6">Let&apos;s help you get started</p>

          <p className="text-xs font-semibold text-[#A08070] uppercase tracking-wide mb-3">
            What do you want to do first?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.href} href={a.href}
                className="flex items-center justify-between bg-[#FAEEE9] hover:bg-[#F0DDD5] text-[#2C1810] font-semibold text-sm px-4 py-3 rounded-xl transition-colors">
                <span>{a.icon} {a.label}</span>
                <span className="text-[#C0593A]">→</span>
              </Link>
            ))}
          </div>
        </div>

        <PopularContractors city={state.city} />

        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
          <h3 className="text-sm font-bold text-[#2C1810] mb-4">How Griffy works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step}>
                <div className="w-7 h-7 rounded-full bg-[#C0593A] text-white text-xs font-bold flex items-center justify-center mb-2">
                  {s.step}
                </div>
                <p className="font-semibold text-sm text-[#2C1810]">{s.title}</p>
                <p className="text-xs text-[#6B5248] mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-[#A08070]">
          Need help? 💬 Use the chat bubble in the bottom-right corner any time.
        </p>
      </div>
    </div>
  );
}
