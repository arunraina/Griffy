import fs from 'fs';
import path from 'path';
import { Page, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// The web app's own .env intentionally has no service-role key (client-side
// code must never see it). E2E test tooling isn't client-side code, so it
// reads the sibling api app's .env directly — the same dev Supabase project
// both apps point at.
function loadApiEnv(): Record<string, string> {
  const envPath = path.join(__dirname, '../../api/.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const out: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, '');
  }
  return out;
}

const apiEnv = loadApiEnv();
// Not process.env.API_BASE_URL: importing @prisma/client triggers Prisma's
// own dotenv auto-load of apps/api/.env as a side effect (it bakes in the
// schema's directory at generate-time), which defines API_BASE_URL WITHOUT
// the /api/v1 prefix (that var is for email/notification links, not this
// API's own route prefix) — and dotenv mutates process.env globally, so it
// silently clobbers any same-named var before this file's own code runs.
const API_BASE = 'http://localhost:3001/api/v1';

// Cap the pool (Prisma defaults to num_cpus*2+1 connections) — the Supabase
// dev pooler has a much lower connection ceiling, and this test process's
// PrismaClient competes with every other client hitting the same project.
const separator = apiEnv.DATABASE_URL.includes('?') ? '&' : '?';
export const prisma = new PrismaClient({
  datasourceUrl: `${apiEnv.DATABASE_URL}${separator}connection_limit=3&pool_timeout=20`,
});

const supabaseAdmin = createClient(apiEnv.SUPABASE_URL, apiEnv.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as any },
});

const supabaseAnon = createClient(apiEnv.SUPABASE_URL, apiEnv.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as any },
});

export interface TestUser {
  email: string;
  password: string;
  userId: string;
  accessToken: string;
}

let counter = 0;

/** Mints a brand-new confirmed Supabase user with a real, known password —
 * used to drive the real /login UI form rather than faking a session. */
export async function createTestUser(prefix: string, metadata: Record<string, unknown> = {}): Promise<TestUser> {
  counter += 1;
  const email = `pw-e2e.${prefix}.${Date.now()}.${counter}@griffy-test.dev`;
  const password = `Test${Date.now()}!aA1`;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error || !data.user) throw new Error(`createUser failed for ${email}: ${error?.message}`);

  const signedIn = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (signedIn.error || !signedIn.data.session) {
    throw new Error(`signInWithPassword failed for ${email}: ${signedIn.error?.message}`);
  }
  const accessToken = signedIn.data.session.access_token;

  // Trigger AuthGuard's upsert so a local User row exists before we set role.
  const meUrl = `${API_BASE}/users/me`;
  const meRes = await fetch(meUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!meRes.ok) throw new Error(`GET ${meUrl} failed for ${email}: ${meRes.status} ${await meRes.text()}`);

  return { email, password, userId: data.user.id, accessToken };
}

export async function setRole(user: TestUser, role: string): Promise<void> {
  if (role === 'ADMIN') {
    await prisma.user.update({ where: { id: user.userId }, data: { role: 'ADMIN' } });
    return;
  }
  await fetch(`${API_BASE}/users/me/role`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${user.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
}

export async function deleteTestUser(user: TestUser): Promise<void> {
  await prisma.user.deleteMany({ where: { id: user.userId } }).catch(() => undefined);
  await supabaseAdmin.auth.admin.deleteUser(user.userId).catch(() => undefined);
}

/** Drives the real /login UI (email/password mode), asserting we land on /dashboard. */
export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Continue with Email & Password' }).click();
  await page.getByPlaceholder('you@example.com').fill(user.email);
  await page.locator('input[type="password"]').fill(user.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}
