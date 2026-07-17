import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, closeTestApp, mintSession, deleteTestSession, authHeader, TestSession } from './helpers';

const api = (app: INestApplication) => request(app.getHttpServer());

describe('Projects/Bids, Reviews, Rate limiting, RLS (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const sessions: TestSession[] = [];

  async function newSession(prefix: string, role?: string): Promise<TestSession> {
    const s = await mintSession(prefix);
    sessions.push(s);
    await api(app).get('/api/v1/users/me').set(authHeader(s));
    if (role) await api(app).patch('/api/v1/users/me/role').set(authHeader(s)).send({ role });
    return s;
  }

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await Promise.all(sessions.map((s) => deleteTestSession(prisma, s.userId)));
    await closeTestApp(app, prisma);
  }, 120000);

  // ── Projects (bidding marketplace) ───────────────────────────────────────
  // Ground-truth correction: this domain's own status enum is OPEN/AWARDED/
  // CLOSED (defaults to OPEN on create, not "REQUESTED"), and this controller
  // has no accept/milestones/fund/reply routes — those concepts only exist on
  // a separate `turnkey-projects` domain, and "reply" doesn't exist anywhere
  // in the codebase at all.
  describe('projects + bids', () => {
    it('POST /projects creates a project defaulting to OPEN status', async () => {
      const owner = await newSession('proj-owner');
      const res = await api(app).post('/api/v1/projects').set(authHeader(owner)).send({
        projectType: 'Home Construction', title: 'Build my house', description: 'Need a 2BHK built',
        city: 'Srinagar', state: 'J&K', budgetMin: 500000, budgetMax: 1000000, timeline: '6 months',
      });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('OPEN');
    });

    it('submitting a bid containing a phone number is blocked (400)', async () => {
      const owner = await newSession('proj-bid-owner');
      const contractor = await newSession('proj-bid-contractor', 'CONTRACTOR');
      const project = await api(app).post('/api/v1/projects').set(authHeader(owner)).send({
        projectType: 'Renovation', title: 'Renovate kitchen', description: 'desc', city: 'Jammu', state: 'J&K',
        budgetMin: 100000, budgetMax: 200000, timeline: '2 months',
      });

      const res = await api(app).post(`/api/v1/projects/${project.body.id}/bids`).set(authHeader(contractor)).send({
        bidAmount: 150000, message: 'Call me at 9876543210 to discuss',
      });
      expect(res.status).toBe(400);
    });

    it('a clean bid succeeds, only the owner can view bids, and accepting sets AWARDED', async () => {
      const owner = await newSession('proj-accept-owner');
      const contractor = await newSession('proj-accept-contractor', 'CONTRACTOR');
      const stranger = await newSession('proj-accept-stranger');
      const project = await api(app).post('/api/v1/projects').set(authHeader(owner)).send({
        projectType: 'Renovation', title: 'Renovate bathroom', description: 'desc', city: 'Pune', state: 'MH',
        budgetMin: 50000, budgetMax: 90000, timeline: '1 month',
      });

      const bid = await api(app).post(`/api/v1/projects/${project.body.id}/bids`).set(authHeader(contractor)).send({
        bidAmount: 70000, message: 'I can do this well within budget and timeline.',
      });
      expect(bid.status).toBe(201);

      const strangerViewsBids = await api(app).get(`/api/v1/projects/${project.body.id}/bids`).set(authHeader(stranger));
      expect(strangerViewsBids.status).toBe(403);

      const ownerViewsBids = await api(app).get(`/api/v1/projects/${project.body.id}/bids`).set(authHeader(owner));
      expect(ownerViewsBids.status).toBe(200);
      expect(ownerViewsBids.body.length).toBe(1);

      const accept = await api(app)
        .patch(`/api/v1/projects/${project.body.id}/bids/${bid.body.id}`)
        .set(authHeader(owner))
        .send({ status: 'ACCEPTED' });
      expect(accept.status).toBe(200);

      const projectAfter = await api(app).get(`/api/v1/projects/${project.body.id}`);
      expect(projectAfter.body.status).toBe('AWARDED');
    });

    it('a contractor cannot bid on their own project (403)', async () => {
      const owner = await newSession('proj-selfbid-owner', 'CONTRACTOR');
      const project = await api(app).post('/api/v1/projects').set(authHeader(owner)).send({
        projectType: 'Renovation', title: 'Self bid test', description: 'desc', city: 'Pune', state: 'MH',
        budgetMin: 10000, budgetMax: 20000, timeline: '1 week',
      });
      const res = await api(app).post(`/api/v1/projects/${project.body.id}/bids`).set(authHeader(owner)).send({
        bidAmount: 15000, message: 'I would like to work on this project myself.',
      });
      expect(res.status).toBe(403);
    });
  });

  // ── Reviews ───────────────────────────────────────────────────────────
  describe('reviews', () => {
    it('requires a COMPLETED booking to review a CONTRACTOR; blocked before completion (403)', async () => {
      const customer = await newSession('rev-noBooking');
      const contractor = await newSession('rev-contractor-noBooking', 'CONTRACTOR');
      const profile = await api(app).post('/api/v1/contractor-profiles').set(authHeader(contractor)).send({
        contractorType: 'FULL_CONTRACTOR', tradeSkills: ['Masonry'], experience: '3 years', serviceCities: ['Srinagar'],
      });

      const res = await api(app).post('/api/v1/reviews').set(authHeader(customer)).send({
        targetType: 'CONTRACTOR', targetId: profile.body.id, rating: 5, comment: 'Great work',
      });
      expect(res.status).toBe(403);
    });

    it('succeeds and is verified after a COMPLETED booking; duplicate review is a 409 conflict', async () => {
      const customer = await newSession('rev-booking-customer');
      const contractor = await newSession('rev-booking-contractor', 'CONTRACTOR');
      const profile = await api(app).post('/api/v1/contractor-profiles').set(authHeader(contractor)).send({
        contractorType: 'FULL_CONTRACTOR', tradeSkills: ['Tiling'], experience: '3 years', serviceCities: ['Srinagar'],
      });
      const booking = await api(app).post('/api/v1/bookings').set(authHeader(customer)).send({
        providerId: contractor.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });
      expect(booking.status).toBe(201);
      // Booking status is now a real state machine (provider-only,
      // PENDING->CONFIRMED->IN_PROGRESS->COMPLETED) — walk through it rather
      // than jumping straight to COMPLETED.
      const confirmed = await api(app).patch(`/api/v1/bookings/${booking.body.id}/confirm`).set(authHeader(contractor));
      expect(confirmed.status).toBe(200);
      const completed = await api(app).patch(`/api/v1/bookings/${booking.body.id}/status`).set(authHeader(contractor)).send({ status: 'IN_PROGRESS' });
      expect(completed.status).toBe(200);
      const done = await api(app).patch(`/api/v1/bookings/${booking.body.id}/status`).set(authHeader(contractor)).send({ status: 'COMPLETED' });
      expect(done.status).toBe(200);

      const first = await api(app).post('/api/v1/reviews').set(authHeader(customer)).send({
        targetType: 'CONTRACTOR', targetId: profile.body.id, rating: 5, comment: 'Excellent',
      });
      expect(first.status).toBe(201);
      expect(first.body.isVerified).toBe(true);

      const dup = await api(app).post('/api/v1/reviews').set(authHeader(customer)).send({
        targetType: 'CONTRACTOR', targetId: profile.body.id, rating: 4, comment: 'again',
      });
      expect(dup.status).toBe(409);
    });

    it('LAND reviews have no transaction gate and are always unverified', async () => {
      const owner = await newSession('rev-land-owner', 'LAND_OWNER');
      const reviewer = await newSession('rev-land-reviewer');
      // POST /lands requires an APPROVED LandOwnerProfile first (same
      // pattern as materials requiring an APPROVED MaterialSupplierProfile).
      const ownerProfile = await api(app).post('/api/v1/land-owner-profiles').set(authHeader(owner)).send({ bio: 'Land owner' });
      await prisma.landOwnerProfile.update({ where: { id: ownerProfile.body.id }, data: { approvalStatus: 'APPROVED' } });

      const land = await api(app).post('/api/v1/lands').set(authHeader(owner)).send({
        title: 'Test Plot', landType: 'RESIDENTIAL', areaSqFt: 2000, price: 1500000,
        location: 'Sector 5', city: 'Srinagar', state: 'J&K',
      });
      expect(land.status).toBe(201);

      const res = await api(app).post('/api/v1/reviews').set(authHeader(reviewer)).send({
        targetType: 'LAND', targetId: land.body.id, rating: 4, comment: 'Nice plot',
      });
      expect(res.status).toBe(201);
      expect(res.body.isVerified).toBe(false);
    });
  });

  // ── Rate limiting ────────────────────────────────────────────────────────
  describe('rate limiting', () => {
    it('the WhatsApp OTP endpoint 429s on the 4th request within 60s (limit is 3/60s)', async () => {
      const phone = `+9199${Math.floor(10000000 + Math.random() * 89999999)}`;
      const results: number[] = [];
      for (let i = 0; i < 4; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const res = await api(app).post('/api/v1/auth/send-whatsapp-otp').send({ phone });
        results.push(res.status);
      }
      expect(results.slice(0, 3).every((s) => s !== 429)).toBe(true);
      expect(results[3]).toBe(429);
    });
  });

  // ── RLS ──────────────────────────────────────────────────────────────────
  describe('Row Level Security', () => {
    it('a direct anon-key query against the users table returns no rows (RLS denies access)', async () => {
      const anon = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
        auth: { autoRefreshToken: false, persistSession: false },
        realtime: { transport: ws as any },
      });
      const { data, error } = await anon.from('users').select('*').limit(1);
      // RLS lockdown revokes anon/authenticated grants entirely (per the
      // established convention in this codebase) — this can surface either
      // as an empty result set or an explicit permission-denied error,
      // depending on whether the deny is via RLS policy or a bare REVOKE.
      if (error) {
        expect(error.message.toLowerCase()).toMatch(/permission denied|rls/);
      } else {
        expect(data).toEqual([]);
      }
    });
  });
});
