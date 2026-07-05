import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Griffy',
  description: 'The terms that govern use of the Griffy platform.',
};

const SECTIONS = [
  {
    title: '1. What Griffy is',
    body: `Griffy is a marketplace that connects homeowners with contractors, labour, service experts, material
suppliers, and land/property listings. We facilitate these connections and process payments — we are not a
party to the underlying construction, service, or sale contract between a homeowner and a professional or
supplier, and we don't guarantee the quality of work performed off-platform.`,
  },
  {
    title: '2. Accounts',
    body: `You must provide accurate information when creating an account and keep your login credentials
confidential. You're responsible for activity under your account. We may suspend or terminate accounts that
violate these terms, provide false information, or are used for fraud or abuse.`,
  },
  {
    title: '3. Professional listings & approval',
    body: `Contractors, labour, service experts, and material suppliers must submit profile information for
review before their listing goes live. We may reject, suspend, or remove a listing at our discretion —
including for unverifiable credentials, customer complaints, or policy violations.

Being approved on Griffy does not make a professional our employee, agent, or partner — they operate
independently.`,
  },
  {
    title: '4. Payments',
    body: `Payments for materials, bookings, and other transactions are processed through Razorpay. By making a
payment, you agree to Razorpay's terms in addition to ours. Prices shown for materials and services are set by
suppliers and professionals, not by Griffy, unless stated otherwise.

Refunds and cancellations follow the policy shown at checkout for that specific order or booking type.`,
  },
  {
    title: '5. Open projects & bidding',
    body: `Homeowners may post a project for contractors to bid on. Submitting a bid is not a binding contract —
it becomes one only once a homeowner accepts a bid and both parties agree on scope, price, and timeline outside
the bid message itself.

Sharing phone numbers, email addresses, or other contact information inside bid or enquiry messages is not
permitted — this keeps conversations, and both parties, protected on-platform. We may remove messages or bids
that violate this.`,
  },
  {
    title: '6. Reviews',
    body: `Reviews must reflect a genuine transaction on Griffy. Fake, incentivized, or retaliatory reviews are
not allowed and may be removed. We do not edit review content, but we may remove reviews that violate this
policy or applicable law.`,
  },
  {
    title: '7. Prohibited conduct',
    body: `You may not: use Griffy for anything unlawful; impersonate another person or business; post false or
misleading listings; circumvent our payment system for transactions initiated on-platform; or attempt to
scrape, reverse-engineer, or disrupt the service.`,
  },
  {
    title: '8. Liability',
    body: `Griffy is provided "as is." To the maximum extent permitted by law, we're not liable for the quality,
safety, timeliness, or legality of work performed by professionals listed on the platform, or for disputes
between homeowners and professionals. Our liability for any claim relating to the platform itself is limited
to the fees you paid Griffy in the 12 months before the claim.`,
  },
  {
    title: '9. Changes',
    body: `We may update these terms from time to time. We'll post changes here and, for material updates,
notify account holders. Continued use after a change means you accept the updated terms.`,
  },
  {
    title: '10. Governing law',
    body: `These terms are governed by the laws of India, and disputes are subject to the exclusive jurisdiction
of the courts of Gurgaon, Haryana.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-14">
        <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-3xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          Terms of Service
        </h1>
        <p className="text-sm text-[#A08070] mb-10">Last updated: July 2026</p>

        <p className="text-[#4A3528] leading-relaxed mb-10">
          These terms govern your use of griffy.in, operated by Griffy IT Services Pvt. Ltd.
          (&quot;Griffy&quot;, &quot;we&quot;). By creating an account or using the platform, you agree to them.
        </p>

        <div className="space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-[#2C1810] mb-3">{s.title}</h2>
              {s.body.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-[#4A3528] leading-relaxed mb-3 last:mb-0">{para}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[#EBE0D8]">
          <p className="text-xs text-[#A08070]">
            This is a general-purpose draft and not a substitute for legal advice specific to your business and
            jurisdiction — have it reviewed by counsel before relying on it in production.
          </p>
        </div>
      </div>
    </div>
  );
}
