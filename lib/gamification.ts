import { Contractor, Labour, Material } from "./api";

// ── Tier system ────────────────────────────────────────────────────────────

export type Tier = "new" | "rising" | "trusted" | "elite";

export interface TierInfo {
  id: Tier;
  label: string;
  emoji: string;
  color: string;         // Tailwind bg+text classes for badge
  borderColor: string;   // Tailwind border class
  minJobs: number;
  minRating: number;
  description: string;
}

export const TIERS: TierInfo[] = [
  {
    id: "new",
    label: "New",
    emoji: "🌱",
    color: "bg-stone-100 text-stone-600",
    borderColor: "border-stone-200",
    minJobs: 0,
    minRating: 0,
    description: "Just getting started",
  },
  {
    id: "rising",
    label: "Rising Star",
    emoji: "⭐",
    color: "bg-blue-100 text-blue-700",
    borderColor: "border-blue-200",
    minJobs: 5,
    minRating: 3.5,
    description: "Building a strong reputation",
  },
  {
    id: "trusted",
    label: "Trusted Pro",
    emoji: "🏅",
    color: "bg-orange-100 text-orange-700",
    borderColor: "border-orange-200",
    minJobs: 25,
    minRating: 4.0,
    description: "Consistently delivering quality",
  },
  {
    id: "elite",
    label: "Elite",
    emoji: "🏆",
    color: "bg-amber-100 text-amber-800",
    borderColor: "border-amber-300",
    minJobs: 100,
    minRating: 4.5,
    description: "Top performer on Griffy",
  },
];

export function getTier(completedJobs: number, rating: number): TierInfo {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (completedJobs >= t.minJobs && (rating >= t.minRating || t.minRating === 0)) {
      tier = t;
    }
  }
  return tier;
}

