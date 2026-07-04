const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  price?: string;
  href: string;
  emoji: string;
}

function matches(query: string, ...fields: (string | undefined | null)[]): boolean {
  const q = query.toLowerCase();
  return fields.some((f) => (f ?? '').toLowerCase().includes(q));
}

export async function searchMaterials(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(`${API}/materials?search=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).slice(0, 8).map((m: any) => ({
      id: m.id,
      title: m.name,
      subtitle: m.supplier?.businessName ?? m.supplier?.user?.name ?? 'Supplier',
      price: `₹${Number(m.price ?? 0).toLocaleString('en-IN')} ${m.unit ?? ''}`,
      href: `/materials/${m.id}`,
      emoji: '🧱',
    }));
  } catch {
    return [];
  }
}

export async function searchContractors(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(`${API}/contractor-profiles`);
    if (!res.ok) return [];
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? [])
      .filter((c: any) => matches(query, c.user?.name, c.contractorType, ...(c.tradeSkills ?? [])))
      .slice(0, 8)
      .map((c: any) => ({
        id: c.id,
        title: c.user?.name ?? 'Contractor',
        subtitle: [c.contractorType, ...(c.tradeSkills ?? [])].filter(Boolean).join(' · '),
        href: `/contractors/${c.id}`,
        emoji: '🏗️',
      }));
  } catch {
    return [];
  }
}

export async function searchLabour(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(`${API}/labour-profiles`);
    if (!res.ok) return [];
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? [])
      .filter((l: any) => matches(query, l.user?.name, l.skillType))
      .slice(0, 8)
      .map((l: any) => ({
        id: l.id,
        title: l.user?.name ?? 'Labour',
        subtitle: l.skillType ?? '',
        href: `/labour/${l.id}`,
        emoji: '👷',
      }));
  } catch {
    return [];
  }
}

export async function searchServiceExperts(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(`${API}/service-expert-profiles`);
    if (!res.ok) return [];
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? [])
      .filter((s: any) => matches(query, s.user?.name, s.expertiseType))
      .slice(0, 8)
      .map((s: any) => ({
        id: s.id,
        title: s.user?.name ?? 'Service Expert',
        subtitle: s.expertiseType ?? '',
        href: `/service-experts/${s.id}`,
        emoji: '⚡',
      }));
  } catch {
    return [];
  }
}
