'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { isEnabled } from '@/lib/featureFlags';

type Side = 'homeowner' | 'professional' | null;
type FlowStep = 'side' | 'role' | 'auth';
type Role = 'CUSTOMER' | 'SERVICE_PROVIDER' | 'MATERIAL_SELLER' | 'LAND_OWNER' | 'ADMIN' | 'PROPERTY_SELLER' | 'BUILDER' | 'PROPERTY_AGENT';
type Mode = 'options' | 'email' | 'wp-phone' | 'wp-otp' | 'verify-choice';

const API = process.env.NEXT_PUBLIC_API_URL;

const ALL_PRO_ROLES: { value: Role; label: string; sublabel: string; desc: string; icon: string; flagKey?: string; team?: boolean }[] = [
  { value: 'SERVICE_PROVIDER', label: 'Contractor',          sublabel: 'Builder / Designer', desc: 'Architect, designer, civil or renovation contractor', icon: '🏗️', flagKey: 'contractors' },
  { value: 'SERVICE_PROVIDER', label: 'Labour / Mistri',     sublabel: 'Skilled Worker',     desc: 'Mason, carpenter, painter or daily wage worker',      icon: '👷', flagKey: 'labour' },
  { value: 'SERVICE_PROVIDER', label: 'Service Expert',      sublabel: 'Specialist',         desc: 'Electrician, plumber, AC technician or specialist',    icon: '⚡', flagKey: 'service_experts' },
  { value: 'MATERIAL_SELLER',  label: 'Material Supplier',   sublabel: 'Seller',             desc: 'Sell cement, steel, tiles or building materials',       icon: '🧱', flagKey: 'materials' },
  { value: 'LAND_OWNER',       label: 'Land Owner',          sublabel: 'Plot / Land',        desc: 'List land or plots for sale or rent',                  icon: '🌍', flagKey: 'land' },
  { value: 'PROPERTY_SELLER',  label: 'Property Seller',     sublabel: 'Home / Flat',        desc: 'Sell or rent out your home, flat or villa',            icon: '🏠', flagKey: 'properties' },
  { value: 'BUILDER',          label: 'Builder / Developer', sublabel: 'New Projects',       desc: 'Launch new construction projects or housing societies', icon: '🏢', flagKey: 'properties' },
  { value: 'PROPERTY_AGENT',   label: 'Property Agent',      sublabel: 'Broker / Agent',     desc: 'Help buyers and renters find the right property',      icon: '🤝', flagKey: 'properties' },
  { value: 'ADMIN',            label: 'Admin',               sublabel: 'Griffy Team',        desc: 'Internal team access only',                            icon: '⚙️', team: true },
];

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-2xl flex items-center justify-center min-h-[300px]">
        <svg className="animate-spin h-7 w-7 text-[#C0593A]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    }>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const params   = useSearchParams();
  const router   = useRouter();
  const supabase = createClient();
  const PRO_ROLES = ALL_PRO_ROLES.filter(r => r.team || isEnabled(r.flagKey ?? ''));

  const [side,      setSide]      = useState<Side>(null);
  const [flowStep,  setFlowStep]  = useState<FlowStep>('side');
  const [role,      setRole]      = useState<Role | null>(null);
  const [proLabel,  setProLabel]  = useState('');
  const [mode,      setMode]      = useState<Mode>('options');

  // WhatsApp flow
  const [wpName,   setWpName]   = useState('');
  const [phone,    setPhone]    = useState('');
  const [wpDigits, setWpDigits] = useState(['', '', '', '', '', '']);
  const wpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email flow
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [emailPhone, setEmailPhone] = useState('');
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [showCf,     setShowCf]     = useState(false);

  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Read ?type= URL param to pre-select side
  useEffect(() => {
    const t = params.get('type');
    if (t === 'homeowner') {
      setSide('homeowner');
      setRole('CUSTOMER');
      setFlowStep('auth');
    } else if (t === 'professional') {
      setSide('professional');
      setFlowStep('role');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function go(m: Mode) { setMode(m); setError(''); }

  // ── Side selection ─────────────────────────────────────────────
  function selectSide(s: Side) {
    setSide(s);
    if (s === 'homeowner') {
      setRole('CUSTOMER');
      setProLabel('Homeowner');
      setFlowStep('auth');
    } else {
      setRole(null);
      setFlowStep('role');
    }
  }

  // ── Professional role selection ────────────────────────────────
  function selectProRole(r: typeof PRO_ROLES[number]) {
    setRole(r.value);
    setProLabel(r.label);
    setFlowStep('auth');
  }

  // ── Google ─────────────────────────────────────────────────────
  async function handleGoogle() {
    if (role) localStorage.setItem('griffy_signup_role', role);
    if (proLabel) localStorage.setItem('griffy_signup_pro_label', proLabel);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  // ── WhatsApp: send OTP ─────────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: fmt(phone) });
    setLoading(false);
    if (error) { setError(error.message); return; }
    go('wp-otp');
  }

  // ── WhatsApp: verify OTP ───────────────────────────────────────
  async function verifyWpOtp(token: string) {
    setError(''); setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone: fmt(phone), token, type: 'sms' });
    if (!error) await supabase.auth.updateUser({ data: { name: wpName, role, pro_label: proLabel } });
    setLoading(false);
    if (error) { setError(error.message); setWpDigits(['', '', '', '', '', '']); wpRefs.current[0]?.focus(); return; }
    router.push('/onboarding');
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

  // ── Email signup ───────────────────────────────────────────────
  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, role, pro_label: proLabel } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    go('verify-choice');
  }

  // ── Verify via WhatsApp (after email signup) ───────────────────
  async function handleVerifyViaWhatsapp() {
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/send-whatsapp-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fmt(emailPhone) }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? 'Failed to send OTP');
      router.push(`/verify-otp?mode=whatsapp&phone=${encodeURIComponent(emailPhone)}&email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  // ── Step indicator config ──────────────────────────────────────
  const steps = side === 'homeowner'  ? ['Side', 'Details', 'Verify OTP', 'Profile']
    : side === 'professional'         ? ['Side', 'Role', 'Details', 'Verify OTP', 'Profile']
    :                                   ['Side', '···', '···', '···'];
  const activeStep = flowStep === 'side' ? 0
    : flowStep === 'role' ? 1
    : side === 'homeowner' ? 1
    : 2;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl">

      {/* Step indicator */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center">
            {i > 0 && (
              <div className={`h-px w-10 sm:w-16 mx-1 transition-colors ${i <= activeStep ? 'bg-[#C0593A]' : 'bg-gray-200'}`} />
            )}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < activeStep  ? 'bg-green-500 text-white'
                : i === activeStep ? 'bg-[#C0593A] text-white'
                : 'bg-gray-200 text-gray-400'
              }`}>
                {i < activeStep ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${
                i === activeStep ? 'text-[#C0593A]' : i < activeStep ? 'text-green-600' : 'text-gray-300'
              }`}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── STEP 0: Side selection ── */}
      {flowStep === 'side' && (
        <div className="w-full">
          <h1 className="text-2xl font-bold text-[#2C1810] text-center mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Welcome to Griffy
          </h1>
          <p className="text-sm text-[#6B5248] text-center mb-8">Tell us who you are to get started</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SideCard
              icon="🏠"
              title="I want to Hire & Buy"
              subtitle="I'm a Homeowner"
              desc="Find contractors, hire labour, book service experts, buy materials or find land"
              cta="Continue as Homeowner"
              selected={side === 'homeowner'}
              onClick={() => selectSide('homeowner')}
            />
            <SideCard
              icon="💼"
              title="I want to Work & Sell"
              subtitle="I'm a Professional or Supplier"
              desc="Offer services, sell materials, list land or find construction work"
              cta="Continue as Professional"
              selected={side === 'professional'}
              onClick={() => selectSide('professional')}
            />
          </div>

          <p className="text-center text-sm text-[#6B5248] mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-[#C0593A] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      )}

      {/* ── STEP 1: Professional role selection ── */}
      {flowStep === 'role' && (
        <div className="w-full">
          <Back onClick={() => { setFlowStep('side'); setSide(null); }} />
          <h1 className="text-2xl font-bold text-[#2C1810] text-center mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            What kind of professional are you?
          </h1>
          <p className="text-sm text-[#6B5248] text-center mb-8">Choose the role that best fits your work</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PRO_ROLES.map(r => (
              <button key={r.label} type="button"
                onClick={() => selectProRole(r)}
                className={`flex flex-col items-center text-center gap-2.5 p-5 rounded-2xl border-2 transition-all ${
                  r.team
                    ? 'border-dashed border-gray-200 bg-gray-50 hover:border-gray-400'
                    : 'border-[#EBE0D8] bg-white hover:border-[#C0593A] hover:bg-[#FAEEE9] hover:shadow-sm'
                }`}>
                <span className="text-4xl">{r.icon}</span>
                <div>
                  <p className={`text-sm font-bold mb-0.5 ${r.team ? 'text-gray-400' : 'text-[#2C1810]'}`}>{r.label}</p>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${r.team ? 'text-gray-300' : 'text-[#C0593A]'}`}>{r.sublabel}</p>
                  <p className={`text-xs leading-snug ${r.team ? 'text-gray-400' : 'text-[#A08070]'}`}>{r.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-[#6B5248] mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-[#C0593A] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      )}

      {/* ── STEP 2: Auth ── */}
      {flowStep === 'auth' && (
        <div className="w-full max-w-md mx-auto">
          {mode === 'options' && (
            <Back onClick={() => {
              setMode('options'); setError('');
              if (side === 'homeowner') setFlowStep('side');
              else setFlowStep('role');
            }} />
          )}
          {mode !== 'options' && mode !== 'verify-choice' && (
            <Back onClick={() => go('options')} />
          )}

          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>
              Create your account
            </h1>
          </div>
          <p className="text-sm text-[#6B5248] mb-6">
            Joining as a{' '}
            <span className="font-semibold text-[#C0593A]">
              {side === 'homeowner' ? 'Homeowner' : proLabel}
            </span>
          </p>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#EBE0D8]">

            {/* Auth options */}
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

            {/* WhatsApp: phone */}
            {mode === 'wp-phone' && (
              <>
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

            {/* WhatsApp: OTP */}
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

            {/* Verify choice (after email signup) */}
            {mode === 'verify-choice' && (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-[#FAEEE9] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
                  <h2 className="text-lg font-bold text-[#2C1810] mb-1">Account created!</h2>
                  <p className="text-sm text-[#6B5248]">How would you like to verify your account?</p>
                </div>
                {error && <ErrBox>{error}</ErrBox>}
                <div className="space-y-3">
                  <button type="button"
                    onClick={() => router.push(`/verify-otp?email=${encodeURIComponent(email)}`)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-[#EBE0D8] bg-white hover:border-[#C0593A] hover:bg-[#FAEEE9] transition-all text-left">
                    <span className="text-2xl">📧</span>
                    <div>
                      <p className="text-sm font-semibold text-[#2C1810]">Verify via Email</p>
                      <p className="text-xs text-[#A08070]">{email}</p>
                    </div>
                  </button>
                  {emailPhone ? (
                    <button type="button" onClick={handleVerifyViaWhatsapp} disabled={loading}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-[#EBE0D8] bg-white hover:border-[#C0593A] hover:bg-[#FAEEE9] transition-all text-left disabled:opacity-60">
                      <span className="text-2xl">💬</span>
                      <div>
                        <p className="text-sm font-semibold text-[#2C1810]">Verify via WhatsApp</p>
                        <p className="text-xs text-[#A08070]">+91 {emailPhone}</p>
                      </div>
                      {loading && <Spin />}
                    </button>
                  ) : (
                    <button type="button" onClick={() => go('email')}
                      className="w-full text-xs text-[#A08070] hover:text-[#C0593A] transition-colors py-2">
                      + Add WhatsApp number for faster verification
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Email signup */}
            {mode === 'email' && (
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
                <Field label="WhatsApp number (optional)">
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg text-sm text-[#6B5248]">+91</span>
                    <input type="tel" value={emailPhone} onChange={e => setEmailPhone(e.target.value)}
                      placeholder="9876543210" maxLength={10} className={`${inp} flex-1`} />
                  </div>
                  <p className="text-xs text-[#A08070] mt-1">Add to verify account via WhatsApp instead of email</p>
                </Field>
                {error && <ErrBox>{error}</ErrBox>}
                <PrimaryBtn loading={loading} loadingLabel="Creating account…">Create free account</PrimaryBtn>
              </form>
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

// ── SideCard ──────────────────────────────────────────────────────────────────

function SideCard({ icon, title, subtitle, desc, cta, selected, onClick }: {
  icon: string; title: string; subtitle: string; desc: string; cta: string;
  selected: boolean; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex flex-col items-center text-center gap-4 p-8 rounded-2xl border-2 min-h-[220px] justify-center transition-all hover:shadow-md ${
        selected ? 'border-[#C0593A] bg-orange-50 shadow-sm' : 'border-[#EBE0D8] bg-white hover:border-[#C0593A] hover:bg-[#FAEEE9]'
      }`}>
      <span className="text-5xl">{icon}</span>
      <div>
        <p className="text-lg font-bold text-[#2C1810] mb-0.5">{title}</p>
        <p className="text-xs font-semibold text-[#C0593A] uppercase tracking-wider mb-2">{subtitle}</p>
        <p className="text-sm text-[#6B5248] leading-relaxed">{desc}</p>
      </div>
      <div className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
        selected ? 'bg-[#C0593A] text-white' : 'bg-[#C0593A] text-white hover:bg-[#9E3F24]'
      }`}>
        {cta}
      </div>
    </button>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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
