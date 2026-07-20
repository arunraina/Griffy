'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMe } from '@/lib/users';

const PROFESSIONAL_ROLES = new Set([
  'CONTRACTOR', 'LABOUR', 'SERVICE_EXPERT', 'MATERIAL_SUPPLIER',
  'LAND_OWNER', 'PROPERTY_SELLER', 'BUILDER', 'PROPERTY_AGENT',
]);

export default function HomeHeroCTA() {
  // Most visitors landing on the homepage are logged out, so default to
  // those CTAs immediately instead of blocking render on an auth check —
  // only upgrade to the logged-in CTA once fetchMe() actually confirms a
  // session. Previously this rendered nothing until the round-trip
  // resolved, which meant every anonymous visitor waited on a network
  // call just to see the CTAs they'd have seen by default anyway.
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetchMe().then((me) => setRole(me.role)).catch(() => setRole(null));
  }, []);

  if (role === null) {
    return (
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
    );
  }

  const isProfessional = PROFESSIONAL_ROLES.has(role);

  return (
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
  );
}
