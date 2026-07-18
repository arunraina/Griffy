'use client';

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

const API = process.env.NEXT_PUBLIC_API_URL;

type Mode = 'email' | 'wp-phone' | 'wp-otp';

function OtpForm() {
  const searchParams = useSearchParams();
  const email        = searchParams.get('email') ?? '';
  const initMode     = (searchParams.get('mode') === 'whatsapp' ? 'wp-phone' : 'email') as Mode;
  const initPhone    = searchParams.get('phone') ?? '';

  const router   = useRouter();
  const supabase = createClient();

  const [mode, setMode]         = useState<Mode>(initMode);
  const [digits, setDigits]     = useState(['', '', '', '', '', '']);
  const [phone, setPhone]       = useState(initPhone);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const startTimer = useCallback(() => {
    setCountdown(60); setCanResend(false);
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(id); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return id;
  }, []);

  useEffect(() => {
    if (mode === 'email' || mode === 'wp-otp') {
      const id = startTimer();
      inputRefs.current[0]?.focus();
      return () => clearInterval(id);
    }
  }, [mode, startTimer]);

  function resetBoxes() { setDigits(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); }

  // ── Email OTP verify ──────────────────────────────────────────
  async function verifyEmail(token: string) {
    setError(''); setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    setLoading(false);
    if (error) { setError(error.message); resetBoxes(); return; }
    trackEvent('sign_up', { method: 'email' });
    router.push('/onboarding');
  }

  async function resendEmail() {
    setError('');
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) { setError(error.message); return; }
    startTimer(); resetBoxes();
  }

  // ── WhatsApp OTP ──────────────────────────────────────────────
  async function sendWhatsappOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/send-whatsapp-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fmt(phone) }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? 'Failed to send OTP');
      setMode('wp-otp'); setDigits(['', '', '', '', '', '']);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function verifyWhatsapp(token: string) {
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/verify-whatsapp-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fmt(phone), otp: token }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? 'Invalid OTP');
      trackEvent('sign_up', { method: 'whatsapp' });
      router.push('/onboarding');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      resetBoxes();
    } finally {
      setLoading(false);
    }
  }

  // ── Box handlers ──────────────────────────────────────────────
  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...digits]; next[i] = d; setDigits(next);
    if (d && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(Boolean)) {
      const token = next.join('');
      if (mode === 'email') verifyEmail(token);
      else verifyWhatsapp(token);
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace') {
      if (digits[i]) { const n = [...digits]; n[i] = ''; setDigits(n); }
      else if (i > 0) inputRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft'  && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputRefs.current[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) {
      if (mode === 'email') verifyEmail(pasted);
      else verifyWhatsapp(pasted);
    }
  }

  const isOtpMode = mode === 'email' || mode === 'wp-otp';

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex flex-col">
      <header className="px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 bg-[#C0593A] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">G</span>
          </div>
          <span className="text-[#2C1810] text-base font-bold tracking-tight">Griffy</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Mode toggle */}
          <div className="flex bg-[#F7F1EC] rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={() => { setMode('email'); setError(''); resetBoxes(); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                mode === 'email' ? 'bg-white text-[#C0593A] shadow-sm' : 'text-[#6B5248] hover:text-[#2C1810]'
              }`}>
              📧 Email OTP
            </button>
            <button
              type="button"
              onClick={() => { setMode('wp-phone'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                mode !== 'email' ? 'bg-white text-[#C0593A] shadow-sm' : 'text-[#6B5248] hover:text-[#2C1810]'
              }`}>
              📱 Phone OTP
            </button>
          </div>

          {/* ── Email OTP ── */}
          {mode === 'email' && (
            <>
              <div className="w-14 h-14 bg-[#FAEEE9] rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">📧</div>
              <h1 className="text-2xl font-bold text-[#2C1810] text-center mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                Check your email
              </h1>
              <p className="text-sm text-[#6B5248] text-center mb-2">We sent a 6-digit code to</p>
              <p className="text-sm font-semibold text-[#2C1810] text-center mb-8">{email || 'your email'}</p>
              <OtpBoxes digits={digits} inputRefs={inputRefs} loading={loading}
                onDigit={handleDigit} onKeyDown={handleKeyDown} onPaste={handlePaste} />
              {error && <ErrBox>{error}</ErrBox>}
              {loading && <Spinner />}
              <ResendRow canResend={canResend} countdown={countdown} onResend={resendEmail} />
            </>
          )}

          {/* ── WhatsApp: phone entry ── */}
          {mode === 'wp-phone' && (
            <>
              <div className="w-14 h-14 bg-[#FAEEE9] rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">📱</div>
              <h1 className="text-2xl font-bold text-[#2C1810] text-center mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                Verify via Phone Number
              </h1>
              <p className="text-sm text-[#6B5248] text-center mb-8">Enter your phone number to receive an OTP</p>
              <form onSubmit={sendWhatsappOtp} className="space-y-4">
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-white border border-[#EBE0D8] rounded-lg text-sm text-[#6B5248]">+91</span>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="9876543210" required maxLength={10}
                    className="flex-1 bg-white border border-[#EBE0D8] rounded-lg px-4 py-3 text-sm text-[#2C1810] placeholder-[#A08070] outline-none focus:border-[#C0593A] transition-colors" />
                </div>
                {error && <ErrBox>{error}</ErrBox>}
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm py-3 rounded-lg transition-colors disabled:opacity-60">
                  {loading ? <><SpinSvg />Sending…</> : 'Send OTP on Phone Number'}
                </button>
              </form>
            </>
          )}

          {/* ── WhatsApp: OTP entry ── */}
          {mode === 'wp-otp' && (
            <>
              <div className="w-14 h-14 bg-[#FAEEE9] rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">📱</div>
              <h1 className="text-2xl font-bold text-[#2C1810] text-center mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                Enter OTP
              </h1>
              <p className="text-sm text-[#6B5248] text-center mb-2">Sent to</p>
              <p className="text-sm font-semibold text-[#2C1810] text-center mb-8">+91 {phone}</p>
              <OtpBoxes digits={digits} inputRefs={inputRefs} loading={loading}
                onDigit={handleDigit} onKeyDown={handleKeyDown} onPaste={handlePaste} />
              {error && <ErrBox>{error}</ErrBox>}
              {loading && <Spinner />}
              <ResendRow canResend={canResend} countdown={countdown}
                onResend={() => sendWhatsappOtp()}
                changeLabel="← Change number"
                onChange={() => { setMode('wp-phone'); setError(''); }} />
            </>
          )}

          <p className="text-center text-xs text-[#A08070] mt-8">
            <Link href="/signup" className="text-[#C0593A] hover:underline">← Back to signup</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <SpinSvg className="h-6 w-6 text-[#C0593A]" />
      </div>
    }>
      <OtpForm />
    </Suspense>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (p: string) => p.startsWith('+') ? p : `+91${p}`;

