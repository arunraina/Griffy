'use client';

import { useState } from 'react';
import { createUser, CREATABLE_ROLES, type CreateUserPayload } from '@/lib/admin';
import { TRADE_SKILLS, SERVICE_EXPERT_TYPES, CONTRACTOR_TYPES } from '@/lib/providerConstants';
import { StateCitySelect, ServiceCitiesPicker } from '@/components/LocationPicker';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  CONTRACTOR: 'Contractor',
  LABOUR: 'Labour (electrician, plumber, mason...)',
  SERVICE_EXPERT: 'Service Expert',
  MATERIAL_SUPPLIER: 'Material Supplier',
  LAND_OWNER: 'Land Owner',
  PROPERTY_SELLER: 'Property Seller',
  BUILDER: 'Builder',
  PROPERTY_AGENT: 'Property Agent',
};

// Sub/full contractor only — "labour" as a contractorType belongs to the
// separate LABOUR role/LabourProfile, not ContractorProfile.
const CONTRACTOR_TYPE_OPTIONS = CONTRACTOR_TYPES.filter((t) => t.value !== 'labour');

const inp = 'w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-4 py-2.5 text-sm text-[#2C1810] placeholder-[#A08070] outline-none focus:border-[#C0593A] transition-colors';
const label = 'text-xs font-semibold text-[#6B5248] mb-1 block';

const emptyForm = {
  role: '',
  name: '', phone: '', email: '', city: '', state: '',
  contractorType: '', skillType: '', expertiseType: '',
  experience: '', licenseNumber: '', bio: '',
  dailyRate: '', projectRate: '', consultationFee: '',
  businessName: '', gstNumber: '', businessAddress: '',
  companyName: '', registrationNumber: '', agencyName: '',
  serviceCities: [] as string[],
  deliveryCities: [] as string[],
  tradeSkills: [] as string[],
  specializations: [] as string[],
};

