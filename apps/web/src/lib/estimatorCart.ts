'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuthUser } from '@/lib/useAuthUser';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface EstimatorCartLine {
  label: string;
  category: string;
  subcategory: string;
  quantity: number;
}

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

// Maps estimator output (e.g. "12 cement bags") to real Material records by
// category/subcategory and adds them to the cart — same cart used across
// the rest of the site, so checkout just works.
export function useAddEstimateToCart() {
  const { user } = useAuthUser();
  const { addItem } = useCart();
  const router = useRouter();

  async function addEstimateToCart(lines: EstimatorCartLine[]): Promise<{ added: number; skipped: string[] }> {
    if (!user) {
      router.push('/login');
      return { added: 0, skipped: [] };
    }

    let added = 0;
    const skipped: string[] = [];

    for (const line of lines) {
      const material = await findMaterial(line.category, line.subcategory);
      if (!material) {
        skipped.push(line.label);
        continue;
      }
      addItem(
        {
          id: material.id,
          name: material.name,
          imageIcon: '🏗️',
          price: Number(material.price),
          unit: material.unit,
          sellerName: material.supplier?.businessName ?? material.supplier?.user?.name ?? 'Supplier',
        },
        Math.max(1, Math.ceil(line.quantity)),
      );
      added++;
    }

    return { added, skipped };
  }

  return { addEstimateToCart, loggedIn: !!user };
}
