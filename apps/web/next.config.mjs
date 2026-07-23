import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@construction-partner/shared'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // All user-uploaded images (avatars, portfolios, material photos) go
      // through apps/api/src/storage/storage.service.ts, which always
      // returns a `<bucket>.s3.amazonaws.com` URL -- no other image host is
      // used anywhere in the app.
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
    ],
  },
};

// Wrapping is always applied (matches the standard Sentry setup), but every
// step that needs credentials (source-map upload, release creation) is
// silently skipped when SENTRY_AUTH_TOKEN/SENTRY_ORG/SENTRY_PROJECT are
// unset -- true in every environment today, so this changes nothing about
// the actual build output until Sentry is configured.
export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  webpack: { treeshake: { removeDebugLogging: true } },
});
