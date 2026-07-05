import type { Metadata } from 'next';
import ConcreteClient from './ConcreteClient';

export const metadata: Metadata = {
  title: 'Concrete Calculator — Cement Required for Slab | Griffy',
  description: 'Free concrete calculator for India. Estimate cement bags, sand, and aggregate required for a slab or footing by area, thickness, and grade (M15/M20/M25).',
};

const FAQ = [
  {
    q: 'How much cement is required for a 1000 sqft slab?',
    a: 'It depends on slab thickness and concrete grade. For a typical 5-inch (0.42ft) thick M20 slab over 1000 sqft, that\'s roughly 420 cubic feet of wet concrete — use the calculator above with your exact dimensions and grade for a precise cement bag count.',
  },
  {
    q: 'What is the dry volume factor in concrete calculation?',
    a: 'Wet (mixed, compacted) concrete volume is smaller than the loose dry volume of its cement, sand, and aggregate ingredients before mixing — voids between dry particles get filled once water is added. The standard factor used is 1.54, meaning dry ingredient volume = wet volume × 1.54.',
  },
  {
    q: 'What is the mix ratio for M20 concrete?',
    a: 'The nominal mix ratio for M20 grade concrete is 1:1.5:3 (cement:sand:aggregate).',
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

export default function ConcretePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ConcreteClient />
    </>
  );
}
