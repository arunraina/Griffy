'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

function AuthCallbackInner() {
  const router   = useRouter();
  const params    = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    async function finish() {
      const name = localStorage.getItem('griffy_signup_name');
      const role = localStorage.getItem('griffy_signup_role');
      const proLabel = localStorage.getItem('griffy_signup_pro_label');
      const referral_code = localStorage.getItem('griffy_signup_ref');
      if (name || role || proLabel || referral_code) {
        await supabase.auth.updateUser({
          data: {
            ...(name && { name }),
            ...(role && { role }),
            ...(proLabel && { pro_label: proLabel }),
            ...(referral_code && { referral_code }),
          },
        });
        localStorage.removeItem('griffy_signup_name');
        localStorage.removeItem('griffy_signup_role');
        localStorage.removeItem('griffy_signup_pro_label');
        localStorage.removeItem('griffy_signup_ref');
      }
      router.replace(params.get('next') || '/home');
    }
    finish();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="w-8 h-8 border-2 border-[#EBE0D8] border-t-[#C0593A] rounded-full animate-spin" />
        <p className="text-sm text-[#6B5248]">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackInner />
    </Suspense>
  );
}