function OtpBoxes({ digits, inputRefs, loading, onDigit, onKeyDown, onPaste }: {
  digits: string[];
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  loading: boolean;
  onDigit: (i: number, val: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
}) {
  return (
    <div className="flex justify-center gap-3 mb-6" onPaste={onPaste}>
      {digits.map((d, i) => (
        <input key={i} ref={el => { inputRefs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => onDigit(i, e.target.value)}
          onKeyDown={e => onKeyDown(i, e)}
          disabled={loading}
          className={`w-12 h-12 text-center text-lg font-bold rounded-lg border-2 outline-none transition-colors bg-white text-[#2C1810] disabled:opacity-50 ${
            d ? 'border-[#C0593A]' : 'border-[#EBE0D8] focus:border-[#C0593A]'
          }`}
        />
      ))}
    </div>
  );
}

function ResendRow({ canResend, countdown, onResend, changeLabel, onChange }: {
  canResend: boolean; countdown: number; onResend: () => void;
  changeLabel?: string; onChange?: () => void;
}) {
  return (
    <div className="text-center mt-4 space-y-2">
      {canResend ? (
        <button type="button" onClick={onResend}
          className="text-sm text-[#C0593A] font-semibold hover:underline">
          Resend code
        </button>
      ) : (
        <p className="text-sm text-[#A08070]">
          Resend in <span className="font-semibold text-[#6B5248]">{countdown}s</span>
        </p>
      )}
      {onChange && (
        <div>
          <button type="button" onClick={onChange}
            className="text-xs text-[#A08070] hover:text-[#C0593A] transition-colors">
            {changeLabel}
          </button>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center mb-4">
      <button disabled className="flex items-center gap-2 bg-[#C0593A] text-white font-semibold text-sm px-6 py-3 rounded-lg opacity-70">
        <SpinSvg /> Verifying…
      </button>
    </div>
  );
}

function ErrBox({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4 text-center">{children}</p>;
}

function SpinSvg({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}
