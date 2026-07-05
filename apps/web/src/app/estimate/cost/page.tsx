import type { Metadata } from 'next';
import EstimateClient from './EstimateClient';

export const metadata: Metadata = {
  title: 'Construction Cost Calculator India — Free Estimate | Griffy',
  description: 'Free construction cost calculator for India. Get a detailed cost breakdown for new builds, renovation, interiors, electrical, and plumbing by area, quality, and project type.',
};

const FAQ = [
  {
    q: 'How much does construction cost per square foot in India?',
    a: 'It varies widely by city, quality level, and project type — typically ₹1,500-3,500/sqft for a standard new build. Use the calculator above for an estimate based on your specific area, project type, and quality level.',
  },
  {
    q: 'What affects construction cost the most?',
    a: 'Quality level (basic vs premium finishes) and project type have the biggest impact, followed by city (material and labour rates vary regionally) and site conditions.',
  },
  {
    q: 'Is this cost estimate accurate enough to budget with?',
    a: 'It\'s a ballpark based on average Indian market rates — good for early planning, but always get 3+ real contractor quotes before finalizing a budget.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function CostEstimatePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EstimateClient />
    </>
  );
}
