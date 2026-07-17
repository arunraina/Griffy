import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, closeTestApp, mintSession, deleteTestSession, authHeader, TestSession } from './helpers';

const api = (app: INestApplication) => request(app.getHttpServer());

describe('Profiles / Materials / Bookings (e2e)', () => {
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

  // ── Contractor profiles (representative of the identical pattern shared by
  // all 8 profile modules: builder/labour/service-expert/material-supplier/
  // land-owner/property-seller/property-agent all use the same
  // findAll(APPROVED-only, isAvailable, non-suspended) + own-profile-only PATCH shape) ──
  describe('contractor-profiles', () => {
    it('POST creates a profile with PENDING approval status', async () => {
      const s = await newSession('cp-create', 'CONTRACTOR');
      const res = await api(app)
        .post('/api/v1/contractor-profiles')
        .set(authHeader(s))
        .send({
          contractorType: 'FULL_CONTRACTOR',
          tradeSkills: ['Masonry'],
          experience: '5 years',
          serviceCities: ['Srinagar'],
          isAvailable: true,
        });
      expect(res.status).toBe(201);
      expect(res.body.approvalStatus).toBe('PENDING');
    });

    it('GET / (public) excludes PENDING profiles', async () => {
      const s = await newSession('cp-pending', 'CONTRACTOR');
      await api(app)
        .post('/api/v1/contractor-profiles')
        .set(authHeader(s))
        .send({ contractorType: 'FULL_CONTRACTOR', tradeSkills: ['Tiling'], experience: '2 years', serviceCities: ['Jammu'], isAvailable: true });

      const res = await api(app).get('/api/v1/contractor-profiles?city=Jammu');
      expect(res.status).toBe(200);
      expect(res.body.find((p: any) => p.userId === s.userId)).toBeUndefined();
    });

    it('GET / (public) excludes APPROVED-but-unavailable profiles', async () => {
      const s = await newSession('cp-unavail', 'CONTRACTOR');
      const created = await api(app)
        .post('/api/v1/contractor-profiles')
        .set(authHeader(s))
        .send({ contractorType: 'FULL_CONTRACTOR', tradeSkills: ['Wiring'], experience: '3 years', serviceCities: ['Anantnag'], isAvailable: false });

      await prisma.contractorProfile.update({ where: { id: created.body.id }, data: { approvalStatus: 'APPROVED' } });

      const res = await api(app).get('/api/v1/contractor-profiles?city=Anantnag');
      expect(res.body.find((p: any) => p.id === created.body.id)).toBeUndefined();
    });

    it('GET / (public) includes APPROVED + available, filtered by city', async () => {
      const s = await newSession('cp-approved', 'CONTRACTOR');
      const created = await api(app)
        .post('/api/v1/contractor-profiles')
        .set(authHeader(s))
        .send({ contractorType: 'FULL_CONTRACTOR', tradeSkills: ['Plumbing'], experience: '4 years', serviceCities: ['Baramulla'], isAvailable: true });

      await prisma.contractorProfile.update({ where: { id: created.body.id }, data: { approvalStatus: 'APPROVED' } });

      const res = await api(app).get('/api/v1/contractor-profiles?city=Baramulla');
      expect(res.status).toBe(200);
      expect(res.body.find((p: any) => p.id === created.body.id)).toBeDefined();

      const wrongCity = await api(app).get('/api/v1/contractor-profiles?city=Pune');
      expect(wrongCity.body.find((p: any) => p.id === created.body.id)).toBeUndefined();
    });

    it('GET /:id returns the correct profile', async () => {
      const s = await newSession('cp-getone', 'CONTRACTOR');
      const created = await api(app)
        .post('/api/v1/contractor-profiles')
        .set(authHeader(s))
        .send({ contractorType: 'FULL_CONTRACTOR', tradeSkills: ['Carpentry'], experience: '6 years', serviceCities: ['Pune'] });

      const res = await api(app).get(`/api/v1/contractor-profiles/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.body.id);
    });

    it('PATCH updates own profile only; another user gets 403', async () => {
      const owner = await newSession('cp-owner', 'CONTRACTOR');
      const stranger = await newSession('cp-stranger', 'CONTRACTOR');
      const created = await api(app)
        .post('/api/v1/contractor-profiles')
        .set(authHeader(owner))
        .send({ contractorType: 'FULL_CONTRACTOR', tradeSkills: ['Roofing'], experience: '1 year', serviceCities: ['Shimla'] });

      const ownUpdate = await api(app)
        .patch(`/api/v1/contractor-profiles/${created.body.id}`)
        .set(authHeader(owner))
        .send({ bio: 'updated by owner' });
      expect(ownUpdate.status).toBe(200);
      expect(ownUpdate.body.bio).toBe('updated by owner');

      const strangerUpdate = await api(app)
        .patch(`/api/v1/contractor-profiles/${created.body.id}`)
        .set(authHeader(stranger))
        .send({ bio: 'hijacked' });
      expect(strangerUpdate.status).toBe(403);
    });

    // Ground-truth correction: there is no `limit`/`offset` pagination on any
    // profile-listing endpoint (findAll takes only an optional `city`) — the
    // originally-assumed pagination test does not apply to this API.
  });

  // ── Materials ──────────────────────────────────────────────────────────
  describe('materials', () => {
    it('POST is blocked (403) without an APPROVED MaterialSupplierProfile', async () => {
      const s = await newSession('mat-noprofile', 'MATERIAL_SUPPLIER');
      const res = await api(app)
        .post('/api/v1/materials')
        .set(authHeader(s))
        .send({ name: 'Test Cement', category: 'cement', subcategory: 'OPC', price: 350, unit: 'bag', stock: 100 });
      expect(res.status).toBe(403);
    });

    it('POST succeeds once the supplier profile is APPROVED, and GET /:id includes supplier info', async () => {
      const s = await newSession('mat-approved', 'MATERIAL_SUPPLIER');
      const profile = await api(app)
        .post('/api/v1/material-supplier-profiles')
        .set(authHeader(s))
        .send({ businessName: 'Test Supplies Co', businessAddress: '123 Test Rd', deliveryCities: ['Srinagar'] });
      await prisma.materialSupplierProfile.update({ where: { id: profile.body.id }, data: { approvalStatus: 'APPROVED' } });

      const created = await api(app)
        .post('/api/v1/materials')
        .set(authHeader(s))
        .send({ name: 'OPC 53 Grade Cement', category: 'cement', subcategory: 'OPC', price: 380, unit: 'bag', stock: 500 });
      expect(created.status).toBe(201);

      const fetched = await api(app).get(`/api/v1/materials/${created.body.id}`);
      expect(fetched.status).toBe(200);
      expect(fetched.body.supplier?.businessName).toBe('Test Supplies Co');
    });

    it('GET / filters by category and subcategory', async () => {
      const byCategory = await api(app).get('/api/v1/materials?category=cement');
      expect(byCategory.status).toBe(200);
      expect(byCategory.body.every((m: any) => m.category === 'cement')).toBe(true);

      const bySubcategory = await api(app).get('/api/v1/materials?subcategory=OPC');
      expect(bySubcategory.body.every((m: any) => m.subcategory === 'OPC')).toBe(true);
    });
  });

  // ── Bookings ───────────────────────────────────────────────────────────
  describe('bookings', () => {
    it('POST creates a booking with PENDING status and correct customerId from JWT', async () => {
      const customer = await newSession('bk-customer');
      const provider = await newSession('bk-provider', 'CONTRACTOR');

      const res = await api(app)
        .post('/api/v1/bookings')
        .set(authHeader(customer))
        .send({
          providerId: provider.userId,
          providerRole: 'CONTRACTOR',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          notes: 'Please bring tools',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('PENDING');
      expect(res.body.customerId).toBe(customer.userId);
    });

    it('GET /my returns only the current user\'s own bookings as customer', async () => {
      const customer = await newSession('bk-my');
      const otherCustomer = await newSession('bk-other');
      const provider = await newSession('bk-provider2', 'CONTRACTOR');

      await api(app).post('/api/v1/bookings').set(authHeader(customer)).send({
        providerId: provider.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });
      await api(app).post('/api/v1/bookings').set(authHeader(otherCustomer)).send({
        providerId: provider.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const mine = await api(app).get('/api/v1/bookings/my').set(authHeader(customer));
      expect(mine.body.every((b: any) => b.customerId === customer.userId)).toBe(true);
      expect(mine.body.some((b: any) => b.customerId === otherCustomer.userId)).toBe(false);
    });

    it('GET /incoming returns only the provider\'s own bookings', async () => {
      const customer = await newSession('bk-inc-customer');
      const provider = await newSession('bk-inc-provider', 'CONTRACTOR');
      const otherProvider = await newSession('bk-inc-other', 'CONTRACTOR');

      await api(app).post('/api/v1/bookings').set(authHeader(customer)).send({
        providerId: provider.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const incoming = await api(app).get('/api/v1/bookings/incoming').set(authHeader(provider));
      expect(incoming.body.every((b: any) => b.providerId === provider.userId)).toBe(true);

      const otherIncoming = await api(app).get('/api/v1/bookings/incoming').set(authHeader(otherProvider));
      expect(otherIncoming.body.length).toBe(0);
    });

    it('PATCH /:id/cancel is allowed for either party', async () => {
      const customer = await newSession('bk-cancel-customer');
      const provider = await newSession('bk-cancel-provider', 'CONTRACTOR');
      const created = await api(app).post('/api/v1/bookings').set(authHeader(customer)).send({
        providerId: provider.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const res = await api(app).patch(`/api/v1/bookings/${created.body.id}/cancel`).set(authHeader(provider));
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('CANCELLED');
    });

    it('a third party (neither customer nor provider) cannot touch the booking (403)', async () => {
      const customer = await newSession('bk-3p-customer');
      const provider = await newSession('bk-3p-provider', 'CONTRACTOR');
      const stranger = await newSession('bk-3p-stranger');
      const created = await api(app).post('/api/v1/bookings').set(authHeader(customer)).send({
        providerId: provider.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const res = await api(app).patch(`/api/v1/bookings/${created.body.id}/confirm`).set(authHeader(stranger));
      expect(res.status).toBe(403);
    });

    // Fixed bug: BookingsService.updateStatus() now enforces both party-role
    // (only the provider may confirm/start/complete) and a real transition
    // state-machine (PENDING->CONFIRMED->IN_PROGRESS->COMPLETED, cancel from
    // any non-terminal state by either party). These tests verify the fix.
    it('only the provider can confirm a booking; the customer gets 403', async () => {
      const customer = await newSession('bk-selfconfirm-customer');
      const provider = await newSession('bk-selfconfirm-provider', 'CONTRACTOR');
      const created = await api(app).post('/api/v1/bookings').set(authHeader(customer)).send({
        providerId: provider.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const byCustomer = await api(app).patch(`/api/v1/bookings/${created.body.id}/confirm`).set(authHeader(customer));
      expect(byCustomer.status).toBe(403);

      const byProvider = await api(app).patch(`/api/v1/bookings/${created.body.id}/confirm`).set(authHeader(provider));
      expect(byProvider.status).toBe(200);
      expect(byProvider.body.status).toBe('CONFIRMED');
    });

    it('a PENDING booking cannot jump directly to COMPLETED (400 invalid transition)', async () => {
      const customer = await newSession('bk-skipstate-customer');
      const provider = await newSession('bk-skipstate-provider', 'CONTRACTOR');
      const created = await api(app).post('/api/v1/bookings').set(authHeader(customer)).send({
        providerId: provider.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const res = await api(app)
        .patch(`/api/v1/bookings/${created.body.id}/status`)
        .set(authHeader(provider))
        .send({ status: 'COMPLETED' });
      expect(res.status).toBe(400);
    });

    it('provider can walk a booking through CONFIRMED -> IN_PROGRESS -> COMPLETED', async () => {
      const customer = await newSession('bk-lifecycle-customer');
      const provider = await newSession('bk-lifecycle-provider', 'CONTRACTOR');
      const created = await api(app).post('/api/v1/bookings').set(authHeader(customer)).send({
        providerId: provider.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const confirmed = await api(app).patch(`/api/v1/bookings/${created.body.id}/confirm`).set(authHeader(provider));
      expect(confirmed.status).toBe(200);

      const inProgress = await api(app).patch(`/api/v1/bookings/${created.body.id}/status`).set(authHeader(provider)).send({ status: 'IN_PROGRESS' });
      expect(inProgress.status).toBe(200);
      expect(inProgress.body.status).toBe('IN_PROGRESS');

      const byCustomer = await api(app).patch(`/api/v1/bookings/${created.body.id}/status`).set(authHeader(customer)).send({ status: 'COMPLETED' });
      expect(byCustomer.status).toBe(403);

      const completed = await api(app).patch(`/api/v1/bookings/${created.body.id}/status`).set(authHeader(provider)).send({ status: 'COMPLETED' });
      expect(completed.status).toBe(200);
      expect(completed.body.status).toBe('COMPLETED');
    });
  });
});
