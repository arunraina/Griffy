// Static reference ranges, not a live market aggregate -- there's no
// pricing-data pipeline in this app to derive real city-level rates from
// (confirmed: no such aggregate exists anywhere in the schema/API). Shown
// as "typical range" guidance during SE1 onboarding so a new service expert
// isn't pricing blind; only covers the categories with rich enough
// QUICK_ADD_SERVICES chip data to make comparison meaningful.
export const SERVICE_PRICE_BENCHMARKS: Record<string, { min: number; max: number }> = {
  'Switch repair': { min: 150, max: 250 },
  'Socket repair': { min: 150, max: 250 },
  'Fan installation': { min: 300, max: 500 },
  'Light installation': { min: 200, max: 400 },
  'House wiring': { min: 400, max: 600 },
  'MCB installation': { min: 300, max: 500 },
  'Inverter installation': { min: 500, max: 900 },
  'Tap repair': { min: 150, max: 300 },
  'Tap replacement': { min: 250, max: 450 },
  'Pipe fitting': { min: 200, max: 400 },
  'Pipe leakage fix': { min: 300, max: 600 },
  'Basin installation': { min: 500, max: 900 },
  'WC installation': { min: 600, max: 1200 },
  'Drain cleaning': { min: 300, max: 600 },
  'Burst pipe fix': { min: 500, max: 1000 },
  'AC service (split)': { min: 500, max: 800 },
  'AC service (window)': { min: 400, max: 700 },
  'AC installation (split)': { min: 1200, max: 2000 },
  'Gas recharge': { min: 1500, max: 2500 },
  'Gas leak check': { min: 300, max: 600 },
};

export function formatBenchmark(serviceName: string): string | null {
  const b = SERVICE_PRICE_BENCHMARKS[serviceName];
  if (!b) return null;
  return `₹${b.min}-${b.max}`;
}
