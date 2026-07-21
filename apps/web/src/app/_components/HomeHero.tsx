'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMe, type Me } from '@/lib/users';
import { Skeleton } from '@/components/Skeleton';

const PROFESSIONAL_ROLES = new Set([
  'CONTRACTOR', 'LABOUR', 'SERVICE_EXPERT', 'MATERIAL_SUPPLIER',
  'LAND_OWNER', 'PROPERTY_SELLER', 'BUILDER', 'PROPERTY_AGENT',
]);

const ROLE_SUBTEXT: Record<string, string> = {
  HOMEOWNER: 'Pick up where you left off — track your bookings and orders, or find a new professional for your next job.',
  CONTRACTOR: 'Manage your bookings, browse new projects to bid on, and keep your profile fresh for homeowners.',
  LABOUR: 'Manage your bookings, browse new projects to bid on, and keep your profile fresh for homeowners.',
  SERVICE_EXPERT: 'Manage your bookings, browse new projects to bid on, and keep your profile fresh for homeowners.',
  MATERIAL_SUPPLIER: 'Manage your orders and keep your material listings up to date.',
  LAND_OWNER: 'Manage your listings and track leads from interested buyers.',
  PROPERTY_SELLER: 'Manage your listings and track leads from interested buyers.',
  BUILDER: 'Manage your projects and track leads from interested buyers.',
  PROPERTY_AGENT: 'Manage your listings and track leads from interested buyers.',
};

export default function HomeHero() {
  // Previously defaulted straight to the logged-out hero while the auth
  // check resolved, to avoid blocking anonymous visitors on a network call.
  // That meant logged-in visitors saw the wrong (logged-out) CTAs flash for
  // a moment before swapping to "Welcome back" — jarring, and a real risk of
  // clicking "Get Started Free" right as it flips underneath you. A neutral
  // skeleton for both cases is a better trade-off than definitely-wrong
  // content for one of them.
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe().then(setMe).catch(() => setMe(null)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Skeleton className="h-7 w-56 rounded-full mb-6 mx-auto" />
        <Skeleton className="h-11 w-full max-w-lg rounded-lg mb-2 mx-auto" />
        <Skeleton className="h-11 w-2/3 rounded-lg mb-5 mx-auto" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md mb-2 mx-auto" />
        <Skeleton className="h-4 w-2/3 max-w-md rounded-md mb-8 mx-auto" />
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Skeleton className="h-14 w-48 rounded-xl" />
          <Skeleton className="h-14 w-56 rounded-xl" />
        </div>
      </>
    );
  }

  if (!me) {
    return (
      <>
        <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          🏠 For homeowners across India
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#2C1810] leading-tight mb-5"
          style={{ fontFamily: 'Georgia, serif' }}>
          Build your dream home with{' '}
          <em className="not-italic text-[#C0593A]">trusted professionals</em>
        </h1>
        <p className="text-[#6B5248] text-base leading-relaxed mb-8 max-w-xl mx-auto">
          India's one-stop platform for construction — find contractors, hire labour, book service experts, source materials and discover land
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Link href="/signup"
            className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold text-base px-10 py-4 rounded-xl transition-colors shadow-sm">
            Get Started Free
          </Link>
        </div>
      </>
    );
  }

  const firstName = me.name?.split(' ')[0] || 'there';
  const isProfessional = PROFESSIONAL_ROLES.has(me.role);

  return (
    <>
      <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
        👋 Welcome back
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-[#2C1810] leading-tight mb-5"
        style={{ fontFamily: 'Georgia, serif' }}>
        Welcome back, <em className="not-italic text-[#C0593A]">{firstName}</em>
      </h1>
      <p className="text-[#6B5248] text-base leading-relaxed mb-8 max-w-xl mx-auto">
        {ROLE_SUBTEXT[me.role] ?? 'Pick up where you left off.'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <Link href="/dashboard/home"
          className="inline-block bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold text-base px-10 py-4 rounded-xl transition-colors shadow-sm">
          Go to My Dashboard
        </Link>
        {isProfessional ? (
          <Link href="/projects"
            className="inline-block bg-white hover:bg-[#FAEEE9] text-[#C0593A] font-bold text-base px-6 py-4 rounded-xl transition-colors border-2 border-[#C0593A]">
            🏗️ Browse Projects to Bid On
          </Link>
        ) : (
          <Link href="/post-project"
            className="inline-block bg-white hover:bg-[#FAEEE9] text-[#C0593A] font-bold text-base px-6 py-4 rounded-xl transition-colors border-2 border-[#C0593A]">
            📋 Post a Project
          </Link>
        )}
      </div>
    </>
  );
}
