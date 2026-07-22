import bundleAnalyzer from '@next/bundle-analyzer';

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

export default withBundleAnalyzer(nextConfig);
