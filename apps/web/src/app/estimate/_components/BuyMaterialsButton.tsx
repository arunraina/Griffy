'use client';

import { useState } from 'react';
import { useAddEstimateToCart, type EstimatorCartLine } from '@/lib/estimatorCart';

export default function BuyMaterialsButton({ lines }: { lines: EstimatorCartLine[] }) {
  const { addEstimateToCart } = useAddEstimateToCart();
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [result, setResult] = useState<{ added: number; skipped: string[] } | null>(null);

  async function handleClick() {
    setState('loading');
    const res = await addEstimateToCart(lines);
    setResult(res);
    setState('done');
  }

  if (state === 'done' && result) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
        <p className="font-semibold text-green-800">
          {result.added > 0 ? `Added ${result.added} item${result.added !== 1 ? 's' : ''} to your cart ✓` : 'Could not match these to materials'}
        </p>
        {result.skipped.length > 0 && (
          <p className="text-xs text-green-700 mt-1">Not available yet: {result.skipped.join(', ')}</p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className="w-full bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
    >
      {state === 'loading' ? 'Adding…' : '🛒 Buy These Materials'}
    </button>
  );
}
