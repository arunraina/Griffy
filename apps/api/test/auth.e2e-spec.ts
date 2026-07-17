import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, closeTestApp, mintSession, deleteTestSession, authHeader, TestSession } from './helpers';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const sessions: TestSession[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await Promise.all(sessions.map((s) => deleteTestSession(prisma, s.userId)));
    await closeTestApp(app, prisma);
  }, 60000);

  it('rejects requests with no bearer token (401)', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });

  it('rejects requests with a garbage bearer token (401)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('creates a local User row on first authenticated request, defaulting to HOMEOWNER', async () => {
    const session = await mintSession('authdefault');
    sessions.push(session);

    const res = await request(app.getHttpServer()).get('/api/v1/users/me').set(authHeader(session));
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('HOMEOWNER');
    expect(res.body.email).toBe(session.email);
  });

  it('PATCH /users/me/role sets role correctly for a non-admin role', async () => {
    const session = await mintSession('rolechange');
    sessions.push(session);
    await request(app.getHttpServer()).get('/api/v1/users/me').set(authHeader(session));

    const res = await request(app.getHttpServer())
      .patch('/api/v1/users/me/role')
      .set(authHeader(session))
      .send({ role: 'CONTRACTOR' });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('CONTRACTOR');
  });

  it('PATCH /users/me/role blocks setting role to ADMIN (403)', async () => {
    const session = await mintSession('rolehack');
    sessions.push(session);
    await request(app.getHttpServer()).get('/api/v1/users/me').set(authHeader(session));

    const res = await request(app.getHttpServer())
      .patch('/api/v1/users/me/role')
      .set(authHeader(session))
      .send({ role: 'ADMIN' });

    expect(res.status).toBe(403);
  });

  it('a suspended user gets 403 on the next authenticated request', async () => {
    const session = await mintSession('suspend');
    sessions.push(session);
    await request(app.getHttpServer()).get('/api/v1/users/me').set(authHeader(session));

    await prisma.user.update({ where: { id: session.userId }, data: { isSuspended: true } });

    const res = await request(app.getHttpServer()).get('/api/v1/users/me').set(authHeader(session));
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('This account has been suspended');
  });
});
