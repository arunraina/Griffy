import type { Metadata } from 'next';
import PlasterClient from './PlasterClient';

export const metadata: Metadata = {
  title: 'Plaster Calculator — Cement & Sand for Wall Plastering | Griffy',
  description: 'Free plaster calculator for India. Estimate cement bags and sand required for wall plastering by area, coat thickness (12/15/20mm), and mix ratio.',
};

const FAQ = [
  {
    q: 'How much cement and sand is needed for plastering?',
    a: 'It depends on the wall area, plaster thickness, and mix ratio. A richer 1:4 mix uses more cement than a leaner 1:6 mix for the same area and thickness — use the calculator above for your exact numbers.',
  },
  {
    q: 'What plaster thickness should I use?',
    a: '12mm is standard for internal walls, 15-20mm is common for external walls or uneven surfaces that need extra thickness to level out.',
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

export default function PlasterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PlasterClient />
    </>
  );
}
