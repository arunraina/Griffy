"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";

interface NudgeProps {
  emoji: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  dismissKey: string;
  variant?: "orange" | "blue" | "green" | "amber";
  secondary?: { label: string; href: string };
}

const VARIANT_STYLES = {
  orange: "bg-orange-50 border-orange-200 text-orange-900",
  blue: "bg-blue-50 border-blue-200 text-blue-900",
  green: "bg-green-50 border-green-200 text-green-900",
  amber: "bg-amber-50 border-amber-200 text-amber-900",
};

const BADGE_STYLES = {
  orange: "bg-orange-500 text-white hover:bg-orange-600",
  blue: "bg-blue-500 text-white hover:bg-blue-600",
  green: "bg-green-500 text-white hover:bg-green-600",
  amber: "bg-amber-500 text-white hover:bg-amber-600",
};

export default function JourneyNudge({
  emoji, title, description, ctaLabel, ctaHref, dismissKey, variant = "orange", secondary,
}: NudgeProps) {
  const storageKey = `griffy_nudge_dismissed_${dismissKey}`;
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "1";
  });

  if (dismissed) return null;

  function dismiss() {
    localStorage.setItem(storageKey, "1");
    setDismissed(true);
  }

  return (
    <div className={`flex items-start gap-4 rounded-2xl border p-4 ${VARIANT_STYLES[variant]}`}>
      <span className="text-3xl shrink-0 mt-0.5">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm leading-snug mb-0.5">{title}</p>
        <p className="text-sm opacity-80 leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link href={ctaHref} className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${BADGE_STYLES[variant]}`}>
            {ctaLabel}
          </Link>
          {secondary && (
            <Link href={secondary.href} className="text-xs font-semibold px-4 py-2 rounded-lg border border-current opacity-70 hover:opacity-100 transition-opacity">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
      <button onClick={dismiss} className="shrink-0 opacity-40 hover:opacity-70 transition-opacity p-1 -mt-0.5 -mr-1" aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
