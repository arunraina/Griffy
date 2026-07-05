// Core math for the whole-project cost estimator (/estimate/cost).
// Extracted verbatim from apps/web's EstimateClient.tsx — same data, same
// formula — so the component only owns rendering, not the calculation.

export type ProjectType = 'new_build' | 'renovation' | 'interior' | 'electrical' | 'plumbing';
export type Quality = 'basic' | 'standard' | 'premium';
export type CostUnit = 'sqft' | 'room' | 'bathroom' | 'kitchen' | 'flat';

export interface CostItem {
  label: string;
  emoji: string;
  unit: CostUnit;
  costPerUnit: Record<Quality, number>;
}

export interface CostBreakdownItem extends CostItem {
  total: number;
  rate: number;
}

export interface CostEstimateInput {
  projectType: ProjectType;
  area: number;
  rooms: number;
  bathrooms: number;
  quality: Quality;
}

export interface CostEstimateResult {
  breakdown: CostBreakdownItem[];
  grandTotal: number;
  low: number;
  high: number;
}

export const UNIT_LABEL: Record<CostUnit, string> = {
  sqft: '/sqft',
  room: '/room',
  bathroom: '/bathroom',
  kitchen: 'per kitchen',
  flat: 'fixed',
};

// Project types where cost is driven more by room/bathroom count than raw
// area — a 3000 sqft house with 2 bathrooms shouldn't cost as much to
// re-plumb as a 1200 sqft house with 4 bathrooms.
export const ROOM_DRIVEN_TYPES: ProjectType[] = ['interior', 'electrical', 'plumbing'];

export const PROJECTS: { id: ProjectType; label: string; emoji: string; desc: string }[] = [
  { id: 'new_build', label: 'New Construction', emoji: '🏗️', desc: 'Ground-up residential or commercial build' },
  { id: 'renovation', label: 'Renovation', emoji: '🔨', desc: 'Structural changes, additions, or major repairs' },
  { id: 'interior', label: 'Interior Fit-out', emoji: '🛋️', desc: 'Flooring, false ceiling, modular kitchen & more' },
  { id: 'electrical', label: 'Electrical Work', emoji: '⚡', desc: 'Wiring, panels, fixtures & earthing' },
  { id: 'plumbing', label: 'Plumbing', emoji: '🔧', desc: 'Pipes, fixtures, bathrooms & drainage' },
];

