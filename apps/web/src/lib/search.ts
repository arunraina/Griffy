const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  price?: string;
  href: string;
  emoji: string;
}

export type SearchType = 'contractors' | 'labour' | 'experts' | 'materials' | 'properties' | 'lands';

export interface GroupedSearchResults {
  contractors: SearchResult[];
  labour: SearchResult[];
  experts: SearchResult[];
  materials: SearchResult[];
  properties: SearchResult[];
  lands: SearchResult[];
}

const EMPTY_GROUPS: GroupedSearchResults = {
  contractors: [], labour: [], experts: [], materials: [], properties: [], lands: [],
};

// Grouped, top-5-per-type results — used for the instant dropdown.
export async function searchAll(q: string): Promise<GroupedSearchResults> {
  if (!q.trim()) return EMPTY_GROUPS;
  try {
    const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return EMPTY_GROUPS;
    return res.json();
  } catch {
    return EMPTY_GROUPS;
  }
}

export interface SearchPage {
  items: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
}

// Paginated single-type results — used for the full /search results page.
export async function searchByType(q: string, type: SearchType, page = 1, pageSize = 20): Promise<SearchPage> {
  if (!q.trim()) return { items: [], total: 0, page, pageSize };
  try {
    const params = new URLSearchParams({ q, type, page: String(page), pageSize: String(pageSize) });
    const res = await fetch(`${API}/search?${params.toString()}`);
    if (!res.ok) return { items: [], total: 0, page, pageSize };
    return res.json();
  } catch {
    return { items: [], total: 0, page, pageSize };
  }
}
