'use client';

import { useState } from 'react';
import { setAccountStatus, type AccountStatus, type AdminUser } from '@/lib/admin';

const STATUS_OPTIONS: { value: AccountStatus; label: string; description: string }[] = [
  { value: 'ACTIVE', label: 'Active', description: 'Full access restored' },
  { value: 'RESTRICTED_LISTING', label: 'Restrict Listings', description: "Can browse and book services but cannot list their own services or products" },
  { value: 'RESTRICTED_BOOKING', label: 'Restrict Bookings', description: 'Can list services but will not receive new booking requests' },
  { value: 'RESTRICTED_EXPLORE', label: 'Explore Only', description: 'Read-only access, cannot book, order, or list anything' },
  { value: 'PENDING_REVIEW', label: 'Under Review', description: 'Limited access while team reviews their account' },
  { value: 'TEMP_SUSPENDED', label: 'Temporarily Suspend', description: 'Blocked from platform for a set period' },
  { value: 'SUSPENDED', label: 'Permanently Suspend', description: 'Complete ban, cannot login or create new account' },
];

const DURATIONS = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
];

export default function StatusChangeModal({
  userId, userName, currentStatus, onClose, onChanged,
}: {
  userId: string;
  userName: string;
  currentStatus: AccountStatus;
  onClose: () => void;
  onChanged: (updated: AdminUser) => void;
}) {
  const [status, setStatus] = useState<AccountStatus>(currentStatus);
  const [duration, setDuration] = useState<number | 'custom'>(7);
  const [customDate, setCustomDate] = useState('');
  const [reason, setReason] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleApply() {
    if (status !== 'ACTIVE' && !reason.trim()) {
      setError('Reason is required for this status change.');
      return;
    }

    let expiresAt: string | undefined;
    if (status === 'TEMP_SUSPENDED') {
      if (duration === 'custom') {
        if (!customDate) {
          setError('Pick a date for the custom duration.');
          return;
        }
        expiresAt = new Date(customDate).toISOString();
      } else {
        expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    setSaving(true);
    setError('');
    try {
      const updated = await setAccountStatus(userId, {
        status,
        reason: status === 'ACTIVE' ? undefined : reason.trim(),
        expiresAt,
        notifyUser,
      });
      onChanged(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to change status');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={() => !saving && onClose()} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
          <h2 className="font-bold text-[#2C1810] text-lg mb-4">Change status for {userName}</h2>

          <div className="space-y-2.5">
            {STATUS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 border rounded-xl px-3.5 py-2.5 cursor-pointer ${
                  status === opt.value ? 'border-[#C0593A] bg-[#FAEEE9]' : 'border-[#EBE0D8]'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  className="mt-0.5"
                  checked={status === opt.value}
                  onChange={() => setStatus(opt.value)}
                />
                <div>
                  <p className="text-sm font-semibold text-[#2C1810]">{opt.label}</p>
                  <p className="text-xs text-[#6B5248]">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>

          {status === 'TEMP_SUSPENDED' && (
            <div className="mt-4">
              <label className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">Duration</label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d.days}
                    type="button"
                    onClick={() => setDuration(d.days)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                      duration === d.days ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setDuration('custom')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                    duration === 'custom' ? 'bg-[#C0593A] text-white border-[#C0593A]' : 'bg-white text-[#6B5248] border-[#EBE0D8]'
                  }`}
                >
                  Custom date
                </button>
              </div>
              {duration === 'custom' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="mt-2 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2"
                />
              )}
            </div>
          )}

          {status !== 'ACTIVE' && (
            <div className="mt-4">
              <label className="text-[11px] font-semibold text-[#A08070] uppercase tracking-wide">Reason *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Reason for this action (visible to user in notification)"
                className="w-full mt-1 text-sm border border-[#EBE0D8] rounded-lg px-3 py-2"
              />
            </div>
          )}

          <label className="flex items-center gap-2 mt-4 text-sm text-[#6B5248]">
            <input type="checkbox" checked={notifyUser} onChange={(e) => setNotifyUser(e.target.checked)} />
            Notify user via email/in-app
          </label>

          {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

          <div className="flex gap-2 mt-5">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 text-sm font-semibold text-[#6B5248] border border-[#EBE0D8] px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={saving}
              className="flex-1 text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white px-4 py-2 rounded-lg"
            >
              {saving ? 'Applying…' : 'Apply Status Change'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
