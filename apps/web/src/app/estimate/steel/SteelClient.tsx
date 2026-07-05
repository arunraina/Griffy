'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { calculateSteelEstimate, type SlabUsage } from '@griffy/shared';
import EstimatorShell from '../_components/EstimatorShell';
import ResultLine from '../_components/ResultLine';
import BuyMaterialsButton from '../_components/BuyMaterialsButton';

function SteelInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [slabAreaSqft, setSlabAreaSqft] = useState(Number(params.get('a')) || 1000);
  const [usage, setUsage] = useState<SlabUsage>((params.get('u') as SlabUsage) || 'residential');

  function update(next: { a?: number; u?: SlabUsage }) {
    const a = next.a ?? slabAreaSqft, u = next.u ?? usage;
    if (next.a !== undefined) setSlabAreaSqft(next.a);
    if (next.u !== undefined) setUsage(next.u);
    router.replace(`/estimate/steel?a=${a}&u=${u}`, { scroll: false });
  }

  const result = calculateSteelEstimate({ slabAreaSqft, usage });

  return (
    <EstimatorShell
      icon="🔩"
      title="TMT Steel Calculator"
      subtitle="Estimate TMT steel reinforcement needed for a slab by area and usage type."
      inputs={
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Slab Area (sqft)</label>
            <input type="number" min={1} value={slabAreaSqft} onChange={(e) => update({ a: Number(e.target.value) || 0 })}
              className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-lg font-bold text-[#2C1810] focus:outline-none focus:border-[#C0593A]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Usage</label>
            <div className="grid grid-cols-2 gap-2">
              {(['residential', 'commercial'] as SlabUsage[]).map((u) => (
                <button key={u} onClick={() => update({ u })}
                  className={`py-2.5 text-sm font-semibold rounded-lg border transition-all capitalize ${usage === u ? 'border-[#C0593A] bg-[#FAEEE9] text-[#C0593A]' : 'border-[#EBE0D8] text-[#6B5248]'}`}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      results={
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5">
          <h2 className="font-bold text-[#2C1810] mb-1">Estimated Quantity</h2>
          <p className="text-xs text-[#A08070] mb-3">{result.kgPerSqftUsed} kg/sqft thumb rule for {usage} slabs</p>
          <div>
            <ResultLine emoji="🔩" label="TMT Steel" value={`${result.steelKg.toLocaleString('en-IN')} kg`} />
          </div>
          <div className="mt-4">
            <BuyMaterialsButton
              lines={[
                { label: 'TMT Steel', category: 'steel', subcategory: 'tmt', quantity: result.steelKg },
              ]}
            />
          </div>
        </div>
      }
      disclaimer="Thumb-rule estimate. Verify with your engineer for structural work. Actual reinforcement depends on span, load, and structural design — this is not a substitute for a structural drawing."
      disclaimerProminent
      crossLink={{ label: 'Back to Concrete calculator', href: '/estimate/concrete' }}
    />
  );
}

export default function SteelClient() {
  return (
    <Suspense>
      <SteelInner />
    </Suspense>
  );
}
