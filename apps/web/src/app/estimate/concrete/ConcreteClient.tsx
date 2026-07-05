'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { calculateConcreteEstimate, type ConcreteGrade } from '@griffy/shared';
import EstimatorShell from '../_components/EstimatorShell';
import ResultLine from '../_components/ResultLine';
import BuyMaterialsButton from '../_components/BuyMaterialsButton';

const GRADES: ConcreteGrade[] = ['M15', 'M20', 'M25'];

function ConcreteInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [lengthFt, setLengthFt] = useState(Number(params.get('l')) || 20);
  const [widthFt, setWidthFt] = useState(Number(params.get('w')) || 15);
  const [thicknessIn, setThicknessIn] = useState(Number(params.get('t')) || 6);
  const [grade, setGrade] = useState<ConcreteGrade>((params.get('g') as ConcreteGrade) || 'M20');

  function update(next: { l?: number; w?: number; t?: number; g?: ConcreteGrade }) {
    const l = next.l ?? lengthFt, w = next.w ?? widthFt, t = next.t ?? thicknessIn, g = next.g ?? grade;
    if (next.l !== undefined) setLengthFt(next.l);
    if (next.w !== undefined) setWidthFt(next.w);
    if (next.t !== undefined) setThicknessIn(next.t);
    if (next.g !== undefined) setGrade(next.g);
    router.replace(`/estimate/concrete?l=${l}&w=${w}&t=${t}&g=${g}`, { scroll: false });
  }

  const result = calculateConcreteEstimate({ lengthFt, widthFt, thicknessIn, grade });

  return (
    <EstimatorShell
      icon="🏗️"
      title="Concrete Calculator"
      subtitle="Estimate cement, sand, and aggregate needed for a slab by length, width, thickness, and grade."
      inputs={
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Length (ft)</label>
            <input type="number" min={1} value={lengthFt} onChange={(e) => update({ l: Number(e.target.value) || 0 })}
              className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-lg font-bold text-[#2C1810] focus:outline-none focus:border-[#C0593A]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Width (ft)</label>
            <input type="number" min={1} value={widthFt} onChange={(e) => update({ w: Number(e.target.value) || 0 })}
              className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-lg font-bold text-[#2C1810] focus:outline-none focus:border-[#C0593A]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Thickness (inches)</label>
            <input type="number" min={1} value={thicknessIn} onChange={(e) => update({ t: Number(e.target.value) || 0 })}
              className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-lg font-bold text-[#2C1810] focus:outline-none focus:border-[#C0593A]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Grade</label>
            <div className="grid grid-cols-3 gap-2">
              {GRADES.map((g) => (
                <button key={g} onClick={() => update({ g })}
                  className={`py-2.5 text-sm font-semibold rounded-lg border transition-all ${grade === g ? 'border-[#C0593A] bg-[#FAEEE9] text-[#C0593A]' : 'border-[#EBE0D8] text-[#6B5248]'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      results={
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5">
          <h2 className="font-bold text-[#2C1810] mb-1">Estimated Quantities</h2>
          <p className="text-xs text-[#A08070] mb-3">{result.wetVolumeCft} cft wet volume · {result.dryVolumeCft} cft dry volume ({grade})</p>
          <div>
            <ResultLine emoji="🏗️" label="Cement" value={`${result.cementBags} bags`} />
            <ResultLine emoji="🏖️" label="Sand" value={`${result.sandCft} cft`} />
            <ResultLine emoji="🪨" label="Aggregate" value={`${result.aggregateCft} cft`} />
          </div>
          <div className="mt-4">
            <BuyMaterialsButton
              lines={[
                { label: 'Cement', category: 'structure', subcategory: 'cement', quantity: result.cementBags },
                { label: 'Sand', category: 'structure', subcategory: 'sand', quantity: result.sandCft },
                { label: 'Aggregate', category: 'structure', subcategory: 'aggregate', quantity: result.aggregateCft },
              ]}
            />
          </div>
        </div>
      }
      disclaimer="Thumb-rule estimate. Verify with your engineer for structural work. Concrete mix design, reinforcement, and curing requirements depend on load and span — this calculator only estimates material volume for a nominal mix."
      disclaimerProminent
      crossLink={{ label: 'Estimate steel reinforcement for this slab', href: '/estimate/steel' }}
    />
  );
}

export default function ConcreteClient() {
  return (
    <Suspense>
      <ConcreteInner />
    </Suspense>
  );
}
