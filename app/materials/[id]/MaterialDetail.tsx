"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star, Truck, MapPin, ShieldCheck, ChevronRight, Minus, Plus,
  Heart, Share2, Phone, CheckCircle2, AlertCircle, Package
} from "lucide-react";
import { getMaterial, Material } from "@/lib/api";
import { CATEGORY_EMOJI, CATEGORY_LABEL } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import ReviewsList from "@/components/ReviewsList";

function Skeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="aspect-square bg-stone-200 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-4 bg-stone-200 rounded w-1/4" />
          <div className="h-8 bg-stone-200 rounded w-3/4" />
          <div className="h-4 bg-stone-200 rounded w-1/3" />
          <div className="h-24 bg-stone-200 rounded" />
          <div className="h-12 bg-stone-200 rounded" />
          <div className="h-12 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    getMaterial(id)
      .then((m) => {
        setMaterial(m);
        setQty(m.minOrderQuantity ?? 1);
      })
      .catch((e) => setError(e.message ?? "Failed to load material"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-stone-50"><Skeleton /></div>;

  if (error || !material) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h2 className="font-bold text-stone-700 mb-2">Material not found</h2>
          <p className="text-stone-500 text-sm mb-4">{error}</p>
          <Link href="/materials" className="btn-primary">Browse Materials</Link>
        </div>
      </div>
    );
  }

  const emoji = CATEGORY_EMOJI[material.category] ?? "📦";
  const minQ = material.minOrderQuantity ?? 1;
  const maxQ = material.stockQuantity ?? 9999;
  const total = (Number(material.pricePerUnit) * qty).toLocaleString("en-IN");

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${material.name} — ₹${Number(material.pricePerUnit).toLocaleString("en-IN")}/${material.unit} on Griffy\n${pageUrl}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: material.name,
    description: material.description ?? undefined,
    image: material.imageUrls?.[0] ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: Number(material.pricePerUnit).toFixed(2),
      availability: material.isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: material.supplier ? { "@type": "Organization", name: material.supplier.fullName } : undefined,
    },
    aggregateRating: material.reviewCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: material.rating.toFixed(1),
      reviewCount: material.reviewCount,
      bestRating: "5",
    } : undefined,
  };

  function handleAddToCart() {
    addItem({
      id: material!.id,
      name: material!.name,
      emoji,
      category: material!.category,
      price: Number(material!.pricePerUnit),
      unit: material!.unit,
      supplier: material!.supplier?.fullName ?? "",
      quantity: qty,
      minOrder: minQ,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-stone-500 flex-wrap">
          <Link href="/" className="hover:text-orange-500">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/materials" className="hover:text-orange-500">Materials</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/materials?category=${material.category}`} className="hover:text-orange-500">
            {CATEGORY_LABEL[material.category] ?? material.category}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-stone-800 font-medium truncate">{material.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Image / Gallery */}
          <div>
            {material.imageUrls && material.imageUrls.length > 0 ? (
              <div className="space-y-3">
                <div className="aspect-square rounded-3xl overflow-hidden relative shadow-sm border border-stone-100">
                  <img
                    src={material.imageUrls[activeImg]}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                  {material.isFeatured && (
                    <span className="absolute top-4 left-4 badge bg-orange-100 text-orange-700 text-sm">Featured</span>
                  )}
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${saved ? "bg-red-500 text-white" : "bg-white text-stone-500 hover:text-red-400"}`}
                  >
                    <Heart className={`w-5 h-5 ${saved ? "fill-white" : ""}`} />
                  </button>
                </div>
                {material.imageUrls.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {material.imageUrls.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImg(i)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? "border-orange-400" : "border-transparent"}`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 rounded-3xl flex items-center justify-center text-[120px] relative overflow-hidden shadow-sm">
                {emoji}
                {material.isFeatured && (
                  <span className="absolute top-4 left-4 badge bg-orange-100 text-orange-700 text-sm">Featured</span>
                )}
                <button
                  onClick={() => setSaved(!saved)}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${saved ? "bg-red-500 text-white" : "bg-white text-stone-500 hover:text-red-400"}`}
                >
                  <Heart className={`w-5 h-5 ${saved ? "fill-white" : ""}`} />
                </button>
              </div>
            )}
          </div>

          {/* Info + Order */}
          <div>
            <p className="text-orange-500 text-sm font-semibold mb-1">{CATEGORY_LABEL[material.category] ?? material.category}</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 mb-3">{material.name}</h1>

            {material.rating > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(material.rating) ? "text-yellow-400 fill-yellow-400" : "text-stone-200"}`} />
                  ))}
                </div>
                <span className="font-bold text-stone-900">{material.rating.toFixed(1)}</span>
                <span className="text-stone-500 text-sm">({material.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-stone-900">₹{Number(material.pricePerUnit).toLocaleString("en-IN")}</span>
                <span className="text-stone-500">per {material.unit}</span>
              </div>
              {minQ > 1 && <p className="text-sm text-stone-500 mt-1">Min. order: {minQ} {material.unit}</p>}
            </div>

            {/* Supplier */}
            {material.supplier && (
              <div className="flex items-center gap-3 mb-5 p-4 bg-white rounded-2xl border border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {material.supplier.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 text-sm">{material.supplier.fullName}</p>
                  {(material.city || material.state) && (
                    <p className="text-xs text-stone-500">{[material.city, material.state].filter(Boolean).join(", ")}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Verified
                </div>
              </div>
            )}

            {/* Trust chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {material.deliveryDays && (
                <span className="flex items-center gap-1.5 text-xs text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-full">
                  <Truck className="w-3.5 h-3.5 text-green-500" /> {material.deliveryDays}
                </span>
              )}
              {(material.city || material.state) && (
                <span className="flex items-center gap-1.5 text-xs text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-full">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" /> {[material.city, material.state].filter(Boolean).join(", ")}
                </span>
              )}
              {material.stockQuantity != null && (
                <span className="flex items-center gap-1.5 text-xs text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-full">
                  <Package className="w-3.5 h-3.5 text-orange-500" />
                  {material.stockQuantity > 0 ? `${material.stockQuantity} ${material.unit} in stock` : "Out of stock"}
                </span>
              )}
              {material.brand && (
                <span className="flex items-center gap-1.5 text-xs text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-full">
                  🏷️ {material.brand}
                </span>
              )}
            </div>

            {/* Quantity selector */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-stone-700 mb-2">Quantity ({material.unit})</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-0 border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(minQ, qty - 1))}
                    className="w-12 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={qty}
                    min={minQ}
                    onChange={(e) => setQty(Math.max(minQ, Number(e.target.value)))}
                    className="w-16 h-12 text-center font-bold text-stone-900 border-x border-stone-200 focus:outline-none focus:bg-orange-50"
                  />
                  <button
                    onClick={() => setQty(Math.min(maxQ, qty + 1))}
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

            {/* CTA */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all ${
                  added ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg"
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
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-[#25D366] hover:bg-[#20bc5a] flex items-center justify-center text-white transition-colors"
                title="Share on WhatsApp">
                <Share2 className="w-5 h-5" />
              </a>
            </div>

            <button className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 text-stone-600 hover:border-blue-300 hover:text-blue-600 font-medium transition-all">
              <Phone className="w-4 h-4" /> Call Supplier for Bulk Discount
            </button>
          </div>
        </div>

        {/* Lower section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {material.description && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="font-bold text-stone-900 text-lg mb-3">Product Description</h2>
                <p className="text-stone-600 leading-relaxed">{material.description}</p>
              </div>
            )}

            {/* Info card when no description */}
            {!material.description && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="font-bold text-stone-900 text-lg mb-4">Product Details</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: "Category", value: CATEGORY_LABEL[material.category] ?? material.category },
                    material.brand && { label: "Brand", value: material.brand },
                    { label: "Unit", value: material.unit },
                    material.minOrderQuantity && { label: "Min. Order", value: `${material.minOrderQuantity} ${material.unit}` },
                    material.deliveryDays && { label: "Delivery", value: material.deliveryDays },
                    (material.city || material.state) && { label: "Ships From", value: [material.city, material.state].filter(Boolean).join(", ") },
                  ].filter(Boolean).map((spec: any) => (
                    <div key={spec.label} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                      <span className="text-sm text-stone-500">{spec.label}</span>
                      <span className="text-sm font-semibold text-stone-800">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ReviewsList targetType="material" targetId={material.id} rating={material.rating} reviewCount={material.reviewCount} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-bold text-stone-900 mb-3 text-sm">Delivery Info</h3>
              <div className="space-y-3 text-sm">
                {[
                  { icon: Truck, color: "text-green-500", label: "Delivery", val: material.deliveryDays ?? "Contact supplier" },
                  { icon: MapPin, color: "text-blue-500", label: "Ships from", val: [material.city, material.state].filter(Boolean).join(", ") || "—" },
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

            <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4">
              <p className="text-sm font-bold text-stone-700 mb-1">Need help ordering?</p>
              <Link href="/contact" className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                Contact Support →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
