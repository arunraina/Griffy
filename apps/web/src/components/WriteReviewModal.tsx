'use client';

import { useState } from 'react';
import { submitReview, type ReviewTargetType } from '@/lib/reviews';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string;
  willBeVerified: boolean;
}

export default function WriteReviewModal({ open, onClose, onSubmitted, targetType, targetId, targetName, willBeVerified }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  function resetAndClose() {
    setRating(0); setHoverRating(0); setComment(''); setError('');
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) { setError('Please select a rating.'); return; }
    setError(''); setSubmitting(true);
    try {
      await submitReview({ targetType, targetId, rating, comment: comment.trim() || undefined });
      onSubmitted();
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={resetAndClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#2C1810]">Write a Review</h2>
            <p className="text-xs text-[#A08070] mt-0.5">Reviewing {targetName}</p>
          </div>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {willBeVerified && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
            <span>✓</span> This will be posted as a Verified review
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl leading-none transition-transform hover:scale-110"
                >
                  <span className={star <= (hoverRating || rating) ? 'text-yellow-500' : 'text-gray-200'}>★</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-2">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Share details about your experience…"
              className="w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-4 py-3 text-sm text-[#2C1810] placeholder-[#A08070] outline-none focus:border-[#C0593A] transition-colors resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={resetAndClose} disabled={submitting}
              className="text-sm font-semibold text-[#6B5248] px-4 py-2 rounded-lg hover:bg-[#FAEEE9] disabled:opacity-40">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-lg disabled:opacity-40">
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
