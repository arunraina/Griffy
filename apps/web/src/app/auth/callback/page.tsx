'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AuthCallback() {
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function finish() {
      const role = localStorage.getItem('griffy_signup_role');
      if (role) {
        await supabase.auth.updateUser({ data: { role } });
        localStorage.removeItem('griffy_signup_role');
      }
      router.replace('/dashboard');
    }
    finish();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="w-8 h-8 border-2 border-[#EBE0D8] border-t-[#C0593A] rounded-full animate-spin" />
        <p className="text-sm text-[#6B5248]">Signing you in…</p>
      </div>
    </div>
  );
}
