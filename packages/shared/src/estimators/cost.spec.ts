import { calculateCostEstimate, formatIndianCurrency } from './cost';

describe('calculateCostEstimate', () => {
  it('scales sqft-driven items linearly with area', () => {
    const small = calculateCostEstimate({ projectType: 'new_build', area: 1000, rooms: 3, bathrooms: 2, quality: 'standard' });
    const large = calculateCostEstimate({ projectType: 'new_build', area: 2000, rooms: 3, bathrooms: 2, quality: 'standard' });
    expect(large.grandTotal).toBeCloseTo(small.grandTotal * 2, -2);
  });

  it('room-driven project types (e.g. plumbing) scale with bathroom count, not just area', () => {
    const fewBath = calculateCostEstimate({ projectType: 'plumbing', area: 1000, rooms: 3, bathrooms: 1, quality: 'standard' });
    const manyBath = calculateCostEstimate({ projectType: 'plumbing', area: 1000, rooms: 3, bathrooms: 4, quality: 'standard' });
    expect(manyBath.grandTotal).toBeGreaterThan(fewBath.grandTotal);
  });

  it('premium quality costs more than basic for the same inputs', () => {
    const basic = calculateCostEstimate({ projectType: 'renovation', area: 1500, rooms: 3, bathrooms: 2, quality: 'basic' });
    const premium = calculateCostEstimate({ projectType: 'renovation', area: 1500, rooms: 3, bathrooms: 2, quality: 'premium' });
    expect(premium.grandTotal).toBeGreaterThan(basic.grandTotal);
  });

  it('low/high range brackets the grand total', () => {
    const result = calculateCostEstimate({ projectType: 'new_build', area: 1200, rooms: 3, bathrooms: 2, quality: 'standard' });
    expect(result.low).toBeLessThan(result.grandTotal);
    expect(result.high).toBeGreaterThan(result.grandTotal);
  });
});

describe('formatIndianCurrency', () => {
  it('formats crores', () => {
    expect(formatIndianCurrency(15000000)).toBe('₹1.50 Cr');
  });
  it('formats lakhs', () => {
    expect(formatIndianCurrency(250000)).toBe('₹2.5L');
  });
  it('formats small amounts with Indian grouping', () => {
    expect(formatIndianCurrency(45000)).toBe('₹45,000');
  });
});
