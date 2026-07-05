import type { Metadata } from 'next';
import PaintClient from './PaintClient';

export const metadata: Metadata = {
  title: 'Paint Calculator — How Much Paint Do I Need? | Griffy',
  description: 'Free paint calculator for India. Estimate putty, primer, and paint quantity needed for your walls by area and number of coats.',
};

const FAQ = [
  {
    q: 'How much paint do I need for my walls?',
    a: 'It depends on wall area and number of coats — most interior paints cover roughly 100-120 sqft per litre per coat. Use the calculator above with your wall area and coat count for an estimate.',
  },
  {
    q: 'Do I need putty and primer before painting?',
    a: 'Yes — putty fills surface imperfections and primer helps paint adhere evenly and reduces the number of paint coats needed. Both are typically applied once, regardless of how many paint coats follow.',
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

export default function PaintPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PaintClient />
    </>
  );
}
