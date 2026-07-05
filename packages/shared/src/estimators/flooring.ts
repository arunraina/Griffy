// Tile flooring estimator — thumb-rule only.
// Adhesive coverage (~40 sqft per 20kg bag) and grout usage (~0.5 kg/sqft)
// are typical thin-bed/standard-joint assumptions; actual coverage varies
// with tile size, trowel notch size, and joint width.

import { roundUp, round1 } from './units';

export interface FlooringEstimateInput {
  roomLengthFt: number;
  roomWidthFt: number;
  tileSizeIn: number; // square tile, e.g. 24 for 24x24in
}

export interface FlooringEstimateResult {
  roomAreaSqft: number;
  tileCountBase: number;
  wastageTiles: number;
  tileCountWithWastage: number;
  adhesiveBags: number;
  groutKg: number;
}

const WASTAGE_FACTOR = 0.10;
const SQFT_PER_ADHESIVE_BAG = 40;
const GROUT_KG_PER_SQFT = 0.5;

export function calculateFlooringEstimate(input: FlooringEstimateInput): FlooringEstimateResult {
  const roomAreaSqft = input.roomLengthFt * input.roomWidthFt;
  const tileAreaSqft = (input.tileSizeIn * input.tileSizeIn) / 144;

  const tileCountBase = Math.ceil(roomAreaSqft / tileAreaSqft);
  const tileCountWithWastage = roundUp(tileCountBase * (1 + WASTAGE_FACTOR));
  const wastageTiles = tileCountWithWastage - tileCountBase;

  return {
    roomAreaSqft: round1(roomAreaSqft),
    tileCountBase,
    wastageTiles,
    tileCountWithWastage,
    adhesiveBags: roundUp(roomAreaSqft / SQFT_PER_ADHESIVE_BAG),
    groutKg: round1(roomAreaSqft * GROUT_KG_PER_SQFT),
  };
}
