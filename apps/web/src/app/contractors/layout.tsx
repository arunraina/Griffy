import type { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Find Verified Contractors & Labour Near You | Griffy',
  description: 'Hire verified civil contractors, masons, electricians, plumbers, carpenters and daily wage labour near you. 500+ contractors across India with ratings and reviews.',
  keywords: [
    ...SEO_KEYWORDS.global,
    ...SEO_KEYWORDS.contractors,
    ...SEO_KEYWORDS.labour,
    ...SEO_KEYWORDS.near_me,
    ...SEO_KEYWORDS.construction_cost,
    ...SEO_KEYWORDS.kashmir,
  ],
};

export default function ContractorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
