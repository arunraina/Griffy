import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '../sitemap';

export const metadata: Metadata = {
  title: 'Sitemap — Griffy',
  description: 'All public pages on Griffy in one place.',
};

const LABELS: Record<string, string> = {
  '/': 'Home',
  '/estimate': 'Cost Estimator',
  '/estimate/cost': 'Full Cost Estimator',
  '/estimate/bricks': 'Brick Calculator',
  '/estimate/concrete': 'Concrete Calculator',
  '/estimate/plaster': 'Plaster Calculator',
  '/estimate/flooring': 'Flooring Calculator',
  '/estimate/paint': 'Paint Calculator',
  '/estimate/steel': 'Steel Calculator',
  '/contractors': 'Contractors',
  '/labour': 'Labour',
  '/service-experts': 'Service Experts',
  '/materials': 'Materials',
  '/land': 'Land',
  '/properties': 'Properties',
  '/projects': 'Projects (Bidding)',
  '/post-project': 'Post a Project',
  '/leaderboard': 'Leaderboard',
  '/search': 'Search',
  '/about': 'About Us',
  '/team': 'Team',
  '/careers': 'Careers',
  '/contact': 'Contact Us',
  '/help': 'Help Center',
  '/how-it-works': 'How It Works',
  '/early-access': 'Early Access',
  '/blog': 'Blog',
  '/press': 'Press',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms & Conditions',
  '/refund-policy': 'Refund Policy',
};

const SECTIONS: { heading: string; paths: string[] }[] = [
  {
    heading: 'Marketplace',
    paths: ['/', '/contractors', '/labour', '/service-experts', '/materials', '/land', '/properties', '/projects', '/post-project', '/search', '/leaderboard'],
  },
  {
    heading: 'Estimators',
    paths: ['/estimate', '/estimate/cost', '/estimate/bricks', '/estimate/concrete', '/estimate/plaster', '/estimate/flooring', '/estimate/paint', '/estimate/steel'],
  },
  {
    heading: 'Company',
    paths: ['/about', '/team', '/careers', '/blog', '/press', '/how-it-works'],
  },
  {
    heading: 'Support & Legal',
    paths: ['/help', '/contact', '/early-access', '/privacy', '/terms', '/refund-policy'],
  },
];

export default function SitemapPage() {
  const known = new Set(ROUTES.map((r) => r.path));
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-16 text-center">
        <div className="max-w-[700px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Sitemap
          </h1>
          <p className="text-[#6B5248] text-base">Every public page on Griffy, in one place.</p>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 gap-10">
        {SECTIONS.map((section) => (
          <div key={section.heading}>
            <h2 className="text-sm font-bold text-[#2C1810] uppercase tracking-wide mb-4">{section.heading}</h2>
            <ul className="space-y-2.5">
              {section.paths.filter((p) => known.has(p)).map((p) => (
                <li key={p}>
                  <Link href={p} className="text-sm text-[#6B5248] hover:text-[#C0593A] transition-colors">
                    {LABELS[p] ?? p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
