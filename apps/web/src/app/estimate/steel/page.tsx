import type { Metadata } from 'next';
import SteelClient from './SteelClient';

export const metadata: Metadata = {
  title: 'TMT Steel Calculator — Steel Required for Slab | Griffy',
  description: 'Free TMT steel calculator for India. Estimate steel reinforcement (kg) required for a residential or commercial slab by area — thumb-rule only, verify with your engineer.',
};

const FAQ = [
  {
    q: 'How much steel is required for a slab?',
    a: 'A common thumb rule is 3.5-4 kg of TMT steel per square foot for residential slabs, and somewhat more for commercial slabs carrying heavier loads. This is only a rough estimate — actual reinforcement must come from a structural engineer\'s design based on span and load.',
  },
  {
    q: 'Is this steel calculator accurate enough to order materials directly?',
    a: 'No — treat it as a starting ballpark for budgeting, not a purchase order. Structural reinforcement depends on span, load, and slab design that only a structural drawing can specify correctly.',
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

export default function SteelPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SteelClient />
    </>
  );
}
