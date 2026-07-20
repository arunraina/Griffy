'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { calculatePaintEstimate } from '@griffy/shared';
import EstimatorShell from '../_components/EstimatorShell';
import ResultLine from '../_components/ResultLine';
import BuyMaterialsButton from '../_components/BuyMaterialsButton';
import AddToEstimateButton from '../_components/AddToEstimateButton';

function PaintInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [wallAreaSqft, setWallAreaSqft] = useState(Number(params.get('a')) || 800);
  const [coats, setCoats] = useState(Number(params.get('c')) || 2);

  function update(next: { a?: number; c?: number }) {
    const a = next.a ?? wallAreaSqft, c = next.c ?? coats;
    if (next.a !== undefined) setWallAreaSqft(next.a);
    if (next.c !== undefined) setCoats(next.c);
    router.replace(`/estimate/paint?a=${a}&c=${c}`, { scroll: false });
  }

  const result = calculatePaintEstimate({ wallAreaSqft, coats });

  return (
    <EstimatorShell
      icon="🎨"
      title="Paint Calculator"
      subtitle="Estimate putty, primer, and paint needed for your walls by area and number of coats."
      inputs={
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Wall Area (sqft)</label>
            <input type="number" min={1} value={wallAreaSqft} onChange={(e) => update({ a: Number(e.target.value) || 0 })}
              className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-lg font-bold text-[#2C1810] focus:outline-none focus:border-[#C0593A]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Number of Coats</label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((c) => (
                <button key={c} onClick={() => update({ c })}
                  className={`py-2.5 text-sm font-semibold rounded-lg border transition-all ${coats === c ? 'border-[#C0593A] bg-[#FAEEE9] text-[#C0593A]' : 'border-[#EBE0D8] text-[#6B5248]'}`}>
                  {c} coat{c !== 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      results={
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5">
          <h2 className="font-bold text-[#2C1810] mb-1">Estimated Quantities</h2>
          <p className="text-xs text-[#A08070] mb-3">{wallAreaSqft} sqft · {coats} coat{coats !== 1 ? 's' : ''} of paint</p>
          <div>
            <ResultLine emoji="🪣" label="Wall putty" value={`${result.puttyKg} kg`} note="1 base coat" />
            <ResultLine emoji="🧴" label="Primer" value={`${result.primerLitres} L`} note="1 coat" />
            <ResultLine emoji="🎨" label="Paint" value={`${result.paintLitres} L`} note={`${coats} coat${coats !== 1 ? 's' : ''}`} />
          </div>
          <div className="mt-4 space-y-3">
            <BuyMaterialsButton
              lines={[
                { label: 'Paint', category: 'paints', subcategory: 'interior_paint', quantity: Math.max(1, Math.ceil(result.paintLitres / 20)) },
              ]}
            />
            <AddToEstimateButton
              source="paint"
              sourceLabel="Paint"
              description={`${wallAreaSqft} sqft, ${coats} coat${coats !== 1 ? 's' : ''}`}
              lines={[
                { label: 'Paint', category: 'paints', subcategory: 'interior_paint', quantity: Math.max(1, Math.ceil(result.paintLitres / 20)) },
              ]}
            />
          </div>
        </div>
      }
      disclaimer="Thumb-rule estimate. Coverage varies by paint brand, wall texture, and application method (brush/roller/spray) — check the product label for exact coverage."
      crossLink={{ label: 'Back to Flooring calculator', href: '/estimate/flooring' }}
    />
  );
}

export default function PaintClient() {
  return (
    <Suspense>
      <PaintInner />
    </Suspense>
  );
}
