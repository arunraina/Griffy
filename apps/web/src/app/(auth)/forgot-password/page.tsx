'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

const inp = 'w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-4 py-3 text-sm text-[#2C1810] placeholder-[#A08070] outline-none focus:border-[#C0593A] transition-colors';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-center text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
        Reset your password
      </h1>
      <p className="text-center text-[#6B5248] text-sm mb-8">
        {sent ? "We've sent you a reset link" : "Enter your email and we'll send you a reset link"}
      </p>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#EBE0D8]">
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📧</div>
            <p className="text-sm text-[#2C1810] font-semibold mb-1">Check your inbox</p>
            <p className="text-sm text-[#6B5248] mb-6">
              If an account exists for <strong>{email}</strong>, you&apos;ll get an email with a link to reset your password.
            </p>
            <Link href="/login" className="text-sm font-semibold text-[#C0593A] hover:underline">
              ← Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2C1810] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className={inp}
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm py-3 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>

      {!sent && (
        <p className="text-center text-sm text-[#6B5248] mt-6">
          Remembered your password?{' '}
          <Link href="/login" className="text-[#C0593A] font-semibold hover:underline">Log in</Link>
        </p>
      )}
    </div>
  );
}
