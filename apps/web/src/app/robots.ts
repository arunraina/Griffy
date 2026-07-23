import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://griffy.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin', '/dashboard', '/orders', '/cart', '/checkout', '/profile',
          '/notifications', '/onboarding', '/saved', '/messages', '/turnkey-projects',
          '/verify-otp', '/auth', '/login', '/signup', '/register', '/forgot-password', '/reset-password',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
