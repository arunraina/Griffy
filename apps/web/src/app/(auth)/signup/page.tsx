'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

type Role = 'CUSTOMER' | 'SERVICE_PROVIDER' | 'MATERIAL_SELLER';
type Mode = 'options' | 'email' | 'wp-phone' | 'wp-otp';

const ROLES: { value: Role; label: string; desc: string; icon: string }[] = [
  { value: 'CUSTOMER',         label: 'Homeowner',         desc: 'I want to build or renovate my space',  icon: '🏠' },
  { value: 'SERVICE_PROVIDER', label: 'Contractor',        desc: 'I offer professional construction work', icon: '🔨' },
  { value: 'MATERIAL_SELLER',  label: 'Material Supplier', desc: 'I sell building materials & supplies',  icon: '📦' },
];

export default function SignupPage() {
  const [step, setStep]     = useState<1 | 2>(1);
  const [role, setRole]     = useState<Role | null>(null);
  const [mode, setMode]     = useState<Mode>('options');

  // WhatsApp flow
  const [wpName, setWpName] = useState('');
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState('');

  // Email flow
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [done, setDone]         = useState(false);

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const router   = useRouter();
  const supabase = createClient();

  function go(m: Mode) { setMode(m); setError(''); }

  // ── Google ────────────────────────────────────────────────────
  async function handleGoogle() {
    if (role) localStorage.setItem('griffy_signup_role', role);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  // ── WhatsApp: send OTP ────────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: fmt(phone) });
    setLoading(false);
    if (error) { setError(error.message); return; }
    go('wp-otp');
  }

  // ── WhatsApp: verify OTP ──────────────────────────────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone: fmt(phone), token: otp, type: 'sms' });
    if (!error) await supabase.auth.updateUser({ data: { name: wpName, role } });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push('/dashboard');
  }

  // ── Email signup ──────────────────────────────────────────────
  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, role } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  }

  // ── Email confirmation sent ───────────────────────────────────
  if (done) return (
    <div className="w-full max-w-md text-center">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#EBE0D8]">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Check your inbox</h2>
        <p className="text-sm text-[#6B5248] mb-6">
          Confirmation link sent to <strong>{email}</strong>
        </p>
        <Link href="/login" className="block w-full text-center bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm py-3 rounded-lg transition-colors">
          Back to login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-xl">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {([1, 2] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-[#EBE0D8]" />}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-[#C0593A] text-white' : 'bg-[#EBE0D8] text-[#A08070]'}`}>{s}</div>
            <span className={`text-xs font-medium ${step >= s ? 'text-[#C0593A]' : 'text-[#A08070]'}`}>
              {s === 1 ? 'Choose role' : 'Create account'}
            </span>
          </div>
        ))}
      </div>

      {/* ── STEP 1: Role cards ── */}
      {step === 1 && (
        <>
          <h1 className="text-2xl font-bold text-[#2C1810] text-center mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Who are you on Griffy?
          </h1>
          <p className="text-sm text-[#6B5248] text-center mb-8">Pick the role that best describes you.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLES.map(r => (
              <button key={r.value} type="button"
                onClick={() => { setRole(r.value); setStep(2); }}
                className={`flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                  role === r.value
                    ? 'border-[#C0593A] bg-[#FAEEE9] shadow-sm'
                    : 'border-[#EBE0D8] bg-white hover:border-[#C0593A] hover:bg-[#FAEEE9]'
                }`}>
                <span className="text-4xl">{r.icon}</span>
                <div>
                  <p className="text-sm font-bold text-[#2C1810] mb-1">{r.label}</p>
                  <p className="text-xs text-[#A08070] leading-snug">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-[#6B5248] mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-[#C0593A] font-semibold hover:underline">Sign in</Link>
          </p>
        </>
      )}

      {/* ── STEP 2: Auth methods ── */}
      {step === 2 && (
        <div className="w-full max-w-md mx-auto">
          {/* Back to role selection */}
          {mode === 'options' && (
            <button type="button" onClick={() => { setStep(1); setMode('options'); }}
              className="flex items-center gap-1 text-xs text-[#A08070] hover:text-[#C0593A] transition-colors mb-5">
              ← Change role
            </button>
          )}

          <h1 className="text-2xl font-bold text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Create your account
          </h1>
          <p className="text-sm text-[#6B5248] mb-6">
            Joining as a{' '}
            <span className="font-semibold text-[#C0593A]">{ROLES.find(r => r.value === role)?.label}</span>
          </p>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#EBE0D8]">

            {/* ── Auth options ── */}
            {mode === 'options' && (
              <div className="space-y-3">
                <SocialBtn icon={<GoogleIcon />} onClick={handleGoogle}>Continue with Google</SocialBtn>
                <SocialBtn icon={<span className="text-xl">💬</span>} onClick={() => go('wp-phone')}>
                  Continue with WhatsApp
                </SocialBtn>
                <Divider />
                <button type="button" onClick={() => go('email')}
                  className="w-full py-3 rounded-lg border border-[#EBE0D8] text-[#6B5248] text-sm font-medium hover:bg-[#FDF8F5] transition-colors">
                  Sign up with Email & Password
                </button>
              </div>
            )}

            {/* ── WhatsApp: phone ── */}
            {mode === 'wp-phone' && (
              <>
                <Back onClick={() => go('options')} />
                <p className="text-base font-semibold text-[#2C1810] mb-1">Enter your WhatsApp number</p>
                <p className="text-xs text-[#A08070] mb-5">We'll send a one-time code to your WhatsApp</p>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <Field label="Your name">
                    <input type="text" value={wpName} onChange={e => setWpName(e.target.value)}
                      placeholder="Arun Raina" required autoComplete="name" className={inp} />
                  </Field>
                  <Field label="Phone number">
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg text-sm text-[#6B5248]">+91</span>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="9876543210" required maxLength={10} className={`${inp} flex-1`} />
                    </div>
                  </Field>
                  {error && <ErrBox>{error}</ErrBox>}
                  <PrimaryBtn loading={loading} loadingLabel="Sending OTP…">Send OTP on WhatsApp</PrimaryBtn>
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
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="• • • • • •" maxLength={6} required
                    className={`${inp} text-center text-xl tracking-[0.5em] font-mono`} />
                  {error && <ErrBox>{error}</ErrBox>}
                  <PrimaryBtn loading={loading} loadingLabel="Verifying…">Verify & Create account</PrimaryBtn>
                  <button type="button" onClick={handleSendOtp as unknown as React.MouseEventHandler}
                    className="w-full text-center text-xs text-[#A08070] hover:text-[#C0593A] transition-colors">
                    Resend OTP
                  </button>
                </form>
              </>
            )}

            {/* ── Email signup ── */}
            {mode === 'email' && (
              <>
                <Back onClick={() => go('options')} />
                <form onSubmit={handleEmail} className="space-y-4">
                  <Field label="Full name">
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Arun Raina" required autoComplete="name" className={inp} />
                  </Field>
                  <Field label="Email address">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" required autoComplete="email" className={inp} />
                  </Field>
                  <Field label="Password">
                    <PwInput value={password} onChange={setPassword} show={showPw} onToggle={() => setShowPw(p => !p)} placeholder="Min. 8 characters" />
                  </Field>
                  <Field label="Confirm password">
                    <PwInput value={confirm} onChange={setConfirm} show={showCf} onToggle={() => setShowCf(p => !p)} placeholder="Re-enter password" />
                  </Field>
                  {error && <ErrBox>{error}</ErrBox>}
                  <PrimaryBtn loading={loading} loadingLabel="Creating account…">Create free account</PrimaryBtn>
                </form>
              </>
            )}

          </div>

          <p className="text-center text-sm text-[#6B5248] mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-[#C0593A] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      )}
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

function PwInput({ value, onChange, show, onToggle, placeholder }: {
  value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder: string;
}) {
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required autoComplete="new-password" className={`${inp} pr-12`} />
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
