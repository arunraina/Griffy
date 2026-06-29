"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, Calendar, MapPin, FileText, CheckCircle2, ArrowRight, Clock } from "lucide-react";

const WORK_DURATIONS = [
  "1 day", "2–3 days", "1 week", "2 weeks", "1 month", "Ongoing / as needed",
];

const TIME_SLOTS = [
  "7:00 AM – 9:00 AM", "9:00 AM – 11:00 AM", "11:00 AM – 1:00 PM",
  "2:00 PM – 4:00 PM", "4:00 PM – 6:00 PM",
];

function BookingForm({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "labour";

  const [step, setStep] = useState(1);
  const [booked, setBooked] = useState(false);
  const [bookingId] = useState(() => "GBK" + Math.floor(100000 + Math.random() * 900000));

  const [form, setForm] = useState({
    startDate: "",
    duration: "",
    timeSlot: "",
    address: "",
    city: "",
    pincode: "",
    description: "",
    name: "",
    phone: "",
  });

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 1200));
    setBooked(true);
  }

  const isLabour = type === "labour";
  const isContractor = type === "contractor";

  if (booked) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mb-2">Booking Confirmed!</h1>
          <p className="text-stone-500 mb-1">Your booking request has been sent.</p>
          <p className="text-sm font-bold text-orange-500 mb-6">Booking ID: {bookingId}</p>

          <div className="bg-stone-50 rounded-2xl p-4 mb-6 text-left space-y-2 text-sm text-stone-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Start date: <strong className="text-stone-900">{form.startDate || "TBD"}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>{isLabour ? "Duration" : "Project scope"}: <strong className="text-stone-900">{form.duration}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span><strong>{form.city}</strong> — {form.address}</span>
            </div>
          </div>

          <p className="text-sm text-stone-400 mb-6">
            The {isLabour ? "worker" : "contractor"} will confirm within 2 hours. You'll receive an SMS on {form.phone}.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/orders" className="btn-primary justify-center">View Bookings</Link>
            <Link href={isLabour ? "/labour" : "/contractors"} className="btn-secondary justify-center">
              Browse More {isLabour ? "Labour" : "Contractors"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href={isLabour ? "/labour" : "/contractors"} className="hover:text-orange-500">
              {isLabour ? "Labour" : "Contractors"}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/${isLabour ? "labour" : "contractors"}/${id}`} className="hover:text-orange-500">Profile</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-stone-900 font-medium">Book Now</span>
          </nav>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-extrabold text-stone-900 mb-2">
          Book {isLabour ? "Labour" : "Contractor"}
        </h1>
        <p className="text-stone-500 mb-8">Fill in your requirements and we'll send your request to the {isLabour ? "worker" : "contractor"}.</p>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Schedule", "Location", "Confirm"].map((s, i) => {
            const active = step === i + 1;
            const done = step > i + 1;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 text-sm font-semibold ${active ? "text-orange-500" : done ? "text-green-500" : "text-stone-300"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${active ? "border-orange-500 bg-orange-50" : done ? "border-green-500 bg-green-50 text-green-600" : "border-stone-200"}`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className="hidden sm:block">{s}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-green-400" : "bg-stone-200"}`} />}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 md:p-8">
          {/* Step 1 — Schedule */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-extrabold text-stone-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" /> Schedule
              </h2>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Start Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">
                  {isLabour ? "Duration of Work *" : "Project Timeline *"}
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {WORK_DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm({ ...form, duration: d })}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${form.duration === d ? "border-orange-400 bg-orange-50 text-orange-700" : "border-stone-200 text-stone-600 hover:border-stone-300"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {isLabour && (
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-3">Preferred Start Time</label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, timeSlot: t })}
                        className={`py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${form.timeSlot === t ? "border-orange-400 bg-orange-50 text-orange-700" : "border-stone-200 text-stone-600 hover:border-stone-300"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!form.startDate || !form.duration}
                className="w-full btn-primary justify-center disabled:opacity-50"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {/* Step 2 — Location + Description */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-extrabold text-stone-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" /> Site Location & Details
              </h2>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Site Address *</label>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Plot no., street, area"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">City *</label>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Bengaluru"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">Pincode</label>
                  <input
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    placeholder="560001"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">
                  <FileText className="w-4 h-4 inline mr-1" /> Work Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the work — area in sq ft, what needs to be done, any special requirements..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 btn-secondary justify-center">Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!form.address || !form.city || !form.description}
                  className="flex-1 btn-primary justify-center disabled:opacity-50"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Confirm */}
          {step === 3 && (
            <form onSubmit={handleConfirm} className="space-y-5">
              <h2 className="font-extrabold text-stone-900">Your Contact Details</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Rajesh Kumar"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">Mobile *</label>
                  <input
                    required
                    type="tel"
                    pattern="[6-9]\d{9}"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-stone-50 rounded-xl p-4 text-sm space-y-2 text-stone-600">
                <p className="font-bold text-stone-900 mb-1">Booking Summary</p>
                <p>📅 Start: {form.startDate} {form.timeSlot && `· ${form.timeSlot}`}</p>
                <p>⏱ Duration: {form.duration}</p>
                <p>📍 {form.address}, {form.city} {form.pincode}</p>
                <p className="line-clamp-2">📝 {form.description}</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
                Payment will be collected after the {isLabour ? "worker" : "contractor"} confirms. No charges now.
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 btn-secondary justify-center">Back</button>
                <button type="submit" className="flex-1 btn-primary justify-center">
                  Confirm Booking ✓
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone-400">Loading...</div>}>
      <BookingForm id={params.id} />
    </Suspense>
  );
}
