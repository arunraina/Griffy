import { calculatePaintEstimate } from './paint';

describe('calculatePaintEstimate', () => {
  it('paint litres scale linearly with coat count, putty/primer do not', () => {
    const oneCoat = calculatePaintEstimate({ wallAreaSqft: 1000, coats: 1 });
    const twoCoats = calculatePaintEstimate({ wallAreaSqft: 1000, coats: 2 });
    expect(twoCoats.paintLitres).toBeCloseTo(oneCoat.paintLitres * 2, 1);
    expect(twoCoats.puttyKg).toBe(oneCoat.puttyKg);
    expect(twoCoats.primerLitres).toBe(oneCoat.primerLitres);
  });

  it('returns positive quantities for a typical room', () => {
    const result = calculatePaintEstimate({ wallAreaSqft: 400, coats: 2 });
    expect(result.puttyKg).toBeGreaterThan(0);
    expect(result.primerLitres).toBeGreaterThan(0);
    expect(result.paintLitres).toBeGreaterThan(0);
  });
});
