'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  fetchAdminUserDetail, createAdminPortfolioItem, createAdminServiceItem,
  fetchAdminUserBookings, fetchAdminUserReviews, updateAdminUserProfile,
  createAdminReview, updateAdminReview, deleteAdminReview, startImpersonation,
  PROFILE_TYPE_TO_REVIEW_TARGET_TYPE, REVIEW_SOURCES,
  type AdminUserDetail, type AdminProviderBooking, type AdminProviderReview, type AdminUser,
} from '@/lib/admin';
import { SkeletonListRows } from '@/components/Skeleton';
import { useAuth } from '@/lib/auth-provider';
import { beginImpersonation } from '@/lib/impersonation';

const PRICE_UNITS = ['FIXED', 'PER_HOUR', 'PER_DAY', 'PER_POINT', 'PER_SQFT', 'PER_VISIT'] as const;
type PriceUnit = typeof PRICE_UNITS[number];

// Mirrors AdminService.PROFILE_FIELDS_BY_TYPE on the backend — only real
// columns on each profile type's Prisma model, nothing invented.
type FieldType = 'text' | 'textarea' | 'number' | 'array' | 'boolean';
interface FieldConfig { key: string; label: string; type: FieldType; }

const PROFILE_FIELD_CONFIG: Record<string, FieldConfig[]> = {
  contractor: [
    { key: 'contractorType', label: 'Contractor Type', type: 'text' },
    { key: 'tradeSkills', label: 'Trade Skills (comma-separated)', type: 'array' },
    { key: 'experience', label: 'Experience', type: 'text' },
    { key: 'serviceCities', label: 'Service Cities (comma-separated)', type: 'array' },
    { key: 'licenseNumber', label: 'License Number', type: 'text' },
    { key: 'dailyRate', label: 'Daily Rate (₹)', type: 'number' },
    { key: 'projectRate', label: 'Project Rate (₹)', type: 'number' },
    { key: 'bio', label: 'Bio', type: 'textarea' },
    { key: 'isAvailable', label: 'Available for work', type: 'boolean' },
  ],
  labour: [
    { key: 'skillType', label: 'Skill Type', type: 'text' },
    { key: 'experience', label: 'Experience', type: 'text' },
    { key: 'serviceCities', label: 'Service Cities (comma-separated)', type: 'array' },
    { key: 'dailyRate', label: 'Daily Rate (₹)', type: 'number' },
    { key: 'bio', label: 'Bio', type: 'textarea' },
    { key: 'isAvailable', label: 'Available for work', type: 'boolean' },
  ],
  'service-expert': [
    { key: 'expertiseType', label: 'Expertise Type', type: 'text' },
    { key: 'qualifications', label: 'Qualifications (comma-separated)', type: 'array' },
    { key: 'experience', label: 'Experience', type: 'text' },
    { key: 'serviceCities', label: 'Service Cities (comma-separated)', type: 'array' },
    { key: 'consultationFee', label: 'Consultation Fee (₹)', type: 'number' },
    { key: 'bio', label: 'Bio', type: 'textarea' },
    { key: 'isAvailable', label: 'Available for work', type: 'boolean' },
  ],
  'material-supplier': [
    { key: 'businessName', label: 'Business Name', type: 'text' },
    { key: 'gstNumber', label: 'GST Number', type: 'text' },
    { key: 'businessAddress', label: 'Business Address', type: 'textarea' },
    { key: 'deliveryCities', label: 'Delivery Cities (comma-separated)', type: 'array' },
    { key: 'isAvailable', label: 'Currently supplying', type: 'boolean' },
  ],
  'land-owner': [
    { key: 'bio', label: 'Bio', type: 'textarea' },
    { key: 'isAvailable', label: 'Available', type: 'boolean' },
    { key: 'govtIdVerified', label: 'Govt ID Verified', type: 'boolean' },
  ],
  'property-seller': [
    { key: 'bio', label: 'Bio', type: 'textarea' },
    { key: 'isAvailable', label: 'Available', type: 'boolean' },
    { key: 'govtIdVerified', label: 'Govt ID Verified', type: 'boolean' },
  ],
  builder: [
    { key: 'companyName', label: 'Company Name', type: 'text' },
    { key: 'registrationNumber', label: 'Registration Number', type: 'text' },
    { key: 'specializations', label: 'Specializations (comma-separated)', type: 'array' },
    { key: 'serviceCities', label: 'Service Cities (comma-separated)', type: 'array' },
    { key: 'bio', label: 'Bio', type: 'textarea' },
    { key: 'isAvailable', label: 'Available', type: 'boolean' },
  ],
  'property-agent': [
    { key: 'agencyName', label: 'Agency Name', type: 'text' },
    { key: 'licenseNumber', label: 'License Number', type: 'text' },
    { key: 'serviceCities', label: 'Service Cities (comma-separated)', type: 'array' },
    { key: 'bio', label: 'Bio', type: 'textarea' },
    { key: 'isAvailable', label: 'Available', type: 'boolean' },
  ],
};

