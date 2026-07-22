'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';

// 'ALL' = Super Admin / Admin only (full-access tiers) — mirrors
// AdminService.SECTION_ACCESS on the API side. Sections not listed there
// (Dashboard, Growth Metrics, Feature Flags) have no backend route to scope,
// so they stay full-access-only here too.
const NAV = [
  { href: '/admin',              icon: '📊', label: 'Dashboard',           sections: 'ALL' as const },
  { href: '/admin/metrics',      icon: '📈', label: 'Growth Metrics',      sections: 'ALL' as const },
  { href: '/admin/approvals',    icon: '✅', label: 'Profile Approvals',   sections: 'ALL' as const },
  { href: '/admin/kyc',          icon: '🪪', label: 'KYC Review',          sections: ['KYC'] },
  { href: '/admin/moderation',   icon: '🚩', label: 'Content Moderation',  sections: ['CONTENT_MODERATION'] },
  { href: '/admin/reports',      icon: '⚑', label: 'User Reports',        sections: ['CONTENT_MODERATION', 'REPORTS'] },
  { href: '/admin/users',        icon: '👥', label: 'Users',               sections: 'ALL' as const },
  { href: '/admin/orders',       icon: '📦', label: 'Orders & Refunds',    sections: 'ALL' as const },
  { href: '/admin/projects',     icon: '🏗️', label: 'Posted Projects',     sections: ['CONTENT_MODERATION'] },
  { href: '/admin/careers',      icon: '💼', label: 'Career Applications', sections: ['CAREERS'] },
  { href: '/admin/early-access', icon: '🚀', label: 'Early Access',        sections: ['EARLY_ACCESS'] },
  { href: '/admin/flags',        icon: '🎛️', label: 'Feature Flags',       sections: 'ALL' as const },
];

const ROLE_SECTIONS: Record<string, string[] | 'ALL'> = {
  SUPER_ADMIN: 'ALL',
  ADMIN: 'ALL',
  CONTENT_MODERATOR: ['CONTENT_MODERATION', 'REPORTS'],
  KYC_MODERATOR: ['KYC'],
  HR: ['CAREERS', 'EARLY_ACCESS'],
};

function allowedNav(adminRole: string | null) {
  // Null adminRole: treat as full access, matching the backend's defensive
  // default for a not-yet-migrated/unexpected-gap row (see AdminService.assertAdminSection).
  const access = adminRole ? ROLE_SECTIONS[adminRole] ?? 'ALL' : 'ALL';
  if (access === 'ALL') return NAV;
  return NAV.filter((item) => item.sections !== 'ALL' && item.sections.some((s) => access.includes(s)));
}

function isNavItemActive(href: string, pathname: string) {
  // /admin/profile/:id (the "manage this person's listings" screen reached
  // by clicking a name in the Users list) lives outside /admin/users, but
  // belongs to the same section for nav-highlighting and the allowed-section
  // gating below.
  if (href === '/admin/users' && pathname.startsWith('/admin/profile/')) return true;
  return pathname === href || (href !== '/admin' && pathname.startsWith(href));
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, me, loading: authLoading, meLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const checking = authLoading || (!!user && meLoading);
  // Real admin-ness lives only in the database User.adminRole column (set
  // via an existing Super Admin's setAdminRole call), never in Supabase
  // Auth's own user_metadata — that field is client-writable (a user
  // could set it from the browser console), which is exactly why
  // AuthGuard on the API side never trusts it for this either. Gate on
  // the same source of truth the backend actually uses. Deliberately NOT
  // `role` — that's the marketplace user type (HOMEOWNER, CONTRACTOR...)
  // and stays independent of admin access.
  const nav = me?.adminRole ? allowedNav(me.adminRole) : [];

  useEffect(() => {
    if (checking) return;
    if (!me?.adminRole) {
      router.replace('/dashboard/home');
      return;
    }
    // A scoped admin (e.g. KYC Moderator) hitting a section they can't use
    // — including the default '/admin' dashboard, which is full-access-only
    // — lands on their first permitted page instead.
    if (!nav.some((item) => isNavItemActive(item.href, pathname))) {
      router.replace(nav[0]?.href ?? '/dashboard/home');
    }
  }, [checking]); // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <svg className="animate-spin h-7 w-7 text-[#C0593A]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-screen w-56 bg-white border-r border-[#EBE0D8] flex flex-col z-30
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-5 py-5 border-b border-[#EBE0D8]">
          <Link href="/" className="text-[#C0593A] font-bold text-xl tracking-tight">Griffy</Link>
          <p className="text-[10px] text-[#A08070] font-semibold uppercase tracking-widest mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(item => {
            const active = isNavItemActive(item.href, pathname);
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#FAEEE9] text-[#C0593A]'
                    : 'text-[#6B5248] hover:bg-[#F5EDE8] hover:text-[#2C1810]'
                }`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-[#EBE0D8]">
          <Link href="/dashboard" className="text-xs text-[#A08070] hover:text-[#C0593A] transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-10 bg-white border-b border-[#EBE0D8] px-4 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 text-xl">☰</button>
          <span className="text-[#C0593A] font-bold text-lg">Griffy Admin</span>
        </div>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

    </div>
  );
}
