import type { Metadata } from 'next';
import EstimateClient from './EstimateClient';

export const metadata: Metadata = {
  title: 'Cost Estimator — Griffy',
  description: 'Get a detailed construction cost breakdown by project type, area, and quality level. Free instant estimate for building, renovating, or fitting out in India.',
};

export default function EstimatePage() {
  return <EstimateClient />;
}
