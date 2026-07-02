import type { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Building Materials — Prices, Brands & Suppliers | Griffy',
  description: 'Buy cement, TMT steel, tiles, sand, bricks, paint, plywood and 10,000+ construction materials online. Compare prices from top brands like UltraTech, Tata Tiscon, Kajaria. Doorstep delivery across India.',
  keywords: [
    ...SEO_KEYWORDS.global,
    ...SEO_KEYWORDS.materials,
    ...SEO_KEYWORDS.cement_price,
    ...SEO_KEYWORDS.steel_price,
    ...SEO_KEYWORDS.tiles_price,
    ...SEO_KEYWORDS.sand_price,
    ...SEO_KEYWORDS.bricks_price,
    ...SEO_KEYWORDS.doors_windows_price,
    ...SEO_KEYWORDS.paint_price,
    ...SEO_KEYWORDS.wood_price,
    ...SEO_KEYWORDS.electrical_price,
    ...SEO_KEYWORDS.sanitary_price,
    ...SEO_KEYWORDS.near_me,
  ],
};

export default function MaterialsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
