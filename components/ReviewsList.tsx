"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { listReviews, Review } from "@/lib/api";
import StarRating from "./StarRating";
import { formatDate, initials } from "@/lib/constants";

interface ReviewsListProps {
  targetType: "material" | "contractor" | "labour";
  targetId: string;
  rating: number;
  reviewCount: number;
}

export default function ReviewsList({ targetType, targetId, rating, reviewCount }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    listReviews(targetType, targetId, page, 5)
      .then((r) => { setReviews((prev) => page === 1 ? r.data : [...prev, ...r.data]); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [targetType, targetId, page]);

  if (reviewCount === 0 && !loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="font-bold text-stone-900 text-lg mb-4">Reviews</h2>
        <div className="text-center py-6">
          <MessageSquare className="w-10 h-10 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">No reviews yet. Be the first to review.</p>
        </div>
      </div>
    );
  }

  const dist = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
      <h2 className="font-bold text-stone-900 text-lg mb-5">Reviews</h2>

      {/* Summary */}
      {rating > 0 && (
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-stone-100">
          <div className="text-center shrink-0">
            <p className="text-5xl font-extrabold text-stone-900">{rating.toFixed(1)}</p>
            <StarRating value={Math.round(rating)} readonly size="sm" />
            <p className="text-stone-400 text-xs mt-1">{reviewCount} review{reviewCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {dist.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-stone-500 w-3">{star}</span>
                <div className="flex-1 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-1.5 rounded-full transition-all"
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-xs text-stone-400 w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review cards */}
      <div className="space-y-4">
        {loading && reviews.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-stone-200 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-stone-200 rounded w-1/3" />
                    <div className="h-3 bg-stone-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-3 bg-stone-200 rounded w-full" />
                <div className="h-3 bg-stone-200 rounded w-3/4" />
              </div>
            ))
          : reviews.map((r) => {
              const name = r.reviewer?.fullName ?? "Anonymous";
              const ini = initials(name);
              const colors = ["bg-blue-100 text-blue-600", "bg-orange-100 text-orange-600", "bg-green-100 text-green-600", "bg-purple-100 text-purple-600"];
              const color = colors[name.charCodeAt(0) % colors.length];
              return (
                <div key={r.id} className="border-b border-stone-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 ${color}`}>
                      {ini}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <p className="font-semibold text-stone-900 text-sm">{name}</p>
                        <p className="text-xs text-stone-400">{formatDate(r.createdAt)}</p>
                      </div>
                      <StarRating value={r.rating} readonly size="sm" />
                    </div>
                  </div>
                  {r.comment && <p className="text-stone-600 text-sm leading-relaxed ml-13">{r.comment}</p>}
                </div>
              );
            })}
      </div>

      {reviews.length < total && (
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={loading}
          className="mt-5 w-full text-center text-sm text-orange-500 hover:text-orange-600 font-semibold py-2 disabled:opacity-50"
        >
          {loading ? "Loading…" : `Load more (${total - reviews.length} remaining)`}
        </button>
      )}
    </div>
  );
}