export default function CreateUserModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  function set<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function resetAndClose() {
    setForm(emptyForm);
    setError('');
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.role) { setError('Please select a user type.'); return; }
    if (!form.name.trim()) { setError('Please enter a name.'); return; }

    const num = (v: string) => (v.trim() ? Number(v) : undefined);
    const payload: CreateUserPayload = {
      role: form.role,
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      profile: {
        contractorType: form.contractorType || undefined,
        skillType: form.skillType || undefined,
        expertiseType: form.expertiseType || undefined,
        experience: form.experience.trim() || undefined,
        serviceCities: form.serviceCities.length ? form.serviceCities : undefined,
        tradeSkills: form.tradeSkills.length ? form.tradeSkills : undefined,
        licenseNumber: form.licenseNumber.trim() || undefined,
        dailyRate: num(form.dailyRate),
        projectRate: num(form.projectRate),
        consultationFee: num(form.consultationFee),
        bio: form.bio.trim() || undefined,
        businessName: form.businessName.trim() || undefined,
        gstNumber: form.gstNumber.trim() || undefined,
        businessAddress: form.businessAddress.trim() || undefined,
        deliveryCities: form.deliveryCities.length ? form.deliveryCities : undefined,
        companyName: form.companyName.trim() || undefined,
        registrationNumber: form.registrationNumber.trim() || undefined,
        specializations: form.specializations.length ? form.specializations : undefined,
        agencyName: form.agencyName.trim() || undefined,
      },
    };

    setSubmitting(true);
    setError('');
    try {
      await createUser(payload);
      onCreated();
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={resetAndClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#2C1810]">Add User</h2>
            <p className="text-xs text-[#A08070] mt-0.5">Manually seed a supply-side provider. Their profile goes live immediately.</p>
          </div>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={label}>User type</label>
            <select value={form.role} onChange={(e) => set('role', e.target.value)} className={inp}>
              <option value="">Select a type…</option>
              {CREATABLE_ROLES.map(({ role }) => (
                <option key={role} value={role}>{ROLE_LABELS[role] ?? role}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={label}>Name</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inp} placeholder="Full name" />
            </div>
            <div>
              <label className={label}>Phone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inp} placeholder="+91XXXXXXXXXX" />
            </div>
            <div>
              <label className={label}>Email (optional)</label>
              <input value={form.email} onChange={(e) => set('email', e.target.value)} className={inp} placeholder="Leave blank if unknown" />
            </div>
            <div className="col-span-2">
              <label className={label}>City / State</label>
              <StateCitySelect
                state={form.state}
                city={form.city}
                onStateChange={(v) => set('state', v)}
                onCityChange={(v) => set('city', v)}
              />
            </div>
          </div>

          {form.role === 'LABOUR' && (
            <>
              <div>
                <label className={label}>Skill</label>
                <select value={form.skillType} onChange={(e) => set('skillType', e.target.value)} className={inp}>
                  <option value="">Select a skill…</option>
                  {TRADE_SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Experience</label>
                <input value={form.experience} onChange={(e) => set('experience', e.target.value)} className={inp} placeholder="e.g. 5 years" />
              </div>
              <div>
                <label className={label}>Location</label>
                <ServiceCitiesPicker selected={form.serviceCities} onChange={(cities) => set('serviceCities', cities)} />
              </div>
              <div>
                <label className={label}>Daily rate (₹, optional)</label>
                <input value={form.dailyRate} onChange={(e) => set('dailyRate', e.target.value)} className={inp} type="number" min="0" />
              </div>
            </>
          )}

          {form.role === 'CONTRACTOR' && (
            <>
              <div>
                <label className={label}>Contractor type</label>
                <select value={form.contractorType} onChange={(e) => set('contractorType', e.target.value)} className={inp}>
                  <option value="">Select…</option>
                  {CONTRACTOR_TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Experience</label>
                <input value={form.experience} onChange={(e) => set('experience', e.target.value)} className={inp} placeholder="e.g. 8 years" />
              </div>
              <div>
                <label className={label}>Location</label>
                <ServiceCitiesPicker selected={form.serviceCities} onChange={(cities) => set('serviceCities', cities)} />
              </div>
              <div>
                <label className={label}>License number (optional)</label>
                <input value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Daily rate (₹, optional)</label>
                  <input value={form.dailyRate} onChange={(e) => set('dailyRate', e.target.value)} className={inp} type="number" min="0" />
                </div>
                <div>
                  <label className={label}>Project rate (₹, optional)</label>
                  <input value={form.projectRate} onChange={(e) => set('projectRate', e.target.value)} className={inp} type="number" min="0" />
                </div>
              </div>
            </>
          )}

          {form.role === 'SERVICE_EXPERT' && (
            <>
              <div>
                <label className={label}>Expertise type</label>
                <select value={form.expertiseType} onChange={(e) => set('expertiseType', e.target.value)} className={inp}>
                  <option value="">Select…</option>
                  {SERVICE_EXPERT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Experience</label>
                <input value={form.experience} onChange={(e) => set('experience', e.target.value)} className={inp} placeholder="e.g. 10 years" />
              </div>
              <div>
                <label className={label}>Location</label>
                <ServiceCitiesPicker selected={form.serviceCities} onChange={(cities) => set('serviceCities', cities)} />
              </div>
              <div>
                <label className={label}>Consultation fee (₹, optional)</label>
                <input value={form.consultationFee} onChange={(e) => set('consultationFee', e.target.value)} className={inp} type="number" min="0" />
              </div>
            </>
          )}

          {form.role === 'MATERIAL_SUPPLIER' && (
            <>
              <div>
                <label className={label}>Business name</label>
                <input value={form.businessName} onChange={(e) => set('businessName', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={label}>Business address</label>
                <input value={form.businessAddress} onChange={(e) => set('businessAddress', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={label}>GST number (optional)</label>
                <input value={form.gstNumber} onChange={(e) => set('gstNumber', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={label}>Delivery cities</label>
                <ServiceCitiesPicker selected={form.deliveryCities} onChange={(cities) => set('deliveryCities', cities)} />
              </div>
            </>
          )}

          {form.role === 'BUILDER' && (
            <>
              <div>
                <label className={label}>Company name</label>
                <input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={label}>Registration number (optional)</label>
                <input value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={label}>Location</label>
                <ServiceCitiesPicker selected={form.serviceCities} onChange={(cities) => set('serviceCities', cities)} />
              </div>
            </>
          )}

          {form.role === 'PROPERTY_AGENT' && (
            <>
              <div>
                <label className={label}>Agency name (optional)</label>
                <input value={form.agencyName} onChange={(e) => set('agencyName', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={label}>License number (optional)</label>
                <input value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={label}>Location</label>
                <ServiceCitiesPicker selected={form.serviceCities} onChange={(cities) => set('serviceCities', cities)} />
              </div>
            </>
          )}

          {(form.role === 'LAND_OWNER' || form.role === 'PROPERTY_SELLER') && (
            <p className="text-xs text-[#A08070]">
              No extra details needed — they list land/properties themselves from their profile once claimed.
            </p>
          )}

          {form.role && (
            <div>
              <label className={label}>Bio (optional)</label>
              <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={2} className={inp} />
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={resetAndClose} disabled={submitting}
              className="text-sm font-semibold text-[#6B5248] px-4 py-2 rounded-lg hover:bg-[#FAEEE9] disabled:opacity-40">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-lg disabled:opacity-40">
              {submitting ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
