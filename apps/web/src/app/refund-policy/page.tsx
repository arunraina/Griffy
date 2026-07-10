import type { Metadata } from 'next';
import { BRAND_NAME, LEGAL_ENTITY_NAME, SUPPORT_EMAIL } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Refund & Cancellation Policy — ${BRAND_NAME}`,
  description: `How cancellations and refunds work for orders and bookings on ${BRAND_NAME}.`,
};

const SECTIONS = [
  {
    title: '1. How this fits with our Terms of Service',
    body: `As explained in our Terms of Service, ${BRAND_NAME} is a marketplace connecting homeowners with
independent material suppliers, contractors, labour, and service experts — we are not the seller of materials
or the provider of services ourselves. This policy explains how cancellations and refunds work for payments
made through ${BRAND_NAME}'s checkout, which is processed by Razorpay.`,
  },
  {
    title: '2. Material orders — cancellation window',
    body: `You can cancel a material order for a full refund any time before the supplier accepts it (while the
order shows status "Placed"). Once a supplier accepts an order ("Accepted"), it enters their fulfillment
process — cancellation from that point is at the supplier's discretion, and we'll facilitate it through the
platform if they agree.

Once an order has been packed or shipped, it cannot be cancelled through the platform. If it hasn't arrived, is
damaged, or doesn't match the listing, use the order's "Report a problem" option or contact us — this is
treated as a supplier-side issue under our Terms, and we'll help facilitate a refund from the supplier where
warranted.`,
  },
  {
    title: '3. Bookings — cancellation & rescheduling',
    body: `A booking can be cancelled for a full refund any time before the provider confirms it (status
"Pending"). Once a provider confirms a booking, cancelling it may be subject to the provider's own
cancellation terms shown at the time of booking — some professionals charge a partial fee for late
cancellations to cover time already blocked on their schedule.

To reschedule instead of cancelling, contact the provider directly through the booking, or reach out to us if
you're unable to.`,
  },
  {
    title: '4. How refunds are processed',
    body: `Approved refunds are issued to the original payment method through Razorpay. Razorpay typically
credits refunds back within 5-7 business days, though your bank may take longer to reflect it depending on
your card issuer or bank. We do not hold refunded amounts on the platform — there is no wallet or store credit
system today.

You'll get a notification (in-app, WhatsApp, or email) when a refund is initiated and again when it's confirmed
processed by Razorpay. You can also see refund status on the order's tracking page at any time.`,
  },
  {
    title: '5. Partial refunds',
    body: `Where only part of an order is affected — for example, one item out of a multi-item order is
missing or damaged — we may facilitate a partial refund for just that portion rather than the full order
value.`,
  },
  {
    title: '6. Non-refundable situations',
    body: `Refunds are not available where: you simply changed your mind after a supplier has already shipped
material or a professional has already started work; the issue is a normal, disclosed variation you accepted at
time of purchase (e.g. natural variation in stone/tile shade); or the order/booking was cancelled by you after
the applicable window in Sections 2-3 without the counterparty's agreement.`,
  },
  {
    title: '7. Disputed charges',
    body: `If you believe you were charged incorrectly or a payment didn't go through but you were still
charged, contact us at ${SUPPORT_EMAIL} with your order or booking ID before raising a chargeback with your
bank — most issues are resolved faster this way, and a direct bank chargeback can delay resolution on both
sides.`,
  },
  {
    title: '8. Changes to this policy',
    body: `We may update this policy from time to time. We'll post changes here and, for material updates,
notify account holders. Continued use of ${BRAND_NAME} after a change means you accept the updated policy.`,
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-14">
        <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-3xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          Refund & Cancellation Policy
        </h1>
        <p className="text-sm text-[#A08070] mb-10">Last updated: July 2026</p>

        <p className="text-[#4A3528] leading-relaxed mb-10">
          This policy explains how cancellations and refunds work for material orders and bookings made through
          {' '}{LEGAL_ENTITY_NAME} (&quot;{BRAND_NAME}&quot;, &quot;we&quot;). It should be read alongside our Terms of Service.
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
