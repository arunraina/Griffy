// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRIFFY FEATURE FLAGS
// Control entire categories AND subcategories
// Change enabled: true/false to show/hide features
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type SubcategoryFlag = {
  enabled: boolean
  name: string
  icon: string
}

export type CategoryFlag = {
  enabled: boolean
  name: string
  description: string
  icon: string
  subcategories: Record<string, SubcategoryFlag>
}

export const FEATURE_FLAGS: Record<string, CategoryFlag> = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. CONTRACTORS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  contractors: {
    enabled: true, // ✅ MVP ON
    name: 'Contractors',
    description: 'Find & hire contractors, architects, designers',
    icon: '🏗️',
    subcategories: {
      civil_contractor:    { enabled: true,  name: 'Civil Contractor',    icon: '🏗️' },
      renovation_contractor:{ enabled: true, name: 'Renovation Contractor',icon: '🔄' },
      architect:           { enabled: true,  name: 'Architect',           icon: '🏛️' },
      interior_designer:   { enabled: true,  name: 'Interior Designer',   icon: '🎨' },
      structural_engineer: { enabled: true, name: 'Structural Engineer', icon: '📐' },
      project_manager:     { enabled: true, name: 'Project Manager',     icon: '📊' },
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. LABOUR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  labour: {
    enabled: true, // ✅ MVP ON
    name: 'Labour & Mistri',
    description: 'Hire masons, carpenters, painters & daily workers',
    icon: '👷',
    subcategories: {
      mason:       { enabled: true,  name: 'Mason / Mistri',        icon: '🧱' },
      carpenter:   { enabled: true,  name: 'Carpenter',             icon: '🪚' },
      painter:     { enabled: true,  name: 'Painter',               icon: '🎨' },
      tile_fixer:  { enabled: true,  name: 'Tile Fixer',            icon: '🪟' },
      helper:      { enabled: true,  name: 'Helper / General Labour',icon: '👷' },
      welder:      { enabled: true, name: 'Welder',                icon: '🔧' },
      scaffolding: { enabled: true, name: 'Scaffolding Worker',    icon: '🪜' },
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. SERVICE EXPERTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  service_experts: {
    enabled: true, // ✅ MVP ON
    name: 'Service Experts',
    description: 'Book electricians, plumbers, AC technicians',
    icon: '⚡',
    subcategories: {
      electrician:    { enabled: true,  name: 'Electrician',          icon: '⚡' },
      plumber:        { enabled: true,  name: 'Plumber',              icon: '🔧' },
      ac_technician:  { enabled: true,  name: 'AC Technician',        icon: '❄️' },
      waterproofing:  { enabled: true, name: 'Waterproofing Expert', icon: '🌧️' },
      cctv_security:  { enabled: true, name: 'CCTV & Security',      icon: '📡' },
      solar_installer:{ enabled: true, name: 'Solar Installer',      icon: '☀️' },
      gas_plumbing:   { enabled: true, name: 'Gas & Plumbing',       icon: '🔥' },
      glazing_expert: { enabled: true, name: 'Glazing Expert',       icon: '🪟' },
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. MATERIALS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  materials: {
    enabled: true, // ✅ MVP ON
    name: 'Materials Marketplace',
    description: 'Buy cement, steel, tiles & building materials',
    icon: '🧱',
    subcategories: {
      cement:         { enabled: true,  name: 'Cement & Concrete',      icon: '🧱' },
      steel_tmt:      { enabled: true,  name: 'Steel & TMT Bars',       icon: '🔩' },
      sand_aggregate: { enabled: true,  name: 'Sand & Aggregate',       icon: '🏖️' },
      bricks_blocks:  { enabled: true,  name: 'Bricks & Blocks',        icon: '🧱' },
      tiles_flooring: { enabled: true,  name: 'Tiles & Flooring',       icon: '🪟' },
      doors_windows:  { enabled: true,  name: 'Doors & Windows',        icon: '🚪' },
      plumbing_pipes: { enabled: true,  name: 'Plumbing & Pipes',       icon: '🚿' },
      electricals:    { enabled: true,  name: 'Electricals & Wiring',   icon: '⚡' },
      paints:         { enabled: true,  name: 'Paints & Finishes',      icon: '🎨' },
      kashmir_special:{ enabled: true,  name: 'Kashmir Special',        icon: '🏔️' },
      roofing:        { enabled: true, name: 'Roofing Materials',      icon: '🚧' },
      wood_plywood:   { enabled: true, name: 'Wood & Plywood',         icon: '🪵' },
      hardware:       { enabled: true, name: 'Hardware & Fasteners',   icon: '🔧' },
      sanitary_ware:  { enabled: true, name: 'Sanitary Ware',          icon: '🚿' },
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. LAND
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  land: {
    enabled: true, // ✅ MVP ON
    name: 'Land & Plots',
    description: 'Buy or sell land and plots across India',
    icon: '🌍',
    subcategories: {
      residential_plot:  { enabled: true,  name: 'Residential Plot',  icon: '🏘️' },
      agricultural_land: { enabled: true,  name: 'Agricultural Land', icon: '🌾' },
      commercial_plot:   { enabled: true, name: 'Commercial Plot',   icon: '🏬' },
      industrial_plot:   { enabled: true, name: 'Industrial Plot',   icon: '🏭' },
      joint_development: { enabled: true, name: 'Joint Development', icon: '🤝' },
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. PROPERTIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  properties: {
    enabled: true, // ✅ ON
    name: 'Properties',
    description: 'Buy, sell or rent ready homes & new projects',
    icon: '🏠',
    subcategories: {
      buy_home:         { enabled: true, name: 'Buy Home',                 icon: '🏠' },
      rent_home:        { enabled: true, name: 'Rent Home',                icon: '🏢' },
      new_projects:     { enabled: true, name: 'New Builder Projects',     icon: '🏗️' },
      commercial_rent:  { enabled: true, name: 'Commercial Rent',          icon: '🏬' },
      pg_accommodation: { enabled: true, name: 'PG & Shared',              icon: '🛏️' },
    },
  },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function isEnabled(category: string): boolean {
  return FEATURE_FLAGS[category]?.enabled ?? false
}

export function isSubEnabled(category: string, subcategory: string): boolean {
  const cat = FEATURE_FLAGS[category]
  if (!cat?.enabled) return false
  return cat.subcategories?.[subcategory]?.enabled ?? false
}

export function getEnabledSubs(category: string): string[] {
  const cat = FEATURE_FLAGS[category]
  if (!cat?.enabled) return []
  return Object.entries(cat.subcategories || {})
    .filter(([, val]) => val.enabled)
    .map(([key]) => key)
}

export function getSubData(category: string, subcategory: string): { name: string; icon: string } | null {
  const cat = FEATURE_FLAGS[category]
  if (!cat) return null
  const sub = cat.subcategories?.[subcategory]
  if (!sub) return null
  return { name: sub.name, icon: sub.icon }
}

export function getEnabledCategories(): string[] {
  return Object.keys(FEATURE_FLAGS).filter(key => FEATURE_FLAGS[key].enabled)
}

export function getCategoryData(category: string): CategoryFlag | null {
  return FEATURE_FLAGS[category] ?? null
}
