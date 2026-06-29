"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle2, MessageSquare, HelpCircle, Headphones } from "lucide-react";

const TOPICS = [
  "Order issue", "Payment problem", "Material quality", "Contractor complaint",
  "Labour complaint", "Account help", "Partnership / Supplier", "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Headphones className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-3">We're here to help</h1>
          <p className="text-stone-500 max-w-xl mx-auto">
            Have a question, complaint, or feedback? Our support team responds within 2 working hours.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact info */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h2 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wide">Get in Touch</h2>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: "Phone", value: "+91 80 4567 8900", desc: "Mon–Sat, 9 AM – 7 PM" },
                  { icon: Mail, label: "Email", value: "support@griffy.in", desc: "Replies within 2 hours" },
                  { icon: MapPin, label: "Office", value: "HSR Layout, Bengaluru", desc: "Karnataka 560102, India" },
                  { icon: Clock, label: "Hours", value: "Mon – Sat", desc: "9:00 AM – 7:00 PM IST" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">{item.label}</p>
                        <p className="text-sm font-semibold text-stone-900">{item.value}</p>
                        <p className="text-xs text-stone-400">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h2 className="font-bold text-stone-900 mb-3 text-sm uppercase tracking-wide">Quick Help</h2>
              <div className="space-y-2">
                {[
                  { label: "Track my order", href: "/orders", icon: MessageSquare },
                  { label: "Cancel / Return policy", href: "/how-it-works", icon: HelpCircle },
                  { label: "How payments work", href: "/how-it-works", icon: HelpCircle },
                  { label: "Report a contractor", href: "#", icon: MessageSquare },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <a key={link.label} href={link.href} className="flex items-center gap-2 text-sm text-stone-600 hover:text-orange-500 font-medium py-1.5 transition-colors">
                      <Icon className="w-4 h-4 text-stone-400" /> {link.label}
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Response times */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm text-stone-700">
              <p className="font-bold text-stone-900 mb-2">⚡ Response Times</p>
              <div className="space-y-1.5">
                <div className="flex justify-between"><span>WhatsApp / Phone</span><span className="font-semibold text-green-600">{"< 1 hour"}</span></div>
                <div className="flex justify-between"><span>Email support</span><span className="font-semibold text-blue-600">2–4 hours</span></div>
                <div className="flex justify-between"><span>Complaint resolution</span><span className="font-semibold text-orange-600">24–48 hours</span></div>
              </div>
            </div>
          </aside>

          {/* Contact form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-extrabold text-stone-900 mb-2">Message Sent!</h2>
                <p className="text-stone-500 mb-4">
                  Thanks for reaching out, <strong>{form.name}</strong>. Our team will get back to you at {form.email} within 2 hours.
                </p>
                <p className="text-sm text-stone-400">Reference: GRF-SUPP-{Date.now().toString().slice(-6)}</p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", topic: "", message: "" }); }}
                  className="btn-secondary mt-6"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 md:p-8 space-y-5">
                <h2 className="font-extrabold text-stone-900 text-xl">Send us a message</h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1.5">Full Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Rajesh Kumar"
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1.5">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1.5">Phone (optional)</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1.5">Topic *</label>
                    <select
                      required
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                    >
                      <option value="">Select a topic</option>
                      {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Please describe your issue or question in detail. Include order IDs or contractor names if relevant."
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-stone-400 mt-1">{form.message.length}/1000 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : "Send Message"}
                </button>

                <p className="text-xs text-stone-400 text-center">
                  We never share your details. By submitting, you agree to our Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="mt-12 bg-white rounded-2xl border border-stone-100 shadow-sm p-6 md:p-8">
          <h2 className="font-extrabold text-stone-900 text-xl mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: "How do I track my material order?", a: "Go to My Orders in your dashboard or use the Order ID in the tracking link we send via SMS." },
              { q: "What if materials are damaged on delivery?", a: "Raise a return request within 48 hours. Our team will arrange a pickup and full refund." },
              { q: "How do contractor payments work?", a: "Payments are held in escrow and released to contractors only after you confirm satisfactory work." },
              { q: "Can I hire labour for a single day?", a: "Yes! You can hire labour for 1 day, weekly, or monthly. Rates are clearly listed on each profile." },
            ].map((faq) => (
              <details key={faq.q} className="group bg-stone-50 rounded-xl border border-stone-100">
                <summary className="px-5 py-4 font-semibold text-stone-800 text-sm cursor-pointer flex items-center justify-between list-none">
                  {faq.q}
                  <span className="text-stone-400 group-open:rotate-180 transition-transform text-lg">⌄</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-stone-600">{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="text-center mt-6">
            <a href="/how-it-works" className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
              See all FAQs on How It Works →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
