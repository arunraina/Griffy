"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { ProfileCompletion } from "@/lib/gamification";

interface ProfileStrengthMeterProps {
  completion: ProfileCompletion;
  role: string;
}

const scoreLabel = (s: number) =>
  s === 100 ? "Complete" : s >= 80 ? "Almost there" : s >= 50 ? "Good start" : "Needs attention";

const scoreColor = (s: number) =>
  s === 100
    ? "bg-green-500"
    : s >= 80
    ? "bg-blue-500"
    : s >= 50
    ? "bg-orange-500"
    : "bg-red-400";

const scoreTextColor = (s: number) =>
  s === 100 ? "text-green-600" : s >= 80 ? "text-blue-600" : s >= 50 ? "text-orange-600" : "text-red-500";

export default function ProfileStrengthMeter({ completion, role }: ProfileStrengthMeterProps) {
  const { score, fields } = completion;
  const incomplete = fields.filter((f) => !f.done);

  if (score === 100) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
        <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
        <div>
          <p className="font-bold text-green-800">Profile 100% complete!</p>
          <p className="text-sm text-green-600 mt-0.5">Your profile is fully set up. Homeowners can find you easily.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-stone-900">Profile Strength</h3>
          <p className={`text-sm font-semibold mt-0.5 ${scoreTextColor(score)}`}>{scoreLabel(score)}</p>
        </div>
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f5f5f4" strokeWidth="3.2" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={score === 100 ? "#22c55e" : score >= 80 ? "#3b82f6" : score >= 50 ? "#f97316" : "#f87171"}
              strokeWidth="3.2"
              strokeDasharray={`${score} ${100 - score}`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-sm font-extrabold ${scoreTextColor(score)}`}>
            {score}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-stone-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${scoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Incomplete items */}
      {incomplete.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Complete these to boost your profile
          </p>
          {incomplete.slice(0, 4).map((field) => (
            <Link
              key={field.label}
              href={field.href}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-orange-50 transition-colors group"
            >
              <Circle className="w-4 h-4 text-stone-300 shrink-0 group-hover:text-orange-400 transition-colors" />
              <span className="text-sm text-stone-600 group-hover:text-orange-600 flex-1">{field.label}</span>
              <span className="text-xs font-bold text-orange-400">+{field.points}%</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-orange-400 transition-colors" />
            </Link>
          ))}
          {incomplete.length > 4 && (
            <p className="text-xs text-stone-400 pl-2">+{incomplete.length - 4} more to complete</p>
          )}
        </div>
      )}
    </div>
  );
}
