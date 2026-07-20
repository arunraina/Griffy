'use client';

import Link from 'next/link';
import { useEstimateBuilder } from '@/context/EstimateBuilderContext';
import { formatIndianCurrency as fmt } from '@griffy/shared';

export default function SummaryClient() {
  const { entries, removeEntry, clearAll, total } = useEstimateBuilder();

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-5xl mb-4">📋</p>
          <h1 className="text-2xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Your estimate is empty
          </h1>
          <p className="text-sm text-[#6B5248] mb-6">
            Use any of the material calculators — bricks, concrete, steel, plaster, flooring, paint — and tap
            &ldquo;Add to My Estimate&rdquo; to build up a combined total for your whole project.
          </p>
          <Link
            href="/estimate"
            className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Browse Calculators →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="bg-white border-b border-[#EBE0D8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            📋 My Estimate
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Your combined project estimate
          </h1>
          <p className="text-[#6B5248] text-base leading-relaxed max-w-xl mx-auto">
            Built up from {entries.length} calculator{entries.length !== 1 ? 's' : ''} — add more anytime, or remove any that don&apos;t apply.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="bg-gradient-to-br from-[#C0593A] to-[#9E3F24] rounded-2xl p-6 text-white shadow-sm">
          <p className="text-[#F5D9CC] text-sm font-semibold mb-1">Estimated Total</p>
          <p className="text-4xl font-extrabold" style={{ fontFamily: 'Georgia, serif' }}>{fmt(total)}</p>
          <p className="text-[#F5D9CC] text-sm mt-1">Across {entries.length} item{entries.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-bold text-[#2C1810]">{entry.sourceLabel}</p>
                <p className="text-sm text-[#6B5248] mt-0.5">{entry.description}</p>
                {entry.unmatched.length > 0 && (
                  <p className="text-xs text-amber-700 mt-1.5">
                    ⚠️ No matching materials yet for: {entry.unmatched.join(', ')} — not included in this item&apos;s cost.
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-[#2C1810]">{fmt(entry.estimatedCost)}</p>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-xs text-[#A08070] hover:text-[#C0593A] hover:underline mt-1.5"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#FDF8F5] rounded-2xl border border-[#EBE0D8] p-5">
          <p className="text-xs text-[#A08070] mb-4">
            <strong>Disclaimer:</strong> Estimated using current material listings on Griffy where a match was found.
            Actual costs vary by supplier, city, and quantity discounts. Always get 3+ quotes before starting.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/contractors"
              className="flex items-center justify-center gap-2 bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Get Contractor Quotes <span aria-hidden>→</span>
            </Link>
            <Link
              href="/estimate"
              className="flex items-center justify-center gap-2 bg-white border-2 border-[#EBE0D8] hover:border-[#C0593A] text-[#6B5248] hover:text-[#C0593A] font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Add Another Estimate <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <button onClick={clearAll} className="text-xs text-[#A08070] hover:text-[#C0593A] hover:underline">
            Clear entire estimate
          </button>
        </div>
      </div>
    </div>
  );
}
