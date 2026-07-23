import { createClient } from '@/lib/supabase';

// ── Google OAuth ───────────────────────────────────────────────
export async function signInWithGoogle(redirectTo = '/home') {
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

// ── Sign out ─────────────────────────────────────────────────────
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = '/login';
}
