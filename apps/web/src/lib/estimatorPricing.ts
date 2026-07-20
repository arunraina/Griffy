import type { EstimatorCartLine } from '@/lib/estimatorCart';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findMaterial(category: string, subcategory: string): Promise<any | null> {
  try {
    const res = await fetch(`${API}/materials?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`);
    if (!res.ok) return null;
    const materials = await res.json();
    return materials[0] ?? null;
  } catch {
    return null;
  }
}

// Resolves estimator quantities (e.g. "12 cement bags") against real Material
// records to price them, without adding anything to the purchase cart — used
// by "Add to My Estimate" to give a running ₹ total across calculators.
export async function resolveEstimatedCost(lines: EstimatorCartLine[]): Promise<{ total: number; unmatched: string[] }> {
  let total = 0;
  const unmatched: string[] = [];

  for (const line of lines) {
    const material = await findMaterial(line.category, line.subcategory);
    if (!material) {
      unmatched.push(line.label);
      continue;
    }
    total += Number(material.price) * Math.max(1, Math.ceil(line.quantity));
  }

  return { total, unmatched };
}