export const COST_ITEMS: Record<ProjectType, CostItem[]> = {
  new_build: [
    { label: 'Foundation & RCC Structure', emoji: '🏛️', unit: 'sqft', costPerUnit: { basic: 450, standard: 650, premium: 1100 } },
    { label: 'Masonry & Plastering', emoji: '🧱', unit: 'sqft', costPerUnit: { basic: 220, standard: 320, premium: 520 } },
    { label: 'Plumbing', emoji: '🔧', unit: 'sqft', costPerUnit: { basic: 110, standard: 165, premium: 280 } },
    { label: 'Electrical', emoji: '⚡', unit: 'sqft', costPerUnit: { basic: 90, standard: 140, premium: 240 } },
    { label: 'Flooring', emoji: '🏠', unit: 'sqft', costPerUnit: { basic: 90, standard: 180, premium: 420 } },
    { label: 'Doors & Windows', emoji: '🚪', unit: 'sqft', costPerUnit: { basic: 100, standard: 180, premium: 350 } },
    { label: 'Painting & Finishing', emoji: '🎨', unit: 'sqft', costPerUnit: { basic: 70, standard: 115, premium: 200 } },
    { label: 'Labour Charges', emoji: '👷', unit: 'sqft', costPerUnit: { basic: 320, standard: 430, premium: 620 } },
  ],
  renovation: [
    { label: 'Demolition & Disposal', emoji: '⛏️', unit: 'sqft', costPerUnit: { basic: 60, standard: 90, premium: 130 } },
    { label: 'Masonry & Plastering', emoji: '🧱', unit: 'sqft', costPerUnit: { basic: 150, standard: 230, premium: 380 } },
    { label: 'Plumbing Upgrades', emoji: '🔧', unit: 'sqft', costPerUnit: { basic: 80, standard: 120, premium: 200 } },
    { label: 'Electrical Upgrades', emoji: '⚡', unit: 'sqft', costPerUnit: { basic: 70, standard: 110, premium: 180 } },
    { label: 'Flooring', emoji: '🏠', unit: 'sqft', costPerUnit: { basic: 100, standard: 200, premium: 450 } },
    { label: 'Painting & Finishing', emoji: '🎨', unit: 'sqft', costPerUnit: { basic: 80, standard: 130, premium: 220 } },
    { label: 'Labour Charges', emoji: '👷', unit: 'sqft', costPerUnit: { basic: 160, standard: 230, premium: 340 } },
  ],
  interior: [
    { label: 'False Ceiling', emoji: '⬆️', unit: 'sqft', costPerUnit: { basic: 80, standard: 130, premium: 280 } },
    { label: 'Flooring', emoji: '🏠', unit: 'sqft', costPerUnit: { basic: 120, standard: 220, premium: 500 } },
    { label: 'Modular Kitchen', emoji: '🍳', unit: 'kitchen', costPerUnit: { basic: 150000, standard: 320000, premium: 750000 } },
    { label: 'Wardrobes & Storage', emoji: '🪟', unit: 'room', costPerUnit: { basic: 45000, standard: 90000, premium: 200000 } },
    { label: 'Electrical & Lighting', emoji: '💡', unit: 'sqft', costPerUnit: { basic: 80, standard: 130, premium: 250 } },
    { label: 'Painting', emoji: '🎨', unit: 'sqft', costPerUnit: { basic: 70, standard: 120, premium: 220 } },
    { label: 'Labour Charges', emoji: '👷', unit: 'sqft', costPerUnit: { basic: 180, standard: 280, premium: 400 } },
  ],
  electrical: [
    { label: 'Wiring & Conduits', emoji: '🔌', unit: 'sqft', costPerUnit: { basic: 50, standard: 80, premium: 140 } },
    { label: 'Electrical Panel', emoji: '⚡', unit: 'flat', costPerUnit: { basic: 12000, standard: 22000, premium: 40000 } },
    { label: 'Switches & Fixtures', emoji: '💡', unit: 'room', costPerUnit: { basic: 8000, standard: 15000, premium: 32000 } },
    { label: 'Earthing & Safety', emoji: '🛡️', unit: 'flat', costPerUnit: { basic: 6000, standard: 10000, premium: 18000 } },
    { label: 'Labour Charges', emoji: '👷', unit: 'sqft', costPerUnit: { basic: 60, standard: 85, premium: 120 } },
  ],
  plumbing: [
    { label: 'Water Supply Lines', emoji: '💧', unit: 'sqft', costPerUnit: { basic: 40, standard: 65, premium: 120 } },
    { label: 'Drainage & Sewage', emoji: '🔩', unit: 'sqft', costPerUnit: { basic: 35, standard: 55, premium: 100 } },
    { label: 'Bathroom Fixtures', emoji: '🛁', unit: 'bathroom', costPerUnit: { basic: 35000, standard: 75000, premium: 180000 } },
    { label: 'Kitchen Plumbing', emoji: '🚰', unit: 'kitchen', costPerUnit: { basic: 15000, standard: 28000, premium: 55000 } },
    { label: 'Labour Charges', emoji: '👷', unit: 'sqft', costPerUnit: { basic: 55, standard: 80, premium: 110 } },
  ],
};

export const QUALITY_OPTIONS: { id: Quality; label: string; desc: string }[] = [
  { id: 'basic', label: 'Basic', desc: 'Economy grade — functional & durable' },
  { id: 'standard', label: 'Standard', desc: 'Mid-range — popular choice for most homes' },
  { id: 'premium', label: 'Premium', desc: 'Luxury grade — high-end finishes & brands' },
];

export function formatIndianCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function unitCount(unit: CostUnit, input: Pick<CostEstimateInput, 'area' | 'rooms' | 'bathrooms'>): number {
  switch (unit) {
    case 'sqft': return input.area;
    case 'room': return input.rooms;
    case 'bathroom': return input.bathrooms;
    case 'kitchen': return 1;
    case 'flat': return 1;
  }
}

export function calculateCostEstimate(input: CostEstimateInput): CostEstimateResult {
  const items = COST_ITEMS[input.projectType];
  const breakdown = items.map((item) => ({
    ...item,
    total: item.costPerUnit[input.quality] * unitCount(item.unit, input),
    rate: item.costPerUnit[input.quality],
  }));
  const grandTotal = breakdown.reduce((s, i) => s + i.total, 0);
  return {
    breakdown,
    grandTotal,
    low: Math.round(grandTotal * 0.9),
    high: Math.round(grandTotal * 1.15),
  };
}
