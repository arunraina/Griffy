import type { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Land & Plots for Sale — Agricultural, Residential, Commercial | Griffy',
  description: 'Browse 1,000+ land and plot listings across India. Find agricultural land, residential plots, and commercial property for sale. Compare land prices per bigha, acre, sqft. Listings in Delhi, Mumbai, Srinagar, Bangalore and more.',
  keywords: [
    ...SEO_KEYWORDS.global,
    ...SEO_KEYWORDS.land,
    ...SEO_KEYWORDS.land_price,
    ...SEO_KEYWORDS.kashmir,
    ...SEO_KEYWORDS.near_me,
  ],
};

export default function LandLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
