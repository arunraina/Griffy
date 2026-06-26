"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Search, Filter, Star, MapPin, Truck, ShoppingCart, Phone, Clock, X, SlidersHorizontal } from "lucide-react";

type SearchTab = "all" | "materials" | "contractors" | "labour";

const allResults = {
  materials: [
    { id: "m1", name: "River Sand (Fine Grade)", category: "Sand & Aggregate", emoji: "🏖️", price: "₹1,800/ton", supplier: "Kaveri Aggregates", location: "Bengaluru", rating: 4.7, reviews: 234, delivery: "24 hrs", badge: "Best Seller", badgeColor: "bg-orange-100 text-orange-700" },
    { id: "m2", name: "Red Clay Bricks (Class A)", category: "Bricks & Blocks", emoji: "🧱", price: "₹8/piece", supplier: "Rajasthan Brick Works", location: "Jaipur", rating: 4.8, reviews: 412, delivery: "2–3 days", badge: "Top Rated", badgeColor: "bg-yellow-100 text-yellow-700" },
    { id: "m3", name: "UltraTech OPC 53 Grade Cement", category: "Cement", emoji: "🏗️", price: "₹420/bag", supplier: "UltraTech Dealer", location: "Mumbai", rating: 4.9, reviews: 1089, delivery: "Same day", badge: "Verified Brand", badgeColor: "bg-green-100 text-green-700" },
    { id: "m4", name: "JSW TMT Fe500 Steel Bars 12mm", category: "Steel & TMT", emoji: "🔩", price: "₹68,000/ton", supplier: "JSW Distributor", location: "Hyderabad", rating: 4.8, reviews: 567, delivery: "1–2 days", badge: null, badgeColor: "" },
  ],
  contractors: [
    { id: "c1", name: "Rajan Constructions", specialty: "Civil Contractor", emoji: "🔨", price: "₹800–1200/sq ft", location: "Bengaluru", rating: 4.9, reviews: 287, experience: "14 yrs", badge: "Top Pro", badgeColor: "bg-orange-100 text-orange-700", available: true },
    { id: "c2", name: "Mehta & Associates", specialty: "Structural Engineer", emoji: "📐", price: "₹1200–2000/sq ft", location: "Mumbai", rating: 4.8, reviews: 412, experience: "20 yrs", badge: "Licensed", badgeColor: "bg-blue-100 text-blue-700", available: true },
    { id: "c3", name: "Powerline Electricals", specialty: "Electrical Contractor", emoji: "⚡", price: "₹80–150/sq ft", location: "Hyderabad", rating: 4.7, reviews: 198, experience: "10 yrs", badge: null, badgeColor: "", available: false },
  ],
  labour: [
    { id: "l1", name: "Mohammed Rafiq", trade: "Mason / Mistri", emoji: "🧱", price: "₹900/day", location: "Bengaluru", rating: 4.8, reviews: 167, experience: "12 yrs", badge: "Top Mistri", badgeColor: "bg-orange-100 text-orange-700", available: true },
    { id: "l2", name: "Sanjay Electricals", trade: "Electrician", emoji: "⚡", price: "₹750/day", location: "Mumbai", rating: 4.7, reviews: 234, experience: "8 yrs", badge: "Licensed", badgeColor: "bg-blue-100 text-blue-700", available: true },
    { id: "l3", name: "Arjun Carpenter", trade: "Carpenter", emoji: "🪚", price: "₹1,100/day", location: "Chennai", rating: 4.9, reviews: 310, experience: "15 yrs", badge: "Expert", badgeColor: "bg-amber-100 text-amber-700", available: true },
  ],
};

const recentSearches = ["River Sand Bengaluru", "Civil Contractor", "Electrician near me", "TMT Steel Price"];
const popularSearches = ["Cement price today", "Mistri hire", "Plumber", "Bricks bulk order", "Interior designer", "Waterproofing contractor"];

