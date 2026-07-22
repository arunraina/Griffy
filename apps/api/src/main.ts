import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

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
}

bootstrap();
