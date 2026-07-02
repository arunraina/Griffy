'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Mock data ─────────────────────────────────────────────────────────────────

const CONTRACTOR = {
  id: '1',
  name: 'Mohd Ashfaq Mir',
  initials: 'MA',
  type: 'Civil Contractor',
  location: 'Srinagar, Kashmir',
  rating: 4.8,
  reviewCount: 124,
  experience: 8,
  projects: 47,
  completionRate: 98,
  responseTime: '2 hours',
  rate: 15000,
  verified: true,
  featured: true,
  active: true,
  joinedDate: 'March 2024',
  bio: 'With over 8 years of experience in civil construction across Kashmir, I specialize in residential and commercial projects. I have completed 47+ projects with a 98% client satisfaction rate. My team of skilled professionals ensures quality work delivered on time and within budget. We work with premium materials and follow all safety standards. Our expertise spans from foundation to finishing, making us your one-stop solution for all construction needs.',
  services: ['New Construction', 'Renovation', 'Interior Work', 'Commercial Projects', 'Residential', 'Project Management'],
  skills: ['Civil Work', 'RCC Construction', 'Brickwork', 'Plastering', 'Waterproofing', 'Tiling'],
  serviceAreas: ['Srinagar', 'Baramulla', 'Anantnag', 'Gulmarg', 'Sopore', 'Pulwama'],
  portfolio: [
    { id: 1, name: 'Residential Villa, Nishat',     year: '2023' },
    { id: 2, name: 'Commercial Complex, Lal Chowk', year: '2023' },
    { id: 3, name: 'Hotel Renovation, Gulmarg',     year: '2022' },
    { id: 4, name: '3BHK Apartment, Rajbagh',       year: '2022' },
    { id: 5, name: 'School Building, Baramulla',    year: '2021' },
    { id: 6, name: 'Office Interior, Sopore',       year: '2021' },
  ],
  ratingBreakdown: { 5: 78, 4: 15, 3: 5, 2: 1, 1: 1 },
  reviews: [
    { id: 1, name: 'Riyaz Ahmed',      initials: 'RA', rating: 5, date: 'Dec 2023', text: 'Excellent work on my house in Baramulla. Team was professional and completed on time. Quality of work is outstanding. Would highly recommend to anyone looking for a reliable contractor in Kashmir.', project: 'Residential' },
    { id: 2, name: 'Sunita Sharma',    initials: 'SS', rating: 5, date: 'Nov 2023', text: 'Very professional team. Quality construction and great attention to detail. Ashfaq sahab is very responsive and keeps you updated throughout the project.', project: 'Renovation' },
    { id: 3, name: 'Farooq Abdullah',  initials: 'FA', rating: 4, date: 'Oct 2023', text: 'Good work overall, there was a slight delay due to weather conditions but the quality was great. Will work with them again for my next project.', project: 'Commercial' },
  ],
};

const SIMILAR = [
  { id: '2', name: 'Rajesh Kumar', initials: 'RK', type: 'Civil Contractor',   location: 'Delhi NCR',  rating: 4.9, reviews: 63, rate: 250000, rateUnit: 'project' },
  { id: '3', name: 'Anil Singh',   initials: 'AS', type: 'Sub-Contractor',     location: 'Bangalore',  rating: 4.9, reviews: 88, rate: 120000, rateUnit: 'project' },
  { id: '4', name: 'Priya Verma',  initials: 'PV', type: 'Labour Contractor',  location: 'Mumbai',     rating: 4.7, reviews: 41, rate: 800,    rateUnit: 'day'     },
  { id: '5', name: 'Suresh Mehta', initials: 'SM', type: 'Plumbing Specialist',location: 'Pune',       rating: 4.5, reviews: 29, rate: 700,    rateUnit: 'day'     },
];

