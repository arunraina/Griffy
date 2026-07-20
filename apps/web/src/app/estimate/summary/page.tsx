import type { Metadata } from 'next';
import SummaryClient from './SummaryClient';

export const metadata: Metadata = {
  title: 'My Estimate | Griffy',
  description: 'Your combined home construction estimate — built up from bricks, concrete, steel, plaster, flooring, and paint calculators.',
};

export default function EstimateSummaryPage() {
  return <SummaryClient />;
}
