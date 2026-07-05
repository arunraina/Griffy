import { calculateSteelEstimate } from './steel';

describe('calculateSteelEstimate', () => {
  it('uses a 4 kg/sqft thumb rule for residential slabs', () => {
    const result = calculateSteelEstimate({ slabAreaSqft: 1000, usage: 'residential' });
    expect(result.kgPerSqftUsed).toBe(4);
    expect(result.steelKg).toBe(4000);
  });

  it('commercial slabs use more steel per sqft than residential', () => {
    const residential = calculateSteelEstimate({ slabAreaSqft: 1000, usage: 'residential' });
    const commercial = calculateSteelEstimate({ slabAreaSqft: 1000, usage: 'commercial' });
    expect(commercial.steelKg).toBeGreaterThan(residential.steelKg);
  });
});
