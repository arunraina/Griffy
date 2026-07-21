import Link from 'next/link';
import type { UserState } from '@griffy/shared';
import { greeting } from '@/lib/dashboard';
import { HomePriceTicker } from '@/app/_components/HomeClientSections';
import PopularContractors from './PopularContractors';

const QUICK_ACTIONS = [
  { icon: '🏗️', label: 'Book Contractor', href: '/contractors' },
  { icon: '🧱', label: 'Buy Materials', href: '/materials' },
  { icon: '📐', label: 'Estimate Costs', href: '/estimate' },
  { icon: '🏠', label: 'Turnkey Project', href: '/post-project?type=turnkey' },
];

export default function IdleHomeownerDashboard({ state, name }: { state: UserState; name: string }) {
  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[900px] mx-auto space-y-6">
        <h1 className="text-xl font-bold text-[#2C1810]">
          {greeting()}, {name} 👋
        </h1>

        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.href} href={a.href}
              className="bg-white hover:border-[#C0593A] border border-[#EBE0D8] rounded-2xl p-5 text-center transition-colors">
              <span className="text-2xl block mb-2">{a.icon}</span>
              <span className="font-semibold text-sm text-[#2C1810]">{a.label}</span>
            </Link>
          ))}
        </div>

        <PopularContractors city={state.city} />

        <HomePriceTicker />
      </div>
    </div>
  );
}