function SearchContent() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ city: "", minRating: 0, available: false });
  const [searched, setSearched] = useState(false);

  const handleSearch = (q?: string) => {
    if (q) setQuery(q);
    setSearched(true);
  };

  const visibleMaterials = activeTab === "all" || activeTab === "materials" ? allResults.materials : [];
  const visibleContractors = activeTab === "all" || activeTab === "contractors" ? allResults.contractors : [];
  const visibleLabour = activeTab === "all" || activeTab === "labour" ? allResults.labour : [];
  const totalResults = visibleMaterials.length + visibleContractors.length + visibleLabour.length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Search header */}
      <div className="bg-white border-b border-stone-100 sticky top-16 z-30 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search materials, contractors, labour..."
                autoFocus
                className="w-full pl-12 pr-4 py-3.5 border border-stone-200 rounded-2xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-stone-50 focus:bg-white"
              />
              {query && (
                <button onClick={() => { setQuery(""); setSearched(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleSearch()}
              className="btn-primary px-6 rounded-2xl"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${showFilters ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"}`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-stone-700">City</label>
                <input
                  type="text"
                  placeholder="Any city"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-stone-700">Min Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                  className="px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white"
                >
                  <option value={0}>Any</option>
                  <option value={4}>4+</option>
                  <option value={4.5}>4.5+</option>
                  <option value={4.8}>4.8+</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.available}
                  onChange={(e) => setFilters({ ...filters, available: e.target.checked })}
                  className="w-4 h-4 accent-orange-500 rounded"
                />
                Available now only
              </label>
              <button onClick={() => setFilters({ city: "", minRating: 0, available: false })} className="text-sm text-stone-400 hover:text-stone-600 underline ml-auto">
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Not searched yet */}
        {!searched && (
          <div className="max-w-2xl">
            {recentSearches.length > 0 && (
              <div className="mb-8">
                <p className="text-sm font-bold text-stone-700 mb-3">Recent Searches</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <button key={s} onClick={() => handleSearch(s)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-stone-200 text-stone-600 text-sm hover:border-orange-300 hover:text-orange-500 transition-all">
                      <Clock className="w-3.5 h-3.5 text-stone-400" /> {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-stone-700 mb-3">Popular on Griffy</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((s) => (
                  <button key={s} onClick={() => handleSearch(s)}
                    className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 text-sm font-medium rounded-full border border-orange-200 transition-all">
                    🔥 {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse categories */}
            <div className="mt-10">
              <p className="text-sm font-bold text-stone-700 mb-4">Browse by Category</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Sand & Aggregate", emoji: "🏖️", href: "/materials?cat=sand" },
                  { label: "Bricks & Blocks", emoji: "🧱", href: "/materials?cat=bricks" },
                  { label: "Cement", emoji: "🏗️", href: "/materials?cat=cement" },
                  { label: "Civil Contractors", emoji: "🔨", href: "/contractors?specialty=civil" },
                  { label: "Electricians", emoji: "⚡", href: "/labour?trade=electrician" },
                  { label: "Plumbers", emoji: "🔧", href: "/labour?trade=plumber" },
                ].map((cat) => (
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

        {/* Search results */}
        {searched && (
          <div>
            {/* Result tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {(["all", "materials", "contractors", "labour"] as SearchTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all capitalize ${
                    activeTab === tab ? "bg-orange-500 text-white border-orange-500" : "bg-white text-stone-600 border-stone-200 hover:border-orange-300"
                  }`}
                >
                  {tab === "all" ? `All Results (${totalResults})` : tab === "materials" ? `Materials (${allResults.materials.length})` : tab === "contractors" ? `Contractors (${allResults.contractors.length})` : `Labour (${allResults.labour.length})`}
                </button>
              ))}
            </div>

            {query && (
              <p className="text-stone-500 text-sm mb-6">
                Showing results for <span className="font-semibold text-stone-800">&ldquo;{query}&rdquo;</span>
              </p>
            )}

            {/* Materials */}
            {visibleMaterials.length > 0 && (
              <section className="mb-10">
                {activeTab === "all" && <h2 className="text-lg font-bold text-stone-900 mb-4">Materials</h2>}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {visibleMaterials.map((m) => (
                    <div key={m.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                      <div className="h-28 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-4xl relative">
                        {m.emoji}
                        {m.badge && <span className={`absolute top-2 left-2 badge ${m.badgeColor} text-xs`}>{m.badge}</span>}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-orange-500 font-semibold">{m.category}</p>
                        <h3 className="font-bold text-stone-900 text-sm mt-0.5 group-hover:text-orange-500 transition-colors">{m.name}</h3>
                        <p className="text-xs text-stone-500 mt-1">{m.supplier}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold text-stone-700">{m.rating}</span>
                          <span>({m.reviews})</span>
                          <span>·</span>
                          <MapPin className="w-3 h-3" />{m.location}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                          <Truck className="w-3 h-3" /> {m.delivery}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="font-extrabold text-stone-900">{m.price}</p>
                          <button className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors">
                            <ShoppingCart className="w-3 h-3" /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contractors */}
            {visibleContractors.length > 0 && (
              <section className="mb-10">
                {activeTab === "all" && <h2 className="text-lg font-bold text-stone-900 mb-4">Contractors</h2>}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleContractors.map((c) => (
                    <div key={c.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">{c.emoji}</div>
                          <div>
                            <h3 className="font-bold text-stone-900 text-sm">{c.name}</h3>
                            <p className="text-xs text-blue-600 font-semibold">{c.specialty}</p>
                          </div>
                        </div>
                        {c.badge && <span className={`badge ${c.badgeColor} text-xs`}>{c.badge}</span>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-3">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /><b className="text-stone-700">{c.rating}</b> ({c.reviews})</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>
                        <span>{c.experience} exp</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-stone-50">
                        <div>
                          <p className="text-xs text-stone-400">Price</p>
                          <p className="font-bold text-stone-900 text-sm">{c.price}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 border border-stone-200 rounded-lg text-stone-500 hover:text-blue-500 hover:border-blue-200 transition-colors">
                            <Phone className="w-4 h-4" />
                          </button>
                          <Link href={`/contractors/${c.id}`} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Labour */}
            {visibleLabour.length > 0 && (
              <section>
                {activeTab === "all" && <h2 className="text-lg font-bold text-stone-900 mb-4">Labour</h2>}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleLabour.map((w) => (
                    <div key={w.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-2xl">{w.emoji}</div>
                          <div>
                            <h3 className="font-bold text-stone-900 text-sm">{w.name}</h3>
                            <p className="text-xs text-green-600 font-semibold">{w.trade}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${w.available ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                          {w.available ? "● Available" : "○ Busy"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-3">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /><b className="text-stone-700">{w.rating}</b> ({w.reviews})</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{w.location}</span>
                        <span>{w.experience} exp</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-stone-50">
                        <div>
                          <p className="text-xl font-extrabold text-stone-900">{w.price}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 border border-stone-200 rounded-lg text-stone-500 hover:text-green-500 hover:border-green-200 transition-colors">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                            <Clock className="w-3.5 h-3.5" /> Book
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {totalResults === 0 && (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-xl font-bold text-stone-900 mb-2">No results found</h3>
                <p className="text-stone-500">Try a different search term or browse by category below.</p>
                <Link href="/materials" className="btn-primary mt-6 inline-flex">Browse Materials</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
