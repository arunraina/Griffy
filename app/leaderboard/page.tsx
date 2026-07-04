"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, MapPin, Trophy, Shield, ChevronRight } from "lucide-react";
import { listContractors, listLabour, Contractor, Labour } from "@/lib/api";
import { SPECIALTY_LABEL, TRADE_LABEL, TRADE_EMOJI, INDIAN_STATES } from "@/lib/constants";
import { getTier } from "@/lib/gamification";
import TierBadge from "@/components/TierBadge";

type Tab = "contractors" | "labour";

const MEDAL = ["🥇", "🥈", "🥉"];

function ContractorRow({ c, rank }: { c: Contractor; rank: number }) {
  const jobs = c.completedProjects ?? 0;
  const tier = getTier(jobs, c.rating);
  const avatarText = (c.businessName ?? c.user?.fullName ?? "??").slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/contractors/${c.id}`}
      className="flex items-center gap-4 bg-white rounded-2xl border border-stone-100 shadow-sm p-4 hover:border-orange-200 hover:shadow-md transition-all group"
    >
      <div className="w-8 text-center shrink-0">
        {rank <= 3
          ? <span className="text-xl">{MEDAL[rank - 1]}</span>
          : <span className="text-sm font-extrabold text-stone-400">#{rank}</span>
        }
      </div>

      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center">
        {c.avatarUrl
          ? <img src={c.avatarUrl} alt={c.businessName} className="w-full h-full object-cover" />
          : avatarText
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors truncate">
            {c.businessName}
          </p>
          {c.isVerified && <Shield className="w-4 h-4 text-blue-500 shrink-0" />}
          <TierBadge tier={tier} completedJobs={jobs} rating={c.rating} size="sm" />
        </div>
        <p className="text-xs text-stone-500 mt-0.5">
          {SPECIALTY_LABEL[c.specialty] ?? c.specialty}
          {(c.city || c.state) && <span> · {[c.city, c.state].filter(Boolean).join(", ")}</span>}
        </p>
      </div>

      <div className="flex flex-col items-end shrink-0 gap-1">
        {c.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-stone-900 text-sm">{c.rating.toFixed(1)}</span>
            <span className="text-xs text-stone-400">({c.reviewCount})</span>
          </div>
        )}
        <span className="text-xs text-stone-400">{jobs} projects</span>
      </div>

      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-400 transition-colors shrink-0" />
    </Link>
  );
}

function LabourRow({ w, rank }: { w: Labour; rank: number }) {
  const jobs = w.completedJobs ?? 0;
  const tier = getTier(jobs, w.rating);
  const tradeEmoji = TRADE_EMOJI[w.trade] ?? "🛠️";
  const name = w.user?.fullName ?? "Worker";

  return (
    <Link
      href={`/labour/${w.id}`}
      className="flex items-center gap-4 bg-white rounded-2xl border border-stone-100 shadow-sm p-4 hover:border-orange-200 hover:shadow-md transition-all group"
    >
      <div className="w-8 text-center shrink-0">
        {rank <= 3
          ? <span className="text-xl">{MEDAL[rank - 1]}</span>
          : <span className="text-sm font-extrabold text-stone-400">#{rank}</span>
        }
      </div>

      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-orange-100 text-orange-600 font-bold text-xl flex items-center justify-center">
        {w.avatarUrl
          ? <img src={w.avatarUrl} alt={name} className="w-full h-full object-cover" />
          : tradeEmoji
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors truncate">{name}</p>
          {w.isVerified && <Shield className="w-4 h-4 text-blue-500 shrink-0" />}
          <TierBadge tier={tier} completedJobs={jobs} rating={w.rating} size="sm" />
        </div>
        <p className="text-xs text-stone-500 mt-0.5">
          {TRADE_LABEL[w.trade] ?? w.trade}
          {(w.city || w.state) && <span> · {[w.city, w.state].filter(Boolean).join(", ")}</span>}
        </p>
      </div>

      <div className="flex flex-col items-end shrink-0 gap-1">
        {w.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-stone-900 text-sm">{w.rating.toFixed(1)}</span>
            <span className="text-xs text-stone-400">({w.reviewCount})</span>
          </div>
        )}
        <span className="text-xs text-stone-400">{jobs} jobs</span>
      </div>

      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-400 transition-colors shrink-0" />
    </Link>
  );
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("contractors");
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [trade, setTrade] = useState("");
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [labour, setLabour] = useState<Labour[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (tab === "contractors") {
      listContractors({ limit: 20, sortBy: "rating", ...(city ? { city } : {}), ...(specialty ? { specialty } : {}) })
        .then((r) => setContractors(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      listLabour({ limit: 20, sortBy: "rating", ...(city ? { city } : {}), ...(trade ? { trade } : {}) })
        .then((r) => setLabour(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab, city, specialty, trade]);

  const SPECIALTIES = ["civil", "structural", "electrical", "plumbing", "interior", "architect", "painting", "other"];
  const TRADES = ["mason", "electrician", "plumber", "carpenter", "painter", "tiler", "welder", "helper", "other"];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-7 h-7 text-orange-500" />
            <h1 className="text-2xl font-extrabold text-stone-900">Leaderboard</h1>
          </div>
          <p className="text-stone-500">Top-rated contractors and labour on Griffy, ranked by rating and completed work.</p>

          {/* Tier legend */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { emoji: "🌱", label: "New", color: "bg-stone-100 text-stone-600 border-stone-200" },
              { emoji: "⭐", label: "Rising Star", color: "bg-blue-100 text-blue-700 border-blue-200" },
              { emoji: "🏅", label: "Trusted Pro", color: "bg-orange-100 text-orange-700 border-orange-200" },
              { emoji: "🏆", label: "Elite", color: "bg-amber-100 text-amber-800 border-amber-300" },
            ].map((t) => (
              <span key={t.label} className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${t.color}`}>
                {t.emoji} {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
            {(["contractors", "labour"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
                {t === "contractors" ? "👷 Contractors" : "🔧 Labour"}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm">
              <MapPin className="w-4 h-4 text-stone-400" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="text-stone-700 bg-transparent focus:outline-none pr-1"
              >
                <option value="">All cities</option>
                {["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Surat"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {tab === "contractors" ? (
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-orange-300"
              >
                <option value="">All specialties</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{SPECIALTY_LABEL[s] ?? s}</option>
                ))}
              </select>
            ) : (
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-orange-300"
              >
                <option value="">All trades</option>
                {TRADES.map((t) => (
                  <option key={t} value={t}>{TRADE_LABEL[t] ?? t}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : tab === "contractors" ? (
          contractors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
              <Trophy className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <p className="text-stone-500">No contractors found for this filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contractors.map((c, i) => (
                <ContractorRow key={c.id} c={c} rank={i + 1} />
              ))}
            </div>
          )
        ) : (
          labour.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
              <Trophy className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <p className="text-stone-500">No labour found for this filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {labour.map((w, i) => (
                <LabourRow key={w.id} w={w} rank={i + 1} />
              ))}
            </div>
          )
        )}

        <p className="text-xs text-stone-400 text-center mt-8">
          Rankings update in real time · Based on rating × reviews × completed jobs
        </p>
      </div>
    </div>
  );
}
