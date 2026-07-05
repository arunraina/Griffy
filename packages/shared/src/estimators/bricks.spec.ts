import { calculateBricksEstimate } from './bricks';

describe('calculateBricksEstimate', () => {
  it('computes a 9-inch wall correctly', () => {
    const result = calculateBricksEstimate({ wallLengthFt: 10, wallHeightFt: 10, thicknessIn: 9 });
    expect(result.wallVolumeCft).toBeCloseTo(75, 0);
    expect(result.brickCountBase).toBeGreaterThan(0);
    expect(result.brickCountWithWastage).toBeGreaterThan(result.brickCountBase);
    expect(result.wastageBricks).toBe(result.brickCountWithWastage - result.brickCountBase);
    expect(result.cementBags).toBeGreaterThan(0);
    expect(result.sandCft).toBeGreaterThan(0);
  });

  it('a thinner (4.5in) wall of the same face area needs fewer bricks than a 9in wall', () => {
    const thin = calculateBricksEstimate({ wallLengthFt: 10, wallHeightFt: 10, thicknessIn: 4.5 });
    const thick = calculateBricksEstimate({ wallLengthFt: 10, wallHeightFt: 10, thicknessIn: 9 });
    expect(thin.brickCountBase).toBeLessThan(thick.brickCountBase);
  });

  it('applies ~5% wastage', () => {
    const result = calculateBricksEstimate({ wallLengthFt: 20, wallHeightFt: 10, thicknessIn: 9 });
    const ratio = result.brickCountWithWastage / result.brickCountBase;
    expect(ratio).toBeGreaterThanOrEqual(1.05);
    expect(ratio).toBeLessThan(1.06);
  });
});
