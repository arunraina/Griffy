'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const NAV = [
  { href: '/admin',              icon: '📊', label: 'Dashboard'           },
  { href: '/admin/approvals',    icon: '✅', label: 'Profile Approvals'   },
  { href: '/admin/moderation',   icon: '🚩', label: 'Content Moderation'  },
  { href: '/admin/projects',     icon: '🏗️', label: 'Posted Projects'     },
  { href: '/admin/careers',      icon: '💼', label: 'Career Applications' },
  { href: '/admin/early-access', icon: '🚀', label: 'Early Access'        },
  { href: '/admin/flags',        icon: '🎛️', label: 'Feature Flags'       },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const role = user?.user_metadata?.role ?? '';
      if (role !== 'ADMIN') {
        router.replace('/dashboard');
        return;
      }
      setChecking(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
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