export function getNextTier(current: TierInfo): TierInfo | null {
  const idx = TIERS.findIndex((t) => t.id === current.id);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

// ── Badge system ───────────────────────────────────────────────────────────

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export function getContractorBadges(profile: Contractor): Badge[] {
  const badges: Badge[] = [];
  const jobs = profile.completedProjects ?? 0;
  const rating = profile.rating ?? 0;
  const reviews = profile.reviewCount ?? 0;

  if (profile.isVerified) {
    badges.push({ id: "verified", label: "Verified Pro", emoji: "✅", description: "Identity & license verified by Griffy", color: "bg-blue-50 text-blue-700 border-blue-200" });
  }
  if (jobs >= 1) {
    badges.push({ id: "first_job", label: "First Job", emoji: "🎯", description: "Completed their first project", color: "bg-green-50 text-green-700 border-green-200" });
  }
  if (jobs >= 100) {
    badges.push({ id: "century", label: "Century Club", emoji: "💯", description: "100+ projects completed", color: "bg-purple-50 text-purple-700 border-purple-200" });
  }
  if (jobs >= 200) {
    badges.push({ id: "elite_worker", label: "Elite Contractor", emoji: "🏆", description: "200+ projects completed", color: "bg-amber-50 text-amber-800 border-amber-300" });
  }
  if (rating >= 4.8 && reviews >= 10) {
    badges.push({ id: "top_rated", label: "Top Rated", emoji: "⭐", description: "Rating 4.8+ with 10+ reviews", color: "bg-yellow-50 text-yellow-800 border-yellow-200" });
  }
  if (rating === 5 && reviews >= 5) {
    badges.push({ id: "perfect", label: "5★ Streak", emoji: "🌟", description: "Perfect 5-star rating", color: "bg-orange-50 text-orange-700 border-orange-200" });
  }
  if (profile.city && profile.state) {
    badges.push({ id: "local", label: "Local Expert", emoji: "📍", description: "Serving clients in their local area", color: "bg-teal-50 text-teal-700 border-teal-200" });
  }
  if (profile.avatarUrl) {
    badges.push({ id: "photo", label: "Photo Verified", emoji: "📸", description: "Profile photo added", color: "bg-stone-50 text-stone-700 border-stone-200" });
  }
  return badges;
}

export function getLabourBadges(profile: Labour): Badge[] {
  const badges: Badge[] = [];
  const jobs = profile.completedJobs ?? 0;
  const rating = profile.rating ?? 0;
  const reviews = profile.reviewCount ?? 0;

  if (profile.isVerified) {
    badges.push({ id: "verified", label: "ID Verified", emoji: "✅", description: "Aadhaar & background verified by Griffy", color: "bg-blue-50 text-blue-700 border-blue-200" });
  }
  if (jobs >= 1) {
    badges.push({ id: "first_job", label: "First Job", emoji: "🎯", description: "Completed their first job", color: "bg-green-50 text-green-700 border-green-200" });
  }
  if (jobs >= 50) {
    badges.push({ id: "fifty", label: "50 Jobs Done", emoji: "💯", description: "50+ jobs completed", color: "bg-purple-50 text-purple-700 border-purple-200" });
  }
  if (jobs >= 200) {
    badges.push({ id: "elite_worker", label: "Elite Worker", emoji: "🏆", description: "200+ jobs completed", color: "bg-amber-50 text-amber-800 border-amber-300" });
  }
  if (rating >= 4.8 && reviews >= 10) {
    badges.push({ id: "top_rated", label: "Top Rated", emoji: "⭐", description: "Rating 4.8+ with 10+ reviews", color: "bg-yellow-50 text-yellow-800 border-yellow-200" });
  }
  if (rating === 5 && reviews >= 5) {
    badges.push({ id: "perfect", label: "5★ Streak", emoji: "🌟", description: "Perfect 5-star rating", color: "bg-orange-50 text-orange-700 border-orange-200" });
  }
  if (profile.city && profile.state) {
    badges.push({ id: "local", label: "Local Expert", emoji: "📍", description: "Serving clients in their local area", color: "bg-teal-50 text-teal-700 border-teal-200" });
  }
  if ((profile.languages?.length ?? 0) >= 2) {
    badges.push({ id: "multilingual", label: "Multilingual", emoji: "🌐", description: "Speaks 2+ languages", color: "bg-indigo-50 text-indigo-700 border-indigo-200" });
  }
  return badges;
}

// ── Profile completion ─────────────────────────────────────────────────────

export interface ProfileField {
  label: string;
  done: boolean;
  points: number;
  href: string;
}

export interface ProfileCompletion {
  score: number;       // 0–100
  fields: ProfileField[];
}

export function getContractorCompletion(profile: Contractor | null): ProfileCompletion {
  if (!profile) {
    return { score: 0, fields: [{ label: "Create your contractor profile", done: false, points: 100, href: "/profile" }] };
  }
  const fields: ProfileField[] = [
    { label: "Business name", done: !!profile.businessName, points: 10, href: "/profile" },
    { label: "Specialty set", done: !!profile.specialty, points: 5, href: "/profile" },
    { label: "Bio / About", done: !!(profile.bio?.trim()), points: 15, href: "/profile" },
    { label: "City & State", done: !!(profile.city && profile.state), points: 15, href: "/profile" },
    { label: "Skills added", done: (profile.skills?.length ?? 0) > 0, points: 10, href: "/profile" },
    { label: "Profile photo", done: !!profile.avatarUrl, points: 15, href: "/profile" },
    { label: "License number", done: !!profile.licenseNumber, points: 10, href: "/profile" },
    { label: "Price range set", done: !!(profile.priceRangeMin && profile.priceRangeMax), points: 15, href: "/profile" },
    { label: "Availability set", done: true, points: 5, href: "/profile" },
  ];
  const total = fields.reduce((s, f) => s + f.points, 0);
  const earned = fields.filter((f) => f.done).reduce((s, f) => s + f.points, 0);
  return { score: Math.round((earned / total) * 100), fields };
}

export function getLabourCompletion(profile: Labour | null): ProfileCompletion {
  if (!profile) {
    return { score: 0, fields: [{ label: "Create your labour profile", done: false, points: 100, href: "/profile" }] };
  }
  const fields: ProfileField[] = [
    { label: "Trade selected", done: !!profile.trade, points: 10, href: "/profile" },
    { label: "Bio / About", done: !!(profile.bio?.trim()), points: 15, href: "/profile" },
    { label: "City & State", done: !!(profile.city && profile.state), points: 15, href: "/profile" },
    { label: "Skills added", done: (profile.skills?.length ?? 0) > 0, points: 10, href: "/profile" },
    { label: "Languages added", done: (profile.languages?.length ?? 0) > 0, points: 5, href: "/profile" },
    { label: "Profile photo", done: !!profile.avatarUrl, points: 15, href: "/profile" },
    { label: "Daily rate set", done: Number(profile.dailyRate) > 0, points: 15, href: "/profile" },
    { label: "Weekly rate set", done: Number(profile.weeklyRate ?? 0) > 0, points: 5, href: "/profile" },
    { label: "Experience years", done: Number(profile.experienceYears) > 0, points: 10, href: "/profile" },
  ];
  const total = fields.reduce((s, f) => s + f.points, 0);
  const earned = fields.filter((f) => f.done).reduce((s, f) => s + f.points, 0);
  return { score: Math.round((earned / total) * 100), fields };
}

export function getSupplierCompletion(user: { city?: string; state?: string }, materialCount: number): ProfileCompletion {
  const fields: ProfileField[] = [
    { label: "City & State in profile", done: !!(user.city && user.state), points: 20, href: "/profile" },
    { label: "First material listed", done: materialCount >= 1, points: 30, href: "/dashboard" },
    { label: "3+ materials listed", done: materialCount >= 3, points: 20, href: "/dashboard" },
    { label: "5+ materials listed", done: materialCount >= 5, points: 20, href: "/dashboard" },
    { label: "10+ materials listed", done: materialCount >= 10, points: 10, href: "/dashboard" },
  ];
  const total = fields.reduce((s, f) => s + f.points, 0);
  const earned = fields.filter((f) => f.done).reduce((s, f) => s + f.points, 0);
  return { score: Math.round((earned / total) * 100), fields };
}
