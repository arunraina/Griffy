"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, CheckCircle2, Phone, Calendar, Shield, Clock, Award, ChevronRight, MessageSquare, Wrench } from "lucide-react";
import { getLabour, Labour } from "@/lib/api";
import { TRADE_LABEL, TRADE_EMOJI } from "@/lib/constants";
import ReviewsList from "@/components/ReviewsList";

function Skeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-stone-200 rounded-2xl h-40" />
          <div className="bg-stone-200 rounded-2xl h-32" />
        </div>
        <div className="bg-stone-200 rounded-2xl h-64" />
      </div>
    </div>
  );
}

export default function LabourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [worker, setWorker] = useState<Labour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getLabour(id)
      .then(setWorker)
      .catch((e) => setError(e.message ?? "Failed to load worker profile"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-stone-50"><Skeleton /></div>;

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔧</p>
          <h2 className="font-bold text-stone-700 mb-2">Worker not found</h2>
          <p className="text-stone-500 text-sm mb-4">{error}</p>
          <Link href="/labour" className="btn-primary">Browse Labour</Link>
        </div>
      </div>
    );
  }

  const name = worker.user?.fullName ?? "Worker";
  const tradeLabel = TRADE_LABEL[worker.trade] ?? worker.trade;
  const tradeEmoji = TRADE_EMOJI[worker.trade] ?? "🛠️";

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/labour" className="hover:text-orange-500">Hire Labour</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-stone-900 font-medium">{name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-orange-100 text-orange-600 font-extrabold text-3xl flex items-center justify-center shrink-0">
                  {tradeEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-extrabold text-stone-900">{name}</h1>
                    {worker.isVerified && <Shield className="w-5 h-5 text-blue-500" />}
                  </div>
                  <p className="text-stone-500 mt-0.5 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-orange-400" /> {tradeLabel}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-stone-600">
                    {worker.rating > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-stone-900">{worker.rating.toFixed(1)}</span>
                        <span className="text-stone-500">({worker.reviewCount} reviews)</span>
                      </span>
                    )}
                    {(worker.city || worker.state) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        {[worker.city, worker.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-stone-400" />{worker.experienceYears} yrs exp
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />{worker.completedJobs} jobs done
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${worker.isAvailable ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {worker.isAvailable ? "● Available now" : "● Not available"}
                    </span>
                    {worker.isVerified && (
                      <span className="badge bg-blue-100 text-blue-700 text-xs flex items-center gap-1">
                        <Shield className="w-3 h-3" /> ID Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            {worker.bio && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="font-bold text-stone-900 text-lg mb-3">About</h2>
                <p className="text-stone-600 leading-relaxed">{worker.bio}</p>
              </div>
            )}

            {/* Skills */}
            {worker.skills && worker.skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="font-bold text-stone-900 text-lg mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-stone-100 text-stone-700 text-sm font-medium rounded-full">{skill}</span>
                  ))}
                </div>

                {worker.languages && worker.languages.length > 0 && (
                  <div className="mt-5 flex items-center gap-2 text-sm text-stone-500">
                    <span className="font-semibold text-stone-700">Languages:</span>
                    {worker.languages.join(", ")}
                  </div>
                )}
              </div>
            )}

            <ReviewsList targetType="labour" targetId={worker.id} rating={worker.rating} reviewCount={worker.reviewCount} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sticky top-24">
              <div className="text-center mb-5 pb-5 border-b border-stone-50">
                <p className="text-sm text-stone-500 mb-1">Daily rate</p>
                <p className="text-3xl font-extrabold text-stone-900">₹{Number(worker.dailyRate).toLocaleString("en-IN")}</p>
                {worker.weeklyRate && (
                  <p className="text-xs text-stone-400 mt-1">
                    Weekly: ₹{Number(worker.weeklyRate).toLocaleString("en-IN")} · Excl. travel
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { icon: Clock, text: "Typically responds in 1 hour" },
                  { icon: Award, text: `${worker.experienceYears}+ years of experience` },
                  { icon: CheckCircle2, text: `${worker.completedJobs} jobs completed` },
                  worker.isVerified && { icon: Shield, text: "Aadhaar & background verified" },
                ].filter(Boolean).map((item: any) => (
                  <div key={item.text} className="flex items-center gap-2.5 text-sm text-stone-600">
                    <item.icon className="w-4 h-4 text-green-500 shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>

              <Link href={`/checkout?type=labour&id=${worker.id}`} className="w-full btn-primary justify-center flex mb-3">
                Book Now
              </Link>
              <button className="w-full flex items-center justify-center gap-2 border-2 border-stone-200 hover:border-blue-300 text-stone-700 hover:text-blue-600 font-semibold py-3 rounded-xl transition-all">
                <Phone className="w-4 h-4" /> Call Now
              </button>
              <button className="w-full flex items-center justify-center gap-2 mt-2 text-stone-500 hover:text-stone-700 font-medium py-2 transition-colors text-sm">
                <MessageSquare className="w-4 h-4" /> Send a Message
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
