import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import fs from 'fs';
import path from 'path';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// Prisma's default connection pool size is num_cpus*2+1 per PrismaClient —
// on a multi-core dev machine that's easily 10-30+ connections from a SINGLE
// test file against the Supabase transaction pooler, which has a much lower
// hard cap. Running the full suite (4 files, each with its own PrismaClient)
// back-to-back was intermittently exhausting it, causing
// PrismaClientInitializationError on files that happened to run later.
// Capping the pool per test process fixes this deterministically. Must run
// before AppModule/ConfigModule are ever imported, since dotenv (used by
// ConfigModule.forRoot()) never overwrites an already-set env var.
(function capTestConnectionPool() {
  if (process.env.DATABASE_URL) return; // already capped by an earlier import in this process
  const envPath = path.join(__dirname, '../.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.split('\n').find((l) => l.startsWith('DATABASE_URL='));
  if (!match) return;
  const raw = match.slice('DATABASE_URL='.length).replace(/^"|"$/g, '');
  const separator = raw.includes('?') ? '&' : '?';
  process.env.DATABASE_URL = `${raw}${separator}connection_limit=3&pool_timeout=20`;
})();

// AuthGuard verifies bearer tokens by calling supabase.auth.getUser(token)
// against real Supabase — there is no local JWT secret to sign fake tokens
// with, so every "authenticated" test request needs a real Supabase session.
// We mint one per test user via the service-role admin API (generateLink +
// verifyOtp) without ever knowing/using a real password.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws as any } },
);

const supabaseAnon = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws as any } },
);

export async function createTestApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { rawBody: true, logger: false });
  app.setGlobalPrefix('api/v1', { exclude: ['media/(.*)'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.init();
  return app;
}

// PrismaService only implements OnModuleInit (calls $connect()) — it never
// implements OnModuleDestroy, so app.close() alone never actually closes its
// Postgres connections. Left unfixed, every test run leaks connections
// against the Supabase pooler's (low) connection cap, which is exactly what
// was causing "Can't reach database server" failures to compound across
// repeated runs in this same dev project. Explicitly disconnect Prisma here.
export async function closeTestApp(app: INestApplication, prisma: PrismaService): Promise<void> {
  await prisma.$disconnect();
  await app.close();
}

export interface TestSession {
  email: string;
  userId: string;
  accessToken: string;
}

let counter = 0;

// Mints a brand-new Supabase Auth user + real session. `metadata` is written
// as user_metadata so AuthGuard.resolveRole() can derive a starting role
// (e.g. { role: 'SERVICE_PROVIDER', pro_label: 'Contractor' }) on first
// login, matching how real signup writes metadata. Every email is unique
// per process so parallel/rerun test runs never collide with leftover rows.
export async function mintSession(rolePrefix: string, metadata: Record<string, unknown> = {}): Promise<TestSession> {
  counter += 1;
  const email = `e2e.${rolePrefix}.${Date.now()}.${counter}@griffy-test.dev`;

  const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email,
    password: `Test${Date.now()}!aA1`,
    options: { data: metadata },
  });
  if (linkErr || !linkData) throw new Error(`generateLink failed for ${email}: ${linkErr?.message}`);

  const otp = linkData.properties?.email_otp;
  if (!otp) throw new Error(`no email_otp returned for ${email}`);

  const { data: verifyData, error: verifyErr } = await supabaseAnon.auth.verifyOtp({
    email,
    token: otp,
    type: 'signup',
  });
  if (verifyErr || !verifyData.session) throw new Error(`verifyOtp failed for ${email}: ${verifyErr?.message}`);

  return {
    email,
    userId: verifyData.session.user.id,
    accessToken: verifyData.session.access_token,
  };
}

export async function deleteTestSession(prisma: PrismaService, userId: string): Promise<void> {
  await prisma.user.deleteMany({ where: { id: userId } }).catch(() => undefined);
  await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
}

export function authHeader(session: TestSession): { Authorization: string } {
  return { Authorization: `Bearer ${session.accessToken}` };
}

export { supabaseAdmin };
