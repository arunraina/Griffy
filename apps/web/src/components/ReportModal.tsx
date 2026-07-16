'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitReport, type ReportTargetType } from '@/lib/reports';
import { NotAuthenticatedError } from '@/lib/users';

interface Props {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetName: string;
}

export default function ReportModal({ open, onClose, targetType, targetId, targetName }: Props) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  function resetAndClose() {
    setReason(''); setError(''); setSubmitted(false);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) { setError('Please describe the issue.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await submitReport(targetType, targetId, reason.trim());
      setSubmitted(true);
    } catch (err) {
      if (err instanceof NotAuthenticatedError) router.push('/login');
      else setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={resetAndClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        {submitted ? (
          <div className="text-center">
            <p className="text-3xl mb-2">✅</p>
            <h2 className="text-lg font-bold text-[#2C1810] mb-1">Report submitted</h2>
            <p className="text-sm text-[#6B5248] mb-4">Our team will review this shortly. Thanks for helping keep Griffy safe.</p>
            <button onClick={resetAndClose} className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-lg">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#2C1810]">Report {targetName}</h2>
                <p className="text-xs text-[#A08070] mt-0.5">Tell us what's wrong — our team will review it.</p>
              </div>
              <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={reason} onChange={(e) => setReason(e.target.value)} rows={4}
                placeholder="Describe the issue (e.g. fake profile, inappropriate content, scam)…"
                className="w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-4 py-3 text-sm text-[#2C1810] placeholder-[#A08070] outline-none focus:border-[#C0593A] transition-colors resize-none"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={resetAndClose} disabled={submitting}
                  className="text-sm font-semibold text-[#6B5248] px-4 py-2 rounded-lg hover:bg-[#FAEEE9] disabled:opacity-40">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="text-sm font-semibold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-40">
                  {submitting ? 'Submitting…' : 'Submit Report'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
