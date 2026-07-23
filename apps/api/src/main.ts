import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';

// Unset in every environment today -- a pure no-op until SENTRY_DSN is set
// (same prep pattern as CacheService/PrismaService.read).
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Gzips JSON responses -- list endpoints (contractors, materials, etc.)
  // routinely run 60-70% smaller over the wire, which is both a Core Web
  // Vitals win (faster TTFB/LCP on slow J&K connections) and a direct
  // Railway egress-cost reduction.
  app.use(compression());

  // /media is static file serving (ServeStaticModule), not an API route —
  // excluded so its URLs stay clean and match what StorageService constructs.
  // (Named /media rather than /uploads deliberately: /uploads is also the
  // UploadsController's own API path — reusing the same segment for both
  // would make this exclude rule accidentally strip the prefix from the
  // real /api/v1/uploads/image endpoint too.)
  app.setGlobalPrefix('api/v1', { exclude: ['media/(.*)', 'health'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
    credentials: true,
    // X-Account-Status drives the PENDING_REVIEW banner (AuthGuard sets it);
    // custom response headers are invisible to browser JS unless listed here,
    // even same-response, per the fetch spec's "simple response header" rule.
    exposedHeaders: ['X-Account-Status'],
  });

  await app.listen(process.env.PORT ?? 3001);

  // Railway's edge proxy keeps connections alive for ~60s. Node's default
  // keepAliveTimeout (5s) is shorter than that, so under load the proxy can
  // send a request on a socket the app has already started closing --
  // sporadic ECONNRESET on the client side. Raising both past the proxy's
  // window (headersTimeout must exceed keepAliveTimeout, per Node's docs)
  // avoids that race.
  const server = app.getHttpServer();
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
}

bootstrap();
