import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://griffy.in';

// Static, public marketing/product routes only — dynamic [id] listing pages
// (contractors/[id], materials/[id], etc.) would need a DB query to
// enumerate and are left for a later pass.
export interface SitemapRoute { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }

export const ROUTES: SitemapRoute[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/estimate', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/estimate/cost', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/estimate/bricks', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/estimate/concrete', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/estimate/plaster', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/estimate/flooring', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/estimate/paint', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/estimate/steel', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contractors', priority: 0.8, changeFrequency: 'daily' },
  { path: '/labour', priority: 0.8, changeFrequency: 'daily' },
  { path: '/service-experts', priority: 0.8, changeFrequency: 'daily' },
  { path: '/materials', priority: 0.8, changeFrequency: 'daily' },
  { path: '/land', priority: 0.7, changeFrequency: 'daily' },
  { path: '/properties', priority: 0.7, changeFrequency: 'daily' },
  { path: '/projects', priority: 0.7, changeFrequency: 'daily' },
  { path: '/post-project', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/leaderboard', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/search', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/team', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/careers', priority: 0.4, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/help', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/how-it-works', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/early-access', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.3, changeFrequency: 'weekly' },
  { path: '/press', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/refund-policy', priority: 0.2, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
