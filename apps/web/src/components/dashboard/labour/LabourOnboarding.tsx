'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import { greeting, firstName } from '@/lib/dashboard';
import {
  fetchMyLabourProfile, setWeeklyAvailability as saveWeeklyAvailability,
  type MyLabourProfile, type WeeklyAvailability,
} from '@/lib/labourProfiles';

const ALL_AVAILABLE: WeeklyAvailability = { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true };
const DAY_ORDER: (keyof WeeklyAvailability)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL: Record<keyof WeeklyAvailability, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

export default function LabourOnboarding({ state, me }: { state: UserState; me: Me }) {
  const [profile, setProfile] = useState<MyLabourProfile | null>(null);
  const [week, setWeek] = useState<WeeklyAvailability>(ALL_AVAILABLE);

  useEffect(() => {
    fetchMyLabourProfile().then((p) => {
      setProfile(p);
      if (p?.weeklyAvailability) setWeek(p.weeklyAvailability);
    });
  }, []);

  async function toggleDay(day: keyof WeeklyAvailability) {
    const next = { ...week, [day]: !week[day] };
    setWeek(next); // optimistic -- payload is tiny, no separate save step
    try {
      await saveWeeklyAvailability(next);
    } catch {
      setWeek(week); // revert on failure
    }
  }

  const checklist = [
    { done: !!profile?.dailyRate, label: 'Add your daily rate', href: '/dashboard?tab=portfolio' },
    { done: !!me.avatarUrl, label: 'Add a profile photo', href: '/profile' },
    { done: !!profile?.skillType, label: 'List your skills', href: '/dashboard?tab=portfolio' },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[700px] mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <h1 className="text-lg font-bold text-[#2C1810] mb-1">
            You&apos;re live on Griffy, {firstName(me.name)}!
          </h1>
          <p className="text-sm text-[#6B5248]">
            Homeowners in {state.city ?? 'your area'} can now find you
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6">
          <p className="text-sm font-bold text-[#2C1810] mb-4">To get your first booking:</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-[#2C1810]">
              <span>✅</span> Profile created
            </div>
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 text-[#2C1810]">
                  <span>{item.done ? '✅' : '❌'}</span> {item.label}
                </span>
                {!item.done && (
                  <Link href={item.href} className="text-xs font-semibold text-[#C0593A] hover:underline whitespace-nowrap">
                    Add now →
                  </Link>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-[#A08070] bg-[#FAEEE9] rounded-lg px-3 py-2">
            Profiles with photos get 5x more bookings 📸
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6">
          <p className="text-sm font-bold text-[#2C1810] mb-1">Set your availability this week</p>
          <p className="text-xs text-[#6B5248] mb-4">Mark any days you won&apos;t be able to work</p>
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_ORDER.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                  week[day]
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <span>{DAY_LABEL[day]}</span>
                <span>{week[day] ? '✅' : '❌'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
