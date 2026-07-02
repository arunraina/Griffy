'use client';

import { useState, useMemo } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type ContractorType = 'Labour' | 'Sub-Contractor' | 'Full Contractor';
type ProfileStatus  = 'pending' | 'approved' | 'rejected' | 'suspended';
type Tab = ProfileStatus | 'all';

interface AdminContractor {
  id: string;
  name: string;
  phone: string;
  type: ContractorType;
  skills: string[];
  location: string;
  experience: number;
  status: ProfileStatus;
  verified: boolean;
  featured: boolean;
  rejectionReason?: string;
  appliedAt: Date;
  licenseNumber?: string;
  bio: string;
  rating: number;
  reviewCount: number;
  totalJobs: number;
  adminNotes: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const INITIAL_CONTRACTORS: AdminContractor[] = [
  { id:'a1', name:'Vikram Nair',      phone:'+91 98765 43210', type:'Full Contractor', skills:['Civil','Plumbing'],      location:'Kochi',     experience:7,  status:'pending',   verified:false, featured:false, appliedAt:new Date('2026-06-28'), licenseNumber:'KL-CONT-2024-001', bio:'Experienced civil contractor with 7+ years in residential projects across Kerala.',     rating:0,   reviewCount:0,  totalJobs:0,  adminNotes:'' },
  { id:'a2', name:'Deepa Krishnan',   phone:'+91 97654 32109', type:'Sub-Contractor',  skills:['Electrical','Civil'],    location:'Chennai',   experience:4,  status:'pending',   verified:false, featured:false, appliedAt:new Date('2026-06-29'), licenseNumber:undefined,          bio:'Specializes in residential electrical wiring and distribution panels.',              rating:0,   reviewCount:0,  totalJobs:0,  adminNotes:'' },
  { id:'a3', name:'Ravi Shankar',     phone:'+91 96543 21098', type:'Labour',          skills:['Mason','Helper'],        location:'Pune',      experience:2,  status:'pending',   verified:false, featured:false, appliedAt:new Date('2026-06-25'), licenseNumber:undefined,          bio:'Daily wage mason available for residential and commercial projects in Pune.',        rating:0,   reviewCount:0,  totalJobs:0,  adminNotes:'' },
  { id:'a4', name:'Rajesh Kumar',     phone:'+91 95432 10987', type:'Full Contractor', skills:['Civil'],                 location:'Delhi NCR', experience:12, status:'approved',  verified:true,  featured:true,  appliedAt:new Date('2026-06-20'), licenseNumber:'DL-CONT-2024-001', bio:'Top-rated civil contractor in Delhi with 12 years and 48 completed projects.',      rating:4.8, reviewCount:63, totalJobs:48, adminNotes:'Exceptional track record. Fast-tracked for verification.' },
  { id:'a5', name:'Priya Verma',      phone:'+91 94321 09876', type:'Labour',          skills:['Mason','Civil'],         location:'Mumbai',    experience:5,  status:'approved',  verified:true,  featured:false, appliedAt:new Date('2026-06-18'), licenseNumber:undefined,          bio:'Experienced mason with expertise in RCC work and brick masonry in Mumbai.',         rating:4.7, reviewCount:41, totalJobs:32, adminNotes:'' },
  { id:'a6', name:'Anil Singh',       phone:'+91 93210 98765', type:'Sub-Contractor',  skills:['Electrical'],            location:'Bangalore', experience:8,  status:'approved',  verified:false, featured:false, appliedAt:new Date('2026-06-22'), licenseNumber:'KA-CONT-2024-002', bio:'Electrical sub-contractor specialising in commercial complexes.',                    rating:4.9, reviewCount:88, totalJobs:61, adminNotes:'' },
  { id:'a7', name:'Santosh Yadav',    phone:'+91 92109 87654', type:'Labour',          skills:['Painting'],              location:'Jaipur',    experience:1,  status:'rejected',  verified:false, featured:false, appliedAt:new Date('2026-06-25'), licenseNumber:undefined,          bio:'Painter looking for residential painting work.',                                    rating:0,   reviewCount:0,  totalJobs:0,  adminNotes:'', rejectionReason:'Incomplete profile — no verifiable experience documents provided.' },
  { id:'a8', name:'Firoz Khan',       phone:'+91 91098 76543', type:'Sub-Contractor',  skills:['Plumbing','Civil'],      location:'Lucknow',   experience:3,  status:'rejected',  verified:false, featured:false, appliedAt:new Date('2026-06-24'), licenseNumber:undefined,          bio:'Plumbing sub-contractor for residential projects.',                                 rating:0,   reviewCount:0,  totalJobs:0,  adminNotes:'', rejectionReason:'Duplicate profile detected.' },
  { id:'a9', name:'Mahesh Gupta',     phone:'+91 90987 65432', type:'Full Contractor', skills:['Civil','Carpentry'],     location:'Ahmedabad', experience:10, status:'suspended', verified:true,  featured:false, appliedAt:new Date('2026-06-10'), licenseNumber:'GJ-CONT-2023-001', bio:'Previously active contractor suspended due to customer complaints.',               rating:4.1, reviewCount:23, totalJobs:15, adminNotes:'3 complaints received. Suspended pending investigation.', rejectionReason:'Multiple customer complaints about non-delivery.' },
];

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<ProfileStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved:  'bg-green-100  text-green-800  border-green-200',
  rejected:  'bg-red-100    text-red-800    border-red-200',
  suspended: 'bg-gray-100   text-gray-700   border-gray-200',
};

