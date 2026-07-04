"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Building2, HardHat, Package, Trash2 } from "lucide-react";
import { listSaved, unsaveItem, SavedItem, SavedType, listContractors, listLabour, listMaterials } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { SPECIALTY_LABEL, TRADE_LABEL } from "@/lib/constants";

type EnrichedItem = SavedItem & { name?: string; subtitle?: string; href?: string };

const TYPE_ICONS = { contractor: Building2, labour: HardHat, material: Package };
const TYPE_LABELS = { contractor: "Contractor", labour: "Labour", material: "Material" };

export default function SavedPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SavedType | "all">("all");

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    listSaved()
      .then((saved) => {
        setItems(saved.map((s) => ({
          ...s,
          name: "—",
          subtitle: TYPE_LABELS[s.type],
          href: `/${s.type === "contractor" ? "contractors" : s.type === "labour" ? "labour" : "materials"}/${s.targetId}`,
        })));
        // Fetch names in background
        enrichItems(saved).then(setItems);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  async function enrichItems(saved: SavedItem[]): Promise<EnrichedItem[]> {
    const contractorIds = saved.filter((s) => s.type === "contractor").map((s) => s.targetId);
    const labourIds = saved.filter((s) => s.type === "labour").map((s) => s.targetId);
    const materialIds = saved.filter((s) => s.type === "material").map((s) => s.targetId);

    const [contractors, labour, materials] = await Promise.allSettled([
      contractorIds.length ? listContractors({ limit: 100 }) : Promise.resolve({ data: [] }),
      labourIds.length ? listLabour({ limit: 100 }) : Promise.resolve({ data: [] }),
      materialIds.length ? listMaterials({ limit: 100 }) : Promise.resolve({ data: [] }),
    ]);

    const cMap: Record<string, any> = {};
    const lMap: Record<string, any> = {};
    const mMap: Record<string, any> = {};

    if (contractors.status === "fulfilled") contractors.value.data.forEach((c: any) => (cMap[c.id] = c));
    if (labour.status === "fulfilled") labour.value.data.forEach((l: any) => (lMap[l.id] = l));
    if (materials.status === "fulfilled") materials.value.data.forEach((m: any) => (mMap[m.id] = m));

    return saved.map((s) => {
      if (s.type === "contractor" && cMap[s.targetId]) {
        const c = cMap[s.targetId];
        return { ...s, name: c.businessName, subtitle: SPECIALTY_LABEL[c.specialty] ?? c.specialty, href: `/contractors/${s.targetId}` };
      }
      if (s.type === "labour" && lMap[s.targetId]) {
        const l = lMap[s.targetId];
        return { ...s, name: l.user?.fullName ?? "Worker", subtitle: TRADE_LABEL[l.trade] ?? l.trade, href: `/labour/${s.targetId}` };
      }
      if (s.type === "material" && mMap[s.targetId]) {
        const m = mMap[s.targetId];
        return { ...s, name: m.name, subtitle: `₹${Number(m.pricePerUnit).toLocaleString("en-IN")} / ${m.unit}`, href: `/materials/${s.targetId}` };
      }
      return { ...s, href: `/${s.type}/${s.targetId}` };
    });
  }

  async function handleRemove(item: EnrichedItem) {
    await unsaveItem(item.type, item.targetId).catch(() => undefined);
    setItems((prev) => prev.filter((i) => !(i.type === item.type && i.targetId === item.targetId)));
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h2 className="font-bold text-stone-700 mb-2">Sign in to view saved items</h2>
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-7 h-7 text-orange-500 fill-orange-500" />
          <h1 className="text-2xl font-extrabold text-stone-900">Saved Items</h1>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "contractor", "labour", "material"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === t ? "bg-orange-500 text-white" : "bg-white text-stone-600 border border-stone-200 hover:border-orange-300"}`}
            >
              {t === "all" ? "All" : TYPE_LABELS[t]}
              <span className="ml-1.5 text-xs opacity-70">
                {t === "all" ? items.length : items.filter((i) => i.type === t).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-12 h-12 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-500 font-medium">Nothing saved yet</p>
            <p className="text-stone-400 text-sm mt-1">Tap the bookmark icon on any contractor, worker, or material.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((item) => {
              const Icon = TYPE_ICONS[item.type];
              return (
                <div key={`${item.type}:${item.targetId}`} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={item.href ?? "#"} className="font-semibold text-stone-900 hover:text-orange-500 transition-colors block truncate">
                      {item.name}
                    </Link>
                    <p className="text-sm text-stone-500 truncate">{item.subtitle}</p>
                    <span className="text-xs text-stone-400 mt-0.5 block">{TYPE_LABELS[item.type]}</span>
                  </div>
                  <button onClick={() => handleRemove(item)} className="p-2 text-stone-300 hover:text-red-400 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
