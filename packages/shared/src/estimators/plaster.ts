// Wall plaster estimator — thumb-rule only.

import { CEMENT_CFT_PER_BAG, DRY_VOLUME_FACTOR_MORTAR, roundUp, round1 } from './units';

export type PlasterThickness = 12 | 15 | 20; // mm
export type PlasterRatio = 4 | 6; // 1:4 or 1:6 cement:sand

export interface PlasterEstimateInput {
  areaSqft: number;
  thicknessMm: PlasterThickness;
  ratio: PlasterRatio;
}

export interface PlasterEstimateResult {
  wetVolumeCft: number;
  cementBags: number;
  sandCft: number;
}

const MM_TO_FT = 1 / 304.8;

export function calculatePlasterEstimate(input: PlasterEstimateInput): PlasterEstimateResult {
  const thicknessFt = input.thicknessMm * MM_TO_FT;
  const wetVolumeCft = input.areaSqft * thicknessFt;
  const dryVolumeCft = wetVolumeCft * DRY_VOLUME_FACTOR_MORTAR;

  const totalParts = 1 + input.ratio;
  const cementCft = dryVolumeCft * (1 / totalParts);
  const sandCft = dryVolumeCft * (input.ratio / totalParts);

  return {
    wetVolumeCft: round1(wetVolumeCft),
    cementBags: roundUp(cementCft / CEMENT_CFT_PER_BAG),
    sandCft: round1(sandCft),
  };
}
