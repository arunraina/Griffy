"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star, Truck, MapPin, ShieldCheck, ChevronRight, Minus, Plus,
  Heart, Share2, Phone, CheckCircle2, AlertCircle, Package
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const material = {
  id: "m1",
  name: "River Sand (Fine Grade)",
  category: "Sand & Aggregate",
  emoji: "🏖️",
  price: 1800,
  unit: "per ton",
  minOrder: 5,
  maxOrder: 500,
  supplier: "Kaveri Aggregates Pvt Ltd",
  supplierRating: 4.8,
  supplierReviews: 892,
  supplierSince: "2015",
  location: "Bengaluru, KA",
  delivery: "Within 24 hours",
  rating: 4.7,
  reviews: 234,
  stock: "Available (500+ tons)",
  verified: true,
  brand: "Kaveri Grade A",
  badge: "Best Seller",
  description: "Premium quality river sand sourced from certified quarries along the Kaveri river basin. Grade A fine sand, ideal for plastering, RCC work, and brickwork. Sieved and washed to remove clay, silt, and organic material. Meets IS 383:2016 specifications.",
  specs: [
    { label: "Grade", value: "Fine Sand (Zone II)" },
    { label: "IS Standard", value: "IS 383:2016" },
    { label: "Size", value: "0.075 – 4.75 mm" },
    { label: "Silt Content", value: "< 3%" },
    { label: "Moisture", value: "< 5%" },
    { label: "Source", value: "Kaveri River Basin" },
  ],
  uses: ["Plastering", "RCC / Concrete", "Brickwork Mortar", "Block Jointing", "Flooring Screed"],
  images: ["🏖️", "🏝️", "⛱️"],
  reviewsList: [
    { author: "Suresh K", rating: 5, date: "Jun 2025", text: "Excellent quality sand. No silt, clean and properly graded. Delivery was on time.", avatar: "SK" },
    { author: "Ravi M", rating: 5, date: "May 2025", text: "Used for plastering work — very smooth finish. Will order again.", avatar: "RM" },
    { author: "Anita P", rating: 4, date: "Apr 2025", text: "Good quality but delivery was delayed by a few hours. Overall satisfied.", avatar: "AP" },
  ],
  similarProducts: [
    { id: "m7", name: "M-Sand (Manufactured Sand)", emoji: "🏜️", price: 1500, unit: "/ton", rating: 4.5 },
    { id: "m8", name: "Coarse Sand (Plastering)", emoji: "🏖️", price: 1600, unit: "/ton", rating: 4.6 },
    { id: "m9", name: "P-Sand (Plaster Sand)", emoji: "⛏️", price: 1700, unit: "/ton", rating: 4.7 },
  ],
};

