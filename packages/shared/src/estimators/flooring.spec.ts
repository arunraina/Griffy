import { calculateFlooringEstimate } from './flooring';

describe('calculateFlooringEstimate', () => {
  it('computes tile count with ~10% wastage for a simple room', () => {
    // 10x10 room = 100 sqft, 24x24in tiles = 4 sqft/tile -> 25 tiles base
    const result = calculateFlooringEstimate({ roomLengthFt: 10, roomWidthFt: 10, tileSizeIn: 24 });
    expect(result.roomAreaSqft).toBe(100);
    expect(result.tileCountBase).toBe(25);
    expect(result.tileCountWithWastage).toBe(28); // ceil(25 * 1.10)
    expect(result.wastageTiles).toBe(3);
  });

  it('smaller tiles need more tiles than larger tiles for the same room', () => {
    const smallTiles = calculateFlooringEstimate({ roomLengthFt: 12, roomWidthFt: 10, tileSizeIn: 12 });
    const largeTiles = calculateFlooringEstimate({ roomLengthFt: 12, roomWidthFt: 10, tileSizeIn: 24 });
    expect(smallTiles.tileCountBase).toBeGreaterThan(largeTiles.tileCountBase);
  });

  it('adhesive and grout scale with room area', () => {
    const small = calculateFlooringEstimate({ roomLengthFt: 10, roomWidthFt: 10, tileSizeIn: 24 });
    const large = calculateFlooringEstimate({ roomLengthFt: 20, roomWidthFt: 20, tileSizeIn: 24 });
    expect(large.adhesiveBags).toBeGreaterThan(small.adhesiveBags);
    expect(large.groutKg).toBeGreaterThan(small.groutKg);
  });
});
