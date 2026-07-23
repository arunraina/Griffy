'use client';

import { useState } from 'react';
import { createBooking } from '@/lib/bookings';
import { trackEvent } from '@/lib/analytics';

interface Props {
  open: boolean;
  onClose: () => void;
  providerName: string;
  providerId: string;
  providerRole: string;
  ctaLabel?: string;
}

const inp = 'w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-4 py-3 text-sm text-[#2C1810] placeholder-[#A08070] outline-none focus:border-[#C0593A] transition-colors';

export default function BookingModal({ open, onClose, providerName, providerId, providerRole, ctaLabel = 'Send Request' }: Props) {
  const [date,        setDate]        = useState('');
  const [description, setDescription] = useState('');
  const [location,    setLocation]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  if (!open) return null;

  function resetAndClose() {
    setDate(''); setDescription(''); setLocation('');
    setError(''); setSuccess(false);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) { setError('Please select a date.'); return; }
    setError(''); setLoading(true);
    try {
      const notes = [
        location ? `Location: ${location}` : '',
        description ? `\n${description}` : '',
      ].filter(Boolean).join('');
      await createBooking({ providerId, providerRole, scheduledAt: date, notes: notes || undefined });
      setSuccess(true);
      trackEvent('generate_lead', { item_id: providerId, item_category: providerRole.toLowerCase(), lead_type: 'booking_request' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={resetAndClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
            <h2 className="text-lg font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Booking Requested!</h2>
            <p className="text-sm text-[#6B5248] mb-2">
              Your request has been sent to <span className="font-semibold text-[#2C1810]">{providerName}</span>.
            </p>
            <p className="text-xs text-[#A08070] mb-6">You can track the status in your dashboard.</p>
            <div className="flex gap-3">
              <button onClick={resetAndClose}
                className="flex-1 border border-[#EBE0D8] text-[#6B5248] hover:bg-[#FDF8F5] font-medium py-3 rounded-xl text-sm transition-colors">
                Close
              </button>
              <a href="/dashboard/home"
                className="flex-1 text-center bg-[#C0593A] hover:bg-[#9E3F24] text-white font-bold py-3 rounded-xl text-sm transition-colors">
                View Dashboard
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>Book {providerName}</h2>
                <p className="text-xs text-[#A08070] mt-0.5">Fill in the details and they will confirm shortly</p>
              </div>
              <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4">✕</button>
            </div>

            <p className="text-xs text-[#A08070] mb-5 bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2">
              🔒 Your contact is shared only after the provider confirms
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C1810] mb-1">Preferred Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1810] mb-1">Work Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City / area / address"
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1810] mb-1">Description *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the work you need — type, scope, duration, any specific requirements…"
                  rows={4}
                  required
                  className={`${inp} resize-none`}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={resetAndClose}
                  className="flex-1 border border-[#EBE0D8] text-[#6B5248] hover:bg-[#FDF8F5] font-medium py-3 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending…
                    </>
                  ) : ctaLabel}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