const PORTFOLIO_COLORS = [
  'from-slate-300 to-slate-400',
  'from-stone-300 to-stone-400',
  'from-zinc-300 to-zinc-400',
  'from-neutral-300 to-neutral-400',
  'from-gray-300 to-gray-400',
  'from-slate-200 to-slate-300',
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContractorProfilePage() {
  const [bioExpanded,   setBioExpanded]   = useState(false);
  const [showAllReviews,setShowAllReviews]= useState(false);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [enquiry, setEnquiry] = useState({
    name: '', phone: '', projectType: '', city: '', pincode: '', budget: '', message: '',
  });

  const c = CONTRACTOR;
  const bioShort = c.bio.slice(0, 180);
  const bioNeedsTruncate = c.bio.length > 180;
  const visibleReviews = showAllReviews ? c.reviews : c.reviews.slice(0, 3);

  function handleEnquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    setModalOpen(false);
    alert('Quote request sent! The contractor will respond within 2 hours.');
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#A08070] mb-6">
          <Link href="/" className="hover:text-[#C0593A]">Home</Link>
          <span>›</span>
          <Link href="/contractors" className="hover:text-[#C0593A]">Contractors</Link>
          <span>›</span>
          <span className="text-[#2C1810] font-medium">{c.name}</span>
        </div>

        <div className="flex gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Cover + Avatar + Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Cover */}
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#C0593A]/10 to-transparent" />
                {c.featured && (
                  <span className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-200">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Avatar row */}
              <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-10 mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-[#C0593A] text-white text-2xl font-bold flex items-center justify-center border-4 border-white shadow-md">
                      {c.initials}
                    </div>
                    {c.active && (
                      <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 pb-1">
                    {c.verified && (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-semibold">
                        ✅ Verified
                      </span>
                    )}
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-[#2C1810] mb-1" style={{ fontFamily: 'Georgia, serif' }}>{c.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs bg-[#FAEEE9] text-[#C0593A] border border-[#E8C4B0] px-3 py-1 rounded-full font-semibold">{c.type}</span>
                  {c.active
                    ? <span className="text-xs text-green-600 font-medium">🟢 Active</span>
                    : <span className="text-xs text-gray-400 font-medium">🔴 Offline</span>
                  }
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-[#6B5248]">
                  <a href="#reviews" className="flex items-center gap-1 hover:text-[#C0593A]">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold text-[#2C1810]">{c.rating}</span>
                    <span>({c.reviewCount} reviews)</span>
                  </a>
                  <span>📍 {c.location}</span>
                  <span>📅 Joined {c.joinedDate}</span>
                  <span>⚡ Responds in {c.responseTime}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: `${c.projects}`,          label: 'Projects Completed', icon: '🏗️' },
                { value: `${c.rating}★`,           label: 'Average Rating',     icon: '⭐' },
                { value: `${c.completionRate}%`,   label: 'Completion Rate',    icon: '✅' },
                { value: `${c.experience} yrs`,    label: 'Experience',         icon: '📅' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="text-xl font-bold text-[#C0593A]">{s.value}</p>
                  <p className="text-xs text-[#A08070] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* About */}
            <Section title="About">
              <p className="text-sm text-[#6B5248] leading-relaxed">
                {bioNeedsTruncate && !bioExpanded ? `${bioShort}…` : c.bio}
              </p>
              {bioNeedsTruncate && (
                <button onClick={() => setBioExpanded(v => !v)}
                  className="text-sm text-[#C0593A] hover:underline font-medium mt-2">
                  {bioExpanded ? 'Read less ▲' : 'Read more ▼'}
                </button>
              )}
            </Section>

            {/* Services */}
            <Section title="Services Offered">
              <div className="flex flex-wrap gap-2">
                {c.services.map(s => (
                  <span key={s} className="text-sm bg-[#FAEEE9] text-[#C0593A] border border-[#E8C4B0] px-3 py-1.5 rounded-full font-medium">{s}</span>
                ))}
              </div>
            </Section>

            {/* Skills */}
            <Section title="Skills & Expertise">
              <div className="flex flex-wrap gap-2">
                {c.skills.map(s => (
                  <span key={s} className="text-sm bg-[#2C1810] text-white px-3 py-1.5 rounded-full font-medium">{s}</span>
                ))}
              </div>
            </Section>

            {/* Service Areas */}
            <Section title="Service Areas">
              <div className="flex flex-wrap gap-2">
                {c.serviceAreas.map(a => (
                  <span key={a} className="text-sm bg-white border border-[#EBE0D8] text-[#3D2B22] px-3 py-1.5 rounded-full font-medium">📍 {a}</span>
                ))}
              </div>
            </Section>

            {/* Portfolio */}
            <Section title="Portfolio">
              <div className="grid grid-cols-3 gap-3">
                {c.portfolio.map((p, i) => (
                  <div key={p.id} className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${PORTFOLIO_COLORS[i]} aspect-video group cursor-pointer`}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end p-3">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-semibold leading-tight">{p.name}</p>
                        <p className="text-white/70 text-[10px]">{p.year}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Reviews */}
            <Section title={`Reviews (${c.reviewCount})`} id="reviews">
              <div className="flex gap-8 items-start mb-6">
                {/* Overall */}
                <div className="text-center flex-shrink-0">
                  <p className="text-5xl font-bold text-[#C0593A]">{c.rating}</p>
                  <p className="text-yellow-500 text-lg mt-1">{'★'.repeat(Math.round(c.rating))}</p>
                  <p className="text-xs text-[#A08070] mt-1">{c.reviewCount} reviews</p>
                </div>
                {/* Bars */}
                <div className="flex-1 space-y-2">
                  {([5, 4, 3, 2, 1] as const).map(star => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-[#6B5248] w-4 text-right">{star}★</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#C0593A] h-full rounded-full transition-all"
                          style={{ width: `${c.ratingBreakdown[star]}%` }} />
                      </div>
                      <span className="text-xs text-[#A08070] w-7">{c.ratingBreakdown[star]}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {visibleReviews.map(r => (
                  <div key={r.id} className="border border-[#EBE0D8] rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-[#FAEEE9] text-[#C0593A] text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {r.initials}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#2C1810]">{r.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                          <span className="text-xs text-[#A08070]">{r.date}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-[#FAEEE9] text-[#C0593A] border border-[#E8C4B0] px-2 py-0.5 rounded-full font-medium">{r.project}</span>
                    </div>
                    <p className="text-sm text-[#6B5248] leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>

              {c.reviews.length > 3 && (
                <button onClick={() => setShowAllReviews(v => !v)}
                  className="mt-4 w-full py-2.5 text-sm font-semibold border border-[#EBE0D8] text-[#C0593A] rounded-xl hover:bg-[#FAEEE9] transition-colors">
                  {showAllReviews ? 'Show less ▲' : `Load more reviews (${c.reviewCount - 3} more) ▼`}
                </button>
              )}
            </Section>

            {/* Similar contractors */}
            <Section title="Similar Contractors">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {SIMILAR.map(s => (
                  <Link key={s.id} href={`/contractors/${s.id}`}
                    className="flex-shrink-0 w-56 bg-white border border-[#EBE0D8] rounded-2xl p-4 hover:border-[#C0593A] hover:shadow-sm transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FAEEE9] text-[#C0593A] text-xs font-bold flex items-center justify-center">{s.initials}</div>
                      <div>
                        <p className="text-sm font-semibold text-[#2C1810] leading-tight">{s.name}</p>
                        <p className="text-[10px] text-[#A08070]">{s.type}</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#A08070] mb-2">📍 {s.location}</p>
                    <div className="flex items-center gap-1 text-xs text-[#6B5248] mb-3">
                      <span className="text-yellow-500">★</span>{s.rating} · {s.reviews} reviews
                    </div>
                    <p className="text-sm font-bold text-[#C0593A]">
                      ₹{s.rate.toLocaleString('en-IN')}<span className="text-xs font-normal text-[#A08070]">/{s.rateUnit}</span>
                    </p>
                  </Link>
                ))}
              </div>
            </Section>

          </div>

          {/* ── RIGHT COLUMN — Booking card ── */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
              {/* Mini profile */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#C0593A] text-white text-sm font-bold flex items-center justify-center">{c.initials}</div>
                <div>
                  <p className="text-sm font-bold text-[#2C1810]">{c.name}</p>
                  <p className="text-xs text-[#A08070]">{c.type}</p>
                </div>
              </div>

              {/* Rate */}
              <div>
                <p className="text-2xl font-bold text-[#C0593A]">₹{c.rate.toLocaleString('en-IN')}</p>
                <p className="text-xs text-[#A08070]">per project onwards (negotiable)</p>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <span>🟢</span><span className="font-medium">Available for new projects</span>
              </div>

              {/* CTAs */}
              <button onClick={() => setModalOpen(true)}
                className="w-full bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                Request Quote
              </button>
              <button className="w-full border-2 border-[#C0593A] text-[#C0593A] hover:bg-[#FAEEE9] font-semibold py-3 rounded-xl transition-colors text-sm">
                Send Message
              </button>

              <div className="border-t border-[#F0E8E2] pt-4 space-y-2.5">
                {[
                  { icon: '📍', text: c.location },
                  { icon: '⚡', text: `Responds in ${c.responseTime}` },
                  { icon: '✅', text: `${c.projects} projects completed` },
                  { icon: '🏆', text: 'Top Rated Contractor' },
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

        {/* Mobile fixed booking bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBE0D8] px-4 py-3 flex gap-3 z-30 shadow-lg">
          <div className="flex-1">
            <p className="text-xs text-[#A08070]">Starting from</p>
            <p className="text-base font-bold text-[#C0593A]">₹{c.rate.toLocaleString('en-IN')}/project</p>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
            Request Quote
          </button>
        </div>

      </div>

      {/* ── ENQUIRY MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>Request a Quote</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <p className="text-xs text-[#A08070] mb-5 bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2">
              🔒 Your contact details are shared with the contractor only after they respond
            </p>
            <form onSubmit={handleEnquirySubmit} className="space-y-4">
              <Field label="Your Name">
                <input type="text" value={enquiry.name} onChange={e => setEnquiry({...enquiry, name: e.target.value})}
                  placeholder="Arun Raina" required className={inp} />
              </Field>
              <Field label="Phone Number">
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg text-sm text-[#6B5248]">+91</span>
                  <input type="tel" value={enquiry.phone} onChange={e => setEnquiry({...enquiry, phone: e.target.value})}
                    placeholder="9876543210" required maxLength={10} className={`${inp} flex-1`} />
                </div>
              </Field>
              <Field label="Project Type">
                <select value={enquiry.projectType} onChange={e => setEnquiry({...enquiry, projectType: e.target.value})}
                  required className={inp}>
                  <option value="">Select project type</option>
                  {['New Construction', 'Renovation', 'Interior Work', 'Commercial', 'Other'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <input type="text" value={enquiry.city} onChange={e => setEnquiry({...enquiry, city: e.target.value})}
                    placeholder="Srinagar" required className={inp} />
                </Field>
                <Field label="Pincode">
                  <input type="text" value={enquiry.pincode} onChange={e => setEnquiry({...enquiry, pincode: e.target.value})}
                    placeholder="190001" maxLength={6} className={inp} />
                </Field>
              </div>
              <Field label="Budget Range">
                <select value={enquiry.budget} onChange={e => setEnquiry({...enquiry, budget: e.target.value})}
                  required className={inp}>
                  <option value="">Select budget</option>
                  {['Under ₹5L', '₹5L – ₹15L', '₹15L – ₹50L', '₹50L+'].map(b => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </Field>
              <Field label="Message">
                <textarea value={enquiry.message} onChange={e => setEnquiry({...enquiry, message: e.target.value})}
                  placeholder="Describe your project — size, timeline, specific requirements…"
                  rows={3} className={`${inp} resize-none`} />
              </Field>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 border border-[#EBE0D8] text-[#6B5248] hover:bg-[#FDF8F5] font-medium py-3 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold py-3 rounded-xl text-sm transition-colors">
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Georgia, serif' }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#2C1810] mb-1">{label}</label>
      {children}
    </div>
  );
}

const inp = 'w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-4 py-3 text-sm text-[#2C1810] placeholder-[#A08070] outline-none focus:border-[#C0593A] transition-colors';
