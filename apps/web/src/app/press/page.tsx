import type { Metadata } from 'next';
import { BRAND_NAME, OFFICE_ADDRESS, SUPPORT_EMAIL } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Press — Griffy',
  description: 'Media resources and press contact for Griffy, India\'s construction marketplace.',
};

const FACTS = [
  { label: 'Headquarters', value: OFFICE_ADDRESS },
  { label: 'Categories', value: 'Contractors, labour, service experts, materials, land & property' },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-20 text-center">
        <div className="max-w-[700px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            📰 Press
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-5" style={{ fontFamily: 'Georgia, serif' }}>
            {BRAND_NAME} in the media
          </h1>
          <p className="text-[#6B5248] text-base leading-relaxed max-w-xl mx-auto">
            For interview requests, media assets, or fact-checking, reach our team directly.
          </p>
        </div>
      </section>

      <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {FACTS.map((f) => (
            <div key={f.label} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 text-center">
              <p className="text-xs font-semibold text-[#A08070] uppercase tracking-wide mb-1">{f.label}</p>
              <p className="text-sm font-semibold text-[#2C1810]">{f.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-8 text-center">
          <h2 className="text-lg font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Media Contact</h2>
          <p className="text-sm text-[#6B5248] mb-4">
            For press inquiries, email us and our team will get back to you within 2 business days.
          </p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#C0593A] font-semibold hover:underline">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}
