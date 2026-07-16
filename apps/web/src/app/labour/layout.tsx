import type { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Hire Skilled Labour & Mistri Near You | Griffy',
  description: 'Hire masons, carpenters, electricians, plumbers, and daily wage labour near you. Verified skilled workers across India with ratings and reviews.',
  keywords: [
    ...SEO_KEYWORDS.global,
    ...SEO_KEYWORDS.labour,
    ...SEO_KEYWORDS.near_me,
    ...SEO_KEYWORDS.construction_cost,
    ...SEO_KEYWORDS.kashmir,
  ],
};

export default function LabourLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
