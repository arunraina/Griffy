"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Star, MapPin, CheckCircle2, Phone, Calendar, ChevronRight, Filter, Shield } from "lucide-react";
import { listContractors, Contractor } from "@/lib/api";
import { SPECIALTY_LABEL } from "@/lib/constants";

const specialtyFilters = [
  { label: "All", value: "" },
  { label: "Civil Contractor", value: "civil" },
  { label: "Structural Engineer", value: "structural" },
  { label: "Electrical Contractor", value: "electrical" },
  { label: "Plumbing Contractor", value: "plumbing" },
  { label: "Interior Designer", value: "interior" },
  { label: "Architect", value: "architect" },
  { label: "Painting Contractor", value: "painting" },
];

function SkeletonCard() {
  return (
    <div className="card bg-white p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-stone-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-stone-200 rounded w-1/2" />
          <div className="h-3 bg-stone-200 rounded w-1/3" />
          <div className="h-3 bg-stone-200 rounded w-3/4 mt-3" />
          <div className="h-8 bg-stone-200 rounded mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("");

  const fetchContractors = useCallback(async (p: number, replace: boolean) => {
    try {
      replace ? setLoading(true) : setLoadingMore(true);
      const res = await listContractors({
        page: p, limit: 10,
        specialty: specialty || undefined,
        city: city || undefined,
        search: search || undefined,
      });
      setContractors((prev) => replace ? res.data : [...prev, ...res.data]);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message ?? "Failed to load contractors");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [specialty, city, search]);

  useEffect(() => {
    setPage(1);
    fetchContractors(1, true);
  }, [specialty, city, search]);

  function handleSearch() {
    setSearch(searchInput);
    setCity(cityInput);
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchContractors(next, false);
  }

  const hasMore = contractors.length < total;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-blue-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Contractors</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Find Contractors</h1>
          <p className="text-blue-200 text-lg max-w-2xl">
            Hire verified, experienced contractors for your construction project. Compare profiles, reviews, and get quotes in minutes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 bg-white rounded-xl flex items-center gap-2 px-4">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by name, specialty, or location"
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
        {/* Specialty filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8">
          {specialtyFilters.map((type) => (
            <button
              key={type.value}
              onClick={() => setSpecialty(type.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                specialty === type.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-stone-600 border-stone-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-stone-600 text-sm">
            {loading ? "Loading..." : (
              <><span className="font-semibold text-stone-900">{total}</span> contractors found</>
            )}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            {error} — <button onClick={() => fetchContractors(1, true)} className="underline font-semibold">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : contractors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h2 className="font-bold text-stone-700 text-lg mb-2">No contractors found</h2>
            <p className="text-stone-500 text-sm">Try a different search, specialty, or city.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {contractors.map((c) => (
              <div key={c.id} className="card bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 font-bold text-lg flex items-center justify-center shrink-0">
                    {(c.businessName ?? c.user?.fullName ?? "?").slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-stone-900 text-lg">{c.businessName}</h3>
                          {c.isVerified && <Shield className="w-4 h-4 text-blue-500 shrink-0" aria-label="Verified" />}
                        </div>
                        <p className="text-stone-500 text-sm">{c.user?.fullName ?? "—"} · {SPECIALTY_LABEL[c.specialty] ?? c.specialty}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.isAvailable ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                        {c.isAvailable ? "● Available" : "○ Busy"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-stone-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-stone-700">{c.rating.toFixed(1)}</span>
                        <span>({c.reviewCount} reviews)</span>
                      </span>
                      {(c.city || c.state) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {[c.city, c.state].filter(Boolean).join(", ")}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {c.experienceYears} yrs exp
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> {c.completedProjects} projects
                      </span>
                    </div>

                    {c.skills && c.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {c.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                      <div>
                        <p className="text-xs text-stone-500">Price Range</p>
                        <p className="font-bold text-stone-900">
                          {c.priceRangeMin != null && c.priceRangeMax != null
                            ? `₹${c.priceRangeMin.toLocaleString("en-IN")}–${c.priceRangeMax.toLocaleString("en-IN")}${c.priceUnit ? `/${c.priceUnit}` : ""}`
                            : "Contact for price"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 border border-stone-200 hover:border-blue-300 text-stone-600 hover:text-blue-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                          <Phone className="w-4 h-4" /> Call
                        </button>
                        <Link
                          href={`/contractors/${c.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="text-center mt-12">
            <button onClick={loadMore} disabled={loadingMore} className="btn-secondary px-10 disabled:opacity-50">
              {loadingMore ? "Loading..." : "Load More Contractors"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
