import { createClient } from './supabase';
import { getImpersonationToken } from './impersonation';
import { NotAuthenticatedError } from './users';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function authHeaders(): Promise<Record<string, string>> {
  const impersonationToken = getImpersonationToken();
  if (impersonationToken) {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${impersonationToken}` };
  }
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new NotAuthenticatedError();
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` };
}

export interface WeeklyAvailability {
  mon: boolean; tue: boolean; wed: boolean; thu: boolean; fri: boolean; sat: boolean; sun: boolean;
}

export interface MyLabourProfile {
  id: string;
  skillType: string;
  experience: string;
  dailyRate: string | number | null;
  bio: string | null;
  portfolioImages: string[];
  serviceCities: string[];
  isAvailable: boolean;
  weeklyAvailability: WeeklyAvailability | null;
  urgentAvailableUntil: string | null;
  totalReviews: number;
  totalJobs: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export async function fetchMyLabourProfile(): Promise<MyLabourProfile | null> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/labour-profiles/me`, { headers });
  if (!res.ok) return null;
  return res.json();
}

export async function setWeeklyAvailability(weeklyAvailability: WeeklyAvailability): Promise<MyLabourProfile> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/labour-profiles/me/weekly-availability`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ weeklyAvailability }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to update availability (${res.status})`);
  }
  return res.json();
}

// Rides the existing generic PATCH /labour-profiles/:id route (a plain
// nullable DateTime field), unlike weeklyAvailability's dedicated endpoint
// (which needed a nested-object DTO).
export async function setUrgentAvailability(profileId: string, until: string | null): Promise<MyLabourProfile> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/labour-profiles/${profileId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ urgentAvailableUntil: until }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to update availability (${res.status})`);
  }
  return res.json();
}

const DAYS: (keyof WeeklyAvailability)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL: Record<keyof WeeklyAvailability, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

// Turns {mon:true,...,sun:false} into "Available Mon-Sat this week", falling
// back to a plain day list when the available set isn't one contiguous run
// starting from Monday (the only shape a "Mon-Sat" style range can express).
export function formatWeeklyAvailability(w: WeeklyAvailability | null): string {
  const availableDays = w ? DAYS.filter((d) => w[d]) : DAYS;
  if (availableDays.length === 0) return 'Not available this week';
  if (availableDays.length === 7) return 'Available every day this week';

  const startIdx = DAYS.indexOf(availableDays[0]);
  const isContiguousFromStart = availableDays.every((d, i) => DAYS[startIdx + i] === d);
  if (isContiguousFromStart) {
    return `Available ${DAY_LABEL[availableDays[0]]}-${DAY_LABEL[availableDays[availableDays.length - 1]]} this week`;
  }
  return `Available ${availableDays.map((d) => DAY_LABEL[d]).join(', ')} this week`;
}

// J&K construction season: peak Apr-Oct, slow Nov-Mar. Purely informational
// copy shown on the dashboard -- there's no browsable job marketplace to
// filter (every "open request" is already assigned to one specific
// worker), so this doesn't hide/show anything, just sets expectations.
export function getSeasonalBanner(now: Date = new Date()): { emoji: string; title: string; body: string } | null {
  const month = now.getMonth(); // 0-indexed
  const date = now.getDate();
  if (month === 9 && date === 1) { // Oct 1
    return {
      emoji: '🍂',
      title: 'Winter is coming',
      body: 'Construction slows down in Kashmir from November. Make the most of the next 4-6 weeks of peak work.',
    };
  }
  if (month >= 10 || month <= 1) { // Nov-Feb
    return {
      emoji: '❄️',
      title: 'Slower season ahead',
      body: 'Fewer outdoor jobs this time of year. Indoor work — painting, carpentry, cleaning — stays available year-round.',
    };
  }
  if (month === 3 && date === 1) { // Apr 1
    return {
      emoji: '🌤️',
      title: 'Construction season begins!',
      body: 'Peak demand starts now for masonry, structural and outdoor work — make sure your availability is up to date.',
    };
  }
  return null;
}
