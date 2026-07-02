import type { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Buy & Rent Properties in India — Griffy',
  description: 'Find apartments, villas, independent houses and new projects for sale or rent across India. Browse 5,000+ verified property listings on Griffy.',
  keywords: [
    ...SEO_KEYWORDS.property_keywords,
    ...SEO_KEYWORDS.rental_keywords,
    ...SEO_KEYWORDS.land_price,
    ...SEO_KEYWORDS.near_me,
  ],
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
