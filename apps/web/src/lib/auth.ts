import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { createClient } from '@/lib/supabase';
import { firebaseAuth } from '@/lib/firebase';

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Google OAuth ───────────────────────────────────────────────
export async function signInWithGoogle(redirectTo = '/dashboard') {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) throw error;
  return data;
}

// ── Email + password ───────────────────────────────────────────
export async function signUpWithEmail(email: string, password: string, metadata?: Record<string, unknown>) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: metadata },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// ── Email OTP / magic link ─────────────────────────────────────
export async function sendEmailOtp(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function verifyEmailOtp(email: string, token: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
  return data;
}

// ── Phone OTP via Firebase Auth ─────────────────────────────────
// Firebase's ConfirmationResult can't be serialized into a URL/query param,
// so it can't survive a router.push() to a separate /verify-otp page the
// way a plain REST OTP call could. Stashed here at module scope instead --
// this survives Next.js client-side navigation (same JS execution context),
// but not a full page reload, in which case the user just needs to hit
// Resend on the verify-otp page.
let pendingPhoneConfirmation: ConfirmationResult | null = null;

// recaptchaContainerId must reference an element already mounted in the DOM
// (an invisible reCAPTCHA still needs a container to bind to).
export async function sendPhoneOtp(phone: string, recaptchaContainerId: string): Promise<void> {
  const verifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerId, { size: 'invisible' });
  pendingPhoneConfirmation = await signInWithPhoneNumber(firebaseAuth, phone, verifier);
}

// Confirms the code with Firebase, then exchanges the resulting Firebase ID
// token for a real Supabase session via our backend (AuthGuard only accepts
// Supabase JWTs, not Firebase ones).
export async function verifyPhoneOtp(otp: string) {
  if (!pendingPhoneConfirmation) throw new Error('OTP session expired — please request a new code.');
  const credential = await pendingPhoneConfirmation.confirm(otp);
  const idToken = await credential.user.getIdToken();

  const res = await fetch(`${API}/auth/firebase-phone-signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Invalid OTP');

  const supabase = createClient();
  const { error } = await supabase.auth.setSession({ access_token: body.access_token, refresh_token: body.refresh_token });
  if (error) throw error;
  pendingPhoneConfirmation = null;

  // Signup stashes name/role/pro_label/referral_code in localStorage before
  // redirecting here (same pattern the Google OAuth callback uses) since
  // there's no external identity provider supplying them for phone signup.
  const name = localStorage.getItem('griffy_signup_name');
  const role = localStorage.getItem('griffy_signup_role');
  const proLabel = localStorage.getItem('griffy_signup_pro_label');
  const referralCode = localStorage.getItem('griffy_signup_ref');
  if (name || role || proLabel || referralCode) {
    await supabase.auth.updateUser({
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(proLabel && { pro_label: proLabel }),
        ...(referralCode && { referral_code: referralCode }),
      },
    });
    localStorage.removeItem('griffy_signup_name');
    localStorage.removeItem('griffy_signup_role');
    localStorage.removeItem('griffy_signup_pro_label');
    localStorage.removeItem('griffy_signup_ref');
  }

  return body;
}

// ── Sign out ─────────────────────────────────────────────────────
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = '/login';
}
