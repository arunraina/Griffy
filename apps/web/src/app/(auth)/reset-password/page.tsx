'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

const inp = 'w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-4 py-3 text-sm text-[#2C1810] placeholder-[#A08070] outline-none focus:border-[#C0593A] transition-colors';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setCheckingSession(false);
    });
    // The recovery link establishes a session client-side after the page
    // loads (Supabase's browser client auto-detects the URL token) —
    // getSession() above can win the race and see nothing yet, so also
    // listen for the session actually landing.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasSession(true);
        setCheckingSession(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => router.push('/login'), 2000);
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-center text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
        Set a new password
      </h1>
      <p className="text-center text-[#6B5248] text-sm mb-8">Choose a new password for your account</p>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#EBE0D8]">
        {checkingSession ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <span className="w-8 h-8 border-2 border-[#EBE0D8] border-t-[#C0593A] rounded-full animate-spin" />
            <p className="text-sm text-[#6B5248]">Verifying your link…</p>
          </div>
        ) : done ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
            <p className="text-sm text-[#2C1810] font-semibold mb-1">Password updated</p>
            <p className="text-sm text-[#6B5248]">Redirecting you to log in…</p>
          </div>
        ) : !hasSession ? (
          <div className="text-center">
            <p className="text-sm text-[#2C1810] font-semibold mb-1">This link has expired or is invalid</p>
            <p className="text-sm text-[#6B5248] mb-6">Request a new password reset link and try again.</p>
            <Link href="/forgot-password" className="text-sm font-semibold text-[#C0593A] hover:underline">
              Request new link →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2C1810] mb-1">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={8}
                className={inp}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#2C1810] mb-1">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={8}
                className={inp}
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm py-3 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
