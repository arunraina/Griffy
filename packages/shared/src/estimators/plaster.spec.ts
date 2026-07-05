import { calculatePlasterEstimate } from './plaster';

describe('calculatePlasterEstimate', () => {
  it('a thicker coat needs more material for the same area', () => {
    const thin = calculatePlasterEstimate({ areaSqft: 500, thicknessMm: 12, ratio: 6 });
    const thick = calculatePlasterEstimate({ areaSqft: 500, thicknessMm: 20, ratio: 6 });
    expect(thick.cementBags).toBeGreaterThanOrEqual(thin.cementBags);
    expect(thick.sandCft).toBeGreaterThan(thin.sandCft);
  });

  it('a richer ratio (1:4) uses more cement than a leaner one (1:6) for the same volume', () => {
    const rich = calculatePlasterEstimate({ areaSqft: 500, thicknessMm: 12, ratio: 4 });
    const lean = calculatePlasterEstimate({ areaSqft: 500, thicknessMm: 12, ratio: 6 });
    expect(rich.cementBags).toBeGreaterThanOrEqual(lean.cementBags);
  });

  it('returns zero for zero area', () => {
    const result = calculatePlasterEstimate({ areaSqft: 0, thicknessMm: 12, ratio: 6 });
    expect(result.wetVolumeCft).toBe(0);
    expect(result.sandCft).toBe(0);
  });
});
