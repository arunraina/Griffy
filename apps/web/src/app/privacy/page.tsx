import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Griffy',
  description: 'How Griffy collects, uses, and protects your data.',
};

const SECTIONS = [
  {
    title: '1. What we collect',
    body: `We collect information you give us directly — name, email, phone number, and city when you sign up;
project details when you post a project or request a quote; payment details when you check out (handled by
our payment processor, Razorpay — we never store your card or UPI details ourselves); and profile information
(business name, service areas, portfolio, pricing) if you register as a contractor, labourer, service expert,
or material supplier.

We also collect information automatically: pages you visit, searches you run, and device/browser information,
used to keep the platform working and to improve search relevance.`,
  },
  {
    title: '2. How we use it',
    body: `To operate the marketplace — matching your project or search with relevant contractors, materials, or
listings; to process payments and bookings through Razorpay; to send you booking confirmations, order updates,
and notifications about bids on projects you've posted; to verify professional profiles before they go live;
and to detect fraud, spam, and abuse (including scanning bid/enquiry messages for shared contact information,
which we block to keep conversations on-platform).

We do not sell your personal data to third parties.`,
  },
  {
    title: '3. Who we share it with',
    body: `With the other party in a transaction — e.g., a contractor you book sees your name, phone number, and
project details; a homeowner who posts a project sees the name and profile of anyone who bids on it.

With service providers who help us run Griffy: Supabase (authentication and database hosting), Razorpay
(payments), AWS (file and image storage), and Twilio (WhatsApp/SMS OTP verification). Each only receives the
data it needs to do its job.

With law enforcement or regulators, only if legally required.`,
  },
  {
    title: '4. Your choices',
    body: `You can view and edit your profile information at any time from your Profile page. You can request
account deletion by contacting support@griffy.in — we'll remove your personal data except where we're legally
required to retain records (e.g., completed payment transactions).

You can opt out of non-essential notifications from your account settings; transactional notifications
(order status, booking confirmations) can't be turned off since they're necessary to use the service.`,
  },
  {
    title: '5. Data retention & security',
    body: `We retain account data for as long as your account is active, and transaction records for as long as
required by Indian tax and consumer-protection law. Passwords are never stored in plain text — authentication
is handled by Supabase using industry-standard hashing. Payment card details never touch our servers; they go
directly to Razorpay.`,
  },
  {
    title: '6. Children',
    body: `Griffy is not directed at anyone under 18. We don't knowingly collect data from minors.`,
  },
  {
    title: '7. Changes to this policy',
    body: `We'll post updates here and, for material changes, notify account holders by email. Continued use of
Griffy after a change means you accept the updated policy.`,
  },
  {
    title: '8. Contact',
    body: `Questions about this policy or your data — email privacy@griffy.in or use our Contact page.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-14">
        <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-3xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          Privacy Policy
        </h1>
        <p className="text-sm text-[#A08070] mb-10">Last updated: July 2026</p>

        <p className="text-[#4A3528] leading-relaxed mb-10">
          This policy explains what information Griffy IT Services Pvt. Ltd. (&quot;Griffy&quot;, &quot;we&quot;) collects
          when you use griffy.in, and how we use, share, and protect it. It applies to homeowners, contractors,
          labour, service experts, material suppliers, and anyone else using the platform.
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
            This is a general-purpose draft policy and not a substitute for legal advice specific to your
            business and jurisdiction — have it reviewed by counsel before relying on it in production.
          </p>
        </div>
      </div>
    </div>
  );
}
