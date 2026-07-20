'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEstimateBuilder } from '@/context/EstimateBuilderContext';
import { formatIndianCurrency as fmt } from '@griffy/shared';

export default function EstimateBuilderChip() {
  const { count, total } = useEstimateBuilder();
  const pathname = usePathname();

  if (count === 0 || pathname === '/estimate/summary') return null;

  return (
    <Link
      href="/estimate/summary"
      className="fixed bottom-5 left-5 z-40 flex items-center gap-3 bg-[#2C1810] hover:bg-[#3D2418] text-white rounded-full shadow-lg pl-4 pr-5 py-3 transition-colors"
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#C0593A] text-xs font-bold shrink-0">{count}</span>
      <div className="text-left leading-tight">
        <p className="text-[10px] text-[#D8B8A8] uppercase tracking-wide font-semibold">My Estimate</p>
        <p className="text-sm font-bold">{fmt(total)}</p>
      </div>
    </Link>
  );
}
