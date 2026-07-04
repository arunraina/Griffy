import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://griffy.in";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function fetchIds(path: string): Promise<string[]> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).map((item: { id: string }) => item.id);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [contractorIds, labourIds, materialIds] = await Promise.all([
    fetchIds("/contractors?limit=200"),
    fetchIds("/labour?limit=200"),
    fetchIds("/materials?limit=200"),
  ]);

  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/contractors`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/labour`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/materials`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/projects`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/estimate`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const contractorPages: MetadataRoute.Sitemap = contractorIds.map((id) => ({
    url: `${BASE}/contractors/${id}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const labourPages: MetadataRoute.Sitemap = labourIds.map((id) => ({
    url: `${BASE}/labour/${id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const materialPages: MetadataRoute.Sitemap = materialIds.map((id) => ({
    url: `${BASE}/materials/${id}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticPages, ...contractorPages, ...labourPages, ...materialPages];
}
