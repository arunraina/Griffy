"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Star, MapPin, Phone, Calendar, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import { listLabour, Labour } from "@/lib/api";
import { TRADE_LABEL, TRADE_EMOJI } from "@/lib/constants";

const tradeFilters = [
  { label: "All Trades", value: "" },
  { label: "Mason / Mistri", value: "mason" },
  { label: "Electrician", value: "electrician" },
  { label: "Plumber", value: "plumber" },
  { label: "Carpenter", value: "carpenter" },
  { label: "Painter", value: "painter" },
  { label: "Tiler", value: "tiler" },
  { label: "Welder", value: "welder" },
  { label: "Helper", value: "helper" },
];

function SkeletonCard() {
  return (
    <div className="card bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-stone-200" />
        <div className="h-5 bg-stone-200 rounded w-20" />
      </div>
      <div className="h-4 bg-stone-200 rounded w-1/2 mb-1" />
      <div className="h-3 bg-stone-200 rounded w-1/3 mb-3" />
      <div className="h-3 bg-stone-200 rounded w-3/4 mb-2" />
      <div className="h-8 bg-stone-200 rounded mt-6" />
    </div>
  );
}

export default function LabourPage() {
  const [workers, setWorkers] = useState<Labour[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [city, setCity] = useState("");
  const [trade, setTrade] = useState("");

  const fetchWorkers = useCallback(async (p: number, replace: boolean) => {
    try {
      replace ? setLoading(true) : setLoadingMore(true);
      const res = await listLabour({
        page: p, limit: 12,
        trade: trade || undefined,
        city: city || undefined,
        search: search || undefined,
      });
      setWorkers((prev) => replace ? res.data : [...prev, ...res.data]);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message ?? "Failed to load workers");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [trade, city, search]);

  useEffect(() => {
    setPage(1);
    fetchWorkers(1, true);
  }, [trade, city, search]);

  function handleSearch() {
    setSearch(searchInput);
    setCity(cityInput);
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchWorkers(next, false);
  }

  const hasMore = workers.length < total;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-green-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Labour</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Hire Skilled Labour</h1>
          <p className="text-green-200 text-lg max-w-2xl">
            Connect with trusted masons (mistri), electricians, plumbers, carpenters, painters, and more. Hire by the day or week.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 bg-white rounded-xl flex items-center gap-2 px-4">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search trade (e.g. mistri, electrician, plumber)"
                className="flex-1 py-3 text-stone-700 placeholder-stone-400 outline-none bg-transparent"
              />
            </div>
            <div className="bg-white rounded-xl flex items-center gap-2 px-4">
              <MapPin className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="City"
                className="w-32 py-3 text-stone-700 placeholder-stone-400 outline-none bg-transparent"
              />
            </div>
            <button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Trade filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8">
          {tradeFilters.map((t) => (
            <button
              key={t.value}
              onClick={() => setTrade(t.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                trade === t.value
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-stone-600 border-stone-200 hover:border-green-300 hover:text-green-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-stone-600 text-sm">
            {loading ? "Loading..." : (
              <><span className="font-semibold text-stone-900">{total}</span> workers available</>
            )}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            {error} — <button onClick={() => fetchWorkers(1, true)} className="underline font-semibold">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h2 className="font-bold text-stone-700 text-lg mb-2">No workers found</h2>
            <p className="text-stone-500 text-sm">Try a different trade, search, or city.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {workers.map((w) => (
              <Link key={w.id} href={`/labour/${w.id}`} className="card bg-white p-5 flex flex-col group block">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 font-bold text-lg flex items-center justify-center text-2xl">
                    {TRADE_EMOJI[w.trade] ?? "🛠️"}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${w.isAvailable ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                    {w.isAvailable ? "● Available" : "○ Busy"}
                  </span>
                </div>

                <h3 className="font-bold text-stone-900 group-hover:text-green-700 transition-colors">{w.user?.fullName ?? "—"}</h3>
                <p className="text-orange-500 text-sm font-semibold">{TRADE_LABEL[w.trade] ?? w.trade}</p>

                <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-stone-700">{w.rating.toFixed(1)}</span> ({w.reviewCount})
                  </span>
                  {w.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {w.city}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {w.experienceYears} yrs
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {w.completedJobs} jobs
                  </span>
                </div>

                {w.skills && w.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {w.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {w.skills.length > 3 && (
                      <span className="text-xs text-stone-400 px-2 py-0.5">+{w.skills.length - 3}</span>
                    )}
                  </div>
                )}

                {w.languages && w.languages.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-stone-400">
                    <span>Speaks: {w.languages.join(", ")}</span>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-extrabold text-stone-900">₹{w.dailyRate.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-stone-500">per day</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="p-2 rounded-lg border border-stone-200 hover:border-green-300 text-stone-500 hover:text-green-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors">
                      <Clock className="w-3.5 h-3.5" /> Book
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="text-center mt-12">
            <button onClick={loadMore} disabled={loadingMore} className="btn-secondary px-10 disabled:opacity-50">
              {loadingMore ? "Loading..." : "Load More Workers"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
