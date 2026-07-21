'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { getEnabledSubs, FEATURE_FLAGS } from '@/lib/featureFlags';
import { TRADE_SKILLS, CONTRACTOR_TYPES, MATERIAL_CATEGORIES } from '@/lib/providerConstants';
import { INDIAN_STATES, citiesForState } from '@/lib/geoConstants';
import { ServiceCitiesPicker } from '@/components/LocationPicker';

type Role = 'CUSTOMER' | 'SERVICE_PROVIDER' | 'MATERIAL_SELLER' | 'LAND_OWNER' | 'ADMIN' | 'PROPERTY_SELLER' | 'BUILDER' | 'PROPERTY_AGENT';

interface HomeownerData {
  projectType: string;
  city: string;
  pincode: string;
  budget: string;
  timeline: string;
}

interface ContractorData {
  contractorType: string;
  // Labour-specific
  tradeSkills: string[];
  availabilityType: string;
  dailyRate: string;
  languages: string[];
  // Sub/Full contractor
  teamSize: string;
  trades: string[];
  licenseNumber: string;
  // Common
  experience: string;
  serviceCities: string[];
}

interface SellerData {
  category: string;
  businessName: string;
  gstNumber: string;
  city: string;
  pincode: string;
}

interface LandOwnerData {
  listingType: string;
  landType: string;
  areaValue: string;
  areaUnit: string;
  state: string;
  city: string;
  pincode: string;
  locality: string;
  price: string;
  priceNegotiable: boolean;
  amenities: string[];
  description: string;
}

interface PropertySellerData {
  propertyType: string;
  bhk: string;
  listingPurpose: string;
  city: string;
  locality: string;
  pincode: string;
  price: string;
  amenities: string[];
  description: string;
}

interface BuilderData {
  companyName: string;
  projectName: string;
  projectStage: string;
  bhkOptions: string[];
  city: string;
  locality: string;
  pincode: string;
  totalUnits: string;
  website: string;
  reraNumber: string;
}

interface PropertyAgentData {
  agencyName: string;
  licenseNumber: string;
  specialization: string[];
  serviceCities: string[];
  experience: string;
}

const PROJECT_TYPES = [
  { value: 'new_construction', label: 'New Construction', icon: '🏗️', desc: 'Build from the ground up' },
  { value: 'renovation',       label: 'Renovation',       icon: '🔧', desc: 'Upgrade an existing space' },
  { value: 'interior_design',  label: 'Interior Design',  icon: '🛋️', desc: 'Style & furnish interiors' },
];

const TRADES       = ['Civil', 'Electrical', 'Plumbing', 'Carpentry', 'Painting', 'All'];
const LANGUAGES    = ['Hindi', 'Urdu', 'Punjabi', 'English', 'Kashmiri'];
const TEAM_SIZES   = [
  { value: 'just_me', label: 'Just me' },
  { value: '2_5',     label: '2 – 5' },
  { value: '5_15',    label: '5 – 15' },
  { value: '15_50',   label: '15 – 50' },
  { value: '50_plus', label: '50+' },
];

const LISTING_TYPES = [
  { value: 'for_sale',          icon: '🏷️', label: 'For Sale',           desc: 'One-time sale' },
  { value: 'for_rent',          icon: '📋', label: 'For Rent / Lease',   desc: 'Monthly or annual lease' },
  { value: 'joint_development', icon: '🤝', label: 'Joint Development',  desc: 'Partner to develop the land' },
];
const LAND_TYPES = getEnabledSubs('land').map(key => ({
  value: key,
  label: FEATURE_FLAGS.land.subcategories[key].name,
  icon:  FEATURE_FLAGS.land.subcategories[key].icon,
}));
const AREA_UNITS = ['sq ft', 'sq yards', 'acres', 'bigha'];
const LAND_AMENITIES = ['Road Access', 'Water Connection', 'Electricity', 'Boundary Wall', 'Corner Plot', 'RERA Registered'];
const PROPERTY_TYPES = ['Apartment / Flat', 'Independent House', 'Villa', 'Builder Floor', 'Studio', 'Row House', 'Penthouse'];
const PROPERTY_AMENITIES = ['Car Parking', 'Lift', 'Swimming Pool', 'Gym', 'Security', 'Power Backup', 'Club House', 'Garden'];
const BHK_OPTIONS = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK+', 'Villa'];
const PROJECT_STAGES = [
  { value: 'new_launch', icon: '🚀', label: 'New Launch' },
  { value: 'under_construction', icon: '🏗️', label: 'Under Construction' },
  { value: 'ready_to_move', icon: '✅', label: 'Ready to Move' },
];

