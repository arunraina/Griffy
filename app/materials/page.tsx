import Link from "next/link";
import { Search, Filter, Star, Truck, MapPin, ShoppingCart, ChevronRight } from "lucide-react";

const materialCategories = [
  { label: "All", value: "all" },
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

const materials = [
  {
    id: 1,
    name: "River Sand (Fine Grade)",
    category: "Sand & Aggregate",
    supplier: "Kaveri Aggregates Pvt Ltd",
    location: "Bengaluru, KA",
    price: 1800,
    unit: "per ton",
    minOrder: "5 tons",
    rating: 4.7,
    reviews: 234,
    badge: "Best Seller",
    badgeColor: "bg-orange-100 text-orange-700",
    emoji: "🏖️",
    delivery: "Within 24 hrs",
    verified: true,
  },
  {
    id: 2,
    name: "Red Clay Bricks (Class A)",
    category: "Bricks & Blocks",
    supplier: "Rajasthan Brick Works",
    location: "Jaipur, RJ",
    price: 8,
    unit: "per piece",
    minOrder: "1000 pcs",
    rating: 4.8,
    reviews: 412,
    badge: "Top Rated",
    badgeColor: "bg-yellow-100 text-yellow-700",
    emoji: "🧱",
    delivery: "2–3 days",
    verified: true,
  },
  {
    id: 3,
    name: "UltraTech OPC 53 Grade Cement",
    category: "Cement",
    supplier: "UltraTech Authorized Dealer",
    location: "Mumbai, MH",
    price: 420,
    unit: "per bag (50kg)",
    minOrder: "20 bags",
    rating: 4.9,
    reviews: 1089,
    badge: "Verified Brand",
    badgeColor: "bg-green-100 text-green-700",
    emoji: "🏗️",
    delivery: "Same day",
    verified: true,
  },
  {
    id: 4,
    name: "JSW TMT Fe500 Steel Bars 12mm",
    category: "Steel & TMT",
    supplier: "JSW Steel Distributor",
    location: "Hyderabad, TS",
    price: 68000,
    unit: "per ton",
    minOrder: "1 ton",
    rating: 4.8,
    reviews: 567,
    badge: "Top Rated",
    badgeColor: "bg-yellow-100 text-yellow-700",
    emoji: "🔩",
    delivery: "1–2 days",
    verified: true,
  },
  {
    id: 5,
    name: "Teak Wood Planks (Grade 1)",
    category: "Wood & Timber",
    supplier: "Karnataka Forest Corp",
    location: "Mysuru, KA",
    price: 2200,
    unit: "per cu ft",
    minOrder: "10 cu ft",
    rating: 4.6,
    reviews: 189,
    badge: null,
    badgeColor: "",
    emoji: "🪵",
    delivery: "3–5 days",
    verified: true,
  },
  {
    id: 6,
    name: "Vitrified Floor Tiles 2x2 ft (Matt)",
    category: "Tiles & Flooring",
    supplier: "Kajaria Tiles Dealer",
    location: "Delhi, DL",
    price: 65,
    unit: "per sq ft",
    minOrder: "100 sq ft",
    rating: 4.7,
    reviews: 344,
    badge: "Popular",
    badgeColor: "bg-blue-100 text-blue-700",
    emoji: "⬜",
    delivery: "2–3 days",
    verified: true,
  },
  {
    id: 7,
    name: "M-Sand (Manufactured Sand)",
    category: "Sand & Aggregate",
    supplier: "Deccan Aggregates",
    location: "Pune, MH",
    price: 1500,
    unit: "per ton",
    minOrder: "5 tons",
    rating: 4.5,
    reviews: 156,
    badge: null,
    badgeColor: "",
    emoji: "🏖️",
    delivery: "Within 24 hrs",
    verified: true,
  },
  {
    id: 8,
    name: "AAC Blocks (600x200x150mm)",
    category: "Bricks & Blocks",
    supplier: "Renacon Infra Ltd",
    location: "Ahmedabad, GJ",
    price: 45,
    unit: "per piece",
    minOrder: "500 pcs",
    rating: 4.7,
    reviews: 278,
    badge: "Eco Friendly",
    badgeColor: "bg-emerald-100 text-emerald-700",
    emoji: "🧱",
    delivery: "2–4 days",
    verified: true,
  },
];

export const metadata = {
  title: "Buy Construction Materials | Griffy",
  description: "Shop thousands of verified construction materials at factory prices. Sand, bricks, cement, steel, wood, tiles and more.",
};

export default function MaterialsPage() {
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
            Factory-direct prices from 10,000+ verified suppliers. Compare, order, and get it delivered to your construction site.
          </p>

          {/* Search */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 bg-white rounded-xl flex items-center gap-2 px-4">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="Search for materials (e.g. cement, sand, TMT bars)"
                className="flex-1 py-3 text-stone-700 placeholder-stone-400 outline-none bg-transparent"
              />
            </div>
            <button className="btn-primary rounded-xl whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {materialCategories.map((cat) => (
            <button
              key={cat.value}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                cat.value === "all"
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
            Showing <span className="font-semibold text-stone-900">{materials.length}</span> products
          </p>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-lg px-3 py-2 hover:bg-white transition-colors">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <select className="text-sm font-medium text-stone-600 border border-stone-200 rounded-lg px-3 py-2 bg-white outline-none">
              <option>Sort: Relevance</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Top Rated</option>
            </select>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {materials.map((m) => (
            <div key={m.id} className="card bg-white overflow-hidden group">
              {/* Thumbnail */}
              <div className="h-36 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-5xl relative">
                {m.emoji}
                {m.badge && (
                  <span className={`absolute top-3 left-3 badge ${m.badgeColor} text-xs`}>
                    {m.badge}
                  </span>
                )}
                {m.verified && (
                  <span className="absolute top-3 right-3 badge bg-green-100 text-green-700 text-xs">
                    ✓ Verified
                  </span>
                )}
              </div>

              <div className="p-4">
                <p className="text-xs text-orange-500 font-semibold mb-1">{m.category}</p>
                <h3 className="font-bold text-stone-900 text-sm leading-tight mb-1 group-hover:text-orange-500 transition-colors">
                  {m.name}
                </h3>
                <p className="text-xs text-stone-500 mb-3">{m.supplier}</p>

                <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-stone-700">{m.rating}</span>
                    ({m.reviews})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {m.location}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-stone-500 mb-4">
                  <Truck className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600 font-medium">Delivery: {m.delivery}</span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xl font-extrabold text-stone-900">
                      ₹{m.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-stone-500">{m.unit} · Min {m.minOrder}</p>
                  </div>
                  <button className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                    <ShoppingCart className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load more */}
        <div className="text-center mt-12">
          <button className="btn-secondary px-10">
            Load More Products
          </button>
        </div>
      </div>
    </div>
  );
}
