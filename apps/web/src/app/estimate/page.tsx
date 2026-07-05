import type { Metadata } from 'next';
import EstimateHubClient from './EstimateHubClient';

export const metadata: Metadata = {
  title: 'Construction Cost Calculator India — Free Estimators | Griffy',
  description: 'Free construction estimators for India — whole-project cost calculator plus bricks, concrete, plaster, flooring, paint, and steel quantity calculators.',
};

export default function EstimateHubPage() {
  return <EstimateHubClient />;
}
