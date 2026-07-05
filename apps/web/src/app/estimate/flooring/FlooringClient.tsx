'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { calculateFlooringEstimate } from '@griffy/shared';
import EstimatorShell from '../_components/EstimatorShell';
import ResultLine from '../_components/ResultLine';
import BuyMaterialsButton from '../_components/BuyMaterialsButton';

const TILE_SIZES = [12, 16, 24, 32];

function FlooringInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [lengthFt, setLengthFt] = useState(Number(params.get('l')) || 12);
  const [widthFt, setWidthFt] = useState(Number(params.get('w')) || 10);
  const [tileSizeIn, setTileSizeIn] = useState(Number(params.get('s')) || 24);

  function update(next: { l?: number; w?: number; s?: number }) {
    const l = next.l ?? lengthFt, w = next.w ?? widthFt, s = next.s ?? tileSizeIn;
    if (next.l !== undefined) setLengthFt(next.l);
    if (next.w !== undefined) setWidthFt(next.w);
    if (next.s !== undefined) setTileSizeIn(next.s);
    router.replace(`/estimate/flooring?l=${l}&w=${w}&s=${s}`, { scroll: false });
  }

  const result = calculateFlooringEstimate({ roomLengthFt: lengthFt, roomWidthFt: widthFt, tileSizeIn });

  return (
    <EstimatorShell
      icon="🏠"
      title="Tile Flooring Calculator"
      subtitle="Estimate tile count, adhesive, and grout needed for a room by dimensions and tile size."
      inputs={
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Room Length (ft)</label>
            <input type="number" min={1} value={lengthFt} onChange={(e) => update({ l: Number(e.target.value) || 0 })}
              className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-lg font-bold text-[#2C1810] focus:outline-none focus:border-[#C0593A]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Room Width (ft)</label>
            <input type="number" min={1} value={widthFt} onChange={(e) => update({ w: Number(e.target.value) || 0 })}
              className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-lg font-bold text-[#2C1810] focus:outline-none focus:border-[#C0593A]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Tile Size (inches, square)</label>
            <div className="grid grid-cols-4 gap-2">
              {TILE_SIZES.map((s) => (
                <button key={s} onClick={() => update({ s })}
                  className={`py-2.5 text-sm font-semibold rounded-lg border transition-all ${tileSizeIn === s ? 'border-[#C0593A] bg-[#FAEEE9] text-[#C0593A]' : 'border-[#EBE0D8] text-[#6B5248]'}`}>
                  {s}&quot;
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      results={
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5">
          <h2 className="font-bold text-[#2C1810] mb-1">Estimated Quantities</h2>
          <p className="text-xs text-[#A08070] mb-3">{result.roomAreaSqft} sqft room</p>
          <div>
            <ResultLine emoji="🔲" label="Tiles needed" value={`${result.tileCountBase} pcs`} />
            <ResultLine emoji="➕" label="Wastage (10%)" value={`${result.wastageTiles} pcs`} note="Cutting & breakage allowance" />
            <ResultLine emoji="🔲" label="Total to buy" value={`${result.tileCountWithWastage} pcs`} />
            <ResultLine emoji="🧴" label="Tile adhesive" value={`${result.adhesiveBags} bags`} />
            <ResultLine emoji="⬜" label="Grout" value={`${result.groutKg} kg`} />
          </div>
          <div className="mt-4">
            <BuyMaterialsButton
              lines={[
                { label: 'Tiles', category: 'tiles', subcategory: 'vitrified', quantity: result.tileCountWithWastage },
              ]}
            />
          </div>
        </div>
      }
      disclaimer="Thumb-rule estimate. Adhesive coverage (~40 sqft/bag) and grout usage (~0.5 kg/sqft) vary by tile size, trowel notch, and joint width."
      crossLink={{ label: 'Estimate paint for the rest of the room', href: '/estimate/paint' }}
    />
  );
}

export default function FlooringClient() {
  return (
    <Suspense>
      <FlooringInner />
    </Suspense>
  );
}
