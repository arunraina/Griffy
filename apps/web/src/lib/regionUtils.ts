export const REGION_MAP = {
  kashmir: {
    cities: [
      'srinagar','baramulla','anantnag','jammu',
      'leh','kargil','kupwara','pulwama',
      'shopian','bandipora','ganderbal','budgam',
    ],
    label: 'Kashmir & Ladakh',
    icon: '🏔️',
    alerts: [
      '❄️ Snow load roofing materials recommended',
      '🏔️ Seismic Zone V — use Fe500D+ TMT only',
      '🌡️ Cold climate insulation materials shown first',
      '🪵 Deodar wood available locally',
    ],
    tips: [
      'Sloped roof minimum 30° — mandatory for snow shedding',
      'Foundation depth 6ft+ due to frost line',
      'Double/triple glazed windows for insulation',
      'Anti-freeze admixture needed below 5°C',
      'Dhajji Dewari timber-laced construction is earthquake resistant',
    ],
    priorityCategories: ['kashmir_special','steel','roofing','wood'],
    warningMaterials: [
      { id: 'flat_roof',    message: '⚠️ Flat roofs collapse under heavy snowfall in Kashmir. Use sloped roofing.' },
      { id: 'single_glass', message: '⚠️ Single glass windows not suitable for Kashmir winters.' },
      { id: 'opc33',        message: '⚠️ OPC 33 Grade not recommended in sub-zero temperatures.' },
    ],
  },
  himalayan: {
    cities: [
      'shimla','manali','dehradun','mussoorie',
      'nainital','darjeeling','gangtok','dharamshala',
      'kullu','mandi','chamba','roorkee',
    ],
    label: 'Himalayan Region',
    icon: '⛰️',
    alerts: [
      '❄️ Cold climate materials recommended',
      '🏔️ Seismic Zone IV/V area',
      '🌧️ High rainfall — waterproofing critical',
    ],
    tips: [
      'Sloped roofs recommended for snow and rain',
      'Use pressure treated wood for moisture resistance',
      'Extra waterproofing layers needed',
    ],
    priorityCategories: ['roofing','wood','structure','paints'],
    warningMaterials: [],
  },
  coastal: {
    cities: [
      'mumbai','goa','kochi','mangalore',
      'visakhapatnam','chennai','puducherry',
      'kozhikode','thrissur','udupi','karwar',
    ],
    label: 'Coastal Region',
    icon: '🌊',
    alerts: [
      '🌊 High humidity — anti-corrosion materials recommended',
      '🧂 Salt air — use marine grade steel',
      '🌧️ Heavy monsoon — drainage planning critical',
    ],
    tips: [
      'Use epoxy coated or stainless steel fittings',
      'Anti-corrosion paint mandatory for steel',
      'Elevated foundation recommended in flood zones',
    ],
    priorityCategories: ['steel','paints','plumbing','roofing'],
    warningMaterials: [
      { id: 'ms_plain', message: '⚠️ Plain MS steel corrodes quickly in coastal areas. Use epoxy coated TMT.' },
    ],
  },
  desert: {
    cities: [
      'jaipur','jodhpur','jaisalmer','bikaner',
      'ajmer','ahmedabad','rajkot','surat',
      'barmer','pali','nagaur',
    ],
    label: 'Arid & Desert Region',
    icon: '☀️',
    alerts: [
      '☀️ Extreme heat — thermal insulation recommended',
      '💨 High dust — sealed windows/doors critical',
      '🌡️ Temperature up to 50°C — heat resistant materials',
    ],
    tips: [
      'Thick walls 18 inch+ for natural insulation',
      'Light colored exterior paint reflects heat',
      'Underground water tank recommended',
      'Sandstone locally available and heat resistant',
    ],
    priorityCategories: ['structure','paints','doors_windows','roofing'],
    warningMaterials: [],
  },
  northeast: {
    cities: [
      'guwahati','shillong','imphal','agartala',
      'aizawl','kohima','itanagar','dibrugarh',
      'silchar','jorhat','tezpur',
    ],
    label: 'Northeast India',
    icon: '🌿',
    alerts: [
      '🌧️ Very high rainfall — waterproofing critical',
      '🏔️ Hilly terrain — slope stability needed',
      '🌿 Bamboo construction materials available locally',
    ],
    tips: [
      'Elevated/stilt foundation for flood areas',
      'Bamboo reinforced construction eco-friendly option',
      'Steep slope roofing for heavy rainfall',
    ],
    priorityCategories: ['roofing','structure','plumbing','paints'],
    warningMaterials: [],
  },
  plains: {
    cities: [],
    label: 'North/Central India',
    icon: '🏙️',
    alerts: [],
    tips: [],
    priorityCategories: ['structure','steel','tiles','doors_windows'],
    warningMaterials: [],
  },
} as const;

export type RegionKey = keyof typeof REGION_MAP;

export function detectRegion(city: string): RegionKey {
  if (!city) return 'plains';
  const normalized = city.toLowerCase().trim();
  for (const [region, data] of Object.entries(REGION_MAP)) {
    if ('cities' in data && (data.cities as readonly string[]).some(
      c => normalized.includes(c) || c.includes(normalized)
    )) {
      return region as RegionKey;
    }
  }
  return 'plains';
}

export function getRegionData(city: string) {
  const region = detectRegion(city);
  return { region, ...REGION_MAP[region] };
}
