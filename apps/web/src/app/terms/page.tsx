import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Griffy',
  description: 'The terms that govern use of the Griffy platform.',
};

const SECTIONS = [
  {
    title: '1. What Griffy is',
    body: `Griffy is a marketplace that connects homeowners with independent contractors, labour, service
experts, material suppliers, and land/property listings. We facilitate discovery, communication, bidding, and
payment — we are not a party to the underlying construction, sale, or service contract that forms between a
homeowner and a professional or supplier.`,
  },
  {
    title: "2. Griffy's role: a marketplace, not the seller or the service provider",
    body: `This is the single most important thing to understand about using Griffy, so we're stating it plainly
rather than burying it in boilerplate — the same model Amazon uses for third-party marketplace sellers, and
Uber uses for independent drivers.

Material suppliers are independent sellers, not Griffy. When you buy cement, steel, tiles, or any other
material through Griffy, the seller is the supplier whose listing you bought from — not Griffy. The supplier is
solely responsible for the accuracy of the listing, product quality, authenticity, safe packaging, and getting
you what you paid for. If a supplier ships the wrong item, a defective batch, or misrepresents what they're
selling, that is a dispute between you and the supplier — the same way a seller-fulfilled defect on Amazon is
between you and that seller, not Amazon itself.

Contractors, labour, and service experts are independent professionals, not Griffy employees or agents. When
you hire a contractor, mason, electrician, or any other professional through Griffy, they are running their own
independent business. Griffy does not supervise their work, set their hours, provide their tools, or direct how
a job is performed. Workmanship quality, on-site safety, timeliness, and whether they hold any licenses they
claim to hold are that professional's responsibility — the same way a driver's conduct on a trip is between the
rider and the driver, not Uber's.

Griffy's own responsibility is the platform itself: keeping listings and profiles reasonably screened before
they go live, processing payment securely through Razorpay, giving you tools to message, review, and report a
problem, and acting on policy violations we're made aware of — including suspending or removing a supplier or
professional. We do not inspect materials before they ship, supervise work on-site, or guarantee outcomes.

In legal terms: Griffy is not, and shall not be considered, a principal or an agent of either the homeowner or
the supplier/professional in any transaction. Your purchase of materials or services from a supplier or
professional is a transaction between you and that party — not with Griffy.`,
  },
  {
    title: '3. Accounts',
    body: `You must provide accurate information when creating an account and keep your login credentials
confidential. You're responsible for activity under your account. We may suspend or terminate accounts that
violate these terms, provide false information, or are used for fraud or abuse.`,
  },
  {
    title: '4. Professional & supplier listings, approval, and fraud',
    body: `Contractors, labour, service experts, and material suppliers must submit profile information for
review before their listing goes live. Approval means their submitted information passed our review at that
point in time — it is not a guarantee of their conduct going forward, and it does not make them our employee,
agent, or partner.

If a supplier engages in fraud (charging for goods never sent, knowingly selling counterfeit or defective
materials, bait-and-switch pricing) or a professional misrepresents their credentials, that is a breach of
their own obligations to you, not Griffy's. Report it to us immediately — we will investigate, may suspend or
permanently remove the listing, and will cooperate with law enforcement where warranted, but financial
responsibility for the fraud itself rests with the party who committed it, not with Griffy.`,
  },
  {
    title: '5. Payments',
    body: `Payments for materials, bookings, and other transactions are processed through Razorpay. By making a
payment, you agree to Razorpay's terms in addition to ours. Prices shown for materials and services are set by
suppliers and professionals, not by Griffy, unless stated otherwise.

Refunds and cancellations follow the policy shown at checkout for that specific order or booking type. Where a
refund is owed because of a supplier's or professional's error (wrong item, no-show, misrepresented work), we
may facilitate the refund through our payment flow, but the underlying loss is attributable to that party, not
to Griffy absorbing it as the seller.`,
  },
  {
    title: '6. Open projects & bidding',
    body: `Homeowners may post a project for contractors to bid on. Submitting a bid is not a binding contract —
it becomes one only once a homeowner accepts a bid and both parties agree on scope, price, and timeline outside
the bid message itself. That agreement is between the homeowner and the contractor; Griffy is not a party to it.

Sharing phone numbers, email addresses, or other contact information inside bid or enquiry messages is not
permitted — this keeps conversations, and both parties, protected on-platform. We may remove messages or bids
that violate this.`,
  },
  {
    title: '7. Reviews',
    body: `Reviews must reflect a genuine transaction on Griffy. Fake, incentivized, or retaliatory reviews are
not allowed and may be removed. We do not edit review content, but we may remove reviews that violate this
policy or applicable law.`,
  },
  {
    title: '8. Prohibited conduct',
    body: `You may not: use Griffy for anything unlawful; impersonate another person or business; post false or
misleading listings; circumvent our payment system for transactions initiated on-platform; or attempt to
scrape, reverse-engineer, or disrupt the service.`,
  },
  {
    title: '9. Disputes between users',
    body: `If something goes wrong with a material order or a professional's work, your first step is to contact
that supplier or professional directly — most issues are resolved that way. If that doesn't work, use Contact
Us or a listing's "Report a problem" option and we'll review it. We may, at our discretion, suspend a party,
remove a listing, or assist in facilitating a resolution — but we are not a guarantor, insurer, or arbitrator of
every transaction, and pursuing a claim against the responsible supplier or professional directly (including
through consumer courts, where applicable) remains available to you.`,
  },
  {
    title: '10. Liability',
    body: `Griffy is provided "as is." Consistent with Section 2 above: to the maximum extent permitted by law,
we're not liable for the quality, safety, authenticity, timeliness, or legality of materials sold or work
performed by suppliers and professionals listed on the platform, nor for disputes between homeowners and those
independent third parties. Our liability for any claim relating to the platform itself (e.g., a payment
processing error caused by Griffy, not by Razorpay or a third party) is limited to the fees you paid Griffy in
the 12 months before the claim.`,
  },
  {
    title: '11. Indemnification',
    body: `If you're a supplier or professional, you agree to indemnify and hold Griffy harmless from claims,
losses, or damages arising from the materials you sold or the work you performed — including claims of
defective goods, property damage, personal injury, or fraud attributable to you. This mirrors how Amazon's
marketplace seller agreements and Uber's driver terms allocate responsibility for the underlying goods or
service to the party actually providing them.`,
  },
  {
    title: '12. Changes',
    body: `We may update these terms from time to time. We'll post changes here and, for material updates,
notify account holders. Continued use after a change means you accept the updated terms.`,
  },
  {
    title: '13. Governing law & dispute resolution',
    body: `These terms are governed by the laws of India. Any dispute arising out of or relating to these terms
or your use of Griffy — other than disputes between you and an independent supplier or professional, which are
between you and that party as described in Sections 2 and 9 — shall first be attempted to be resolved through
good-faith negotiation, and failing that, through arbitration in Gurgaon, Haryana under the Arbitration and
Conciliation Act, 1996, by a sole arbitrator mutually agreed by both parties, conducted in English. Subject to
that, the courts of Gurgaon, Haryana have exclusive jurisdiction.`,
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
