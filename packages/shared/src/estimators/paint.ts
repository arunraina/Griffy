// Wall paint estimator — thumb-rule only.
// Putty and primer are assumed as a single base coat each (standard
// practice regardless of how many top coats of paint follow); paint
// coverage scales with the number of coats specified.

import { round1 } from './units';

export interface PaintEstimateInput {
  wallAreaSqft: number;
  coats: number;
}

export interface PaintEstimateResult {
  puttyKg: number;
  primerLitres: number;
  paintLitres: number;
}

const SQFT_PER_KG_PUTTY = 18;
const SQFT_PER_LITRE_PRIMER = 140;
const SQFT_PER_LITRE_PAINT_PER_COAT = 110;

export function calculatePaintEstimate(input: PaintEstimateInput): PaintEstimateResult {
  return {
    puttyKg: round1(input.wallAreaSqft / SQFT_PER_KG_PUTTY),
    primerLitres: round1(input.wallAreaSqft / SQFT_PER_LITRE_PRIMER),
    paintLitres: round1((input.wallAreaSqft / SQFT_PER_LITRE_PAINT_PER_COAT) * input.coats),
  };
}
