"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, CheckCircle2, Phone, Calendar, Shield, Clock, Award, ChevronRight, MessageSquare } from "lucide-react";
import { getContractor, Contractor } from "@/lib/api";
import { SPECIALTY_LABEL } from "@/lib/constants";
import ReviewsList from "@/components/ReviewsList";
import EnquiryModal from "@/components/EnquiryModal";
import TierBadge from "@/components/TierBadge";
import AchievementBadges from "@/components/AchievementBadges";
import SaveButton from "@/components/SaveButton";
import { getTier, getContractorBadges } from "@/lib/gamification";

function Skeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 h-40 bg-stone-200" />
          <div className="bg-stone-200 rounded-2xl h-32" />
        </div>
        <div className="bg-stone-200 rounded-2xl h-64" />
      </div>
    </div>
  );
}

export default function ContractorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEnquiry, setShowEnquiry] = useState(false);

  useEffect(() => {
    getContractor(id)
      .then(setContractor)
      .catch((e) => setError(e.message ?? "Failed to load contractor"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-stone-50"><Skeleton /></div>;

  if (error || !contractor) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">👷</p>
          <h2 className="font-bold text-stone-700 mb-2">Contractor not found</h2>
          <p className="text-stone-500 text-sm mb-4">{error}</p>
          <Link href="/contractors" className="btn-primary">Browse Contractors</Link>
        </div>
      </div>
    );
  }

  const avatarText = (contractor.businessName ?? contractor.user?.fullName ?? "??").slice(0, 2).toUpperCase();
  const tier = getTier(contractor.completedProjects, contractor.rating);
  const badges = getContractorBadges(contractor);
  const priceLabel = contractor.priceRangeMin != null && contractor.priceRangeMax != null
    ? `₹${Number(contractor.priceRangeMin).toLocaleString("en-IN")}–${Number(contractor.priceRangeMax).toLocaleString("en-IN")}${contractor.priceUnit ? "/" + contractor.priceUnit : ""}`
    : "Contact for price";

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/contractors" className="hover:text-orange-500">Contractors</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-stone-900 font-medium">{contractor.businessName}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-blue-100 text-blue-600 font-extrabold text-2xl flex items-center justify-center">
                  {contractor.avatarUrl
                    ? <img src={contractor.avatarUrl} alt={contractor.businessName} className="w-full h-full object-cover" />
                    : avatarText
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-extrabold text-stone-900">{contractor.businessName}</h1>
                    {contractor.isVerified && <Shield className="w-5 h-5 text-blue-500" />}
                  </div>
                  <p className="text-stone-500 mt-0.5">
                    {contractor.user?.fullName ? `${contractor.user.fullName} · ` : ""}
                    {SPECIALTY_LABEL[contractor.specialty] ?? contractor.specialty}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-stone-600">
                    {contractor.rating > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-stone-900">{contractor.rating.toFixed(1)}</span>
                        <span className="text-stone-500">({contractor.reviewCount} reviews)</span>
                      </span>
                    )}
                    {(contractor.city || contractor.state) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        {[contractor.city, contractor.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-stone-400" />{contractor.experienceYears} yrs exp
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />{contractor.completedProjects} projects done
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${contractor.isAvailable ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {contractor.isAvailable ? "● Available for projects" : "● Currently busy"}
                    </span>
                    {contractor.isVerified && (
                      <span className="badge bg-blue-100 text-blue-700 text-xs flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {contractor.licenseNumber && (
                      <span className="badge bg-stone-100 text-stone-600 text-xs font-mono">
                        Lic: {contractor.licenseNumber}
                      </span>
                    )}
                    <TierBadge tier={tier} completedJobs={contractor.completedProjects} rating={contractor.rating} size="sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* About / Bio */}
            {contractor.bio && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="font-bold text-stone-900 text-lg mb-3">About</h2>
                <p className="text-stone-600 leading-relaxed">{contractor.bio}</p>
              </div>
            )}

            {/* Skills */}
            {contractor.skills && contractor.skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="font-bold text-stone-900 text-lg mb-3">Skills & Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {contractor.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-stone-100 text-stone-700 text-sm font-medium rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {contractor.portfolioImages && contractor.portfolioImages.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <h2 className="font-bold text-stone-900 text-lg mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {contractor.portfolioImages.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden bg-stone-100 block">
                      <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {badges.length > 0 && <AchievementBadges badges={badges} title="Badges" />}

            <ReviewsList targetType="contractor" targetId={contractor.id} rating={contractor.rating} reviewCount={contractor.reviewCount} />
          </div>

          {showEnquiry && (
            <EnquiryModal
              recipientType="contractor"
              targetId={contractor.id}
              recipientName={contractor.businessName ?? contractor.user?.fullName ?? "Contractor"}
              onClose={() => setShowEnquiry(false)}
            />
          )}

          {/* Sidebar — Book / Contact */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sticky top-24">
              <div className="text-center mb-5 pb-5 border-b border-stone-50">
                <p className="text-sm text-stone-500 mb-1">Price range</p>
                <p className="text-2xl font-extrabold text-stone-900">{priceLabel}</p>
                <p className="text-xs text-stone-400 mt-1">Price varies by project size & material</p>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { icon: Clock, text: "Typically responds in 2 hours" },
                  { icon: Award, text: `${contractor.experienceYears}+ years of proven experience` },
                  { icon: CheckCircle2, text: `${contractor.completedProjects} projects completed` },
                  contractor.isVerified && { icon: Shield, text: "Licensed & background verified" },
                ].filter(Boolean).map((item: any) => (
                  <div key={item.text} className="flex items-center gap-2.5 text-sm text-stone-600">
                    <item.icon className="w-4 h-4 text-green-500 shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <SaveButton type="contractor" targetId={contractor.id} />
                {contractor.profileViews != null && (
                  <span className="text-xs text-stone-400">{contractor.profileViews} views</span>
                )}
              </div>
              <button onClick={() => setShowEnquiry(true)} className="w-full btn-primary justify-center mb-3">
                <MessageSquare className="w-4 h-4" /> Request a Quote
              </button>
              <button className="w-full flex items-center justify-center gap-2 border-2 border-stone-200 hover:border-blue-300 text-stone-700 hover:text-blue-600 font-semibold py-3 rounded-xl transition-all">
                <Phone className="w-4 h-4" /> Call Now
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
