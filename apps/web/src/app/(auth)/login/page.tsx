'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

type Mode   = 'options' | 'email' | 'wp-phone' | 'wp-otp';

export default function LoginPage() {
  const [mode, setMode]         = useState<Mode>('options');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [phone, setPhone]       = useState('');
  const [wpDigits, setWpDigits] = useState(['', '', '', '', '', '']);
  const wpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const router   = useRouter();
  const supabase = createClient();

  function go(m: Mode) { setMode(m); setError(''); }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push('/dashboard');
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: fmt(phone) });
    setLoading(false);
    if (error) { setError(error.message); return; }
    go('wp-otp');
  }

  async function verifyWpOtp(token: string) {
    setError(''); setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone: fmt(phone), token, type: 'sms' });
    setLoading(false);
    if (error) { setError(error.message); setWpDigits(['', '', '', '', '', '']); wpRefs.current[0]?.focus(); return; }
    router.push('/dashboard');
  }

  function handleWpDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...wpDigits]; next[i] = d; setWpDigits(next);
    if (d && i < 5) wpRefs.current[i + 1]?.focus();
    if (next.every(Boolean)) verifyWpOtp(next.join(''));
  }

  function handleWpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace') {
      if (wpDigits[i]) { const n = [...wpDigits]; n[i] = ''; setWpDigits(n); }
      else if (i > 0) wpRefs.current[i - 1]?.focus();
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-center text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
        Welcome back
      </h1>
      <p className="text-center text-[#6B5248] text-sm mb-8">Log in to your Griffy account</p>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#EBE0D8]">

        {/* ── Main options ── */}
        {mode === 'options' && (
          <div className="space-y-3">
            <SocialBtn icon={<GoogleIcon />} onClick={handleGoogle}>Continue with Google</SocialBtn>
            <SocialBtn icon={<span className="text-xl">💬</span>} onClick={() => go('wp-phone')}>
              Continue with WhatsApp
            </SocialBtn>
            <Divider />
            <button type="button" onClick={() => go('email')}
              className="w-full py-3 rounded-lg border border-[#EBE0D8] text-[#6B5248] text-sm font-medium hover:bg-[#FDF8F5] transition-colors">
              Continue with Email & Password
            </button>
          </div>
        )}

        {/* ── Email / password ── */}
        {mode === 'email' && (
          <>
            <Back onClick={() => go('options')} />
            <form onSubmit={handleEmail} className="space-y-4">
              <Field label="Email">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email" className={inp} />
              </Field>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#2C1810]">Password</span>
                  <Link href="/forgot-password" className="text-xs text-[#C0593A] hover:underline">Forgot?</Link>
                </div>
                <PasswordInput value={password} onChange={setPassword} show={showPw} onToggle={() => setShowPw(p => !p)} />
              </div>
              {error && <ErrBox>{error}</ErrBox>}
              <PrimaryBtn loading={loading} loadingLabel="Logging in…">Log in</PrimaryBtn>
            </form>
          </>
        )}

        {/* ── WhatsApp: phone ── */}
        {mode === 'wp-phone' && (
          <>
            <Back onClick={() => go('options')} />
            <p className="text-base font-semibold text-[#2C1810] mb-1">Enter your WhatsApp number</p>
            <p className="text-xs text-[#A08070] mb-5">We'll send a one-time code to your WhatsApp</p>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Field label="Phone number">
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg text-sm text-[#6B5248]">+91</span>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="9876543210" required maxLength={10} className={`${inp} flex-1`} />
                </div>
              </Field>
              {error && <ErrBox>{error}</ErrBox>}
              <PrimaryBtn loading={loading} loadingLabel="Sending OTP…">Send OTP</PrimaryBtn>
            </form>
          </>
        )}

        {/* ── WhatsApp: OTP ── */}
        {mode === 'wp-otp' && (
          <>
            <Back onClick={() => go('wp-phone')} label="← Change number" />
            <p className="text-base font-semibold text-[#2C1810] mb-1">Enter the OTP</p>
            <p className="text-xs text-[#A08070] mb-5">
              Sent to <strong>+91 {phone}</strong> via WhatsApp
            </p>
            <div className="flex justify-center gap-3 mb-4">
              {wpDigits.map((d, i) => (
                <input key={i} ref={el => { wpRefs.current[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => handleWpDigit(i, e.target.value)}
                  onKeyDown={e => handleWpKey(i, e)}
                  disabled={loading}
                  className={`w-12 h-12 text-center text-lg font-bold rounded-lg border-2 outline-none transition-colors bg-white text-[#2C1810] disabled:opacity-50 ${d ? 'border-[#C0593A]' : 'border-[#EBE0D8] focus:border-[#C0593A]'}`}
                />
              ))}
            </div>
            {error && <ErrBox>{error}</ErrBox>}
            {loading && <PrimaryBtn loading={loading} loadingLabel="Verifying…">{''}</PrimaryBtn>}
            <button type="button" onClick={e => handleSendOtp(e as unknown as React.FormEvent)}
              className="w-full text-center text-xs text-[#A08070] hover:text-[#C0593A] transition-colors mt-2">
              Resend OTP
            </button>
          </>
        )}

      </div>

      <p className="text-center text-sm text-[#6B5248] mt-6">
        Don't have an account?{' '}
        <Link href="/signup" className="text-[#C0593A] font-semibold hover:underline">Sign up free</Link>
      </p>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (p: string) => p.startsWith('+') ? p : `+91${p}`;
const inp  = 'w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-4 py-3 text-sm text-[#2C1810] placeholder-[#A08070] outline-none focus:border-[#C0593A] transition-colors';

function Back({ onClick, label = '← Back' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1 text-xs text-[#A08070] hover:text-[#C0593A] transition-colors mb-5">
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#2C1810] mb-1">{label}</label>
      {children}
    </div>
  );
}

function PasswordInput({ value, onChange, show, onToggle }: {
  value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
        placeholder="••••••••" required autoComplete="current-password" className={`${inp} pr-12`} />
      <button type="button" onClick={onToggle} tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A08070] hover:text-[#6B5248]">
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

function SocialBtn({ icon, onClick, children }: { icon: React.ReactNode; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center justify-center gap-3 border border-[#EBE0D8] bg-white hover:bg-[#FDF8F5] text-[#2C1810] font-semibold text-sm py-3 rounded-lg transition-colors">
      {icon}{children}
    </button>
  );
}

function PrimaryBtn({ loading, loadingLabel, children }: { loading: boolean; loadingLabel: string; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm py-3 rounded-lg transition-colors disabled:opacity-60">
      {loading ? <><Spin />{loadingLabel}</> : children}
    </button>
  );
}

function Spin() {
  return <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>;
}

function ErrBox({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{children}</p>;
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-[#EBE0D8]" />
      <span className="text-xs text-[#A08070]">or</span>
      <div className="flex-1 h-px bg-[#EBE0D8]" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.01 17.64 11.7 17.64 9.2z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
