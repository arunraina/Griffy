import type { Metadata } from 'next';
import CareersClient from './CareersClient';

export const metadata: Metadata = {
  title: 'Careers — Griffy',
  description: 'Remote internships at Griffy — work on a real construction marketplace, not busywork.',
};

export default function CareersPage() {
  return <CareersClient />;
}