// Keyed by LabourProfile.skillType / ServiceExpertProfile.expertiseType (see
// featureFlags.ts's labour/service_experts subcategories — these are the
// real values used in this app, not a separate role). Lets the admin add a
// realistic set of services in a couple of taps instead of typing every
// field by hand for each one.
const QUICK_ADD_SERVICES: Record<string, { name: string; category: string; unit: PriceUnit }[]> = {
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
};

type Tab = 'profile' | 'listings' | 'bookings' | 'reviews';
const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'listings', label: 'Services & Portfolio' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'reviews', label: 'Reviews' },
];

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { me } = useAuth();
  const isSuperAdmin = me?.adminRole === 'SUPER_ADMIN';

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('profile');
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [reviewSlideOver, setReviewSlideOver] = useState<{ mode: 'create' } | { mode: 'edit'; review: AdminProviderReview } | null>(null);
  const [showImpersonateConfirm, setShowImpersonateConfirm] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [impersonateError, setImpersonateError] = useState('');

  const [bookings, setBookings] = useState<AdminProviderBooking[] | null>(null);
  const [reviews, setReviews] = useState<AdminProviderReview[] | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAdminUserDetail(userId)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(load, [load]);

  // Lazy-load each tab's data only once, the first time it's opened.
  useEffect(() => {
    if (tab === 'bookings' && bookings === null) {
      fetchAdminUserBookings(userId).then(setBookings).catch(() => setBookings([]));
    }
    if (tab === 'reviews' && reviews === null) {
      fetchAdminUserReviews(userId).then(setReviews).catch(() => setReviews([]));
    }
  }, [tab, userId, bookings, reviews]);

  if (loading) {
    return (
      <div className="max-w-3xl">
        <SkeletonListRows count={4} />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
        <p className="text-[#2C1810] font-semibold mb-2">Could not load this user.</p>
        <p className="text-sm text-[#6B5248]">{error}</p>
      </div>
    );
  }

  const { user, profileType, profile, portfolio, services } = detail;
  const canHavePortfolio = profileType === 'contractor' || profileType === 'labour' || profileType === 'service-expert';
  const canHaveServices = profileType === 'labour' || profileType === 'service-expert';
  const skillKey = (profile?.skillType ?? profile?.expertiseType) as string | undefined;
  const quickAdd = skillKey ? QUICK_ADD_SERVICES[skillKey.toLowerCase().replace(/\s+/g, '_')] : undefined;
  const canImpersonate = isSuperAdmin && user.id !== me?.id && user.adminRole !== 'SUPER_ADMIN';

  async function handleImpersonate() {
    setImpersonating(true);
    setImpersonateError('');
    try {
      const { impersonationToken, targetUser } = await startImpersonation(user.id);
      beginImpersonation(impersonationToken, { id: targetUser.id, name: targetUser.name, role: targetUser.role });
      router.push('/dashboard/home');
    } catch (e) {
      setImpersonateError(e instanceof Error ? e.message : 'Failed to start impersonation');
      setImpersonating(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/users" className="text-sm text-[#A08070] hover:text-[#C0593A] inline-block">
        ← Back to Users
      </Link>

      <div className="bg-[#F3E8FF] border border-[#E4CCFF] rounded-xl px-4 py-2.5 text-sm text-[#6B2FB3] font-medium flex items-center justify-between gap-3 flex-wrap">
        <span>⚙️ Managing on behalf of {user.name}</span>
        {canImpersonate && (
          <button
            onClick={() => setShowImpersonateConfirm(true)}
            className="text-xs font-semibold bg-white border border-[#E4CCFF] text-[#6B2FB3] px-3 py-1.5 rounded-lg hover:bg-[#F3E8FF]"
          >
            👁️ Act as User
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-[#2C1810]">#{user.userNumber} · {user.name}</h1>
            <p className="text-sm text-[#6B5248] mt-1">{user.email}{user.phone ? ` · ${user.phone}` : ''}</p>
            <p className="text-xs text-[#A08070] mt-1">
              {user.role}{user.city ? ` · ${user.city}${user.state ? `, ${user.state}` : ''}` : ''}
            </p>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${user.isSuspended ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
            {user.isSuspended ? 'Suspended' : 'Active'}
          </span>
        </div>
      </div>

      {showImpersonateConfirm && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => !impersonating && setShowImpersonateConfirm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
              <p className="text-sm text-[#2C1810]">
                You are about to view Griffy as <span className="font-semibold">{user.name}</span> ({user.role}).
                Your admin session will be preserved. All actions you take will be logged.
              </p>
              {impersonateError && <p className="text-xs text-red-600 mt-3">{impersonateError}</p>}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowImpersonateConfirm(false)}
                  disabled={impersonating}
                  className="flex-1 text-sm font-semibold text-[#6B5248] border border-[#EBE0D8] px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImpersonate}
                  disabled={impersonating}
                  className="flex-1 text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white px-4 py-2 rounded-lg"
                >
                  {impersonating ? 'Starting…' : `Confirm — View as ${user.name}`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-1 border-b border-[#EBE0D8]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-[#C0593A] text-[#C0593A]' : 'border-transparent text-[#A08070] hover:text-[#6B5248]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <ProfileEditForm
          userId={userId}
          user={user}
          profileType={profileType}
          profile={profile}
          onSaved={load}
        />
      )}

      {tab === 'listings' && (
        <>
          {canHavePortfolio && (
            <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#2C1810]">Portfolio</h2>
                <button
                  onClick={() => setShowAddPortfolio((s) => !s)}
                  className="text-sm font-semibold text-[#C0593A] border border-[#C0593A] px-3 py-1.5 rounded-lg hover:bg-[#FAEEE9]"
                >
                  {showAddPortfolio ? 'Cancel' : '+ Add Portfolio Item'}
                </button>
              </div>

              {showAddPortfolio && (
                <AddPortfolioForm
                  userId={userId}
                  profileType={profileType as 'contractor' | 'labour' | 'service-expert'}
                  onCreated={() => { setShowAddPortfolio(false); load(); }}
                />
              )}

              {portfolio.length === 0 ? (
                <p className="text-sm text-[#A08070]">No portfolio items yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map((p) => (
                    <div key={p.id} className="border border-[#EBE0D8] rounded-xl overflow-hidden">
                      {p.imageUrls[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrls[0]} alt={p.title} className="w-full h-24 object-cover" />
                      )}
                      <div className="p-2">
                        <p className="text-xs font-semibold text-[#2C1810] truncate">{p.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {canHaveServices && (
            <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#2C1810]">Services & Rates</h2>
                <button
                  onClick={() => setShowAddService(true)}
                  className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-3 py-1.5 rounded-lg"
                >
                  + Add Service
                </button>
              </div>

              {services.length === 0 ? (
                <p className="text-sm text-[#A08070]">No services listed yet.</p>
              ) : (
                <div className="space-y-2">
                  {services.map((s) => (
                    <div key={s.id} className="flex items-center justify-between border border-[#EBE0D8] rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-[#2C1810]">{s.name}</p>
                        <p className="text-xs text-[#A08070]">{s.category}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#C0593A]">₹{s.price} <span className="text-xs text-[#A08070] font-normal">{s.priceUnit.replace('_', ' ').toLowerCase()}</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
          {bookings === null ? (
            <SkeletonListRows count={3} />
          ) : bookings.length === 0 ? (
            <p className="text-sm text-[#A08070]">No bookings yet.</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between border border-[#EBE0D8] rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#2C1810]">{b.customer?.name ?? 'Customer'}</p>
                    <p className="text-xs text-[#A08070]">{new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#2C1810]">₹{Number(b.amount).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-[#A08070]">{b.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#2C1810]">Reviews</h2>
            {profileType && PROFILE_TYPE_TO_REVIEW_TARGET_TYPE[profileType] && profile && (
              <button
                onClick={() => setReviewSlideOver({ mode: 'create' })}
                className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-3 py-1.5 rounded-lg"
              >
                + Add Review
              </button>
            )}
          </div>

          {reviews === null ? (
            <SkeletonListRows count={3} />
          ) : reviews.length === 0 ? (
            <p className="text-sm text-[#A08070]">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="border border-[#EBE0D8] rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#2C1810]">{r.reviewer?.name ?? r.reviewerName ?? 'Anonymous'}</p>
                    <p className="text-sm font-semibold text-[#C0593A]">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                  </div>
                  {r.comment && <p className="text-sm text-[#6B5248] mt-1">{r.comment}</p>}
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[#A08070]">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      {r.isAdminAdded && (
                        <span className="text-[10px] font-semibold text-[#9E3F24] bg-[#FAEEE9] px-1.5 py-0.5 rounded">✓ Verified by Griffy team</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setReviewSlideOver({ mode: 'edit', review: r })} className="text-xs font-semibold text-[#6B5248] hover:text-[#C0593A]">Edit</button>
                      <DeleteReviewButton id={r.id} onDeleted={() => setReviews((prev) => (prev ?? []).filter((x) => x.id !== r.id))} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {reviewSlideOver && profileType && profile && (
        <ReviewSlideOver
          state={reviewSlideOver}
          targetType={PROFILE_TYPE_TO_REVIEW_TARGET_TYPE[profileType]!}
          targetId={profile.id as string}
          onClose={() => setReviewSlideOver(null)}
          onSaved={(saved) => {
            setReviews((prev) => {
              if (!prev) return [saved];
              const idx = prev.findIndex((x) => x.id === saved.id);
              if (idx === -1) return [saved, ...prev];
              const next = [...prev];
              next[idx] = saved;
              return next;
            });
            setReviewSlideOver(null);
          }}
        />
      )}

      {showAddService && canHaveServices && (
        <ServiceSlideOver
          userId={userId}
          profileType={profileType as 'labour' | 'service-expert'}
          quickAdd={quickAdd}
          onClose={() => setShowAddService(false)}
          onCreated={() => load()}
        />
      )}
    </div>
  );
}

function AddPortfolioForm({
  userId, profileType, onCreated,
}: { userId: string; profileType: 'contractor' | 'labour' | 'service-expert'; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) { setError('Title and at least one image URL are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await createAdminPortfolioItem(userId, {
        profileType, title: title.trim(), description: description.trim() || undefined, imageUrls: [imageUrl.trim()],
      });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add portfolio item');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAEEE9] rounded-xl p-4 mb-4 space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
        className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)"
        className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
      <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL"
        className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={saving}
        className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white px-4 py-2 rounded-lg">
        {saving ? 'Saving…' : 'Add Item'}
      </button>
    </form>
  );
}

// Slides in from the right with the main page still visible/scrollable
// behind it, and — unlike the old inline form — stays open after a
// successful add so the admin can add several services back to back
// without re-opening anything.
function ServiceSlideOver({
  userId, profileType, quickAdd, onClose, onCreated,
}: {
  userId: string;
  profileType: 'labour' | 'service-expert';
  quickAdd?: { name: string; category: string; unit: PriceUnit }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState<PriceUnit>('FIXED');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [justAdded, setJustAdded] = useState('');

  function applyChip(chip: { name: string; category: string; unit: PriceUnit }) {
    setName(chip.name);
    setCategory(chip.category);
    setPriceUnit(chip.unit);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceNum = Number(price);
    if (!name.trim() || !category.trim() || !priceNum || priceNum <= 0) {
      setError('Name, category, and a price greater than 0 are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createAdminServiceItem(userId, {
        profileType, name: name.trim(), category: category.trim(),
        description: description.trim() || undefined, price: priceNum, priceUnit,
      });
      setJustAdded(name.trim());
      setName(''); setCategory(''); setDescription(''); setPrice(''); setPriceUnit('FIXED');
      onCreated();
      setTimeout(() => setJustAdded(''), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add service');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBE0D8] sticky top-0 bg-white">
          <h2 className="font-semibold text-[#2C1810]">Add Service</h2>
          <button onClick={onClose} className="text-[#A08070] hover:text-[#C0593A] text-xl leading-none">✕</button>
        </div>

        <div className="p-5 space-y-5">
          {quickAdd && quickAdd.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide mb-2">Quick add — tap to fill, then set the price</p>
              <div className="flex flex-wrap gap-2">
                {quickAdd.map((chip) => (
                  <button
                    key={chip.name}
                    onClick={() => applyChip(chip)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      name === chip.name ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-[#FAEEE9] text-[#9E3F24] border-[#EBE0D8] hover:border-[#C0593A]'
                    }`}
                  >
                    {chip.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name (e.g. Wiring installation)"
              className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. Electrical)"
              className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" maxLength={100}
              className="w-full text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
            <div className="flex gap-2">
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="1" placeholder="Price (₹)"
                className="flex-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
              <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value as PriceUnit)}
                className="text-sm border border-[#EBE0D8] rounded-lg px-3 py-2">
                {PRICE_UNITS.map((u) => <option key={u} value={u}>{u.replace('_', ' ')}</option>)}
              </select>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            {justAdded && <p className="text-xs text-green-700">✓ Added &ldquo;{justAdded}&rdquo; — add another or close when done.</p>}
            <button type="submit" disabled={saving}
              className="w-full text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white px-4 py-2.5 rounded-lg">
              {saving ? 'Saving…' : 'Add Service'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// Two independently-saveable sections rather than one giant form: Basic Info
// (User-level, every role has it) and Professional Details (profile-type-
// specific, absent for HOMEOWNER). Each section tracks its own edit state so
// saving one doesn't require touching the other's fields.
function ProfileEditForm({
  userId, user, profileType, profile, onSaved,
}: {
  userId: string;
  user: AdminUser;
  profileType: string | null;
  profile: Record<string, unknown> | null;
  onSaved: () => void;
}) {
  const fields = profileType ? (PROFILE_FIELD_CONFIG[profileType] ?? []) : [];

  return (
    <div className="space-y-6">
      <BasicInfoSection userId={userId} user={user} onSaved={onSaved} />
      {profileType && !profile && (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
          <p className="text-sm text-[#A08070]">No {profileType} profile found for this user yet.</p>
        </div>
      )}
      {profileType && profile && fields.length > 0 && (
        <ProfessionalDetailsSection userId={userId} profile={profile} fields={fields} onSaved={onSaved} />
      )}
    </div>
  );
}

function arrayToText(value: unknown): string {
  return Array.isArray(value) ? value.join(', ') : '';
}

function textToArray(value: string): string[] {
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function BasicInfoSection({ userId, user, onSaved }: { userId: string; user: AdminUser; onSaved: () => void }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [city, setCity] = useState(user.city ?? '');
  const [state, setState] = useState(user.state ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateAdminUserProfile(userId, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
      });
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
      <h2 className="font-semibold text-[#2C1810] mb-4">Basic Info</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full mt-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)}
            className="w-full mt-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">State</label>
          <input value={state} onChange={(e) => setState(e.target.value)}
            className="w-full mt-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
      {saved && <p className="text-xs text-green-700 mt-3">✓ Saved</p>}
      <button type="submit" disabled={saving}
        className="mt-4 text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white px-4 py-2 rounded-lg">
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}

function ProfessionalDetailsSection({
  userId, profile, fields, onSaved,
}: { userId: string; profile: Record<string, unknown>; fields: FieldConfig[]; onSaved: () => void }) {
  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const init: Record<string, string | boolean> = {};
    for (const f of fields) {
      const raw = profile[f.key];
      if (f.type === 'boolean') init[f.key] = Boolean(raw);
      else if (f.type === 'array') init[f.key] = arrayToText(raw);
      else init[f.key] = raw === null || raw === undefined ? '' : String(raw);
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function setValue(key: string, value: string | boolean) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const patch: Record<string, unknown> = {};
      for (const f of fields) {
        const raw = values[f.key];
        if (f.type === 'boolean') patch[f.key] = Boolean(raw);
        else if (f.type === 'array') patch[f.key] = textToArray(String(raw));
        else if (f.type === 'number') patch[f.key] = raw === '' ? undefined : Number(raw);
        else patch[f.key] = String(raw).trim() || undefined;
      }
      await updateAdminUserProfile(userId, patch);
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
      <h2 className="font-semibold text-[#2C1810] mb-4">Professional Details</h2>
      <div className="grid grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className={f.type === 'textarea' ? 'col-span-2' : ''}>
            <label className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">{f.label}</label>
            {f.type === 'boolean' ? (
              <div className="mt-1.5">
                <input type="checkbox" checked={Boolean(values[f.key])}
                  onChange={(e) => setValue(f.key, e.target.checked)} className="w-4 h-4" />
              </div>
            ) : f.type === 'textarea' ? (
              <textarea value={String(values[f.key] ?? '')} onChange={(e) => setValue(f.key, e.target.value)}
                rows={3} className="w-full mt-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={String(values[f.key] ?? '')}
                onChange={(e) => setValue(f.key, e.target.value)}
                className="w-full mt-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2"
              />
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
      {saved && <p className="text-xs text-green-700 mt-3">✓ Saved</p>}
      <button type="submit" disabled={saving}
        className="mt-4 text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white px-4 py-2 rounded-lg">
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}

// Two-step inline confirm instead of window.confirm() -- a native confirm()
// blocks all further page script until dismissed, which is exactly the kind
// of dialog browser-automation testing can't safely drive through.
function DeleteReviewButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await deleteAdminReview(id);
      onDeleted();
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-xs text-[#6B5248]">Delete this review?</span>
        <button onClick={handleConfirm} disabled={deleting} className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50">
          {deleting ? 'Deleting…' : 'Yes'}
        </button>
        <button onClick={() => setConfirming(false)} disabled={deleting} className="text-xs font-semibold text-[#A08070] hover:underline">No</button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
  );
}

type ReviewSlideOverState = { mode: 'create' } | { mode: 'edit'; review: AdminProviderReview };

// Same form for adding a brand-new offline review and editing an existing
// one — reviewer name/phone/source only apply to admin-added rows (a real
// customer's own review keeps its own reviewer identity), so those fields
// are hidden when editing a non-admin-added review.
function ReviewSlideOver({
  state, targetType, targetId, onClose, onSaved,
}: {
  state: ReviewSlideOverState;
  targetType: string;
  targetId: string;
  onClose: () => void;
  onSaved: (review: AdminProviderReview) => void;
}) {
  const editing = state.mode === 'edit' ? state.review : null;
  const isAdminAddedOrNew = editing ? editing.isAdminAdded : true;

  const [rating, setRating] = useState(editing?.rating ?? 5);
  const [comment, setComment] = useState(editing?.comment ?? '');
  const [reviewerName, setReviewerName] = useState(editing?.reviewerName ?? '');
  const [reviewerPhone, setReviewerPhone] = useState('');
  const [source, setSource] = useState(editing?.source ?? 'phone_feedback');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (comment.trim().length < 20) {
      setError('Review text must be at least 20 characters.');
      return;
    }
    if (isAdminAddedOrNew && !reviewerName.trim()) {
      setError('Reviewer name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (state.mode === 'create') {
        const saved = await createAdminReview({
          targetType, targetId, rating, comment: comment.trim(),
          reviewerName: reviewerName.trim(), reviewerPhone: reviewerPhone.trim() || undefined, source,
        });
        onSaved(saved);
      } else {
        const saved = await updateAdminReview(state.review.id, {
          rating, comment: comment.trim(),
          ...(isAdminAddedOrNew ? { reviewerName: reviewerName.trim(), source } : {}),
        });
        onSaved(saved);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save review');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBE0D8] sticky top-0 bg-white">
          <h2 className="font-semibold text-[#2C1810]">{state.mode === 'create' ? 'Add Review' : 'Edit Review'}</h2>
          <button onClick={onClose} className="text-[#A08070] hover:text-[#C0593A] text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">Rating</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  className={`text-2xl leading-none ${n <= rating ? 'text-[#C0593A]' : 'text-[#E4D5CC]'}`}>
                  ★
                </button>
              ))}
            </div>
          </div>

          {isAdminAddedOrNew && (
            <div>
              <label className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">Reviewer Name</label>
              <input value={reviewerName} onChange={(e) => setReviewerName(e.target.value)}
                className="w-full mt-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">Review Text (min 20 chars)</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} maxLength={500}
              className="w-full mt-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
          </div>

          {isAdminAddedOrNew && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">Source</label>
                <select value={source ?? 'phone_feedback'} onChange={(e) => setSource(e.target.value)}
                  className="w-full mt-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2">
                  {REVIEW_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              {state.mode === 'create' && (
                <div>
                  <label className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">Reviewer Phone (optional, not displayed)</label>
                  <input value={reviewerPhone} onChange={(e) => setReviewerPhone(e.target.value)}
                    className="w-full mt-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2" />
                </div>
              )}
            </>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white px-4 py-2.5 rounded-lg">
            {saving ? 'Saving…' : state.mode === 'create' ? 'Add Review' : 'Save Changes'}
          </button>
        </form>
      </div>
    </>
  );
}
