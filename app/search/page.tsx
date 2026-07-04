"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Star, MapPin, X, SlidersHorizontal, Building2, HardHat, Package, ChevronRight } from "lucide-react";
import { listContractors, listLabour, listMaterials, Contractor, Labour, Material } from "@/lib/api";
import { SPECIALTY_LABEL, TRADE_LABEL } from "@/lib/constants";
import SaveButton from "@/components/SaveButton";

type SearchTab = "all" | "materials" | "contractors" | "labour";

const POPULAR = ["electrician", "plumber", "cement", "mason", "painter", "TMT steel", "civil contractor"];
const CATEGORIES = [
  { label: "Sand & Aggregate", emoji: "🏖️", href: "/materials?category=sand" },
  { label: "Bricks & Blocks", emoji: "🧱", href: "/materials?category=bricks" },
  { label: "Cement", emoji: "🏗️", href: "/materials?category=cement" },
  { label: "Civil Contractors", emoji: "🔨", href: "/contractors?specialty=civil" },
  { label: "Electricians", emoji: "⚡", href: "/labour?trade=electrician" },
  { label: "Plumbers", emoji: "🔧", href: "/labour?trade=plumber" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [input, setInput] = useState(searchParams.get("q") ?? "");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [city, setCity] = useState("");
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [labour, setLabour] = useState<Labour[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);

  const searched = query.trim().length > 0;

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    Promise.allSettled([
      listContractors({ search: query, city: city || undefined, limit: 8 }),
      listLabour({ search: query, city: city || undefined, limit: 8 }),
      listMaterials({ search: query, city: city || undefined, limit: 8 }),
    ]).then(([c, l, m]) => {
      setContractors(c.status === "fulfilled" ? c.value.data : []);
      setLabour(l.status === "fulfilled" ? l.value.data : []);
      setMaterials(m.status === "fulfilled" ? m.value.data : []);
    }).finally(() => setLoading(false));
  }, [query, city]);

  function handleSearch(q?: string) {
    const term = q ?? input;
    if (!term.trim()) return;
    setQuery(term.trim());
    setInput(term.trim());
    router.replace(`/search?q=${encodeURIComponent(term.trim())}`, { scroll: false });
  }

  const visibleContractors = activeTab === "all" || activeTab === "contractors" ? contractors : [];
  const visibleLabour = activeTab === "all" || activeTab === "labour" ? labour : [];
  const visibleMaterials = activeTab === "all" || activeTab === "materials" ? materials : [];
  const total = contractors.length + labour.length + materials.length;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100 sticky top-16 z-30 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search materials, contractors, labour..."
                autoFocus
                className="w-full pl-12 pr-4 py-3.5 border border-stone-200 rounded-2xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-stone-50 focus:bg-white"
              />
              {input && (
                <button onClick={() => { setInput(""); setQuery(""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={() => handleSearch()} className="btn-primary px-6 rounded-2xl">Search</button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${showFilters ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"}`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-stone-700">City</label>
                <input
                  type="text"
                  placeholder="Any city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white"
                />
              </div>
              <button onClick={() => setCity("")} className="text-sm text-stone-400 hover:text-stone-600 underline ml-auto">Reset</button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!searched && (
          <div className="max-w-2xl">
            <div className="mb-8">
              <p className="text-sm font-bold text-stone-700 mb-3">Popular on Griffy</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((s) => (
                  <button key={s} onClick={() => handleSearch(s)}
                    className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 text-sm font-medium rounded-full border border-orange-200 transition-all">
                    🔥 {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-stone-700 mb-4">Browse by Category</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <Link key={cat.label} href={cat.href}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-200 hover:border-orange-300 hover:shadow-md transition-all group">
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-sm font-semibold text-stone-700 group-hover:text-orange-500 transition-colors">{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {searched && (
          <div>
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {(["all", "contractors", "labour", "materials"] as SearchTab[]).map((tab) => {
                const count = tab === "all" ? total : tab === "contractors" ? contractors.length : tab === "labour" ? labour.length : materials.length;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all capitalize ${activeTab === tab ? "bg-orange-500 text-white border-orange-500" : "bg-white text-stone-600 border-stone-200 hover:border-orange-300"}`}>
                    {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
                    <span className="opacity-70 text-xs">({loading ? "…" : count})</span>
                  </button>
                );
              })}
            </div>

            {loading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}
              </div>
            )}

            {!loading && (
              <>
                {visibleContractors.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-500" /> Contractors</h2>
                      <Link href={`/contractors?search=${encodeURIComponent(query)}`} className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">See all <ChevronRight className="w-4 h-4" /></Link>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {visibleContractors.map((c) => (
                        <div key={c.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all p-5">
                          <div className="flex items-start justify-between mb-2">
                            <Link href={`/contractors/${c.id}`} className="font-bold text-stone-900 hover:text-orange-500 transition-colors">{c.businessName}</Link>
                            <SaveButton type="contractor" targetId={c.id} className="shrink-0 ml-2" />
                          </div>
                          <p className="text-sm text-blue-600 font-semibold">{SPECIALTY_LABEL[c.specialty] ?? c.specialty}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-stone-500 mt-2">
                            {c.rating > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{c.rating.toFixed(1)}</span>}
                            {(c.city || c.state) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[c.city, c.state].filter(Boolean).join(", ")}</span>}
                          </div>
                          <div className="mt-3 pt-3 border-t border-stone-50 flex items-center justify-between">
                            {c.priceRangeMin != null ? <p className="font-bold text-stone-900 text-sm">₹{Number(c.priceRangeMin).toLocaleString("en-IN")}/{c.priceUnit ?? "sqft"}</p> : <p className="text-sm text-stone-400">Contact for price</p>}
                            <Link href={`/contractors/${c.id}`} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">View</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {visibleLabour.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2"><HardHat className="w-5 h-5 text-orange-500" /> Labour</h2>
                      <Link href={`/labour?search=${encodeURIComponent(query)}`} className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">See all <ChevronRight className="w-4 h-4" /></Link>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {visibleLabour.map((w) => (
                        <div key={w.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all p-5">
                          <div className="flex items-start justify-between mb-2">
                            <Link href={`/labour/${w.id}`} className="font-bold text-stone-900 hover:text-orange-500 transition-colors">{w.user?.fullName ?? "Worker"}</Link>
                            <SaveButton type="labour" targetId={w.id} className="shrink-0 ml-2" />
                          </div>
                          <p className="text-sm text-green-600 font-semibold">{TRADE_LABEL[w.trade] ?? w.trade}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-stone-500 mt-2">
                            {w.rating > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{w.rating.toFixed(1)}</span>}
                            {(w.city || w.state) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[w.city, w.state].filter(Boolean).join(", ")}</span>}
                          </div>
                          <div className="mt-3 pt-3 border-t border-stone-50 flex items-center justify-between">
                            <p className="font-extrabold text-stone-900">₹{Number(w.dailyRate).toLocaleString("en-IN")}/day</p>
                            <Link href={`/labour/${w.id}`} className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">Book</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {visibleMaterials.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2"><Package className="w-5 h-5 text-stone-600" /> Materials</h2>
                      <Link href={`/materials?search=${encodeURIComponent(query)}`} className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">See all <ChevronRight className="w-4 h-4" /></Link>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {visibleMaterials.map((m) => (
                        <div key={m.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                          <div className="h-24 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-3xl">📦</div>
                          <div className="p-4">
                            <p className="text-xs text-orange-500 font-semibold">{m.category}</p>
                            <Link href={`/materials/${m.id}`} className="font-bold text-stone-900 text-sm mt-0.5 group-hover:text-orange-500 transition-colors block">{m.name}</Link>
                            <div className="flex items-center justify-between mt-3">
                              <p className="font-extrabold text-stone-900 text-sm">₹{Number(m.pricePerUnit).toLocaleString("en-IN")}/{m.unit}</p>
                              <SaveButton type="material" targetId={m.id} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {total === 0 && (
                  <div className="text-center py-20">
                    <p className="text-5xl mb-4">🔍</p>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">No results found</h3>
                    <p className="text-stone-500">Try a different search term or browse by category below.</p>
                    <Link href="/materials" className="btn-primary mt-6 inline-flex">Browse Materials</Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}
