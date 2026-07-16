'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/lib/analytics';
import { checkReviewEligibility, type ReviewEligibility } from '@/lib/reviews';
import WriteReviewModal from '@/components/WriteReviewModal';
import ReportModal from '@/components/ReportModal';
import BadgeRow from '@/components/BadgeRow';
import { shareOrCopyLink } from '@/lib/share';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isVerified: boolean;
  createdAt: string;
  reviewer: { name: string; avatarUrl: string | null };
}

interface Material {
  id: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  stock: number;
  imageUrls: string[];
  availableRegions: string[];
  brand: string | null;
  sku: string | null;
  avgRating: number;
  totalReviews: number;
  supplier: {
    id: string;
    name: string;
    city: string;
    phone: string | null;
    verified: boolean;
    avgRating: number;
    totalReviews: number;
    totalOrders: number;
  } | null;
}

interface Props {
  material: Material;
  reviews: Review[];
}

export default function MaterialDetailClient({ material: m, reviews }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const [qty,            setQty]            = useState(1);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  async function handleShare() {
    const result = await shareOrCopyLink(`${m.name} on Griffy`);
    if (result === 'copied') {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  }
  const [activeImage,    setActiveImage]    = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [descExpanded,   setDescExpanded]   = useState(false);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [eligibility,    setEligibility]    = useState<ReviewEligibility | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', city: '', pincode: '', quantity: '', message: '' });

  useEffect(() => {
    trackEvent('view_item', { item_id: m.id, item_category: 'material', item_name: m.name });
    checkReviewEligibility('MATERIAL', m.id).then(setEligibility).catch(() => setEligibility(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.id]);

  function handleAddToCart() {
    addItem({ id: m.id, name: m.name, imageIcon: '🧱', price: m.price, unit: m.unit, sellerName: m.supplier?.name ?? 'Griffy' }, qty);
    trackEvent('add_to_cart', { item_id: m.id, item_category: 'material', item_name: m.name, quantity: qty, value: m.price * qty });
  }

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const desc      = m.description ?? '';
  const descShort = desc.slice(0, 200);
  const descNeedsTruncate = desc.length > 200;
  const inStock = m.stock > 0;

  const ratingBreakdown = reviews.reduce<Record<number, number>>(
    (acc, r) => { acc[r.rating] = (acc[r.rating] ?? 0) + 1; return acc; },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  );
  const totalForPct = reviews.length || 1;

  function handleEnquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    setModalOpen(false);
    trackEvent('generate_lead', { item_id: m.id, item_category: 'material', item_name: m.name });
    alert('Enquiry sent! The supplier will contact you shortly.');
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#A08070] mb-6 flex-wrap">
          <Link href="/" className="hover:text-[#C0593A]">Home</Link>
          <span>›</span>
          <Link href="/materials" className="hover:text-[#C0593A]">Materials</Link>
          <span>›</span>
          <span className="text-[#6B5248] capitalize">{m.category}</span>
          <span>›</span>
          <span className="text-[#2C1810] font-medium">{m.name}</span>
        </div>

        <div className="flex gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Image + Product header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Main image */}
              <div className="relative bg-gray-50 flex items-center justify-center" style={{ minHeight: 320 }}>
                {m.imageUrls.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.imageUrls[activeImage]} alt={m.name} className="max-h-80 w-full object-contain p-6" />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-16">
                    <span className="text-6xl">🏗️</span>
                    <p className="text-sm text-[#A08070]">No image available</p>
                  </div>
                )}
                {!inStock && (
                  <span className="absolute top-4 left-4 text-xs bg-red-100 text-red-600 border border-red-200 px-3 py-1 rounded-full font-semibold">Out of Stock</span>
                )}
              </div>

              {/* Thumbnail strip */}
              {m.imageUrls.length > 1 && (
                <div className="flex gap-2 px-6 pb-4 overflow-x-auto">
                  {m.imageUrls.map((url, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-[#C0593A]' : 'border-gray-200 hover:border-[#C0593A]/50'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`${m.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Product details */}
              <div className="px-6 pb-6 border-t border-[#F0E8E2] pt-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs bg-[#FAEEE9] text-[#C0593A] border border-[#E8C4B0] px-3 py-1 rounded-full font-semibold capitalize">{m.category}</span>
                  <span className="text-xs bg-white text-[#6B5248] border border-[#EBE0D8] px-3 py-1 rounded-full capitalize">{m.subcategory}</span>
                </div>
                <h1 className="text-2xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>{m.name}</h1>
                {m.brand && <p className="text-sm text-[#6B5248] mb-2">Brand: <span className="font-medium text-[#2C1810]">{m.brand}</span></p>}
                {m.sku  && <p className="text-xs text-[#A08070] mb-3">SKU: {m.sku}</p>}

                <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B5248]">
                  {m.avgRating > 0 && (
                    <a href="#reviews" className="flex items-center gap-1 hover:text-[#C0593A]">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold text-[#2C1810]">{m.avgRating.toFixed(1)}</span>
                      <span>({m.totalReviews} reviews)</span>
                    </a>
                  )}
                  <span className={inStock ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                    {inStock ? `✓ In Stock (${m.stock} units)` : '✗ Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {desc && (
              <Section title="Description">
                <p className="text-sm text-[#6B5248] leading-relaxed">
                  {descNeedsTruncate && !descExpanded ? `${descShort}…` : desc}
                </p>
                {descNeedsTruncate && (
                  <button onClick={() => setDescExpanded(v => !v)} className="text-sm text-[#C0593A] hover:underline font-medium mt-2">
                    {descExpanded ? 'Read less ▲' : 'Read more ▼'}
                  </button>
                )}
              </Section>
            )}

            {/* Availability by region */}
            {m.availableRegions.length > 0 && (
              <Section title="Available In">
                <div className="flex flex-wrap gap-2">
                  {m.availableRegions.map(r => (
                    <span key={r} className="text-sm bg-white border border-[#EBE0D8] text-[#3D2B22] px-3 py-1.5 rounded-full font-medium">📍 {r}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Supplier info */}
            {m.supplier && (
              <Section title="Supplier Information">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAEEE9] border border-[#E8C4B0] flex items-center justify-center text-lg font-bold text-[#9E3F24] flex-shrink-0">
                    {m.supplier.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-[#2C1810]">{m.supplier.name}</p>
                      {m.supplier.verified && (
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">✅ Verified</span>
                      )}
                    </div>
                    {m.supplier.city && <p className="text-sm text-[#6B5248]">📍 {m.supplier.city}</p>}
                    {m.supplier.phone && <p className="text-sm text-[#6B5248]">📞 {m.supplier.phone}</p>}
                    <div className="mt-2">
                      <BadgeRow
                        verified={m.supplier.verified}
                        completedJobs={m.supplier.totalOrders}
                        rating={m.supplier.avgRating}
                        reviewCount={m.supplier.totalReviews}
                      />
                    </div>
                  </div>
                  <button onClick={() => setModalOpen(true)}
                    className="text-sm bg-white border border-[#C0593A] text-[#C0593A] hover:bg-[#FAEEE9] font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0">
                    Contact
                  </button>
                </div>
              </Section>
            )}

            {/* Reviews */}
            <Section title={`Reviews (${m.totalReviews})`} id="reviews">
              {eligibility && (
                eligibility.eligible ? (
                  <button onClick={() => setReviewModalOpen(true)}
                    className="mb-5 text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-xl transition-colors">
                    ✍️ Write a Review
                  </button>
                ) : eligibility.reason && (
                  <p className="text-xs text-[#A08070] bg-[#FAEEE9] border border-[#E8C4B0] rounded-lg px-3 py-2 mb-5">{eligibility.reason}</p>
                )
              )}
              {reviews.length === 0 ? (
                <p className="text-sm text-[#A08070]">No reviews yet.</p>
              ) : (
                <>
                  <div className="flex gap-8 items-start mb-6">
                    <div className="text-center flex-shrink-0">
                      <p className="text-5xl font-bold text-[#C0593A]">{m.avgRating.toFixed(1)}</p>
                      <p className="text-yellow-500 text-lg mt-1">{'★'.repeat(Math.round(m.avgRating))}</p>
                      <p className="text-xs text-[#A08070] mt-1">{m.totalReviews} reviews</p>
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
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-[#2C1810]">{r.reviewer.name}</p>
                                {r.isVerified && (
                                  <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">✓ Verified Purchase</span>
                                )}
                              </div>
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

          {/* ── RIGHT COLUMN — Buy/Cart card ── */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
              <div>
                <p className="text-3xl font-bold text-[#C0593A]">₹{m.price.toLocaleString('en-IN')}</p>
                <p className="text-xs text-[#A08070]">{m.unit}</p>
              </div>

              <div className={`flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 border ${inStock ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-500 bg-red-50 border-red-100'}`}>
                <span>{inStock ? '✓' : '✗'}</span>
                <span>{inStock ? `In Stock · ${m.stock} available` : 'Out of Stock'}</span>
              </div>

              {/* Quantity selector */}
              {inStock && (
                <div>
                  <label className="block text-xs font-semibold text-[#2C1810] mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-lg border border-[#EBE0D8] text-[#2C1810] hover:bg-[#FDF8F5] font-bold text-lg transition-colors">−</button>
                    <span className="flex-1 text-center text-base font-bold text-[#2C1810]">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(m.stock, q + 1))}
                      className="w-9 h-9 rounded-lg border border-[#EBE0D8] text-[#2C1810] hover:bg-[#FDF8F5] font-bold text-lg transition-colors">+</button>
                  </div>
                  <p className="text-xs text-[#A08070] mt-1 text-right">
                    Total: <span className="font-semibold text-[#2C1810]">₹{(m.price * qty).toLocaleString('en-IN')}</span>
                  </p>
                </div>
              )}

              <button
                disabled={!inStock}
                className={`w-full font-bold py-3.5 rounded-xl transition-colors text-sm ${inStock
                  ? 'bg-[#C0593A] hover:bg-[#9E3F24] text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                onClick={() => inStock && handleAddToCart()}
              >
                {inStock ? '🛒 Add to Cart' : 'Out of Stock'}
              </button>
              <button onClick={() => setModalOpen(true)}
                className="w-full border-2 border-[#C0593A] text-[#C0593A] hover:bg-[#FAEEE9] font-semibold py-3 rounded-xl transition-colors text-sm">
                Contact Supplier
              </button>

              <div className="border-t border-[#F0E8E2] pt-4 space-y-2.5">
                {[
                  { icon: '🏷️', text: `${m.category} / ${m.subcategory}` },
                  ...(m.brand ? [{ icon: '🏭', text: m.brand }] : []),
                  ...(m.availableRegions.length > 0 ? [{ icon: '📍', text: m.availableRegions.slice(0, 2).join(', ') + (m.availableRegions.length > 2 ? ` +${m.availableRegions.length - 2}` : '') }] : []),
                  ...(m.avgRating > 0 ? [{ icon: '⭐', text: `${m.avgRating.toFixed(1)} rating (${m.totalReviews} reviews)` }] : []),
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2 text-sm text-[#6B5248]">
                    <span>{item.icon}</span><span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={handleShare} className="flex-1 text-xs border border-[#EBE0D8] text-[#6B5248] hover:border-[#C0593A] hover:text-[#C0593A] py-2 rounded-lg transition-colors">
                  {shareStatus === 'copied' ? '✓ Link Copied!' : '🔗 Share'}
                </button>
                <button onClick={() => setReportModalOpen(true)} className="flex-1 text-xs border border-[#EBE0D8] text-gray-400 hover:text-red-500 hover:border-red-200 py-2 rounded-lg transition-colors">
                  ⚑ Report
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile fixed bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBE0D8] px-4 py-3 flex gap-3 z-30 shadow-lg items-center">
          <div className="flex-1">
            <p className="text-xs text-[#A08070]">{m.unit}</p>
            <p className="text-base font-bold text-[#C0593A]">₹{m.price.toLocaleString('en-IN')}</p>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="border border-[#C0593A] text-[#C0593A] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors hover:bg-[#FAEEE9]">
            Contact
          </button>
          <button
            disabled={!inStock}
            className={`font-bold px-5 py-2.5 rounded-xl text-sm transition-colors ${inStock
              ? 'bg-[#C0593A] hover:bg-[#9E3F24] text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            onClick={() => inStock && handleAddToCart()}
          >
            🛒 Add to Cart
          </button>
        </div>

      </div>

      {/* ── SUPPLIER CONTACT MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>Contact Supplier</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            {m.supplier && (
              <div className="flex items-center gap-3 mb-5 bg-[#FDF8F5] border border-[#EBE0D8] rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAEEE9] border border-[#E8C4B0] flex items-center justify-center text-sm font-bold text-[#9E3F24] flex-shrink-0">
                  {m.supplier.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2C1810]">{m.supplier.name}</p>
                  {m.supplier.city && <p className="text-xs text-[#A08070]">📍 {m.supplier.city}</p>}
                </div>
              </div>
            )}
            <form onSubmit={handleEnquirySubmit} className="space-y-4">
              <Field label="Your Name">
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Full name" required className={inp} />
              </Field>
              <Field label="Phone Number">
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg text-sm text-[#6B5248]">+91</span>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="9876543210" required maxLength={10} className={`${inp} flex-1`} />
                </div>
              </Field>
              <Field label="City">
                <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                  placeholder="Your city" required className={inp} />
              </Field>
              <Field label="Pincode">
                <input type="text" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})}
                  placeholder="400001" maxLength={6} className={inp} />
              </Field>
              <Field label="Quantity Required">
                <input type="text" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
                  placeholder={`e.g. 50 ${m.unit}`} className={inp} />
              </Field>
              <Field label="Message">
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  placeholder="Any specific requirements, delivery date, or custom order details…"
                  rows={3} className={`${inp} resize-none`} />
              </Field>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 border border-[#EBE0D8] text-[#6B5248] hover:bg-[#FDF8F5] font-medium py-3 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold py-3 rounded-xl text-sm transition-colors">
                  Send Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <WriteReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmitted={() => router.refresh()}
        targetType="MATERIAL"
        targetId={m.id}
        targetName={m.name}
        willBeVerified={eligibility?.wouldBeVerified ?? false}
      />
      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="MATERIAL"
        targetId={m.id}
        targetName={m.name}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#2C1810] mb-1">{label}</label>
      {children}
    </div>
  );
}

const inp = 'w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-4 py-3 text-sm text-[#2C1810] placeholder-[#A08070] outline-none focus:border-[#C0593A] transition-colors';
