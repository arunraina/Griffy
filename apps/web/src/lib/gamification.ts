// ── Tier system ──────────────────────────────────────────────────────────────
// Purely derived from data the backend already tracks (totalJobs, avgRating) —
// no separate gamification model needed.

export type Tier = 'new' | 'rising' | 'trusted' | 'elite';

export interface TierInfo {
  id: Tier;
  label: string;
  emoji: string;
  color: string;
  borderColor: string;
  minJobs: number;
  minRating: number;
  description: string;
}

export const TIERS: TierInfo[] = [
  { id: 'new', label: 'New', emoji: '🌱', color: 'bg-stone-100 text-stone-600', borderColor: 'border-stone-200', minJobs: 0, minRating: 0, description: 'Just getting started' },
  { id: 'rising', label: 'Rising Star', emoji: '⭐', color: 'bg-blue-50 text-blue-700', borderColor: 'border-blue-200', minJobs: 5, minRating: 3.5, description: 'Building a strong reputation' },
  { id: 'trusted', label: 'Trusted Pro', emoji: '🏅', color: 'bg-[#FAEEE9] text-[#9E3F24]', borderColor: 'border-[#E8C4B0]', minJobs: 25, minRating: 4.0, description: 'Consistently delivering quality' },
  { id: 'elite', label: 'Elite', emoji: '🏆', color: 'bg-amber-50 text-amber-800', borderColor: 'border-amber-300', minJobs: 100, minRating: 4.5, description: 'Top performer on Griffy' },
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

// ── Badges ───────────────────────────────────────────────────────────────────

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export function getBadges(opts: { verified: boolean; completedJobs: number; rating: number; reviewCount: number }): Badge[] {
  const badges: Badge[] = [];
  if (opts.verified) badges.push({ id: 'verified', label: 'Verified', emoji: '✅', description: 'Verified by Griffy' });
  if (opts.completedJobs >= 1) badges.push({ id: 'first_job', label: 'First Job', emoji: '🎯', description: 'Completed their first job' });
  if (opts.completedJobs >= 100) badges.push({ id: 'century', label: 'Century Club', emoji: '💯', description: '100+ jobs completed' });
  if (opts.rating >= 4.8 && opts.reviewCount >= 10) badges.push({ id: 'top_rated', label: 'Top Rated', emoji: '⭐', description: 'Rating 4.8+ with 10+ reviews' });
  return badges;
}
