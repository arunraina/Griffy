"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { createReview, CreateReviewPayload } from "@/lib/api";
import StarRating from "./StarRating";

interface ReviewModalProps {
  orderId?: string;
  targetType: "material" | "contractor" | "labour";
  targetId: string;
  targetName: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function ReviewModal({
  orderId, targetType, targetId, targetName, onClose, onSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating."); return; }
    setSubmitting(true); setError("");
    try {
      const payload: CreateReviewPayload = {
        targetType, targetId, rating,
        ...(orderId ? { orderId } : {}),
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      };
      await createReview(payload);
      setDone(true);
      setTimeout(() => { onSubmitted?.(); onClose(); }, 1800);
    } catch (e: any) {
      setError(e.message ?? "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  const typeLabel = targetType === "material" ? "product" : targetType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <h2 className="font-extrabold text-stone-900 text-lg">Leave a Review</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-10 flex flex-col items-center gap-3">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
            <p className="font-bold text-stone-900 text-lg">Review submitted!</p>
            <p className="text-stone-500 text-sm">Thank you for your feedback.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            <div>
              <p className="text-sm text-stone-500 mb-1">Reviewing</p>
              <p className="font-semibold text-stone-900">{targetName}</p>
              <p className="text-xs text-stone-400 capitalize">{typeLabel}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Your rating</p>
              <StarRating value={rating} onChange={setRating} size="lg" />
              {rating > 0 && (
                <p className="text-xs text-stone-500 mt-1.5">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Comment <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Share your experience with this ${typeLabel}…`}
                className="input-field resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-stone-400 mt-1 text-right">{comment.length}/1000</p>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold text-sm hover:border-stone-300 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting || rating === 0}
                className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
