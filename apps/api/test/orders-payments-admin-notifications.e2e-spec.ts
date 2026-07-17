import { createHmac } from 'crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, closeTestApp, mintSession, deleteTestSession, authHeader, TestSession } from './helpers';

const api = (app: INestApplication) => request(app.getHttpServer());

describe('Orders / Payments / Admin / Notifications (e2e)', () => {
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

  async function approvedSupplierWithMaterial(prefix: string, price = 400) {
    const supplier = await newSession(prefix, 'MATERIAL_SUPPLIER');
    const profile = await api(app)
      .post('/api/v1/material-supplier-profiles')
      .set(authHeader(supplier))
      .send({ businessName: `${prefix} Co`, businessAddress: '1 Test Rd', deliveryCities: ['Srinagar'] });
    await prisma.materialSupplierProfile.update({ where: { id: profile.body.id }, data: { approvalStatus: 'APPROVED' } });
    const material = await api(app)
      .post('/api/v1/materials')
      .set(authHeader(supplier))
      .send({ name: `${prefix} Cement`, category: 'cement', subcategory: 'OPC', price, unit: 'bag', stock: 1000 });
    return { supplier, material: material.body };
  }

  async function promoteToAdmin(session: TestSession) {
    await prisma.user.update({ where: { id: session.userId }, data: { role: 'ADMIN' } });
  }

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await Promise.all(sessions.map((s) => deleteTestSession(prisma, s.userId)));
    await closeTestApp(app, prisma);
  }, 120000);

  describe('orders + payment webhook + invoice', () => {
    it('full lifecycle: create -> webhook payment.captured -> ACCEPTED/PAID -> invoice available', async () => {
      const buyer = await newSession('ord-buyer');
      const { material } = await approvedSupplierWithMaterial('ord-supplier');

      const order = await api(app)
        .post('/api/v1/orders')
        .set(authHeader(buyer))
        .send({ items: [{ materialId: material.id, quantity: 2 }], shippingAddress: '221B Test Street' });
      expect(order.status).toBe(201);
      expect(order.body.status).toBe('PLACED');
      expect(order.body.paymentStatus).toBe('UNPAID');

      const invoiceBefore = await api(app).get(`/api/v1/orders/${order.body.id}/invoice`).set(authHeader(buyer));
      expect(invoiceBefore.status).toBe(404);

      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: `pay_test_${Date.now()}`,
              order_id: `order_test_${Date.now()}`,
              notes: { entityType: 'order', entityId: order.body.id },
            },
          },
        },
      };
      const rawBody = JSON.stringify(webhookPayload);
      const signature = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(rawBody).digest('hex');

      const webhookRes = await api(app)
        .post('/api/v1/webhooks/razorpay')
        .set('x-razorpay-signature', signature)
        .set('x-razorpay-event-id', `evt_test_${Date.now()}`)
        .set('Content-Type', 'application/json')
        .send(rawBody);
      expect(webhookRes.status).toBe(200);
      expect(webhookRes.body.received).toBe(true);

      const afterWebhook = await api(app).get(`/api/v1/orders/${order.body.id}`).set(authHeader(buyer));
      expect(afterWebhook.body.status).toBe('ACCEPTED');
      expect(afterWebhook.body.paymentStatus).toBe('PAID');

      const invoiceAfter = await api(app).get(`/api/v1/orders/${order.body.id}/invoice`).set(authHeader(buyer));
      expect(invoiceAfter.status).toBe(200);
      expect(invoiceAfter.headers['content-type']).toBe('application/pdf');
    });

    it('rejects a webhook with an invalid signature (400)', async () => {
      const payload = { event: 'payment.captured', payload: { payment: { entity: { id: 'x', order_id: 'y', notes: {} } } } };
      const res = await api(app)
        .post('/api/v1/webhooks/razorpay')
        .set('x-razorpay-signature', 'deadbeef')
        .set('x-razorpay-event-id', `evt_bad_${Date.now()}`)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(payload));
      expect(res.status).toBe(400);
    });

    it('a duplicate event id is a no-op on replay (200, no double-processing)', async () => {
      const buyer = await newSession('ord-dup-buyer');
      const { material } = await approvedSupplierWithMaterial('ord-dup-supplier');
      const order = await api(app)
        .post('/api/v1/orders')
        .set(authHeader(buyer))
        .send({ items: [{ materialId: material.id, quantity: 1 }], shippingAddress: 'Addr' });

      const eventId = `evt_dup_${Date.now()}`;
      const payload = {
        event: 'payment.captured',
        payload: { payment: { entity: { id: 'pay_dup', order_id: 'order_dup', notes: { entityType: 'order', entityId: order.body.id } } } },
      };
      const rawBody = JSON.stringify(payload);
      const signature = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(rawBody).digest('hex');

      const first = await api(app).post('/api/v1/webhooks/razorpay').set('x-razorpay-signature', signature).set('x-razorpay-event-id', eventId).set('Content-Type', 'application/json').send(rawBody);
      const second = await api(app).post('/api/v1/webhooks/razorpay').set('x-razorpay-signature', signature).set('x-razorpay-event-id', eventId).set('Content-Type', 'application/json').send(rawBody);
      expect(first.status).toBe(200);
      expect(second.status).toBe(200);

      const events = await prisma.paymentEvent.findMany({ where: { razorpayEventId: eventId } });
      expect(events.length).toBe(1);
    });

    it('order status transitions: PLACED->ACCEPTED works, ACCEPTED->PLACED is rejected (400)', async () => {
      const buyer = await newSession('ord-trans-buyer');
      const { supplier, material } = await approvedSupplierWithMaterial('ord-trans-supplier');
      const order = await api(app).post('/api/v1/orders').set(authHeader(buyer)).send({ items: [{ materialId: material.id, quantity: 1 }], shippingAddress: 'Addr' });

      const accept = await api(app).patch(`/api/v1/orders/${order.body.id}/status`).set(authHeader(supplier)).send({ status: 'ACCEPTED' });
      expect(accept.status).toBe(200);
      expect(accept.body.status).toBe('ACCEPTED');

      const illegal = await api(app).patch(`/api/v1/orders/${order.body.id}/status`).set(authHeader(supplier)).send({ status: 'PLACED' });
      expect(illegal.status).toBe(400);
    });

    // Ground-truth correction: no "quality-check"/QC concept exists anywhere
    // in this codebase (verified by full-repo grep) — PACKED -> SHIPPED is
    // gated only by the transition table above, nothing else. The originally
    // assumed QC-gating tests do not apply; this test instead confirms
    // PACKED -> SHIPPED succeeds unconditionally once ACCEPTED -> PACKED has happened.
    it('PACKED -> SHIPPED succeeds with no additional gate (no QC concept exists in this codebase)', async () => {
      const buyer = await newSession('ord-packed-buyer');
      const { supplier, material } = await approvedSupplierWithMaterial('ord-packed-supplier');
      const order = await api(app).post('/api/v1/orders').set(authHeader(buyer)).send({ items: [{ materialId: material.id, quantity: 1 }], shippingAddress: 'Addr' });
      await api(app).patch(`/api/v1/orders/${order.body.id}/status`).set(authHeader(supplier)).send({ status: 'ACCEPTED' });
      await api(app).patch(`/api/v1/orders/${order.body.id}/status`).set(authHeader(supplier)).send({ status: 'PACKED' });

      const shipped = await api(app).patch(`/api/v1/orders/${order.body.id}/status`).set(authHeader(supplier)).send({ status: 'SHIPPED' });
      expect(shipped.status).toBe(200);
      expect(shipped.body.status).toBe('SHIPPED');
    });

    it('a supplier not on the order cannot update its status (403)', async () => {
      const buyer = await newSession('ord-notsupp-buyer');
      const { material } = await approvedSupplierWithMaterial('ord-notsupp-supplier');
      const { supplier: otherSupplier } = await approvedSupplierWithMaterial('ord-notsupp-other');
      const order = await api(app).post('/api/v1/orders').set(authHeader(buyer)).send({ items: [{ materialId: material.id, quantity: 1 }], shippingAddress: 'Addr' });

      const res = await api(app).patch(`/api/v1/orders/${order.body.id}/status`).set(authHeader(otherSupplier)).send({ status: 'ACCEPTED' });
      expect(res.status).toBe(403);
    });
  });

  describe('admin', () => {
    it('a non-admin gets 403 on every admin route', async () => {
      const s = await newSession('adm-nonadmin');
      const res = await api(app).get('/api/v1/admin/summary').set(authHeader(s));
      expect(res.status).toBe(403);
    });

    it('approving a profile changes status to APPROVED and notifies the supplier', async () => {
      const admin = await newSession('adm-approver');
      await promoteToAdmin(admin);
      const s = await newSession('adm-target', 'CONTRACTOR');
      const profile = await api(app).post('/api/v1/contractor-profiles').set(authHeader(s)).send({
        contractorType: 'FULL_CONTRACTOR', tradeSkills: ['Masonry'], experience: '2 years', serviceCities: ['Srinagar'],
      });

      const approve = await api(app).patch(`/api/v1/admin/profiles/contractor/${profile.body.id}/approve`).set(authHeader(admin));
      expect(approve.status).toBe(200);
      expect(approve.body.approvalStatus).toBe('APPROVED');

      const notifs = await prisma.notification.findMany({ where: { userId: s.userId, type: 'profile.approved' } });
      expect(notifs.length).toBeGreaterThan(0);
    });

    it('suspending a user causes their very next request to get 403', async () => {
      const admin = await newSession('adm-suspender');
      await promoteToAdmin(admin);
      const target = await newSession('adm-suspend-target');

      const suspend = await api(app).patch(`/api/v1/admin/users/${target.userId}/suspend`).set(authHeader(admin));
      expect(suspend.status).toBe(200);

      const nextReq = await api(app).get('/api/v1/users/me').set(authHeader(target));
      expect(nextReq.status).toBe(403);
    });

    it('an admin cannot suspend their own account (403)', async () => {
      const admin = await newSession('adm-selfsuspend');
      await promoteToAdmin(admin);
      const res = await api(app).patch(`/api/v1/admin/users/${admin.userId}/suspend`).set(authHeader(admin));
      expect(res.status).toBe(403);
    });

    // Note: POST /admin/orders/:id/refund calls the real Razorpay SDK
    // (razorpay.payments.refund), which throws at client construction when
    // RAZORPAY_KEY_ID/SECRET are blank (confirmed blank in this local .env).
    // That's an environment/config limitation, not a code bug, so we only
    // assert the authorization boundary here, not a successful refund.
    it('refund endpoint still enforces admin-only access regardless of Razorpay config', async () => {
      const s = await newSession('adm-refund-nonadmin');
      const res = await api(app).post('/api/v1/admin/orders/00000000-0000-0000-0000-000000000000/refund').set(authHeader(s)).send({ reason: 'test' });
      expect(res.status).toBe(403);
    });
  });

  describe('notifications', () => {
    it('a booking creation triggers an in-app notification for the provider', async () => {
      const customer = await newSession('notif-bk-customer');
      const provider = await newSession('notif-bk-provider', 'CONTRACTOR');
      await api(app).post('/api/v1/bookings').set(authHeader(customer)).send({
        providerId: provider.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const list = await api(app).get('/api/v1/notifications').set(authHeader(provider));
      expect(list.body.items.some((n: any) => n.type === 'booking.created')).toBe(true);
    });

    it('GET /notifications only returns the current user\'s own notifications', async () => {
      const a = await newSession('notif-scope-a');
      const b = await newSession('notif-scope-b', 'CONTRACTOR');
      await api(app).post('/api/v1/bookings').set(authHeader(a)).send({
        providerId: b.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });
      const asA = await api(app).get('/api/v1/notifications').set(authHeader(a));
      expect(asA.body.items.length).toBe(0);
    });

    it('unread-count, mark one read, and mark-all-read all work correctly', async () => {
      const customer = await newSession('notif-mark-customer');
      const provider = await newSession('notif-mark-provider', 'CONTRACTOR');
      await api(app).post('/api/v1/bookings').set(authHeader(customer)).send({
        providerId: provider.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });
      await api(app).post('/api/v1/bookings').set(authHeader(customer)).send({
        providerId: provider.userId, providerRole: 'CONTRACTOR', scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const before = await api(app).get('/api/v1/notifications/unread-count').set(authHeader(provider));
      expect(before.body.count).toBe(2);

      const list = await api(app).get('/api/v1/notifications').set(authHeader(provider));
      const firstId = list.body.items[0].id;
      await api(app).patch(`/api/v1/notifications/${firstId}/read`).set(authHeader(provider));

      const afterOne = await api(app).get('/api/v1/notifications/unread-count').set(authHeader(provider));
      expect(afterOne.body.count).toBe(1);

      await api(app).patch('/api/v1/notifications/read-all').set(authHeader(provider));
      const afterAll = await api(app).get('/api/v1/notifications/unread-count').set(authHeader(provider));
      expect(afterAll.body.count).toBe(0);
    });

    it('order status change triggers a notification for the buyer', async () => {
      const buyer = await newSession('notif-ord-buyer');
      const { supplier, material } = await approvedSupplierWithMaterial('notif-ord-supplier');
      const order = await api(app).post('/api/v1/orders').set(authHeader(buyer)).send({ items: [{ materialId: material.id, quantity: 1 }], shippingAddress: 'Addr' });
      await api(app).patch(`/api/v1/orders/${order.body.id}/status`).set(authHeader(supplier)).send({ status: 'ACCEPTED' });

      const list = await api(app).get('/api/v1/notifications').set(authHeader(buyer));
      expect(list.body.items.some((n: any) => n.type === 'order.status_changed')).toBe(true);
    });
  });
});
