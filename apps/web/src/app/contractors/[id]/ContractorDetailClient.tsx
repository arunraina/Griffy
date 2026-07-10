'use client';

import { useState } from 'react';
import Link from 'next/link';
import BookingModal from '@/components/BookingModal';
import Avatar from '@/components/Avatar';
import PortfolioGallery from '@/components/PortfolioGallery';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { name: string; avatarUrl: string | null };
}

interface ContractorProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  contractorType: string;
  tradeSkills: string[];
  serviceCities: string[];
  experience: string;
  dailyRate: number | null;
  projectRate: number | null;
  availability: boolean;
  bio: string | null;
  govtIdVerified: boolean;
  avgRating: number;
  totalReviews: number;
  createdAt: string;
}

interface Props {
  profile: ContractorProfile;
  reviews: Review[];
}

export default function ContractorDetailClient({ profile: p, reviews }: Props) {
  const [bioExpanded,    setBioExpanded]    = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [modalOpen,      setModalOpen]      = useState(false);

  const bio        = p.bio ?? '';
  const bioShort   = bio.slice(0, 180);
  const bioNeedsTruncate = bio.length > 180;
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const joinedYear = new Date(p.createdAt).getFullYear();
  const rate       = p.projectRate ?? p.dailyRate;

  const ratingBreakdown = reviews.reduce<Record<number, number>>(
    (acc, r) => { acc[r.rating] = (acc[r.rating] ?? 0) + 1; return acc; },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  );
  const totalForPct = reviews.length || 1;

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#A08070] mb-6">
          <Link href="/" className="hover:text-[#C0593A]">Home</Link>
          <span>›</span>
          <Link href="/contractors" className="hover:text-[#C0593A]">Contractors</Link>
          <span>›</span>
          <span className="text-[#2C1810] font-medium">{p.name}</span>
        </div>

        <div className="flex gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Cover + Avatar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#C0593A]/10 to-transparent" />
              </div>
              <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-10 mb-4">
                  <div className="relative">
                    <Avatar name={p.name} avatarUrl={p.avatarUrl} size="lg" className="border-4 border-white shadow-md" />
                    {p.availability && (
                      <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 pb-1">
                    {p.govtIdVerified && (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-semibold">
                        ✅ Verified
                      </span>
                    )}
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>{p.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs bg-[#FAEEE9] text-[#C0593A] border border-[#E8C4B0] px-3 py-1 rounded-full font-semibold">{p.contractorType}</span>
                  {p.availability
                    ? <span className="text-xs text-green-600 font-medium">🟢 Available</span>
                    : <span className="text-xs text-gray-400 font-medium">🔴 Unavailable</span>
                  }
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-[#6B5248]">
                  {p.avgRating > 0 && (
                    <a href="#reviews" className="flex items-center gap-1 hover:text-[#C0593A]">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold text-[#2C1810]">{p.avgRating.toFixed(1)}</span>
                      <span>({p.totalReviews} reviews)</span>
                    </a>
                  )}
                  {p.serviceCities[0] && <span>📍 {p.serviceCities[0]}</span>}
                  <span>📅 Since {joinedYear}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: p.totalReviews > 0 ? `${p.avgRating.toFixed(1)}★` : '—', label: 'Average Rating', icon: '⭐' },
                { value: String(p.totalReviews),                                    label: 'Reviews',        icon: '💬' },
                { value: p.experience || '—',                                       label: 'Experience',     icon: '📅' },
                { value: p.availability ? 'Yes' : 'No',                            label: 'Available Now',  icon: '🟢' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="text-xl font-bold text-[#C0593A]">{s.value}</p>
                  <p className="text-xs text-[#A08070] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* About */}
            {bio && (
              <Section title="About">
                <p className="text-sm text-[#6B5248] leading-relaxed">
                  {bioNeedsTruncate && !bioExpanded ? `${bioShort}…` : bio}
                </p>
                {bioNeedsTruncate && (
                  <button onClick={() => setBioExpanded(v => !v)} className="text-sm text-[#C0593A] hover:underline font-medium mt-2">
                    {bioExpanded ? 'Read less ▲' : 'Read more ▼'}
                  </button>
                )}
              </Section>
            )}

            {/* Skills */}
            {p.tradeSkills.length > 0 && (
              <Section title="Skills &amp; Expertise">
                <div className="flex flex-wrap gap-2">
                  {p.tradeSkills.map(s => (
                    <span key={s} className="text-sm bg-[#FAEEE9] text-[#C0593A] border border-[#E8C4B0] px-3 py-1.5 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Service Areas */}
            {p.serviceCities.length > 0 && (
              <Section title="Service Areas">
                <div className="flex flex-wrap gap-2">
                  {p.serviceCities.map(c => (
                    <span key={c} className="text-sm bg-white border border-[#EBE0D8] text-[#3D2B22] px-3 py-1.5 rounded-full font-medium">📍 {c}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Portfolio */}
            <Section title="Portfolio">
              <PortfolioGallery profileType="contractor" profileId={p.id} />
            </Section>

            {/* Reviews */}
            <Section title={`Reviews (${p.totalReviews})`} id="reviews">
              {reviews.length === 0 ? (
                <p className="text-sm text-[#A08070]">No reviews yet.</p>
              ) : (
                <>
                  <div className="flex gap-8 items-start mb-6">
                    <div className="text-center flex-shrink-0">
                      <p className="text-5xl font-bold text-[#C0593A]">{p.avgRating.toFixed(1)}</p>
                      <p className="text-yellow-500 text-lg mt-1">{'★'.repeat(Math.round(p.avgRating))}</p>
                      <p className="text-xs text-[#A08070] mt-1">{p.totalReviews} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {([5, 4, 3, 2, 1] as const).map(star => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-[#6B5248] w-4 text-right">{star}★</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-[#C0593A] h-full rounded-full"
                              style={{ width: `${Math.round((ratingBreakdown[star] / totalForPct) * 100)}%` }} />
                          </div>
                          <span className="text-xs text-[#A08070] w-7">{ratingBreakdown[star]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {visibleReviews.map(r => {
                      const rInitials = r.reviewer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                      const rDate = new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                      return (
                        <div key={r.id} className="border border-[#EBE0D8] rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-[#FAEEE9] text-[#C0593A] text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {rInitials}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-[#2C1810]">{r.reviewer.name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-yellow-500 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                                <span className="text-xs text-[#A08070]">{rDate}</span>
                              </div>
                            </div>
                          </div>
                          {r.comment && <p className="text-sm text-[#6B5248] leading-relaxed">{r.comment}</p>}
                        </div>
                      );
                    })}
                  </div>
                  {reviews.length > 3 && (
                    <button onClick={() => setShowAllReviews(v => !v)}
                      className="mt-4 w-full py-2.5 text-sm font-semibold border border-[#EBE0D8] text-[#C0593A] rounded-xl hover:bg-[#FAEEE9] transition-colors">
                      {showAllReviews ? 'Show less ▲' : `Load more reviews (${reviews.length - 3} more) ▼`}
                    </button>
                  )}
                </>
              )}
            </Section>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={p.name} avatarUrl={p.avatarUrl} size="md" />
                <div>
                  <p className="text-sm font-bold text-[#2C1810]">{p.name}</p>
                  <p className="text-xs text-[#A08070]">{p.contractorType}</p>
                </div>
              </div>

              <div>
                {rate && rate > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-[#C0593A]">₹{rate.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-[#A08070]">{p.projectRate ? 'per project onwards' : 'per day'} (negotiable)</p>
                  </>
                ) : (
                  <p className="text-base font-semibold text-[#6B5248]">Rate on request</p>
                )}
              </div>

              {p.availability ? (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  <span>🟢</span><span className="font-medium">Available for new projects</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <span>🔴</span><span className="font-medium">Currently unavailable</span>
                </div>
              )}

              <button onClick={() => setModalOpen(true)}
                className="w-full bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                Request Quote
              </button>
              <button className="w-full border-2 border-[#C0593A] text-[#C0593A] hover:bg-[#FAEEE9] font-semibold py-3 rounded-xl transition-colors text-sm">
                Send Message
              </button>

              <div className="border-t border-[#F0E8E2] pt-4 space-y-2.5">
                {[
                  { icon: '📍', text: p.serviceCities[0] ?? 'Multiple cities' },
                  { icon: '🏗️', text: `${p.experience} experience` },
                  ...(p.avgRating > 0 ? [{ icon: '⭐', text: `${p.avgRating.toFixed(1)} rating (${p.totalReviews} reviews)` }] : []),
                  ...(p.govtIdVerified ? [{ icon: '✅', text: 'Govt ID Verified' }] : []),
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2 text-sm text-[#6B5248]">
                    <span>{item.icon}</span><span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button className="flex-1 text-xs border border-[#EBE0D8] text-[#6B5248] hover:border-[#C0593A] hover:text-[#C0593A] py-2 rounded-lg transition-colors">
                  🔗 Share Profile
                </button>
                <button className="flex-1 text-xs border border-[#EBE0D8] text-gray-400 hover:text-red-500 hover:border-red-200 py-2 rounded-lg transition-colors">
                  ⚑ Report
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile fixed bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBE0D8] px-4 py-3 flex gap-3 z-30 shadow-lg">
          <div className="flex-1">
            <p className="text-xs text-[#A08070]">Starting from</p>
            <p className="text-base font-bold text-[#C0593A]">
              {rate && rate > 0 ? `₹${rate.toLocaleString('en-IN')}/${p.projectRate ? 'project' : 'day'}` : 'Rate on request'}
            </p>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
            Request Quote
          </button>
        </div>

      </div>

      <BookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        providerName={p.name}
        providerId={p.userId}
        providerRole="CONTRACTOR"
        ctaLabel="Send Request"
      />
    </div>
  );
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>{title}</h2>
      {children}
    </div>
  );
}
