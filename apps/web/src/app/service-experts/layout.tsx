import type { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Find Electricians, Plumbers & Home Service Experts | Griffy',
  description: 'Book verified electricians, plumbers, AC technicians, waterproofing experts, and solar installers near you. Ratings and reviews across India.',
  keywords: [
    ...SEO_KEYWORDS.global,
    ...SEO_KEYWORDS.near_me,
    ...SEO_KEYWORDS.sanitary_price,
    ...SEO_KEYWORDS.electrical_price,
    ...SEO_KEYWORDS.kashmir,
  ],
};

export default function ServiceExpertsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
