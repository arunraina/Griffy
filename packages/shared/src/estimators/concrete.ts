// Concrete quantity estimator — nominal mix ratios, thumb-rule only.
// Dry volume factor 1.54 accounts for voids between dry aggregate/sand/
// cement particles that get filled in once water is added and the mix
// compacts (wet volume x1.54 = dry ingredient volume needed).

import { CEMENT_CFT_PER_BAG, DRY_VOLUME_FACTOR_CONCRETE, roundUp, round1 } from './units';

export type ConcreteGrade = 'M15' | 'M20' | 'M25';

export interface ConcreteEstimateInput {
  lengthFt: number;
  widthFt: number;
  thicknessIn: number;
  grade: ConcreteGrade;
}

export interface ConcreteEstimateResult {
  wetVolumeCft: number;
  dryVolumeCft: number;
  cementBags: number;
  sandCft: number;
  aggregateCft: number;
}

// Nominal mix ratios (cement : sand : aggregate)
const MIX_RATIO: Record<ConcreteGrade, [number, number, number]> = {
  M15: [1, 2, 4],
  M20: [1, 1.5, 3],
  M25: [1, 1, 2],
};

export function calculateConcreteEstimate(input: ConcreteEstimateInput): ConcreteEstimateResult {
  const thicknessFt = input.thicknessIn / 12;
  const wetVolumeCft = input.lengthFt * input.widthFt * thicknessFt;
  const dryVolumeCft = wetVolumeCft * DRY_VOLUME_FACTOR_CONCRETE;

  const [cementPart, sandPart, aggPart] = MIX_RATIO[input.grade];
  const totalParts = cementPart + sandPart + aggPart;

  const cementCft = dryVolumeCft * (cementPart / totalParts);
  const sandCft = dryVolumeCft * (sandPart / totalParts);
  const aggregateCft = dryVolumeCft * (aggPart / totalParts);

  return {
    wetVolumeCft: round1(wetVolumeCft),
    dryVolumeCft: round1(dryVolumeCft),
    cementBags: roundUp(cementCft / CEMENT_CFT_PER_BAG),
    sandCft: round1(sandCft),
    aggregateCft: round1(aggregateCft),
  };
}
