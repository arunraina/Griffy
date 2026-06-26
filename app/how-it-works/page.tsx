import Link from "next/link";
import { ArrowRight, Package, Users, HardHat, ShieldCheck, CreditCard, Star } from "lucide-react";

export const metadata = {
  title: "How It Works | Griffy",
};

const buyerSteps = [
  { icon: "🏠", title: "Tell Us Your Project", desc: "Describe what you're building — house size, type of work, timeline, and location." },
  { icon: "🔍", title: "Browse & Compare", desc: "See verified suppliers, contractors, and workers with real ratings, prices, and availability." },
  { icon: "💳", title: "Book & Pay Safely", desc: "Book with secure escrow payment. Your money is held safely until the job is done." },
  { icon: "✅", title: "Work Begins & You Track", desc: "Monitor progress via the dashboard. Release payment only when satisfied." },
];

const sellerSteps = [
  { icon: "📝", title: "Create Your Profile", desc: "Sign up as a supplier, contractor, or labour. Add your details, portfolio, and pricing." },
  { icon: "✅", title: "Get Verified", desc: "Pass our verification process — we check licenses, experience, and background." },
  { icon: "📩", title: "Receive Project Leads", desc: "Get matched with homeowners in your area looking for your specific service." },
  { icon: "💰", title: "Get Paid Securely", desc: "Complete the work, get rated by the client, and receive fast payment to your bank." },
];

const faqs = [
  {
    q: "Is Griffy free to use for homeowners?",
    a: "Yes! Browsing and posting requirements is completely free for homeowners. We charge a small platform fee (5%) only when you make a booking or purchase.",
  },
  {
    q: "How are contractors and labour verified?",
    a: "All service providers go through a multi-step verification: ID check, license/certificate verification, reference checks, and in-person visits for top-tier partners.",
  },
  {
    q: "What if the work quality is unsatisfactory?",
    a: "Your payment is held in escrow and released only after you approve the work. If there's a dispute, our resolution team steps in within 24 hours.",
  },
  {
    q: "How is material delivery handled?",
    a: "Suppliers manage delivery. Most deliveries happen within 24–72 hours. You can track your order in real-time on the Griffy dashboard.",
  },
  {
    q: "Can I hire labour directly or only through contractors?",
    a: "Both! You can hire individual workers (mistri, electrician, plumber etc.) directly, or hire a contractor who manages a full team for you.",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 to-stone-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5">
            How <span className="text-orange-400">Griffy</span> Works
          </h1>
          <p className="text-stone-300 text-xl">
            Simple, transparent, and secure — from the first brick to the last coat of paint.
          </p>
        </div>
      </section>

      {/* For Homeowners */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="badge bg-orange-100 text-orange-700 text-sm mb-3">For Homeowners</span>
            <h2 className="section-heading">Build Your Dream Home in 4 Steps</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {buyerSteps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center mx-auto text-3xl mb-4">
                  {step.icon}
                </div>
                <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center mx-auto -mt-10 mb-6 relative z-10">
                  {i + 1}
                </div>
                <h3 className="font-bold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register" className="btn-primary">
              Get Started as Homeowner <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-16 bg-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, color: "text-green-500", bg: "bg-green-100", title: "100% Verified", desc: "Every supplier, contractor, and worker is background-verified before appearing on Griffy." },
              { icon: CreditCard, color: "text-blue-500", bg: "bg-blue-100", title: "Escrow Payments", desc: "Your money never goes directly to the vendor. It's held safely and released only on your approval." },
              { icon: Star, color: "text-yellow-500", bg: "bg-yellow-100", title: "Real Reviews", desc: "All ratings come from genuine homeowners who used the service. No fake reviews, ever." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 mb-1">{item.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Service Providers */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="badge bg-blue-100 text-blue-700 text-sm mb-3">For Suppliers, Contractors & Labour</span>
            <h2 className="section-heading">Grow Your Business with Griffy</h2>
            <p className="section-sub mx-auto">Join 50,000+ professionals earning more through our platform.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {sellerSteps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center mx-auto text-3xl mb-4">
                  {step.icon}
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mx-auto -mt-10 mb-6 relative z-10">
                  {i + 1}
                </div>
                <h3 className="font-bold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register?type=provider" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg">
              Join as a Service Provider <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="bg-white rounded-xl border border-stone-200 shadow-sm group">
                <summary className="px-6 py-4 font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between hover:text-orange-500 transition-colors">
                  {faq.q}
                  <span className="text-2xl font-light text-stone-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-5 text-stone-500 leading-relaxed text-sm border-t border-stone-100">
                  <p className="pt-4">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
          <p className="text-center mt-10 text-stone-500">
            Still have questions?{" "}
            <Link href="/contact" className="text-orange-500 font-semibold hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