const STATUS_LABEL: Record<ProfileStatus, string> = {
  pending: '⏳ Pending', approved: '✅ Approved', rejected: '❌ Rejected', suspended: '⛔ Suspended',
};

function isSLABreach(date: Date) {
  return Date.now() - date.getTime() > 48 * 60 * 60 * 1000;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminContractorsPage() {
  const [contractors,   setContractors]  = useState<AdminContractor[]>(INITIAL_CONTRACTORS);
  const [tab,           setTab]          = useState<Tab>('pending');
  const [drawerOpen,    setDrawerOpen]   = useState(false);
  const [drawerTarget,  setDrawerTarget] = useState<AdminContractor | null>(null);
  const [rejectTarget,  setRejectTarget] = useState<AdminContractor | null>(null);
  const [rejectReason,  setRejectReason] = useState('');

  // Filters
  const [filterType,  setFilterType]  = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterCity,  setFilterCity]  = useState('');

  // Derived lists
  const counts = useMemo(() => ({
    pending:   contractors.filter(c => c.status === 'pending').length,
    approved:  contractors.filter(c => c.status === 'approved').length,
    rejected:  contractors.filter(c => c.status === 'rejected').length,
    suspended: contractors.filter(c => c.status === 'suspended').length,
    all:       contractors.length,
  }), [contractors]);

  const visible = useMemo(() => {
    return contractors
      .filter(c => tab === 'all' || c.status === tab)
      .filter(c => !filterType  || c.type === filterType)
      .filter(c => !filterSkill || c.skills.includes(filterSkill))
      .filter(c => !filterCity  || c.location.toLowerCase().includes(filterCity.toLowerCase()))
      .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }, [contractors, tab, filterType, filterSkill, filterCity]);

  // Actions
  function update(id: string, patch: Partial<AdminContractor>) {
    setContractors(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    if (drawerTarget?.id === id) setDrawerTarget(prev => prev ? { ...prev, ...patch } : null);
  }

  function approve(c: AdminContractor) {
    update(c.id, { status: 'approved', rejectionReason: undefined });
  }
  function suspend(c: AdminContractor) {
    update(c.id, { status: 'suspended' });
  }
  function toggleVerify(c: AdminContractor) {
    update(c.id, { verified: !c.verified });
  }
  function toggleFeature(c: AdminContractor) {
    update(c.id, { featured: !c.featured });
  }
  function openReject(c: AdminContractor) {
    setRejectTarget(c); setRejectReason('');
  }
  function confirmReject() {
    if (!rejectTarget) return;
    update(rejectTarget.id, { status: 'rejected', rejectionReason: rejectReason, verified: false, featured: false });
    setRejectTarget(null);
  }
  function openDrawer(c: AdminContractor) {
    setDrawerTarget(c); setDrawerOpen(true);
  }
  function saveNotes(id: string, notes: string) {
    update(id, { adminNotes: notes });
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'pending',   label: 'Pending' },
    { key: 'approved',  label: 'Approved' },
    { key: 'rejected',  label: 'Rejected' },
    { key: 'suspended', label: 'Suspended' },
    { key: 'all',       label: 'All' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>
            Contractor Approvals
          </h1>
          <p className="text-sm text-[#6B5248] mt-0.5">{counts.pending} pending review</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F0E8E2] p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.key ? 'bg-white text-[#C0593A] shadow-sm' : 'text-[#6B5248] hover:text-[#2C1810]'
            }`}>
            {t.label}
            <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
              tab === t.key ? 'bg-[#C0593A] text-white' : 'bg-[#D9C9BF] text-[#6B5248]'
            }`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="text-sm border border-[#EBE0D8] rounded-lg px-3 py-2 bg-white outline-none focus:border-[#C0593A] text-[#2C1810]">
          <option value="">All Types</option>
          <option>Labour</option>
          <option>Sub-Contractor</option>
          <option>Full Contractor</option>
        </select>
        <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
          className="text-sm border border-[#EBE0D8] rounded-lg px-3 py-2 bg-white outline-none focus:border-[#C0593A] text-[#2C1810]">
          <option value="">All Skills</option>
          {['Civil','Electrical','Plumbing','Carpentry','Painting','Mason','Helper'].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input value={filterCity} onChange={e => setFilterCity(e.target.value)}
          placeholder="Filter by city…"
          className="text-sm border border-[#EBE0D8] rounded-lg px-3 py-2 bg-white outline-none focus:border-[#C0593A] w-40" />
        {(filterType || filterSkill || filterCity) && (
          <button onClick={() => { setFilterType(''); setFilterSkill(''); setFilterCity(''); }}
            className="text-xs text-[#C0593A] hover:underline px-2">Clear filters</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EBE0D8] overflow-hidden">
        {visible.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#A08070]">No contractors in this tab.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EBE0D8] bg-[#FAEEE9]/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B5248] uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B5248] uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B5248] uppercase tracking-wide hidden sm:table-cell">Skills</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B5248] uppercase tracking-wide hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B5248] uppercase tracking-wide hidden lg:table-cell">Applied</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B5248] uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B5248] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8E2]">
                {visible.map(c => {
                  const breach = c.status === 'pending' && isSLABreach(c.appliedAt);
                  return (
                    <tr key={c.id} className={`hover:bg-[#FDF8F5] transition-colors ${breach ? 'bg-yellow-50/60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#FAEEE9] border border-[#E8C4B0] flex items-center justify-center text-xs font-bold text-[#9E3F24] flex-shrink-0">
                            {c.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#2C1810]">{c.name}</p>
                            <p className="text-xs text-[#A08070]">{c.phone}</p>
                          </div>
                          {breach && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">SLA</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-[#6B5248]">{c.type}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {c.skills.slice(0,2).map(s => (
                            <span key={s} className="text-[10px] bg-[#F5EDE8] text-[#7A3E27] px-1.5 py-0.5 rounded font-medium">{s}</span>
                          ))}
                          {c.skills.length > 2 && <span className="text-[10px] text-[#A08070]">+{c.skills.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-[#6B5248]">📍 {c.location}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-[#A08070] text-xs">{fmtDate(c.appliedAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[c.status]}`}>
                          {STATUS_LABEL[c.status]}
                        </span>
                        <div className="flex gap-2 mt-1">
                          {c.verified && <span className="text-[10px] text-blue-600">✅ Verified</span>}
                          {c.featured && <span className="text-[10px] text-yellow-600">⭐ Featured</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button onClick={() => openDrawer(c)}
                            className="text-xs border border-[#EBE0D8] text-[#6B5248] hover:text-[#C0593A] hover:border-[#C0593A] px-2 py-1 rounded-lg transition-colors">
                            View
                          </button>
                          {c.status !== 'approved' && c.status !== 'suspended' && (
                            <button onClick={() => approve(c)}
                              className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg transition-colors">
                              Approve
                            </button>
                          )}
                          {c.status !== 'rejected' && c.status !== 'pending' && (
                            <button onClick={() => openReject(c)}
                              className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg transition-colors">
                              Reject
                            </button>
                          )}
                          {c.status === 'pending' && (
                            <button onClick={() => openReject(c)}
                              className="text-xs border border-red-200 text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                              Reject
                            </button>
                          )}
                          {c.status === 'approved' && (
                            <button onClick={() => suspend(c)}
                              className="text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SIDE DRAWER ── */}
      {drawerOpen && drawerTarget && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE0D8] flex-shrink-0">
              <h2 className="text-base font-bold text-[#2C1810]">Contractor Profile</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Identity */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FAEEE9] border border-[#E8C4B0] flex items-center justify-center text-lg font-bold text-[#9E3F24]">
                  {drawerTarget.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                </div>
                <div>
                  <p className="font-bold text-[#2C1810]">{drawerTarget.name}</p>
                  <p className="text-sm text-[#6B5248]">{drawerTarget.phone}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[drawerTarget.status]}`}>
                    {STATUS_LABEL[drawerTarget.status]}
                  </span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoBox label="Type"       value={drawerTarget.type} />
                <InfoBox label="Location"   value={`📍 ${drawerTarget.location}`} />
                <InfoBox label="Experience" value={`${drawerTarget.experience} years`} />
                <InfoBox label="Applied"    value={fmtDate(drawerTarget.appliedAt)} />
                {drawerTarget.rating > 0 && <InfoBox label="Rating" value={`⭐ ${drawerTarget.rating} (${drawerTarget.reviewCount} reviews)`} />}
                {drawerTarget.totalJobs > 0 && <InfoBox label="Total Jobs" value={String(drawerTarget.totalJobs)} />}
              </div>

              {/* Skills */}
              <div>
                <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-2">Trade Skills</p>
                <div className="flex flex-wrap gap-2">
                  {drawerTarget.skills.map(s => (
                    <span key={s} className="text-xs bg-[#F5EDE8] text-[#7A3E27] px-3 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>

              {/* License */}
              {drawerTarget.licenseNumber && (
                <div>
                  <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-1">License Number</p>
                  <p className="text-sm text-[#2C1810] font-mono bg-[#F5EDE8] px-3 py-1.5 rounded-lg">{drawerTarget.licenseNumber}</p>
                </div>
              )}

              {/* Bio */}
              {drawerTarget.bio && (
                <div>
                  <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-1">Bio</p>
                  <p className="text-sm text-[#3D2B22] leading-relaxed">{drawerTarget.bio}</p>
                </div>
              )}

              {/* Portfolio placeholder */}
              <div>
                <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-2">Portfolio</p>
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="aspect-square bg-[#F0E8E2] rounded-xl flex items-center justify-center text-[#A08070] text-xs">
                      📷
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#A08070] mt-1.5">No portfolio images uploaded yet</p>
              </div>

              {/* Rejection reason */}
              {drawerTarget.status === 'rejected' && drawerTarget.rejectionReason && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-red-700 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-600">{drawerTarget.rejectionReason}</p>
                </div>
              )}

              {/* Toggles */}
              <div className="space-y-3">
                <ToggleRow
                  label="Verified Contractor"
                  sublabel="Shows ✅ Verified badge publicly"
                  checked={drawerTarget.verified}
                  onChange={() => toggleVerify(drawerTarget)}
                />
                <ToggleRow
                  label="Featured"
                  sublabel="Shows at top of listings with ⭐ Featured badge"
                  checked={drawerTarget.featured}
                  onChange={() => toggleFeature(drawerTarget)}
                />
              </div>

              {/* Admin notes */}
              <div>
                <p className="text-xs font-bold text-[#6B5248] uppercase tracking-widest mb-2">Internal Notes</p>
                <AdminNotes
                  initial={drawerTarget.adminNotes}
                  onSave={notes => saveNotes(drawerTarget.id, notes)}
                />
              </div>
            </div>

            {/* Drawer action bar */}
            <div className="px-6 py-4 border-t border-[#EBE0D8] flex gap-2 flex-shrink-0">
              {drawerTarget.status !== 'approved' && drawerTarget.status !== 'suspended' && (
                <button onClick={() => { approve(drawerTarget); }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                  ✅ Approve
                </button>
              )}
              {drawerTarget.status !== 'rejected' && (
                <button onClick={() => openReject(drawerTarget)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                  ❌ Reject
                </button>
              )}
              {drawerTarget.status === 'approved' && (
                <button onClick={() => suspend(drawerTarget)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-colors">
                  ⛔ Suspend
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── REJECT MODAL ── */}
      {rejectTarget && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#2C1810]">Reject Profile</h3>
                <p className="text-sm text-[#6B5248] mt-0.5">
                  Rejecting <strong>{rejectTarget.name}</strong>. Please provide a reason.
                </p>
              </div>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={4}
                placeholder="e.g. Incomplete profile — no verifiable experience documents provided."
                className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-sm text-[#2C1810] outline-none focus:border-[#C0593A] resize-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setRejectTarget(null)}
                  className="flex-1 border border-[#EBE0D8] text-[#6B5248] text-sm font-semibold py-2.5 rounded-xl hover:bg-[#FDF8F5] transition-colors">
                  Cancel
                </button>
                <button onClick={confirmReject} disabled={!rejectReason.trim()}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Helper sub-components ──────────────────────────────────────────────────────

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#FDF8F5] border border-[#EBE0D8] rounded-xl px-3 py-2.5">
      <p className="text-[10px] text-[#A08070] uppercase tracking-wide font-semibold mb-0.5">{label}</p>
      <p className="text-sm text-[#2C1810] font-medium">{value}</p>
    </div>
  );
}

function ToggleRow({ label, sublabel, checked, onChange }: {
  label: string; sublabel: string; checked: boolean; onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-[#FDF8F5] border border-[#EBE0D8] rounded-xl px-4 py-3">
      <div>
        <p className="text-sm font-medium text-[#2C1810]">{label}</p>
        <p className="text-xs text-[#A08070]">{sublabel}</p>
      </div>
      <button type="button" onClick={onChange}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-3 ${checked ? 'bg-[#C0593A]' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

function AdminNotes({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(initial);
  const [saved, setSaved] = useState(false);

  function save() {
    onSave(val);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-2">
      <textarea value={val} onChange={e => { setVal(e.target.value); setSaved(false); }} rows={3}
        placeholder="Internal admin notes (not visible to contractor)…"
        className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-sm text-[#2C1810] outline-none focus:border-[#C0593A] resize-none" />
      <button onClick={save}
        className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-colors ${
          saved ? 'bg-green-100 text-green-700' : 'bg-[#C0593A] text-white hover:bg-[#9E3F24]'
        }`}>
        {saved ? '✓ Saved' : 'Save Notes'}
      </button>
    </div>
  );
}
