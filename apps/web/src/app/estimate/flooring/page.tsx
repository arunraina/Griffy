import type { Metadata } from 'next';
import FlooringClient from './FlooringClient';

export const metadata: Metadata = {
  title: 'Tile Flooring Calculator — How Many Tiles Do I Need? | Griffy',
  description: 'Free tile flooring calculator for India. Estimate tile count, adhesive bags, and grout needed for a room by dimensions and tile size.',
};

const FAQ = [
  {
    q: 'How many tiles do I need for a room?',
    a: 'Divide the room area by the area of one tile, then add about 10% extra for cutting and breakage. For a 10x10ft room with 24x24in tiles, that\'s roughly 28 tiles — use the calculator above for your exact room size.',
  },
  {
    q: 'How much tile adhesive do I need?',
    a: 'A 20kg bag of tile adhesive typically covers about 40 sqft with a standard trowel notch — actual coverage varies by tile size and substrate.',
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

export default function FlooringPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FlooringClient />
    </>
  );
}
