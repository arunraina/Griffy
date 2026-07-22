import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://griffy.in';
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const DISTRICTS = [
  'Srinagar', 'Baramulla', 'Anantnag', 'Sopore', 'Pulwama', 'Budgam',
  'Kupwara', 'Bandipora', 'Ganderbal', 'Kulgam', 'Shopian', 'Ramban',
];

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
  { path: '/cities', priority: 0.6, changeFrequency: 'monthly' },
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchEntities(resourcePath: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/${resourcePath}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function buildDynamicEntries(): Promise<MetadataRoute.Sitemap> {
  const [contractors, labour, experts, materials, land, properties] = await Promise.all([
    fetchEntities('contractor-profiles'),
    fetchEntities('labour-profiles'),
    fetchEntities('service-expert-profiles'),
    fetchEntities('materials'),
    fetchEntities('lands'),
    fetchEntities('properties'),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const push = (basePath: string, items: any[], priority: number) => {
    for (const item of items) {
      entries.push({
        url: `${BASE_URL}${basePath}/${item.id}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority,
      });
    }
  };

  push('/contractors', contractors, 0.6);
  push('/labour', labour, 0.6);
  push('/service-experts', experts, 0.6);
  push('/materials', materials, 0.6);
  push('/land', land, 0.5);
  push('/properties', properties, 0.5);

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const cityEntries: MetadataRoute.Sitemap = DISTRICTS.map((d) => ({
    url: `${BASE_URL}/cities/${d.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const dynamicEntries = await buildDynamicEntries();

  return [...staticEntries, ...cityEntries, ...dynamicEntries];
}
