"use client";

import { TierInfo, TIERS } from "@/lib/gamification";

interface TierBadgeProps {
  tier: TierInfo;
  showProgress?: boolean;
  completedJobs: number;
  rating: number;
  size?: "sm" | "md" | "lg";
}

export default function TierBadge({ tier, showProgress = false, completedJobs, rating, size = "md" }: TierBadgeProps) {
  const nextTier = TIERS[TIERS.findIndex((t) => t.id === tier.id) + 1] ?? null;

  const sizes = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  return (
    <div className="inline-flex flex-col gap-2">
      <span className={`inline-flex items-center font-bold rounded-full border ${sizes[size]} ${tier.color} ${tier.borderColor}`}>
        <span>{tier.emoji}</span>
        <span>{tier.label}</span>
      </span>

      {showProgress && nextTier && (
        <div className="text-xs text-stone-500 space-y-1">
          <p>
            Next: <span className="font-semibold text-stone-700">{nextTier.emoji} {nextTier.label}</span>
          </p>
          <div className="flex gap-3 text-stone-400">
            {completedJobs < nextTier.minJobs && (
              <span>{completedJobs}/{nextTier.minJobs} jobs</span>
            )}
            {rating < nextTier.minRating && nextTier.minRating > 0 && (
              <span>{rating.toFixed(1)}/{nextTier.minRating} rating</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
