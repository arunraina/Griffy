'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProject, getProjectBids, submitBid, updateBidStatus, type Project, type Bid } from '@/lib/projects';
import { fetchMe, type Me } from '@/lib/users';

const TYPE_LABEL: Record<string, string> = {
  turnkey: 'Turnkey / Full Construction',
  civil: 'Civil / Structure', electrical: 'Electrical', plumbing: 'Plumbing', interior: 'Interior',
  structural: 'Structural', painting: 'Painting', architecture: 'Architecture', other: 'Other',
};

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [updatingBid, setUpdatingBid] = useState<string | null>(null);

  const loadBids = useCallback(async () => {
    try {
      setBids(await getProjectBids(params.id));
    } catch {
      /* not the owner — bids list stays empty */
    }
  }, [params.id]);

  useEffect(() => {
    getProject(params.id).then((p) => { setProject(p); setLoading(false); });
    fetchMe().then(setMe).catch(() => undefined);
    loadBids();
  }, [params.id, loadBids]);

  async function handleBidSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bidAmount || !bidMessage.trim()) {
      setBidError('Amount and message are required.');
      return;
    }
    setSubmittingBid(true);
    setBidError('');
    try {
      await submitBid(params.id, { bidAmount: Number(bidAmount), message: bidMessage.trim() });
      setBidSuccess(true);
    } catch (e) {
      setBidError(e instanceof Error ? e.message : 'Failed to submit bid');
    } finally {
      setSubmittingBid(false);
    }
  }

  async function handleBidStatus(bidId: string, status: 'ACCEPTED' | 'REJECTED') {
    setUpdatingBid(bidId);
    try {
      const updated = await updateBidStatus(params.id, bidId, status);
      setBids((prev) => prev.map((b) => (b.id === bidId ? updated : b)));
      if (status === 'ACCEPTED') setProject((prev) => (prev ? { ...prev, status: 'AWARDED' } : prev));
    } catch {
      /* leave state as-is; user can retry */
    } finally {
      setUpdatingBid(null);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center text-[#A08070] text-sm">Loading…</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-4">Project not found.</p>
          <Link href="/projects" className="text-[#C0593A] hover:underline font-semibold">Back to Projects →</Link>
        </div>
      </div>
    );
  }

  const isOwner = me?.id === project.ownerId;
  const canBid = !!me && !isOwner && project.status === 'OPEN' && !bidSuccess;

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/projects" className="text-sm text-[#C0593A] hover:underline mb-4 inline-block">← Back to Projects</Link>

        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F5EDE8] text-[#7A3E27]">
              {TYPE_LABEL[project.projectType] ?? project.projectType}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${project.status === 'OPEN' ? 'bg-green-50 text-green-700' : project.status === 'AWARDED' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              {project.status}
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#2C1810] mb-2">{project.title}</h1>
          <p className="text-sm text-[#6B5248] mb-4 whitespace-pre-wrap">{project.description}</p>
          <div className="flex items-center gap-4 text-xs text-[#A08070] flex-wrap mb-4">
            {project.city && <span>📍 {project.city}{project.state ? `, ${project.state}` : ''}</span>}
            {project.timeline && <span>📅 {project.timeline}</span>}
            <span>{project._count?.bids ?? bids.length} bid{(project._count?.bids ?? bids.length) !== 1 ? 's' : ''}</span>
          </div>
          <p className="text-lg font-bold text-[#C0593A]">
            ₹{Number(project.budgetMin).toLocaleString('en-IN')} – ₹{Number(project.budgetMax).toLocaleString('en-IN')}
          </p>
          {project.owner && <p className="text-xs text-[#A08070] mt-1">Posted by {project.owner.name}</p>}
        </div>

        {/* Bid form for non-owners */}
        {canBid && (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 mb-6">
            <h2 className="font-bold text-[#2C1810] mb-4">Submit a Bid</h2>
            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#2C1810] mb-1.5">Your Bid Amount (₹)</label>
                <input
                  type="number" min={0} value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="e.g. 850000"
                  className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#2C1810] mb-1.5">Message</label>
                <textarea
                  rows={4} value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Introduce yourself and explain your approach — don't share phone/email here, keep it on Griffy."
                  className="w-full border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A] resize-none"
                />
              </div>
              {bidError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{bidError}</p>}
              <button
                type="submit" disabled={submittingBid}
                className="w-full bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {submittingBid ? 'Submitting…' : 'Submit Bid'}
              </button>
            </form>
          </div>
        )}

        {bidSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-center">
            <p className="font-semibold text-green-700">✅ Bid submitted! The project owner will review it.</p>
          </div>
        )}

        {!me && project.status === 'OPEN' && (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5 text-center mb-6">
            <p className="text-sm text-[#6B5248] mb-3">Sign in to submit a bid on this project.</p>
            <Link href={`/login?redirect=/projects/${project.id}`} className="bg-[#C0593A] hover:bg-[#9E3F24] text-white font-semibold px-6 py-2.5 rounded-xl inline-block transition-colors">
              Sign In
            </Link>
          </div>
        )}

        {/* Bids list — owner only */}
        {isOwner && (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
            <h2 className="font-bold text-[#2C1810] mb-4">Bids ({bids.length})</h2>
            {bids.length === 0 ? (
              <p className="text-sm text-[#A08070] text-center py-6">No bids yet. Contractors will start bidding soon.</p>
            ) : (
              <div className="space-y-3">
                {bids.map((bid) => (
                  <div key={bid.id} className="border border-[#EBE0D8] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[#2C1810]">{bid.contractor?.name ?? 'Contractor'}</p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${bid.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' : bid.status === 'REJECTED' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-50 text-yellow-700'}`}>
                        {bid.status}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-[#C0593A] mb-1.5">₹{Number(bid.bidAmount).toLocaleString('en-IN')}</p>
                    <p className="text-sm text-[#6B5248] mb-3">{bid.message}</p>
                    {bid.status === 'PENDING' && project.status === 'OPEN' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBidStatus(bid.id, 'ACCEPTED')}
                          disabled={updatingBid === bid.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleBidStatus(bid.id, 'REJECTED')}
                          disabled={updatingBid === bid.id}
                          className="flex-1 border border-[#EBE0D8] text-[#6B5248] text-sm font-semibold py-2 rounded-xl"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
