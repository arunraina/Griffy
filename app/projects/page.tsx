"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MapPin, Calendar, IndianRupee, Users, Search, ChevronRight, Briefcase } from "lucide-react";
import { listProjects, Project } from "@/lib/api";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  civil: "Civil / Structure",
  electrical: "Electrical",
  plumbing: "Plumbing",
  interior: "Interior",
  structural: "Structural",
  painting: "Painting",
  architecture: "Architecture",
  other: "Other",
};

const PROJECT_TYPE_EMOJI: Record<string, string> = {
  civil: "🏗️", electrical: "⚡", plumbing: "🔧", interior: "🛋️",
  structural: "🏛️", painting: "🎨", architecture: "📐", other: "🔨",
};

const TYPE_FILTERS = [
  { value: "", label: "All Types" },
  { value: "civil", label: "Civil" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "interior", label: "Interior" },
  { value: "structural", label: "Structural" },
  { value: "painting", label: "Painting" },
  { value: "architecture", label: "Architecture" },
  { value: "other", label: "Other" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [projectType, setProjectType] = useState("");
  const [city, setCity] = useState("");
  const [cityInput, setCityInput] = useState("");

  const limit = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProjects({ page, limit, search: search || undefined, projectType: projectType || undefined, city: city || undefined });
      setProjects(res.data);
      setTotal(res.total);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, projectType, city]);

  useEffect(() => { load(); }, [load]);

  function applySearch() {
    setSearch(searchInput);
    setCity(cityInput);
    setPage(1);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="flex items-center gap-2 text-sm text-stone-400 mb-4">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-stone-700 font-medium">Open Projects</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-stone-900">Open Projects</h1>
              <p className="text-stone-500 mt-1">Homeowners looking for contractors — submit your bid today</p>
            </div>
            <Link href="/post-project" className="btn-primary shrink-0">
              + Post a Project
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              placeholder="City..."
              className="w-full sm:w-36 pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button onClick={applySearch} className="btn-primary shrink-0">Search</button>
        </div>

        {/* Type chips */}
        <div className="flex gap-2 flex-wrap mb-6">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.value}
              onClick={() => { setProjectType(t.value); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${projectType === t.value ? "bg-orange-500 text-white border-orange-500" : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"}`}
            >
              {t.value && PROJECT_TYPE_EMOJI[t.value] ? `${PROJECT_TYPE_EMOJI[t.value]} ` : ""}{t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 animate-pulse">
                <div className="h-4 bg-stone-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-stone-100 rounded w-full mb-2" />
                <div className="h-3 bg-stone-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-lg font-semibold">No open projects found</p>
            <p className="text-stone-400 text-sm mt-1">Try adjusting your filters or check back soon</p>
            <Link href="/post-project" className="btn-primary mt-5 inline-flex">Be the first to post one</Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-stone-400 mb-4">{total} project{total !== 1 ? "s" : ""} found</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="block bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all p-5 group">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{PROJECT_TYPE_EMOJI[p.projectType] ?? "🔨"}</span>
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Open</span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-base leading-snug group-hover:text-orange-600 transition-colors mb-1 line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-stone-500 mb-3 font-medium">{PROJECT_TYPE_LABELS[p.projectType] ?? p.projectType}</p>

                  {p.description && (
                    <p className="text-sm text-stone-500 line-clamp-2 mb-3">{p.description}</p>
                  )}

                  <div className="space-y-1.5 text-xs text-stone-500">
                    {(p.city || p.state) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        <span>{[p.city, p.state].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    {(p.budgetMin || p.budgetMax) && (
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-orange-400" />
                        <span>
                          {p.budgetMin && `₹${Number(p.budgetMin).toLocaleString("en-IN")}`}
                          {p.budgetMin && p.budgetMax ? " – " : ""}
                          {p.budgetMax && `₹${Number(p.budgetMax).toLocaleString("en-IN")}`}
                        </span>
                      </div>
                    )}
                    {p.timeline && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-orange-400" />
                        <span>{p.timeline}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>{p.bidCount ?? 0} bid{(p.bidCount ?? 0) !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-xs text-stone-400">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">Prev</button>
                <span className="text-sm text-stone-500">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary disabled:opacity-40">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
