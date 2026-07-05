// Shared constants used across the material estimators — kept in one place
// so "how many bags does a bag of cement cover" style assumptions are
// consistent between the bricks/concrete/plaster estimators instead of
// silently drifting.

// 1 bag of cement = 50kg, and loosely occupies ~1.226 cft — the standard
// constant used across Indian construction estimator tools.
export const CEMENT_CFT_PER_BAG = 1.226;

// Dry volume factor: wet (mixed) mortar/concrete volume expands when
// converted to dry (loose) ingredient volume due to voids between
// particles being filled in. 1.54 is the standard factor for concrete;
// 1.33 is the commonly used factor for mortar (plaster/brick jointing).
export const DRY_VOLUME_FACTOR_CONCRETE = 1.54;
export const DRY_VOLUME_FACTOR_MORTAR = 1.33;

export function roundUp(n: number): number {
  return Math.ceil(n);
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