export default function OnboardingPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [role, setRole]       = useState<Role | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [contractorSubmitted, setContractorSubmitted] = useState(false);

  // Homeowner state
  const [hw, setHw] = useState<HomeownerData>({
    projectType: '', city: '', pincode: '', budget: '', timeline: '',
  });

  // Contractor state
  const [co, setCo] = useState<ContractorData>({
    contractorType: '',
    tradeSkills: [], availabilityType: '', dailyRate: '', languages: [],
    teamSize: '', trades: [], licenseNumber: '',
    experience: '', serviceCities: [],
  });

  // Material seller state
  const [ms, setMs] = useState<SellerData>({
    category: '', businessName: '', gstNumber: '', city: '', pincode: '',
  });

  // Land owner state
  const [lo, setLo] = useState<LandOwnerData>({
    listingType: '', landType: '', areaValue: '', areaUnit: 'sq ft',
    state: '', city: '', pincode: '', locality: '',
    price: '', priceNegotiable: false, amenities: [], description: '',
  });

  // Property seller state
  const [ps, setPs] = useState<PropertySellerData>({
    propertyType: '', bhk: '', listingPurpose: '', city: '', locality: '',
    pincode: '', price: '', amenities: [], description: '',
  });

  // Builder state
  const [bu, setBu] = useState<BuilderData>({
    companyName: '', projectName: '', projectStage: '', bhkOptions: [],
    city: '', locality: '', pincode: '', totalUnits: '', website: '', reraNumber: '',
  });

  // Property agent state
  const [pa, setPa] = useState<PropertyAgentData>({
    agencyName: '', licenseNumber: '', specialization: [], serviceCities: [], experience: '',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/login?redirect=/onboarding'); return; }
      const r = (user.user_metadata?.role ?? 'CUSTOMER') as Role;
      if (r === 'ADMIN') { router.replace('/dashboard'); return; }
      setRole(r);
      setPageLoading(false);
    });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSubmitting(true);

    let formData: Record<string, unknown> = { onboarded: true };

    if (role === 'CUSTOMER') {
      if (!hw.projectType || !hw.city || !hw.pincode || !hw.budget || !hw.timeline) {
        setError('Please fill all required fields.'); setSubmitting(false); return;
      }
      formData = { ...formData, ...hw };
    } else if (role === 'SERVICE_PROVIDER') {
      if (!co.contractorType) { setError('Please select your contractor type.'); setSubmitting(false); return; }
      if (co.contractorType === 'labour') {
        if (!co.tradeSkills.length || !co.availabilityType || !co.dailyRate) {
          setError('Please fill all required fields.'); setSubmitting(false); return;
        }
      } else {
        if (!co.teamSize || !co.trades.length) {
          setError('Please fill all required fields.'); setSubmitting(false); return;
        }
      }
      if (!co.experience || !co.serviceCities.length) {
        setError('Please fill all required fields.'); setSubmitting(false); return;
      }
      formData = { ...formData, contractor_type: co.contractorType, ...co };
    } else if (role === 'MATERIAL_SELLER') {
      if (!ms.category || !ms.businessName || !ms.city || !ms.pincode) {
        setError('Please fill all required fields.'); setSubmitting(false); return;
      }
      formData = { ...formData, ...ms };
    } else if (role === 'LAND_OWNER') {
      if (!lo.listingType || !lo.landType || !lo.areaValue || !lo.state || !lo.city || !lo.pincode || !lo.price) {
        setError('Please fill all required fields.'); setSubmitting(false); return;
      }
      formData = { ...formData, ...lo };
    } else if (role === 'PROPERTY_SELLER') {
      if (!ps.propertyType || !ps.bhk || !ps.listingPurpose || !ps.city || !ps.pincode || !ps.price) {
        setError('Please fill all required fields.'); setSubmitting(false); return;
      }
      formData = { ...formData, ...ps };
    } else if (role === 'BUILDER') {
      if (!bu.companyName || !bu.projectName || !bu.projectStage || !bu.city || !bu.pincode) {
        setError('Please fill all required fields.'); setSubmitting(false); return;
      }
      formData = { ...formData, ...bu };
    } else if (role === 'PROPERTY_AGENT') {
      if (!pa.experience || !pa.serviceCities.length) {
        setError('Please fill all required fields.'); setSubmitting(false); return;
      }
      formData = { ...formData, ...pa };
    }

    const { error } = await supabase.auth.updateUser({ data: formData });
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    if (role === 'SERVICE_PROVIDER') {
      setContractorSubmitted(true);
      return;
    }
    router.push('/dashboard');
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <SpinSvg className="h-7 w-7 text-[#C0593A]" />
      </div>
    );
  }

  // Contractor profile submitted — show success screen
  if (contractorSubmitted) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center py-10 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✅
          </div>
          <h1 className="text-2xl font-bold text-[#2C1810] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Profile submitted!
          </h1>
          <p className="text-[#6B5248] text-sm leading-relaxed mb-2">
            Our team will review and approve your profile within <strong>24–48 hours</strong>.
          </p>
          <p className="text-[#6B5248] text-sm mb-8">
            You'll receive a <strong>WhatsApp notification</strong> once approved.
          </p>
          <div className="bg-white border border-[#EBE0D8] rounded-2xl p-5 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="text-sm font-semibold text-[#2C1810]">Profile under review</p>
                <p className="text-xs text-[#A08070]">Our team verifies credentials and experience</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <p className="text-sm font-semibold text-[#2C1810]">WhatsApp notification</p>
                <p className="text-xs text-[#A08070]">You'll be notified once approved or if more info is needed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <p className="text-sm font-semibold text-[#2C1810]">Go live</p>
                <p className="text-xs text-[#A08070]">Once approved, your profile appears in search results</p>
              </div>
            </div>
          </div>
          <button onClick={() => router.push('/dashboard')}
            className="w-full bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm py-3.5 rounded-xl transition-colors">
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  const roleLabel =
    role === 'CUSTOMER'         ? 'Homeowner'        :
    role === 'SERVICE_PROVIDER' ? 'Contractor'       :
    role === 'LAND_OWNER'       ? 'Land Owner'       :
    role === 'PROPERTY_SELLER'  ? 'Property Seller'  :
    role === 'BUILDER'          ? 'Builder / Developer' :
    role === 'PROPERTY_AGENT'   ? 'Property Agent'   :
    'Material Seller';

  return (
    <div className="min-h-screen bg-[#FDF8F5] py-10 px-4">
      <div className="max-w-[600px] mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#C0593A] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <span className="text-[#2C1810] text-base font-bold tracking-tight">Griffy</span>
          </div>

          <h1 className="text-2xl font-bold text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Set up your profile
          </h1>
          <p className="text-sm text-[#6B5248]">
            Tell us a bit more so we can personalise your experience as a{' '}
            <span className="font-semibold text-[#C0593A]">{roleLabel}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── HOMEOWNER FORM ── */}
          {role === 'CUSTOMER' && (
            <>
              <Section title="What are you planning?" hint="Choose the type of project you have in mind">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PROJECT_TYPES.map(pt => (
                    <RadioCard
                      key={pt.value}
                      icon={pt.icon}
                      label={pt.label}
                      desc={pt.desc}
                      selected={hw.projectType === pt.value}
                      onClick={() => setHw(p => ({ ...p, projectType: pt.value }))}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Project location" hint="Where will the work happen?">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City *">
                    <input type="text" value={hw.city} onChange={e => setHw(p => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Gurgaon" className={inp} required />
                  </Field>
                  <Field label="Pincode *">
                    <input type="text" value={hw.pincode} onChange={e => setHw(p => ({ ...p, pincode: e.target.value }))}
                      placeholder="e.g. 122001" maxLength={6} className={inp} required />
                  </Field>
                </div>
              </Section>

              <Section title="Budget range" hint="Approximate total budget for the project">
                <Select value={hw.budget} onChange={v => setHw(p => ({ ...p, budget: v }))} placeholder="Select budget">
                  <option value="under_10l">Under ₹10L</option>
                  <option value="10l_25l">₹10L – ₹25L</option>
                  <option value="25l_50l">₹25L – ₹50L</option>
                  <option value="above_50l">Above ₹50L</option>
                </Select>
              </Section>

              <Section title="Timeline" hint="When do you want to get started?">
                <Select value={hw.timeline} onChange={v => setHw(p => ({ ...p, timeline: v }))} placeholder="Select timeline">
                  <option value="0_3m">0 – 3 months</option>
                  <option value="3_6m">3 – 6 months</option>
                  <option value="6_12m">6 – 12 months</option>
                  <option value="not_decided">Not decided yet</option>
                </Select>
              </Section>
            </>
          )}

          {/* ── CONTRACTOR FORM ── */}
          {role === 'SERVICE_PROVIDER' && (
            <>
              {/* 1. Contractor type */}
              <Section title="What type of contractor are you?" hint="This helps match you with the right customers">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CONTRACTOR_TYPES.map(ct => (
                    <RadioCard key={ct.value} icon={ct.icon} label={ct.label} desc={ct.desc}
                      selected={co.contractorType === ct.value}
                      onClick={() => setCo(p => ({ ...p, contractorType: ct.value }))} />
                  ))}
                </div>
              </Section>

              {/* 2a. Skilled Labour fields */}
              {co.contractorType === 'labour' && (
                <>
                  <Section title="Trade skill" hint="Select your primary skill(s)">
                    <ChipGroup options={TRADE_SKILLS} selected={co.tradeSkills}
                      onToggle={v => setCo(p => ({ ...p, tradeSkills: toggle(p.tradeSkills, v) }))} />
                  </Section>

                  <Section title="Availability type">
                    <div className="grid grid-cols-3 gap-3">
                      {['Daily Wage', 'Weekly', 'Monthly Contract'].map(a => (
                        <RadioCard key={a} icon="" label={a}
                          selected={co.availabilityType === a}
                          onClick={() => setCo(p => ({ ...p, availabilityType: a }))} />
                      ))}
                    </div>
                  </Section>

                  <Section title="Expected daily rate">
                    <Field label="Daily rate (₹) *">
                      <input type="number" value={co.dailyRate} min="0"
                        onChange={e => setCo(p => ({ ...p, dailyRate: e.target.value }))}
                        placeholder="e.g. 800" className={inp} />
                    </Field>
                  </Section>

                  <Section title="Languages spoken">
                    <ChipGroup options={LANGUAGES} selected={co.languages}
                      onToggle={v => setCo(p => ({ ...p, languages: toggle(p.languages, v) }))} />
                  </Section>
                </>
              )}

              {/* 2b. Sub / Full contractor fields */}
              {(co.contractorType === 'sub_contractor' || co.contractorType === 'full_contractor') && (
                <>
                  <Section title="Team size">
                    <Select value={co.teamSize} onChange={v => setCo(p => ({ ...p, teamSize: v }))} placeholder="Select team size">
                      {TEAM_SIZES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </Select>
                  </Section>

                  <Section title="Trade type(s)" hint="Select all that apply">
                    <ChipGroup options={TRADES} selected={co.trades}
                      onToggle={v => setCo(p => ({ ...p, trades: toggle(p.trades, v) }))} />
                  </Section>

                  <Section title="License number" hint="Optional — adds a verified badge to your profile">
                    <Field label="License / Registration number">
                      <input type="text" value={co.licenseNumber}
                        onChange={e => setCo(p => ({ ...p, licenseNumber: e.target.value }))}
                        placeholder="e.g. DL-CONT-2024-XXXXX" className={inp} />
                    </Field>
                  </Section>
                </>
              )}

              {/* 3. Common fields — shown after type is selected */}
              {co.contractorType && (
                <>
                  <Section title="Years of experience">
                    <Select value={co.experience} onChange={v => setCo(p => ({ ...p, experience: v }))} placeholder="Select experience">
                      <option value="0_2">0 – 2 years</option>
                      <option value="2_5">2 – 5 years</option>
                      <option value="5_10">5 – 10 years</option>
                      <option value="10_plus">10+ years</option>
                    </Select>
                  </Section>

                  <Section title="Location" hint="Select all cities where you take work">
                    <ServiceCitiesPicker selected={co.serviceCities}
                      onChange={cities => setCo(p => ({ ...p, serviceCities: cities }))} />
                  </Section>
                </>
              )}
            </>
          )}

          {/* ── MATERIAL SELLER FORM ── */}
          {role === 'MATERIAL_SELLER' && (
            <>
              <Section title="Primary material category" hint="What do you mainly sell?">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MATERIAL_CATEGORIES.map(cat => (
                    <RadioCard
                      key={cat.value}
                      icon={cat.icon}
                      label={cat.label}
                      selected={ms.category === cat.value}
                      onClick={() => setMs(p => ({ ...p, category: cat.value }))}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Business details">
                <div className="space-y-3">
                  <Field label="Business name *">
                    <input type="text" value={ms.businessName}
                      onChange={e => setMs(p => ({ ...p, businessName: e.target.value }))}
                      placeholder="e.g. Sharma Building Materials" className={inp} required />
                  </Field>
                  <Field label="GST number (optional)">
                    <input type="text" value={ms.gstNumber}
                      onChange={e => setMs(p => ({ ...p, gstNumber: e.target.value }))}
                      placeholder="e.g. 07AABCU9603R1ZX" className={inp} />
                  </Field>
                </div>
              </Section>

              <Section title="Business location">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City *">
                    <input type="text" value={ms.city}
                      onChange={e => setMs(p => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Delhi" className={inp} required />
                  </Field>
                  <Field label="Pincode *">
                    <input type="text" value={ms.pincode}
                      onChange={e => setMs(p => ({ ...p, pincode: e.target.value }))}
                      placeholder="e.g. 110001" maxLength={6} className={inp} required />
                  </Field>
                </div>
              </Section>
            </>
          )}

          {/* ── LAND OWNER FORM ── */}
          {role === 'LAND_OWNER' && (
            <>
              <Section title="Listing type" hint="How do you want to offer this land?">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {LISTING_TYPES.map(lt => (
                    <RadioCard key={lt.value} icon={lt.icon} label={lt.label} desc={lt.desc}
                      selected={lo.listingType === lt.value}
                      onClick={() => setLo(p => ({ ...p, listingType: lt.value }))} />
                  ))}
                </div>
              </Section>

              <Section title="Land type">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LAND_TYPES.map(lt => (
                    <RadioCard key={lt.value} icon={lt.icon} label={lt.label}
                      selected={lo.landType === lt.value}
                      onClick={() => setLo(p => ({ ...p, landType: lt.value }))} />
                  ))}
                </div>
              </Section>

              <Section title="Area" hint="Total land area">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Field label="Area *">
                      <input type="number" value={lo.areaValue} min="0"
                        onChange={e => setLo(p => ({ ...p, areaValue: e.target.value }))}
                        placeholder="e.g. 2400" className={inp} required />
                    </Field>
                  </div>
                  <div className="w-36">
                    <Field label="Unit">
                      <select value={lo.areaUnit} onChange={e => setLo(p => ({ ...p, areaUnit: e.target.value }))}
                        className={`${inp} appearance-none`}>
                        {AREA_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              </Section>

              <Section title="Location">
                <div className="space-y-3">
                  <Field label="State *">
                    <select value={lo.state} onChange={e => setLo(p => ({ ...p, state: e.target.value, city: '' }))}
                      required className={`${inp} appearance-none`}>
                      <option value="" disabled>Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City *">
                      <select value={lo.city} onChange={e => setLo(p => ({ ...p, city: e.target.value }))}
                        required disabled={!lo.state} className={`${inp} appearance-none disabled:opacity-50`}>
                        <option value="" disabled>{lo.state ? 'Select city' : 'Select state first'}</option>
                        {citiesForState(lo.state).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Pincode *">
                      <input type="text" value={lo.pincode}
                        onChange={e => setLo(p => ({ ...p, pincode: e.target.value }))}
                        placeholder="e.g. 122001" maxLength={6} className={inp} required />
                    </Field>
                  </div>
                  <Field label="Locality / Area name">
                    <input type="text" value={lo.locality}
                      onChange={e => setLo(p => ({ ...p, locality: e.target.value }))}
                      placeholder="e.g. Sector 45, DLF Phase 1" className={inp} />
                  </Field>
                </div>
              </Section>

              <Section title="Price">
                <div className="space-y-3">
                  <Field label="Total price (₹) *">
                    <input type="number" value={lo.price} min="0"
                      onChange={e => setLo(p => ({ ...p, price: e.target.value }))}
                      placeholder="e.g. 5000000" className={inp} required />
                  </Field>
                  <label className="flex items-center justify-between cursor-pointer bg-white border border-[#EBE0D8] rounded-lg px-4 py-3">
                    <span className="text-sm text-[#2C1810]">Price is negotiable</span>
                    <button type="button" role="switch" aria-checked={lo.priceNegotiable}
                      onClick={() => setLo(p => ({ ...p, priceNegotiable: !p.priceNegotiable }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${lo.priceNegotiable ? 'bg-[#C0593A]' : 'bg-gray-200'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${lo.priceNegotiable ? 'translate-x-5' : ''}`} />
                    </button>
                  </label>
                </div>
              </Section>

              <Section title="Amenities" hint="Select all that apply">
                <ChipGroup options={LAND_AMENITIES} selected={lo.amenities}
                  onToggle={v => setLo(p => ({ ...p, amenities: toggle(p.amenities, v) }))} />
              </Section>

              <Section title="Description" hint="Describe the land — key features, access, surroundings">
                <Field label="Description">
                  <textarea value={lo.description} rows={4}
                    onChange={e => setLo(p => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. North-facing corner plot with road access on two sides. Located near upcoming metro station…"
                    className={`${inp} resize-none`} />
                </Field>
              </Section>
            </>
          )}

          {/* ── PROPERTY SELLER FORM ── */}
          {role === 'PROPERTY_SELLER' && (
            <>
              <Section title="What are you listing?" hint="Tell us about the property">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PROPERTY_TYPES.map(pt => (
                    <RadioCard key={pt} icon="🏠" label={pt}
                      selected={ps.propertyType === pt}
                      onClick={() => setPs(p => ({ ...p, propertyType: pt }))} />
                  ))}
                </div>
              </Section>

              <Section title="Configuration">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {BHK_OPTIONS.map(b => (
                    <RadioCard key={b} icon="" label={b}
                      selected={ps.bhk === b}
                      onClick={() => setPs(p => ({ ...p, bhk: b }))} />
                  ))}
                </div>
              </Section>

              <Section title="Listing purpose">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[{ v: 'for_sale', l: 'For Sale', i: '🏷️' }, { v: 'for_rent', l: 'For Rent', i: '📋' }, { v: 'both', l: 'Sale or Rent', i: '🔄' }].map(x => (
                    <RadioCard key={x.v} icon={x.i} label={x.l}
                      selected={ps.listingPurpose === x.v}
                      onClick={() => setPs(p => ({ ...p, listingPurpose: x.v }))} />
                  ))}
                </div>
              </Section>

              <Section title="Location">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City *">
                      <input type="text" value={ps.city}
                        onChange={e => setPs(p => ({ ...p, city: e.target.value }))}
                        placeholder="e.g. Gurgaon" className={inp} required />
                    </Field>
                    <Field label="Pincode *">
                      <input type="text" value={ps.pincode}
                        onChange={e => setPs(p => ({ ...p, pincode: e.target.value }))}
                        placeholder="e.g. 122001" maxLength={6} className={inp} required />
                    </Field>
                  </div>
                  <Field label="Locality / Society name">
                    <input type="text" value={ps.locality}
                      onChange={e => setPs(p => ({ ...p, locality: e.target.value }))}
                      placeholder="e.g. DLF Phase 2, Sector 45" className={inp} />
                  </Field>
                </div>
              </Section>

              <Section title="Price">
                <Field label="Expected price (₹) *">
                  <input type="number" value={ps.price} min="0"
                    onChange={e => setPs(p => ({ ...p, price: e.target.value }))}
                    placeholder="e.g. 7500000" className={inp} required />
                </Field>
              </Section>

              <Section title="Amenities" hint="Select all that are available">
                <ChipGroup options={PROPERTY_AMENITIES} selected={ps.amenities}
                  onToggle={v => setPs(p => ({ ...p, amenities: toggle(p.amenities, v) }))} />
              </Section>

              <Section title="Description (optional)">
                <Field label="Description">
                  <textarea value={ps.description} rows={3}
                    onChange={e => setPs(p => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. Well-maintained 3BHK in a gated society. Walking distance from metro station…"
                    className={`${inp} resize-none`} />
                </Field>
              </Section>
            </>
          )}

          {/* ── BUILDER / DEVELOPER FORM ── */}
          {role === 'BUILDER' && (
            <>
              <Section title="Company details">
                <div className="space-y-3">
                  <Field label="Company / Developer name *">
                    <input type="text" value={bu.companyName}
                      onChange={e => setBu(p => ({ ...p, companyName: e.target.value }))}
                      placeholder="e.g. Prestige Group" className={inp} required />
                  </Field>
                  <Field label="Project name *">
                    <input type="text" value={bu.projectName}
                      onChange={e => setBu(p => ({ ...p, projectName: e.target.value }))}
                      placeholder="e.g. Prestige Sunrise Park" className={inp} required />
                  </Field>
                  <Field label="RERA registration number (optional)">
                    <input type="text" value={bu.reraNumber}
                      onChange={e => setBu(p => ({ ...p, reraNumber: e.target.value }))}
                      placeholder="e.g. P52100012345" className={inp} />
                  </Field>
                  <Field label="Website (optional)">
                    <input type="url" value={bu.website}
                      onChange={e => setBu(p => ({ ...p, website: e.target.value }))}
                      placeholder="https://yourproject.com" className={inp} />
                  </Field>
                </div>
              </Section>

              <Section title="Project stage">
                <div className="grid grid-cols-3 gap-3">
                  {PROJECT_STAGES.map(s => (
                    <RadioCard key={s.value} icon={s.icon} label={s.label}
                      selected={bu.projectStage === s.value}
                      onClick={() => setBu(p => ({ ...p, projectStage: s.value }))} />
                  ))}
                </div>
              </Section>

              <Section title="Available configurations">
                <ChipGroup options={BHK_OPTIONS} selected={bu.bhkOptions}
                  onToggle={v => setBu(p => ({ ...p, bhkOptions: toggle(p.bhkOptions, v) }))} />
              </Section>

              <Section title="Project location">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City *">
                      <input type="text" value={bu.city}
                        onChange={e => setBu(p => ({ ...p, city: e.target.value }))}
                        placeholder="e.g. Hyderabad" className={inp} required />
                    </Field>
                    <Field label="Pincode *">
                      <input type="text" value={bu.pincode}
                        onChange={e => setBu(p => ({ ...p, pincode: e.target.value }))}
                        placeholder="e.g. 500081" maxLength={6} className={inp} required />
                    </Field>
                  </div>
                  <Field label="Locality / Area">
                    <input type="text" value={bu.locality}
                      onChange={e => setBu(p => ({ ...p, locality: e.target.value }))}
                      placeholder="e.g. Gachibowli, Nanakramguda" className={inp} />
                  </Field>
                </div>
              </Section>

              <Section title="Total units">
                <Field label="Number of units in this project">
                  <input type="number" value={bu.totalUnits} min="1"
                    onChange={e => setBu(p => ({ ...p, totalUnits: e.target.value }))}
                    placeholder="e.g. 240" className={inp} />
                </Field>
              </Section>
            </>
          )}

          {/* ── PROPERTY AGENT FORM ── */}
          {role === 'PROPERTY_AGENT' && (
            <>
              <Section title="Agency details">
                <div className="space-y-3">
                  <Field label="Agency / Brokerage name">
                    <input type="text" value={pa.agencyName}
                      onChange={e => setPa(p => ({ ...p, agencyName: e.target.value }))}
                      placeholder="e.g. PropConnect Realty" className={inp} />
                  </Field>
                  <Field label="RERA agent license number (optional)">
                    <input type="text" value={pa.licenseNumber}
                      onChange={e => setPa(p => ({ ...p, licenseNumber: e.target.value }))}
                      placeholder="e.g. A51800012345" className={inp} />
                  </Field>
                </div>
              </Section>

              <Section title="Specialization" hint="What types of transactions do you handle?">
                <ChipGroup options={['Residential Sale', 'Residential Rent', 'Commercial Sale', 'Commercial Rent', 'New Projects', 'Luxury Homes']}
                  selected={pa.specialization}
                  onToggle={v => setPa(p => ({ ...p, specialization: toggle(p.specialization, v) }))} />
              </Section>

              <Section title="Location">
                <ServiceCitiesPicker selected={pa.serviceCities}
                  onChange={cities => setPa(p => ({ ...p, serviceCities: cities }))} />
              </Section>

              <Section title="Years of experience">
                <Select value={pa.experience} onChange={v => setPa(p => ({ ...p, experience: v }))} placeholder="Select experience">
                  <option value="0_2">0 – 2 years</option>
                  <option value="2_5">2 – 5 years</option>
                  <option value="5_10">5 – 10 years</option>
                  <option value="10_plus">10+ years</option>
                </Select>
              </Section>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-60">
            {submitting ? <><SpinSvg className="h-4 w-4" />Saving…</> : 'Complete setup →'}
          </button>

        </form>

        <p className="text-center text-xs text-[#A08070] mt-6">
          You can update these details anytime from your profile.
        </p>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toggle(arr: string[], v: string) {
  return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
}

// ── Reusable sub-components ──────────────────────────────────────────────────

const inp = 'w-full bg-white border border-[#EBE0D8] rounded-lg px-4 py-2.5 text-sm text-[#2C1810] placeholder-[#A08070] outline-none focus:border-[#C0593A] transition-colors';

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-[#2C1810]">{title}</h2>
        {hint && <p className="text-xs text-[#A08070] mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B5248] mb-1">{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, placeholder, children }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} required
      className={`${inp} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23A08070' d='M6 8L1 3h10z'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_1rem_center] pr-8`}>
      <option value="" disabled>{placeholder}</option>
      {children}
    </select>
  );
}

function RadioCard({ icon, label, desc, selected, onClick }: {
  icon: string; label: string; desc?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex flex-col items-center text-center gap-2 p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-[#C0593A] bg-[#FAEEE9] shadow-sm'
          : 'border-[#EBE0D8] bg-white hover:border-[#C0593A] hover:bg-[#FAEEE9]'
      }`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-[#2C1810]">{label}</p>
        {desc && <p className="text-[10px] text-[#A08070] mt-0.5 leading-tight">{desc}</p>}
      </div>
    </button>
  );
}

function ChipGroup({ options, selected, onToggle }: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => onToggle(opt)}
            className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
              active
                ? 'bg-[#C0593A] border-[#C0593A] text-white'
                : 'bg-white border-[#EBE0D8] text-[#6B5248] hover:border-[#C0593A]'
            }`}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SpinSvg({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
