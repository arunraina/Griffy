'use client';

import Link from 'next/link';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  inputs: React.ReactNode;
  results: React.ReactNode;
  disclaimer: string;
  disclaimerProminent?: boolean;
  crossLink?: { label: string; href: string };
}

export default function EstimatorShell({ icon, title, subtitle, inputs, results, disclaimer, disclaimerProminent, crossLink }: Props) {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="bg-white border-b border-[#EBE0D8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            {icon} Free Estimator
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            {title}
          </h1>
          <p className="text-[#6B5248] text-base leading-relaxed max-w-xl mx-auto">{subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">{inputs}</div>
          <div className="lg:col-span-3 space-y-6">
            {results}

            <div className={`rounded-2xl border p-5 ${disclaimerProminent ? 'bg-amber-50 border-amber-300' : 'bg-white border-[#EBE0D8]'}`}>
              <p className={`text-xs leading-relaxed ${disclaimerProminent ? 'text-amber-900' : 'text-[#A08070]'}`}>
                <strong>{disclaimerProminent ? '⚠️ ' : ''}Disclaimer:</strong> {disclaimer}
              </p>
            </div>

            {crossLink && (
              <Link
                href={crossLink.href}
                className="block text-center bg-[#FAEEE9] hover:bg-[#F0D8CC] text-[#9E3F24] font-semibold text-sm py-3 rounded-xl transition-colors"
              >
                {crossLink.label} →
              </Link>
            )}

            <div className="text-center">
              <Link href="/estimate" className="text-xs text-[#A08070] hover:text-[#C0593A] hover:underline">
                ← Back to all estimators
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
