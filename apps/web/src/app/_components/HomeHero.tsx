'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMe, type Me } from '@/lib/users';

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
  // Most visitors landing on the homepage are logged out, so default to
  // the logged-out hero immediately instead of blocking render on an auth
  // check — only upgrade once fetchMe() actually confirms a session. See
  // the git history on this file for why (previously this rendered nothing
  // until the round-trip resolved).
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetchMe().then(setMe).catch(() => setMe(null));
  }, []);

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
          <Link href="/early-access"
            className="inline-block bg-white hover:bg-[#FAEEE9] text-[#C0593A] font-bold text-base px-6 py-4 rounded-xl transition-colors border-2 border-[#C0593A]">
            🚀 Get Early Access to the App
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
        <Link href="/dashboard"
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
