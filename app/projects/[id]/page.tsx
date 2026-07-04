"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Calendar, IndianRupee, Users, ChevronRight, Star, CheckCircle2,
  AlertTriangle, Send, XCircle, Award,
} from "lucide-react";
import {
  getProject, getProjectBids, submitBid, updateBidStatus, getMe,
  Project, Bid, User,
} from "@/lib/api";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  civil: "Civil / Structure", electrical: "Electrical", plumbing: "Plumbing",
  interior: "Interior", structural: "Structural", painting: "Painting",
  architecture: "Architecture", other: "Other",
};
const PROJECT_TYPE_EMOJI: Record<string, string> = {
  civil: "🏗️", electrical: "⚡", plumbing: "🔧", interior: "🛋️",
  structural: "🏛️", painting: "🎨", architecture: "📐", other: "🔨",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  closed: "bg-stone-100 text-stone-500",
  awarded: "bg-blue-100 text-blue-700",
};

const BID_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  shortlisted: "bg-blue-100 text-blue-700",
  awarded: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const CONTACT_RE = /(?:\+91[\s-]?)?[6-9]\d{9}|\b\d{10}\b|\b\d{5}[\s-]\d{5}\b|(?:instagram\.com\/|@)[a-zA-Z0-9_.]{3,}|(?:facebook\.com|fb\.com|fb\.gg)\/[a-zA-Z0-9.?=&_-]+|(?:wa\.me|whatsapp\.com\/send)[^\s]*/i;

