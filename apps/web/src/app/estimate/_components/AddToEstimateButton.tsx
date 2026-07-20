'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEstimateBuilder } from '@/context/EstimateBuilderContext';
import { resolveEstimatedCost } from '@/lib/estimatorPricing';
import type { EstimatorCartLine } from '@/lib/estimatorCart';

interface Props {
  source: string;
  sourceLabel: string;
  description: string;
  lines: EstimatorCartLine[];
}

export default function AddToEstimateButton({ source, sourceLabel, description, lines }: Props) {
  const { addEntry } = useEstimateBuilder();
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  async function handleClick() {
    setState('loading');
    const { total, unmatched } = await resolveEstimatedCost(lines);
    addEntry({ source, sourceLabel, description, lines, estimatedCost: total, unmatched });
    setState('done');
  }

  if (state === 'done') {
    return (
      <div className="bg-[#FAEEE9] border border-[#EBE0D8] rounded-xl p-4 text-sm text-center">
        <p className="font-semibold text-[#9E3F24]">Added to your estimate ✓</p>
        <Link href="/estimate/summary" className="text-xs font-semibold text-[#C0593A] hover:underline mt-1 inline-block">
          View My Estimate →
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className="w-full bg-white border-2 border-[#C0593A] hover:bg-[#FAEEE9] disabled:opacity-60 text-[#C0593A] font-semibold py-3 rounded-xl transition-colors"
    >
      {state === 'loading' ? 'Adding…' : '📋 Add to My Estimate'}
    </button>
  );
}
