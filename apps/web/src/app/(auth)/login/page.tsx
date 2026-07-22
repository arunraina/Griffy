'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import { signInWithGoogle, signInWithEmail, sendEmailOtp, sendPhoneOtp } from '@/lib/auth';

type Tab = 'mobile' | 'email';
type EmailSubTab = 'magic' | 'password';

function LoginForm() {
  const [tab, setTab]             = useState<Tab>('mobile');
  const [emailTab, setEmailTab]   = useState<EmailSubTab>('magic');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [phone, setPhone]         = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const router   = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get('redirect') || '/dashboard/home';

  async function handleGoogle() {
    trackEvent('login', { method: 'google' });
    try {
      await signInWithGoogle(redirectTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  }

  async function handleEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signInWithEmail(email, password);
      trackEvent('login', { method: 'email' });
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await sendEmailOtp(email);
      setMagicSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await sendPhoneOtp(fmt(phone), 'recaptcha-container');
      router.push(`/verify-otp?method=phone&phone=${encodeURIComponent(phone)}&redirect=${encodeURIComponent(redirectTo)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-center text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
        Welcome back
      </h1>
      <p className="text-center text-[#6B5248] text-sm mb-8">Sign in to continue</p>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#EBE0D8] space-y-5">

        <SocialBtn icon={<GoogleIcon />} onClick={handleGoogle}>Continue with Google</SocialBtn>
        <Divider />

        <div className="flex bg-[#FDF8F5] rounded-xl p-1">
          <button type="button" onClick={() => { setTab('mobile'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === 'mobile' ? 'bg-white text-[#C0593A] shadow-sm' : 'text-[#6B5248] hover:text-[#2C1810]'}`}>
            📱 Mobile
          </button>
          <button type="button" onClick={() => { setTab('email'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === 'email' ? 'bg-white text-[#C0593A] shadow-sm' : 'text-[#6B5248] hover:text-[#2C1810]'}`}>
            📧 Email
          </button>
        </div>

        {tab === 'mobile' && (
          <form onSubmit={handleSendPhoneOtp} className="space-y-4">
            <Field label="Mobile Number">
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg text-sm text-[#6B5248]">+91</span>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="9876543210" required maxLength={10} className={`${inp} flex-1`} />
              </div>
            </Field>
            {error && <ErrBox>{error}</ErrBox>}
            <PrimaryBtn loading={loading} loadingLabel="Sending OTP…">Send OTP</PrimaryBtn>
            <div id="recaptcha-container" />
          </form>
        )}

        {tab === 'email' && (
          <div className="space-y-4">
            <div className="flex gap-2 text-xs font-semibold">
              <button type="button" onClick={() => { setEmailTab('magic'); setError(''); setMagicSent(false); }}
                className={`px-3 py-1.5 rounded-full transition-colors ${emailTab === 'magic' ? 'bg-[#FAEEE9] text-[#C0593A]' : 'text-[#A08070] hover:text-[#6B5248]'}`}>
                Magic Link
              </button>
              <button type="button" onClick={() => { setEmailTab('password'); setError(''); }}
                className={`px-3 py-1.5 rounded-full transition-colors ${emailTab === 'password' ? 'bg-[#FAEEE9] text-[#C0593A]' : 'text-[#A08070] hover:text-[#6B5248]'}`}>
                Password
              </button>
            </div>

            {emailTab === 'magic' && (
              magicSent ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-[#FAEEE9] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📧</div>
                  <p className="text-sm font-semibold text-[#2C1810] mb-1">Check your email</p>
                  <p className="text-xs text-[#A08070]">We sent a magic link to {email}</p>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <Field label="Email">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" required autoComplete="email" className={inp} />
                  </Field>
                  {error && <ErrBox>{error}</ErrBox>}
                  <PrimaryBtn loading={loading} loadingLabel="Sending…">Send Magic Link</PrimaryBtn>
                </form>
              )
            )}

            {emailTab === 'password' && (
              <form onSubmit={handleEmailPassword} className="space-y-4">
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
            )}
          </div>
        )}

      </div>

      <p className="text-center text-sm text-[#6B5248] mt-6">
        Don't have an account?{' '}
        <Link href="/signup" className="text-[#C0593A] font-semibold hover:underline">Sign up free</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (p: string) => p.startsWith('+') ? p : `+91${p}`;
const inp  = 'w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-4 py-3 text-sm text-[#2C1810] placeholder-[#A08070] outline-none focus:border-[#C0593A] transition-colors';

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
