import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — Griffy',
  description: 'Guides, city cost breakdowns, and updates from the Griffy construction marketplace.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-20 text-center">
        <div className="max-w-[700px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            ✍️ Blog
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-5" style={{ fontFamily: 'Georgia, serif' }}>
            We&apos;re just getting started
          </h1>
          <p className="text-[#6B5248] text-base leading-relaxed max-w-xl mx-auto mb-8">
            The Griffy blog — construction cost guides, city-by-city price breakdowns, and product
            updates — is coming soon. In the meantime, check out our cost estimator or get in touch
            with a question.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/estimate" className="bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors">
              Try the Cost Estimator
            </Link>
            <Link href="/contact" className="border border-[#EBE0D8] hover:border-[#C0593A] text-[#2C1810] text-sm font-semibold px-6 py-3 rounded-xl transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