function detectContactInfo(text: string): string | null {
  if (/(?:\+91[\s-]?)?[6-9]\d{9}|\b\d{10}\b|\b\d{5}[\s-]\d{5}\b/.test(text)) return "phone number";
  if (/(?:instagram\.com\/|@)[a-zA-Z0-9_.]{3,}/i.test(text)) return "Instagram handle";
  if (/(?:facebook\.com|fb\.com|fb\.gg)\//i.test(text)) return "Facebook link";
  if (/(?:wa\.me|whatsapp\.com\/send)/i.test(text)) return "WhatsApp link";
  return null;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Bid form
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidWarning, setBidWarning] = useState<string | null>(null);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);

  // Bid actions
  const [updatingBid, setUpdatingBid] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [proj, user] = await Promise.all([getProject(id), getMe().catch(() => null)]);
        setProject(proj);
        setMe(user);
        if (user && proj.homeownerId === user.id) {
          try { setBids(await getProjectBids(id)); } catch { /* not owner */ }
        }
      } catch {
        router.replace("/projects");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  function handleBidMessageChange(val: string) {
    setBidMessage(val);
    setBidWarning(detectContactInfo(val));
  }

  async function handleBidSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bidAmount || !bidMessage.trim()) { setBidError("Amount and message are required."); return; }
    const v = detectContactInfo(bidMessage);
    if (v) { setBidError(`Sharing ${v}s is not allowed. Keep conversations on Griffy for your protection.`); return; }

    setSubmittingBid(true);
    setBidError("");
    try {
      await submitBid(id, { bidAmount: Number(bidAmount), message: bidMessage.trim() });
      setBidSuccess(true);
    } catch (e: any) {
      setBidError(e.message ?? "Failed to submit bid");
    } finally {
      setSubmittingBid(false);
    }
  }

  async function handleBidStatus(bidId: string, status: string) {
    setUpdatingBid(bidId);
    try {
      const updated = await updateBidStatus(id, bidId, status);
      setBids((prev) => prev.map((b) => b.id === bidId ? updated : b));
      if (status === "awarded") {
        setProject((p) => p ? { ...p, status: "awarded" } : p);
      }
    } catch (e: any) {
      alert(e.message ?? "Failed to update bid");
    } finally {
      setUpdatingBid(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  const isOwner = me?.id === project.homeownerId;
  const isContractor = me?.role === "contractor";
  const canBid = isContractor && project.status === "open" && !bidSuccess;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-stone-400 mb-1">
            <Link href="/projects" className="hover:text-orange-500">Projects</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-stone-700 font-medium line-clamp-1">{project.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{PROJECT_TYPE_EMOJI[project.projectType] ?? "🔨"}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[project.status] ?? "bg-stone-100 text-stone-500"}`}>
                  {project.status}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-stone-900 mb-1">{project.title}</h1>
              <p className="text-sm text-orange-600 font-semibold mb-4">
                {PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType}
              </p>

              {project.description && (
                <p className="text-stone-600 leading-relaxed mb-4">{project.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                {(project.city || project.state) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    {[project.city, project.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {(project.budgetMin || project.budgetMax) && (
                  <span className="flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-orange-400" />
                    {project.budgetMin && `₹${Number(project.budgetMin).toLocaleString("en-IN")}`}
                    {project.budgetMin && project.budgetMax && " – "}
                    {project.budgetMax && `₹${Number(project.budgetMax).toLocaleString("en-IN")}`}
                  </span>
                )}
                {project.timeline && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    {project.timeline}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-orange-400" />
                  {project.bidCount ?? 0} bid{(project.bidCount ?? 0) !== 1 ? "s" : ""}
                </span>
              </div>

              <p className="text-xs text-stone-400 mt-4">
                Posted {new Date(project.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                {project.homeowner && ` · by ${project.homeowner.fullName}`}
              </p>
            </div>

            {/* Bids (owner only) */}
            {isOwner && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="font-bold text-stone-900 text-lg mb-4">
                  Bids ({bids.length})
                </h2>
                {bids.length === 0 ? (
                  <div className="text-center py-8 text-stone-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No bids yet. Contractors will start bidding soon.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <div key={bid.id} className="border border-stone-100 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-stone-900">
                              {bid.contractor?.user?.fullName ?? bid.contractor?.businessName ?? "Contractor"}
                            </p>
                            <p className="text-xs text-stone-500">{bid.contractor?.specialty}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-orange-600 text-lg">
                              ₹{Number(bid.bidAmount).toLocaleString("en-IN")}
                            </p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BID_STATUS_COLORS[bid.status]}`}>
                              {bid.status}
                            </span>
                          </div>
                        </div>

                        {bid.contractor && (
                          <div className="flex items-center gap-3 text-xs text-stone-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              {bid.contractor.rating?.toFixed(1) ?? "—"}
                            </span>
                            <span>{bid.contractor.experienceYears}y experience</span>
                            <span>{bid.contractor.completedProjects} projects</span>
                          </div>
                        )}

                        <p className="text-sm text-stone-600 mb-3">{bid.message}</p>

                        {bid.status === "pending" && project.status === "open" && (
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleBidStatus(bid.id, "shortlisted")}
                              disabled={updatingBid === bid.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleBidStatus(bid.id, "awarded")}
                              disabled={updatingBid === bid.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <Award className="w-3.5 h-3.5" /> Award
                            </button>
                            <button
                              onClick={() => handleBidStatus(bid.id, "rejected")}
                              disabled={updatingBid === bid.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                        {bid.status === "shortlisted" && project.status === "open" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBidStatus(bid.id, "awarded")}
                              disabled={updatingBid === bid.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <Award className="w-3.5 h-3.5" /> Award
                            </button>
                            <button
                              onClick={() => handleBidStatus(bid.id, "rejected")}
                              disabled={updatingBid === bid.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                        {bid.status === "awarded" && (
                          <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> Awarded — Project closed
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Bid form for contractors */}
            {canBid && !me && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 text-center">
                <p className="text-stone-600 text-sm mb-3">Sign in to submit a bid</p>
                <Link href="/login?redirect=/projects" className="btn-primary w-full justify-center">Sign In</Link>
              </div>
            )}

            {isContractor && project.status !== "open" && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 text-center">
                <p className="text-stone-500 text-sm">This project is no longer accepting bids.</p>
              </div>
            )}

            {bidSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="font-bold text-green-800">Bid submitted!</p>
                <p className="text-sm text-green-600 mt-1">The homeowner will review and get back to you.</p>
              </div>
            )}

            {canBid && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Send className="w-4 h-4 text-orange-500" /> Submit Your Bid
                </h3>

                <form onSubmit={handleBidSubmit} className="space-y-4">
                  {bidError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{bidError}</div>
                  )}
                  {bidWarning && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Sharing a {bidWarning} is not allowed on Griffy.</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1.5">
                      Your Bid Amount (₹) *
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="number"
                        min={0}
                        required
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="e.g. 250000"
                        className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1.5">
                      Message to Homeowner *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={bidMessage}
                      onChange={(e) => handleBidMessageChange(e.target.value)}
                      placeholder="Introduce yourself, describe your approach, relevant experience..."
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingBid || !!bidWarning}
                    className="w-full btn-primary justify-center disabled:opacity-50"
                  >
                    {submittingBid ? "Submitting..." : "Submit Bid"}
                  </button>
                  <p className="text-xs text-stone-400 text-center">Do not share contact details — all communication stays on Griffy.</p>
                </form>
              </div>
            )}

            {/* Quick info */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3 text-sm">
              <h3 className="font-bold text-stone-900">Project Details</h3>
              <div className="flex items-center gap-2 text-stone-600">
                <span className="text-xl">{PROJECT_TYPE_EMOJI[project.projectType] ?? "🔨"}</span>
                <span>{PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType}</span>
              </div>
              {(project.city || project.state) && (
                <div className="flex items-center gap-2 text-stone-600">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <span>{[project.city, project.state].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {(project.budgetMin || project.budgetMax) && (
                <div className="flex items-center gap-2 text-stone-600">
                  <IndianRupee className="w-4 h-4 text-stone-400" />
                  <span>
                    {project.budgetMin && `₹${Number(project.budgetMin).toLocaleString("en-IN")}`}
                    {project.budgetMin && project.budgetMax && " – "}
                    {project.budgetMax && `₹${Number(project.budgetMax).toLocaleString("en-IN")}`}
                  </span>
                </div>
              )}
              {project.timeline && (
                <div className="flex items-center gap-2 text-stone-600">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <span>{project.timeline}</span>
                </div>
              )}
            </div>

            {isOwner && project.status === "open" && (
              <Link href="/post-project" className="btn-secondary w-full justify-center text-sm">
                + Post Another Project
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
