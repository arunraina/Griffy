'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { calculatePlasterEstimate, type PlasterThickness, type PlasterRatio } from '@griffy/shared';
import EstimatorShell from '../_components/EstimatorShell';
import ResultLine from '../_components/ResultLine';
import BuyMaterialsButton from '../_components/BuyMaterialsButton';

const THICKNESSES: PlasterThickness[] = [12, 15, 20];
const RATIOS: PlasterRatio[] = [4, 6];

function PlasterInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [areaSqft, setAreaSqft] = useState(Number(params.get('a')) || 500);
  const [thicknessMm, setThicknessMm] = useState<PlasterThickness>((Number(params.get('t')) as PlasterThickness) || 12);
  const [ratio, setRatio] = useState<PlasterRatio>((Number(params.get('r')) as PlasterRatio) || 6);

  function update(next: { a?: number; t?: PlasterThickness; r?: PlasterRatio }) {
    const a = next.a ?? areaSqft, t = next.t ?? thicknessMm, r = next.r ?? ratio;
    if (next.a !== undefined) setAreaSqft(next.a);
    if (next.t !== undefined) setThicknessMm(next.t);
    if (next.r !== undefined) setRatio(next.r);
    router.replace(`/estimate/plaster?a=${a}&t=${t}&r=${r}`, { scroll: false });
  }

  const result = calculatePlasterEstimate({ areaSqft, thicknessMm, ratio });

  return (
    <EstimatorShell
      icon="🧱"
      title="Plaster Calculator"
      subtitle="Estimate cement and sand needed to plaster a wall by area, coat thickness, and mix ratio."
      inputs={
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Wall Area (sqft)</label>
            <input type="number" min={1} value={areaSqft} onChange={(e) => update({ a: Number(e.target.value) || 0 })}
              className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-lg font-bold text-[#2C1810] focus:outline-none focus:border-[#C0593A]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Thickness</label>
            <div className="grid grid-cols-3 gap-2">
              {THICKNESSES.map((t) => (
                <button key={t} onClick={() => update({ t })}
                  className={`py-2.5 text-sm font-semibold rounded-lg border transition-all ${thicknessMm === t ? 'border-[#C0593A] bg-[#FAEEE9] text-[#C0593A]' : 'border-[#EBE0D8] text-[#6B5248]'}`}>
                  {t}mm
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Mix Ratio (cement:sand)</label>
            <div className="grid grid-cols-2 gap-2">
              {RATIOS.map((r) => (
                <button key={r} onClick={() => update({ r })}
                  className={`py-2.5 text-sm font-semibold rounded-lg border transition-all ${ratio === r ? 'border-[#C0593A] bg-[#FAEEE9] text-[#C0593A]' : 'border-[#EBE0D8] text-[#6B5248]'}`}>
                  1:{r}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      results={
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5">
          <h2 className="font-bold text-[#2C1810] mb-1">Estimated Quantities</h2>
          <p className="text-xs text-[#A08070] mb-3">{result.wetVolumeCft} cft of plaster</p>
          <div>
            <ResultLine emoji="🏗️" label="Cement" value={`${result.cementBags} bags`} />
            <ResultLine emoji="🏖️" label="Sand" value={`${result.sandCft} cft`} />
          </div>
          <div className="mt-4">
            <BuyMaterialsButton
              lines={[
                { label: 'Cement', category: 'structure', subcategory: 'cement', quantity: result.cementBags },
                { label: 'Sand', category: 'structure', subcategory: 'sand', quantity: result.sandCft },
              ]}
            />
          </div>
        </div>
      }
      disclaimer="Thumb-rule estimate using a standard 1.33 dry volume factor for mortar. Actual coverage varies by surface, wall condition, and application technique."
      crossLink={{ label: 'Estimate paint for this wall next', href: '/estimate/paint' }}
    />
  );
}

export default function PlasterClient() {
  return (
    <Suspense>
      <PlasterInner />
    </Suspense>
  );
}
