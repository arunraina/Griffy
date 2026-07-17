import Link from 'next/link';

const FLOWS = [
  {
    title: 'For Homeowners',
    emoji: '🏠',
    steps: [
      { emoji: '🔍', title: 'Browse', body: 'Search verified contractors, labour, service experts, and materials by city.' },
      { emoji: '📅', title: 'Book', body: 'Send a request with your preferred date and a description of the work.' },
      { emoji: '💳', title: 'Pay', body: 'Pay securely online or by cash on delivery once the provider confirms.' },
      { emoji: '✅', title: 'Track', body: 'Follow progress from your dashboard and leave a review once the job is done.' },
    ],
    cta: { label: 'Find Contractors', href: '/contractors' },
  },
  {
    title: 'For Suppliers & Professionals',
    emoji: '🛠️',
    steps: [
      { emoji: '📝', title: 'Sign up', body: 'Create a free account and fill in your professional details and service areas.' },
      { emoji: '🔎', title: 'Get approved', body: 'Our team reviews your profile to keep the marketplace trustworthy.' },
      { emoji: '📬', title: 'Receive jobs', body: 'Get booking requests and project bids directly from homeowners.' },
      { emoji: '💰', title: 'Earn', body: 'Complete the work, get paid, and build your rating with every review.' },
    ],
    cta: { label: 'Join as Professional', href: '/signup?type=professional' },
  },
  {
    title: 'For Material Buyers',
    emoji: '🧱',
    steps: [
      { emoji: '🛒', title: 'Browse', body: 'Search cement, steel, tiles, paint and more from verified suppliers.' },
      { emoji: '➕', title: 'Add to cart', body: 'Use our estimators to calculate exact quantities, or add items directly.' },
      { emoji: '💳', title: 'Pay', body: 'Checkout online or choose cash on delivery.' },
      { emoji: '🚚', title: 'Delivery', body: 'Track your order from placed to packed, shipped, and delivered.' },
    ],
    cta: { label: 'Browse Materials', href: '/materials' },
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-16 text-center">
        <div className="max-w-[700px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            How Griffy Works
          </h1>
          <p className="text-[#6B5248] text-base">
            One marketplace for hiring, buying materials, and growing a construction business.
          </p>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 space-y-14">
        {FLOWS.map((flow) => (
          <div key={flow.title}>
            <h2 className="text-xl font-bold text-[#2C1810] mb-6 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
              <span>{flow.emoji}</span> {flow.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {flow.steps.map((step, i) => (
                <div key={step.title} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-5 relative">
                  <span className="absolute top-4 right-4 text-xs font-semibold text-[#A08070]">{i + 1}</span>
                  <p className="text-2xl mb-2">{step.emoji}</p>
                  <p className="font-semibold text-[#2C1810] mb-1">{step.title}</p>
                  <p className="text-sm text-[#6B5248]">{step.body}</p>
                </div>
              ))}
            </div>
            <Link
              href={flow.cta.href}
              className="inline-block mt-5 text-sm font-semibold text-[#C0593A] hover:underline"
            >
              {flow.cta.label} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