export default function MaterialDetailPage({ params }: { params: { id: string } }) {
  const [qty, setQty] = useState(material.minOrder);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: material.id,
      name: material.name,
      emoji: material.emoji,
      category: material.category,
      price: material.price,
      unit: material.unit,
      supplier: material.supplier,
      quantity: qty,
      minOrder: material.minOrder,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const total = (material.price * qty).toLocaleString("en-IN");

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-stone-500">
          <Link href="/" className="hover:text-orange-500">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/materials" className="hover:text-orange-500">Materials</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/materials?cat=sand" className="hover:text-orange-500">{material.category}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-stone-800 font-medium truncate">{material.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 rounded-3xl flex items-center justify-center text-[120px] mb-4 relative overflow-hidden shadow-sm">
              {material.images[activeImg]}
              {material.badge && (
                <span className="absolute top-4 left-4 badge bg-orange-100 text-orange-700 text-sm">{material.badge}</span>
              )}
              <button
                onClick={() => setSaved(!saved)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${saved ? "bg-red-500 text-white" : "bg-white text-stone-500 hover:text-red-400"}`}
              >
                <Heart className={`w-5 h-5 ${saved ? "fill-white" : ""}`} />
              </button>
            </div>
            <div className="flex gap-3">
              {material.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-1 aspect-square rounded-2xl flex items-center justify-center text-4xl border-2 transition-all ${activeImg === i ? "border-orange-500 bg-orange-50" : "border-stone-200 bg-white"}`}
                >
                  {img}
                </button>
              ))}
            </div>
          </div>

          {/* Info + Order */}
          <div>
            <p className="text-orange-500 text-sm font-semibold mb-1">{material.category}</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 mb-3">{material.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(material.rating) ? "text-yellow-400 fill-yellow-400" : "text-stone-200"}`} />
                ))}
              </div>
              <span className="font-bold text-stone-900">{material.rating}</span>
              <span className="text-stone-500 text-sm">({material.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-stone-900">₹{material.price.toLocaleString("en-IN")}</span>
                <span className="text-stone-500">{material.unit}</span>
              </div>
              <p className="text-sm text-stone-500 mt-1">Min. order: {material.minOrder} tons</p>
            </div>

            {/* Supplier */}
            <div className="flex items-center gap-3 mb-5 p-4 bg-white rounded-2xl border border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">KA</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 text-sm">{material.supplier}</p>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span>{material.supplierRating} · {material.supplierReviews} ratings</span>
                  <span>·</span>
                  <span>Since {material.supplierSince}</span>
                </div>
              </div>
              {material.verified && (
                <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Verified
                </div>
              )}
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="flex items-center gap-1.5 text-xs text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-full">
                <Truck className="w-3.5 h-3.5 text-green-500" /> {material.delivery}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> {material.location}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-full">
                <Package className="w-3.5 h-3.5 text-orange-500" /> {material.stock}
              </span>
            </div>

            {/* Quantity selector */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-stone-700 mb-2">Quantity (tons)</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-0 border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(material.minOrder, qty - 1))}
                    className="w-12 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={qty}
                    min={material.minOrder}
                    max={material.maxOrder}
                    onChange={(e) => setQty(Math.max(material.minOrder, Number(e.target.value)))}
                    className="w-16 h-12 text-center font-bold text-stone-900 border-x border-stone-200 focus:outline-none focus:bg-orange-50"
                  />
                  <button
                    onClick={() => setQty(Math.min(material.maxOrder, qty + 1))}
                    className="w-12 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Total estimate</p>
                  <p className="text-xl font-extrabold text-orange-500">₹{total}</p>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all ${
                  added
                    ? "bg-green-500 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {added ? <><CheckCircle2 className="w-5 h-5" /> Added to Cart!</> : "Add to Cart"}
              </button>
              <Link
                href="/checkout"
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-md"
              >
                Buy Now
              </Link>
              <button className="w-12 h-12 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-700 hover:border-stone-300 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <button className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 text-stone-600 hover:border-blue-300 hover:text-blue-600 font-medium transition-all">
              <Phone className="w-4 h-4" /> Call Supplier for Bulk Discount
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-3">Product Description</h2>
              <p className="text-stone-600 leading-relaxed">{material.description}</p>
              <h3 className="font-bold text-stone-900 mt-5 mb-3">Best Used For</h3>
              <div className="flex flex-wrap gap-2">
                {material.uses.map((use) => (
                  <span key={use} className="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm font-medium rounded-full border border-orange-100">{use}</span>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-4">Specifications</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {material.specs.map((spec) => (
                  <div key={spec.label} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                    <span className="text-sm text-stone-500">{spec.label}</span>
                    <span className="text-sm font-semibold text-stone-800">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-stone-900 text-lg">Customer Reviews</h2>
                <div className="flex items-center gap-2">
                  <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
                  <span className="font-bold text-stone-900">{material.rating}</span>
                  <span className="text-stone-500 text-sm">({material.reviews})</span>
                </div>
              </div>
              <div className="space-y-5">
                {material.reviewsList.map((r, i) => (
                  <div key={i} className={i < material.reviewsList.length - 1 ? "pb-5 border-b border-stone-50" : ""}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center">{r.avatar}</div>
                        <div>
                          <p className="font-semibold text-stone-900 text-sm">{r.author}</p>
                          <p className="text-xs text-stone-400">{r.date}</p>
                        </div>
                      </div>
                      <div className="flex">{[...Array(r.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-bold text-stone-900 mb-3 text-sm">Delivery Info</h3>
              <div className="space-y-3 text-sm">
                {[
                  { icon: Truck, color: "text-green-500", label: "Delivery", val: material.delivery },
                  { icon: MapPin, color: "text-blue-500", label: "Ships from", val: material.location },
                  { icon: ShieldCheck, color: "text-orange-500", label: "Quality check", val: "Before dispatch" },
                  { icon: AlertCircle, color: "text-purple-500", label: "Returns", val: "If quality issue" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className={`w-4 h-4 ${item.color} shrink-0 mt-0.5`} />
                    <div>
                      <span className="text-stone-400">{item.label}: </span>
                      <span className="font-medium text-stone-700">{item.val}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-bold text-stone-900 mb-3 text-sm">Similar Products</h3>
              <div className="space-y-3">
                {material.similarProducts.map((p) => (
                  <Link key={p.id} href={`/materials/${p.id}`} className="flex items-center gap-3 hover:bg-stone-50 p-2 rounded-xl transition-colors group">
                    <span className="text-2xl">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 group-hover:text-orange-500 transition-colors truncate">{p.name}</p>
                      <p className="text-xs text-stone-500">₹{p.price.toLocaleString()}{p.unit} · ⭐ {p.rating}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
