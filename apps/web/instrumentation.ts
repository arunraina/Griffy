// Unset in every environment today -- register() below is a no-op until
// SENTRY_DSN is set, matching the same prep-only pattern used on the API
// side (CacheService, PrismaService.read).
//
// Deliberately server/edge-only: there's no instrumentation-client.ts here.
// The client-side Sentry browser SDK adds ~70kB to the shared JS bundle on
// every single page (measured: 87kB -> 157kB first-load), even with no DSN
// configured, since the SDK's code is statically imported and can't be
// tree-shaken away. That's a real Core Web Vitals cost this pass is
// specifically trying to avoid, for a feature that isn't even active --
// worth revisiting deliberately (with the tradeoff in view) if/when
// client-side error tracking becomes a priority, not as a side effect of
// "prep."
export async function register() {
  if (!process.env.SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
  }
}
