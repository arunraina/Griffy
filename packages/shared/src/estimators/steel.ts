// TMT steel estimator for slabs — thumb-rule only, most sensitive to real
// structural design of all 6 estimators (reinforcement depends on span,
// load, and engineer's design, not just area). Residential 3.5-4 kg/sqft
// is a widely cited thumb rule; commercial slabs typically carry more
// reinforcement so a higher default is used, but both are placeholders
// for an actual structural drawing, not a substitute for one.

import { round1 } from './units';

export type SlabUsage = 'residential' | 'commercial';

export interface SteelEstimateInput {
  slabAreaSqft: number;
  usage: SlabUsage;
}

export interface SteelEstimateResult {
  kgPerSqftUsed: number;
  steelKg: number;
}

const KG_PER_SQFT: Record<SlabUsage, number> = {
  residential: 4,
  commercial: 5,
};

export function calculateSteelEstimate(input: SteelEstimateInput): SteelEstimateResult {
  const kgPerSqftUsed = KG_PER_SQFT[input.usage];
  return {
    kgPerSqftUsed,
    steelKg: round1(input.slabAreaSqft * kgPerSqftUsed),
  };
}
