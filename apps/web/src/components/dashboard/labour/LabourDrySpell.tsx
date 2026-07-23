'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import type { Booking } from '@/lib/bookings';
import { greeting, firstName } from '@/lib/dashboard';
import { shareOrCopyLink } from '@/lib/share';
import {
  fetchMyLabourProfile, setUrgentAvailability,
  type MyLabourProfile,
} from '@/lib/labourProfiles';

const DRY_SPELL_DAYS = 5;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

export default function LabourDrySpell({ state, me, bookings }: { state: UserState; me: Me; bookings: Booking[] }) {
  const [profile, setProfile] = useState<MyLabourProfile | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchMyLabourProfile().then(setProfile);
  }, []);

  const mostRecent = bookings.reduce<string | null>((latest, b) => {
    if (!latest || new Date(b.createdAt) > new Date(latest)) return b.createdAt;
    return latest;
  }, null);
  const gapDays = mostRecent ? daysSince(mostRecent) : null;

  const urgentActive = profile?.urgentAvailableUntil && new Date(profile.urgentAvailableUntil) > new Date();

  const tips: { icon: string; text: string; action: React.ReactNode }[] = [];
  if (profile && profile.portfolioImages.length === 0) {
    tips.push({
      icon: '📸',
      text: 'Add a profile photo — workers with photos get 8x more calls',
      action: <Link href="/dashboard?tab=portfolio" className="text-xs font-semibold text-[#C0593A] hover:underline">Add photo →</Link>,
    });
  }
  if (profile && profile.totalReviews === 0) {
    tips.push({
      icon: '⭐',
      text: 'Ask your past customers to review you on Griffy',
      action: (
        <button
          onClick={() => shareOrCopyLink(`${me.name} on Griffy`, `${window.location.origin}/labour/${profile.id}`)}
          className="text-xs font-semibold text-[#C0593A] hover:underline"
        >
          Copy your profile link →
        </button>
      ),
    });
  }
  if (state.profileCompleteness < 80) {
    tips.push({
      icon: '📋',
      text: 'Complete your profile to rank higher in search',
      action: <Link href="/dashboard?tab=portfolio" className="text-xs font-semibold text-[#C0593A] hover:underline">Complete profile →</Link>,
    });
  }

  async function toggleUrgent() {
    if (!profile) return;
    setBusy(true);
    try {
      const next = urgentActive ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const updated = await setUrgentAvailability(profile.id, next);
      setProfile(updated);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[700px] mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6">
          <h1 className="text-lg font-bold text-[#2C1810] mb-1">
            {greeting()}, {firstName(me.name)}
          </h1>
          <p className="text-sm text-[#6B5248]">
            {gapDays !== null ? `No bookings in ${gapDays} days 😕` : 'No bookings yet 😕'} — here&apos;s what to try:
          </p>
        </div>

        {tips.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6 space-y-4">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <p className="text-sm text-[#2C1810] flex items-center gap-2">
                  <span>{tip.icon}</span> {tip.text}
                </p>
                {tip.action}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6">
          <p className="text-sm font-bold text-[#2C1810] mb-1">
            {urgentActive ? '⚡ Marked available for urgent work' : 'Mark yourself available for urgent work'}
          </p>
          <p className="text-xs text-[#6B5248] mb-4">
            {urgentActive
              ? `Shows on your public profile until ${new Date(profile!.urgentAvailableUntil!).toLocaleDateString('en-IN', { dateStyle: 'medium' })} — get priority in search.`
              : 'Get priority in search for same-day/urgent jobs this week.'}
          </p>
          <button
            onClick={toggleUrgent}
            disabled={busy || !profile}
            className={`text-sm font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 ${
              urgentActive
                ? 'border border-[#EBE0D8] text-[#6B5248] hover:bg-[#FDF8F5]'
                : 'bg-[#C0593A] hover:bg-[#9E3F24] text-white'
            }`}
          >
            {urgentActive ? 'Turn off urgent availability' : 'Mark available for urgent work →'}
          </button>
        </div>
      </div>
    </div>
  );
}
