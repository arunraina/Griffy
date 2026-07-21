import { getEnabledSubs, FEATURE_FLAGS } from '@/lib/featureFlags';

export const TRADE_SKILLS = getEnabledSubs('labour').map(key => FEATURE_FLAGS.labour.subcategories[key].name);

// Electricians/plumbers/AC technicians etc. live under "Service Experts" in
// this app's taxonomy, not "Labour" — labour.subcategories only covers
// general-construction day labour (mason, carpenter, painter...).
export const SERVICE_EXPERT_TYPES = getEnabledSubs('service_experts').map(key => FEATURE_FLAGS.service_experts.subcategories[key].name);

export const CONTRACTOR_TYPES = [
  { value: 'labour',          icon: '👷', label: 'Skilled Labour',   desc: 'Mason, Carpenter, Electrician etc — daily/weekly hire' },
  { value: 'sub_contractor',  icon: '🏗️', label: 'Sub-Contractor',   desc: 'Takes up project work with a team' },
  { value: 'full_contractor', icon: '🏢', label: 'Full Contractor',  desc: 'End-to-end construction company' },
];

export const MATERIAL_CATEGORIES = getEnabledSubs('materials').map(key => ({
  value: key,
  label: FEATURE_FLAGS.materials.subcategories[key].name,
  icon:  FEATURE_FLAGS.materials.subcategories[key].icon,
}));
