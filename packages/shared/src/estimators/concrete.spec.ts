import { calculateConcreteEstimate } from './concrete';

describe('calculateConcreteEstimate', () => {
  it('applies the 1.54 dry volume factor', () => {
    const result = calculateConcreteEstimate({ lengthFt: 10, widthFt: 10, thicknessIn: 6, grade: 'M20' });
    expect(result.wetVolumeCft).toBeCloseTo(50, 0);
    expect(result.dryVolumeCft).toBeCloseTo(50 * 1.54, 0);
  });

  it('splits M20 in a 1:1.5:3 ratio', () => {
    const result = calculateConcreteEstimate({ lengthFt: 10, widthFt: 10, thicknessIn: 6, grade: 'M20' });
    const totalParts = 1 + 1.5 + 3;
    const expectedCementCft = result.dryVolumeCft * (1 / totalParts);
    const expectedCementBags = Math.ceil(expectedCementCft / 1.226);
    expect(result.cementBags).toBe(expectedCementBags);
    // sand should be 1.5x cement volume share, aggregate 3x
    expect(result.aggregateCft / result.sandCft).toBeCloseTo(2, 1);
  });

  it('higher grade (M25) uses richer cement content than M15', () => {
    const m15 = calculateConcreteEstimate({ lengthFt: 10, widthFt: 10, thicknessIn: 6, grade: 'M15' });
    const m25 = calculateConcreteEstimate({ lengthFt: 10, widthFt: 10, thicknessIn: 6, grade: 'M25' });
    expect(m25.cementBags).toBeGreaterThan(m15.cementBags);
  });
});
