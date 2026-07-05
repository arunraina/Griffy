'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { calculateBricksEstimate, type WallThickness } from '@griffy/shared';
import EstimatorShell from '../_components/EstimatorShell';
import ResultLine from '../_components/ResultLine';
import BuyMaterialsButton from '../_components/BuyMaterialsButton';

function BricksInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [lengthFt, setLengthFt] = useState(Number(params.get('l')) || 20);
  const [heightFt, setHeightFt] = useState(Number(params.get('h')) || 10);
  const [thickness, setThickness] = useState<WallThickness>((Number(params.get('t')) as WallThickness) || 9);

  function update(next: { l?: number; h?: number; t?: WallThickness }) {
    const l = next.l ?? lengthFt;
    const h = next.h ?? heightFt;
    const t = next.t ?? thickness;
    if (next.l !== undefined) setLengthFt(next.l);
    if (next.h !== undefined) setHeightFt(next.h);
    if (next.t !== undefined) setThickness(next.t);
    router.replace(`/estimate/bricks?l=${l}&h=${h}&t=${t}`, { scroll: false });
  }

  const result = calculateBricksEstimate({ wallLengthFt: lengthFt, wallHeightFt: heightFt, thicknessIn: thickness });

  return (
    <EstimatorShell
      icon="🧱"
      title="Brick Wall Calculator"
      subtitle="Estimate how many bricks, how much cement, and how much sand you need for a wall — by length, height, and thickness."
      inputs={
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Wall Length (ft)</label>
            <input type="number" min={1} value={lengthFt} onChange={(e) => update({ l: Number(e.target.value) || 0 })}
              className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-lg font-bold text-[#2C1810] focus:outline-none focus:border-[#C0593A]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Wall Height (ft)</label>
            <input type="number" min={1} value={heightFt} onChange={(e) => update({ h: Number(e.target.value) || 0 })}
              className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-lg font-bold text-[#2C1810] focus:outline-none focus:border-[#C0593A]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Wall Thickness</label>
            <div className="grid grid-cols-2 gap-2">
              {([4.5, 9] as WallThickness[]).map((t) => (
                <button key={t} onClick={() => update({ t })}
                  className={`py-2.5 text-sm font-semibold rounded-lg border transition-all ${thickness === t ? 'border-[#C0593A] bg-[#FAEEE9] text-[#C0593A]' : 'border-[#EBE0D8] text-[#6B5248]'}`}>
                  {t}&quot; wall
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      results={
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5">
          <h2 className="font-bold text-[#2C1810] mb-1">Estimated Quantities</h2>
          <p className="text-xs text-[#A08070] mb-3">{result.wallVolumeCft} cft of brickwork</p>
          <div>
            <ResultLine emoji="🧱" label="Bricks needed" value={`${result.brickCountBase.toLocaleString('en-IN')} pcs`} />
            <ResultLine emoji="➕" label="Wastage (5%)" value={`${result.wastageBricks.toLocaleString('en-IN')} pcs`} note="Breakage/cutting allowance" />
            <ResultLine emoji="🧱" label="Total to buy" value={`${result.brickCountWithWastage.toLocaleString('en-IN')} pcs`} />
            <ResultLine emoji="🏗️" label="Cement" value={`${result.cementBags} bags`} note="For 1:6 mortar" />
            <ResultLine emoji="🏖️" label="Sand" value={`${result.sandCft} cft`} note="For 1:6 mortar" />
          </div>
          <div className="mt-4">
            <BuyMaterialsButton
              lines={[
                { label: 'Bricks', category: 'structure', subcategory: 'bricks', quantity: result.brickCountWithWastage },
                { label: 'Cement', category: 'structure', subcategory: 'cement', quantity: result.cementBags },
                { label: 'Sand', category: 'structure', subcategory: 'sand', quantity: result.sandCft },
              ]}
            />
          </div>
        </div>
      }
      disclaimer="Thumb-rule estimate based on standard 9x4.5x3in brick with 10mm mortar joints. Actual brick size, mortar mix, and wastage vary by site and supplier."
      crossLink={{ label: 'Estimate plaster for this wall next', href: '/estimate/plaster' }}
    />
  );
}

export default function BricksClient() {
  return (
    <Suspense>
      <BricksInner />
    </Suspense>
  );
}
