import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://griffy.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/orders', '/cart', '/checkout', '/profile', '/notifications', '/onboarding', '/saved'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
