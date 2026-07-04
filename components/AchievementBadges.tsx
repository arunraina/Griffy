"use client";

import { Badge } from "@/lib/gamification";
import { useState } from "react";

interface AchievementBadgesProps {
  badges: Badge[];
  maxVisible?: number;
  title?: string;
}

export default function AchievementBadges({ badges, maxVisible = 8, title = "Achievements" }: AchievementBadgesProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  if (badges.length === 0) return null;

  const visible = badges.slice(0, maxVisible);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <h3 className="font-bold text-stone-900 text-sm mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {visible.map((badge) => (
          <div key={badge.id} className="relative">
            <button
              type="button"
              onMouseEnter={() => setTooltip(badge.id)}
              onMouseLeave={() => setTooltip(null)}
              onFocus={() => setTooltip(badge.id)}
              onBlur={() => setTooltip(null)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all hover:scale-105 ${badge.color}`}
            >
              <span>{badge.emoji}</span>
              <span>{badge.label}</span>
            </button>
            {tooltip === badge.id && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-max max-w-[160px] bg-stone-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg text-center pointer-events-none">
                {badge.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
              </div>
            )}
          </div>
        ))}
        {badges.length > maxVisible && (
          <span className="flex items-center px-2.5 py-1.5 rounded-full bg-stone-100 text-stone-500 text-xs font-semibold">
            +{badges.length - maxVisible} more
          </span>
        )}
      </div>
    </div>
  );
}
