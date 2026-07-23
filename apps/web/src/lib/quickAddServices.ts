export const PRICE_UNITS = ['FIXED', 'PER_HOUR', 'PER_DAY', 'PER_POINT', 'PER_SQFT', 'PER_VISIT'] as const;
export type PriceUnit = typeof PRICE_UNITS[number];

// Keyed by LabourProfile.skillType / ServiceExpertProfile.expertiseType (see
// featureFlags.ts's labour/service_experts subcategories — these are the
// real values used in this app, not a separate role). Shared by the admin
// quick-add panel (admin/profile/[id]/page.tsx) and the Service Expert's own
// self-serve onboarding menu (dashboard/serviceExpert/ServiceExpertOnboarding.tsx)
// so a worker taps a realistic set of services instead of typing every
// field by hand.
export const QUICK_ADD_SERVICES: Record<string, { name: string; category: string; unit: PriceUnit }[]> = {
  plumber: [
    { name: 'Tap repair', category: 'Repair', unit: 'FIXED' },
    { name: 'Tap replacement', category: 'Repair', unit: 'FIXED' },
    { name: 'Pipe fitting', category: 'Fitting', unit: 'PER_POINT' },
    { name: 'Pipe leakage fix', category: 'Fitting', unit: 'FIXED' },
    { name: 'Basin installation', category: 'Installation', unit: 'FIXED' },
    { name: 'WC installation', category: 'Installation', unit: 'FIXED' },
    { name: 'Drain cleaning', category: 'Cleaning', unit: 'FIXED' },
    { name: 'Burst pipe fix', category: 'Emergency', unit: 'FIXED' },
  ],
  electrician: [
    { name: 'Switch repair', category: 'Repair', unit: 'FIXED' },
    { name: 'Socket repair', category: 'Repair', unit: 'FIXED' },
    { name: 'Fan installation', category: 'Installation', unit: 'FIXED' },
    { name: 'Light installation', category: 'Installation', unit: 'FIXED' },
    { name: 'House wiring', category: 'Wiring', unit: 'PER_POINT' },
    { name: 'MCB installation', category: 'Wiring', unit: 'FIXED' },
    { name: 'Inverter installation', category: 'Installation', unit: 'FIXED' },
  ],
  mason: [
    { name: 'Brickwork', category: 'Brickwork', unit: 'PER_SQFT' },
    { name: 'Internal plaster', category: 'Plastering', unit: 'PER_SQFT' },
    { name: 'External plaster', category: 'Plastering', unit: 'PER_SQFT' },
    { name: 'Terrace waterproofing', category: 'Waterproofing', unit: 'PER_SQFT' },
    { name: 'Crack filling', category: 'Repair', unit: 'FIXED' },
  ],
  carpenter: [
    { name: 'Door installation', category: 'Doors', unit: 'FIXED' },
    { name: 'Door repair', category: 'Doors', unit: 'FIXED' },
    { name: 'Furniture repair', category: 'Furniture', unit: 'PER_VISIT' },
    { name: 'Wardrobe fitting', category: 'Furniture', unit: 'FIXED' },
    { name: 'Wooden flooring', category: 'Flooring', unit: 'PER_SQFT' },
    { name: 'False ceiling (POP)', category: 'False ceiling', unit: 'PER_SQFT' },
  ],
  painter: [
    { name: 'Putty application', category: 'Interior', unit: 'PER_SQFT' },
    { name: 'Primer coat', category: 'Interior', unit: 'PER_SQFT' },
    { name: 'Full interior painting', category: 'Interior', unit: 'PER_SQFT' },
    { name: 'Exterior paint', category: 'Exterior', unit: 'PER_SQFT' },
    { name: 'Texture paint', category: 'Special', unit: 'PER_SQFT' },
  ],
  tile_fixer: [
    { name: 'Floor tile fixing', category: 'Flooring', unit: 'PER_SQFT' },
    { name: 'Wall tile fixing', category: 'Wall', unit: 'PER_SQFT' },
    { name: 'Bathroom tiling', category: 'Wall', unit: 'FIXED' },
    { name: 'Tile replacement', category: 'Repair', unit: 'FIXED' },
  ],
  ac_technician: [
    { name: 'AC service (split)', category: 'Service', unit: 'FIXED' },
    { name: 'AC service (window)', category: 'Service', unit: 'FIXED' },
    { name: 'AC installation (split)', category: 'Installation', unit: 'FIXED' },
    { name: 'Gas recharge', category: 'Gas', unit: 'FIXED' },
    { name: 'Gas leak check', category: 'Gas', unit: 'FIXED' },
  ],
  welder: [
    { name: 'Gate fabrication', category: 'Fabrication', unit: 'FIXED' },
    { name: 'Railing fabrication', category: 'Fabrication', unit: 'PER_SQFT' },
    { name: 'Grill work', category: 'Fabrication', unit: 'PER_SQFT' },
    { name: 'Gate repair', category: 'Repair', unit: 'FIXED' },
  ],
  scaffolding: [
    { name: 'Scaffolding rental', category: 'Rental', unit: 'PER_DAY' },
    { name: 'Scaffolding erection', category: 'Setup', unit: 'FIXED' },
    { name: 'Scaffolding dismantling', category: 'Setup', unit: 'FIXED' },
  ],
  waterproofing: [
    { name: 'Terrace waterproofing', category: 'Waterproofing', unit: 'PER_SQFT' },
    { name: 'Bathroom waterproofing', category: 'Waterproofing', unit: 'FIXED' },
    { name: 'Wall seepage treatment', category: 'Repair', unit: 'PER_SQFT' },
    { name: 'Water tank waterproofing', category: 'Waterproofing', unit: 'FIXED' },
  ],
  cctv_security: [
    { name: 'CCTV camera installation', category: 'Installation', unit: 'FIXED' },
    { name: 'DVR/NVR setup', category: 'Installation', unit: 'FIXED' },
    { name: 'Camera repair', category: 'Repair', unit: 'FIXED' },
    { name: 'Video door phone installation', category: 'Installation', unit: 'FIXED' },
  ],
  solar_installer: [
    { name: 'Rooftop solar installation', category: 'Installation', unit: 'FIXED' },
    { name: 'Solar panel cleaning', category: 'Service', unit: 'PER_VISIT' },
    { name: 'Inverter/battery setup', category: 'Installation', unit: 'FIXED' },
    { name: 'System repair', category: 'Repair', unit: 'FIXED' },
  ],
  gas_plumbing: [
    { name: 'Gas pipeline fitting', category: 'Fitting', unit: 'PER_POINT' },
    { name: 'Gas leak check', category: 'Emergency', unit: 'FIXED' },
    { name: 'Gas stove connection', category: 'Installation', unit: 'FIXED' },
  ],
  glazing_expert: [
    { name: 'Window glass fitting', category: 'Installation', unit: 'FIXED' },
    { name: 'Glass partition', category: 'Installation', unit: 'PER_SQFT' },
    { name: 'Glass replacement', category: 'Repair', unit: 'FIXED' },
    { name: 'Mirror fitting', category: 'Installation', unit: 'FIXED' },
  ],
};
