import type { Metadata } from 'next';
import BricksClient from './BricksClient';

export const metadata: Metadata = {
  title: 'How Many Bricks Required for a Wall? Brick Calculator | Griffy',
  description: 'Free brick calculator — find out how many bricks, cement bags, and sand you need for your wall by length, height, and thickness (4.5in or 9in).',
};

const FAQ = [
  {
    q: 'How many bricks are required for a wall?',
    a: 'It depends on wall length, height, and thickness. For a standard 9-inch wall using 9x4.5x3in bricks with 10mm mortar joints, roughly 11 bricks are needed per cubic foot of brickwork. Use the calculator above with your exact dimensions for a precise count.',
  },
  {
    q: 'How much wastage should I add when buying bricks?',
    a: 'Add about 5% extra to account for breakage during transport, handling, and cutting at corners or openings.',
  },
  {
    q: 'How much cement and sand do I need for brickwork?',
    a: 'For a standard 1:6 cement:sand mortar mix, the quantity depends on the mortar joint volume, which the calculator above computes automatically from your wall dimensions.',
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

export default function BricksPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BricksClient />
    </>
  );
}
