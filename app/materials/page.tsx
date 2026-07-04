"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, Star, Truck, MapPin, ShoppingCart, ChevronRight } from "lucide-react";
import { listMaterials, Material } from "@/lib/api";
import { CATEGORY_EMOJI, CATEGORY_LABEL } from "@/lib/constants";
import { useCart } from "@/context/CartContext";

const categoryFilters = [
  { label: "All", value: "" },
  { label: "Sand & Aggregate", value: "sand" },
  { label: "Bricks & Blocks", value: "bricks" },
  { label: "Cement", value: "cement" },
  { label: "Steel & TMT", value: "steel" },
  { label: "Wood & Timber", value: "wood" },
  { label: "Tiles & Flooring", value: "tiles" },
  { label: "Paint", value: "paint" },
  { label: "Electrical", value: "electrical" },
  { label: "Plumbing", value: "plumbing" },
];

function SkeletonCard() {
  return (
    <div className="card bg-white overflow-hidden animate-pulse">
      <div className="h-36 bg-stone-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-stone-200 rounded w-1/3" />
        <div className="h-4 bg-stone-200 rounded w-3/4" />
        <div className="h-3 bg-stone-200 rounded w-1/2" />
        <div className="h-8 bg-stone-200 rounded mt-4" />
      </div>
    </div>
  );
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const { addItem } = useCart();

  const fetchMaterials = useCallback(async (p: number, replace: boolean) => {
    try {
      replace ? setLoading(true) : setLoadingMore(true);
      const res = await listMaterials({ page: p, limit: 12, category: category || undefined, search: search || undefined });
      setMaterials((prev) => replace ? res.data : [...prev, ...res.data]);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message ?? "Failed to load materials");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, search]);

  useEffect(() => {
    setPage(1);
    fetchMaterials(1, true);
  }, [category, search]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchMaterials(next, false);
  }

  function handleSearch() {
    setSearch(searchInput);
  }

  const hasMore = materials.length < total;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-stone-400 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Materials</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Construction Materials</h1>
          <p className="text-stone-300 text-lg max-w-2xl">
            Factory-direct prices from verified suppliers. Compare, order, and get it delivered to your construction site.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 bg-white rounded-xl flex items-center gap-2 px-4">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for materials (e.g. cement, sand, TMT bars)"
                className="flex-1 py-3 text-stone-700 placeholder-stone-400 outline-none bg-transparent"
              />
            </div>
            <button onClick={handleSearch} className="btn-primary rounded-xl whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {categoryFilters.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                category === cat.value
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-stone-600 text-sm">
            {loading ? "Loading..." : (
              <>Showing <span className="font-semibold text-stone-900">{materials.length}</span> of <span className="font-semibold text-stone-900">{total}</span> products</>
            )}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            {error} — <button onClick={() => fetchMaterials(1, true)} className="underline font-semibold">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h2 className="font-bold text-stone-700 text-lg mb-2">No materials found</h2>
            <p className="text-stone-500 text-sm">Try a different search or category filter.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {materials.map((m) => (
              <Link key={m.id} href={`/materials/${m.id}`} className="card bg-white overflow-hidden group block">
                <div className="h-36 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-5xl relative">
                  {CATEGORY_EMOJI[m.category] ?? "📦"}
                  {m.isFeatured && (
                    <span className="absolute top-3 left-3 badge bg-orange-100 text-orange-700 text-xs">Featured</span>
                  )}
                  {m.isAvailable && (
                    <span className="absolute top-3 right-3 badge bg-green-100 text-green-700 text-xs">✓ Available</span>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-xs text-orange-500 font-semibold mb-1">{CATEGORY_LABEL[m.category] ?? m.category}</p>
                  <h3 className="font-bold text-stone-900 text-sm leading-tight mb-1 group-hover:text-orange-500 transition-colors">
                    {m.name}
                  </h3>
                  <p className="text-xs text-stone-500 mb-3">{m.supplier?.fullName ?? "—"}</p>

                  <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-stone-700">{m.rating.toFixed(1)}</span>
                      ({m.reviewCount})
                    </span>
                    {(m.city || m.state) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {[m.city, m.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>

                  {m.deliveryDays && (
                    <div className="flex items-center gap-1 text-xs text-stone-500 mb-4">
                      <Truck className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-green-600 font-medium">Delivery: {m.deliveryDays}</span>
                    </div>
                  )}

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xl font-extrabold text-stone-900">
                        ₹{m.pricePerUnit.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-stone-500">
                        per {m.unit}{m.minOrderQuantity ? ` · Min ${m.minOrderQuantity}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addItem({
                          id: m.id, name: m.name, price: m.pricePerUnit, unit: m.unit,
                          emoji: CATEGORY_EMOJI[m.category] ?? "📦",
                          category: m.category,
                          supplier: m.supplier?.fullName ?? "",
                          quantity: m.minOrderQuantity ?? 1,
                          minOrder: m.minOrderQuantity ?? 1,
                        });
                      }}
                      className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="text-center mt-12">
            <button onClick={loadMore} disabled={loadingMore} className="btn-secondary px-10 disabled:opacity-50">
              {loadingMore ? "Loading..." : "Load More Products"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
