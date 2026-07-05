// Brick wall estimator — thumb-rule quantities, not a structural calculation.
//
// Assumes standard Indian brick size 9in x 4.5in x 3in with a 10mm (~0.4in)
// mortar joint on all sides, giving an effective in-wall size of
// 9.4 x 4.9 x 3.4 in. That's the most common assumption used by Indian
// construction estimator tools for non-modular brick.

import { CEMENT_CFT_PER_BAG, DRY_VOLUME_FACTOR_MORTAR, roundUp, round1 } from './units';

export type WallThickness = 4.5 | 9;

export interface BricksEstimateInput {
  wallLengthFt: number;
  wallHeightFt: number;
  thicknessIn: WallThickness;
}

export interface BricksEstimateResult {
  wallVolumeCft: number;
  brickCountBase: number;
  wastageBricks: number;
  brickCountWithWastage: number;
  cementBags: number;
  sandCft: number;
}

const BRICK_WITH_MORTAR_IN = { l: 9.4, h: 3.4, w: 4.9 };
const BRICK_VOLUME_WITH_MORTAR_CFT = (BRICK_WITH_MORTAR_IN.l * BRICK_WITH_MORTAR_IN.h * BRICK_WITH_MORTAR_IN.w) / 1728;
const BRICK_VOLUME_DRY_CFT = (9 * 3 * 4.5) / 1728;
const WASTAGE_FACTOR = 0.05;
const MORTAR_RATIO_TOTAL_PARTS = 1 + 6; // 1:6 cement:sand

export function calculateBricksEstimate(input: BricksEstimateInput): BricksEstimateResult {
  const thicknessFt = input.thicknessIn / 12;
  const wallVolumeCft = input.wallLengthFt * input.wallHeightFt * thicknessFt;

  const brickCountBase = Math.round(wallVolumeCft / BRICK_VOLUME_WITH_MORTAR_CFT);
  const brickCountWithWastage = roundUp(brickCountBase * (1 + WASTAGE_FACTOR));
  const wastageBricks = brickCountWithWastage - brickCountBase;

  const mortarVolumeCft = wallVolumeCft - brickCountBase * BRICK_VOLUME_DRY_CFT;
  const dryMortarVolumeCft = Math.max(0, mortarVolumeCft) * DRY_VOLUME_FACTOR_MORTAR;
  const cementCft = dryMortarVolumeCft * (1 / MORTAR_RATIO_TOTAL_PARTS);
  const sandCft = dryMortarVolumeCft * (6 / MORTAR_RATIO_TOTAL_PARTS);

  return {
    wallVolumeCft: round1(wallVolumeCft),
    brickCountBase,
    wastageBricks,
    brickCountWithWastage,
    cementBags: roundUp(cementCft / CEMENT_CFT_PER_BAG),
    sandCft: round1(sandCft),
  };
}
