// Overrides the Authorization header apiFetch/admin.ts use, without ever
// touching the admin's real Supabase session (cookies) underneath -- so
// "restoring the admin" on exit is just "stop overriding", nothing to
// capture/replay. Session-scoped deliberately: closing the tab ends any
// stray impersonation rather than leaving it live indefinitely.
const TOKEN_KEY = 'griffy_impersonation_token';
const TARGET_KEY = 'griffy_impersonation_target';

export interface ImpersonationTarget {
  id: string;
  name: string;
  role: string;
}

export function getImpersonationToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getImpersonationTarget(): ImpersonationTarget | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(TARGET_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function beginImpersonation(token: string, target: ImpersonationTarget) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(TARGET_KEY, JSON.stringify(target));
}

export function clearImpersonation() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TARGET_KEY);
}
