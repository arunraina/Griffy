'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAdminOrders, createRefund, type AdminOrder } from '@/lib/admin';

const PAYMENT_STATUSES = ['', 'UNPAID', 'PAID', 'FAILED', 'REFUND_INITIATED', 'REFUNDED'];

const STATUS_STYLE: Record<string, string> = {
  UNPAID: 'bg-gray-100 text-gray-700 border-gray-200',
  PAID: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  REFUND_INITIATED: 'bg-amber-100 text-amber-800 border-amber-200',
  REFUNDED: 'bg-blue-100 text-blue-800 border-blue-200',
};

function refundedSoFar(order: AdminOrder): number {
  return order.refunds.filter((r) => r.status !== 'FAILED').reduce((sum, r) => sum + r.amount, 0);
}

export default function AdminOrdersPage() {
  const [paymentStatus, setPaymentStatus] = useState('');
  const [rows, setRows] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refundTarget, setRefundTarget] = useState<AdminOrder | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAdminOrders(paymentStatus || undefined)
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [paymentStatus]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#2C1810]">Orders & Refunds</h1>
        <p className="text-sm text-[#6B5248] mt-0.5">Showing up to 100 most recent orders.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}
          className="border border-[#EBE0D8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]">
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s || 'All payment statuses'}</option>)}
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      {loading ? (
        <p className="text-[#A08070] text-sm">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-semibold text-[#2C1810]">No orders match</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EBE0D8] text-left text-xs text-[#A08070] uppercase tracking-wide">
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Buyer</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Payment</th>
                <th className="px-5 py-3 font-semibold">Placed</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const remaining = Math.round(Number(o.totalAmount) * 100) - refundedSoFar(o);
                return (
                  <tr key={o.id} className="border-b border-[#F0E8E2] last:border-none align-top">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-[#2C1810]">#{o.id.slice(0, 8)}</p>
                      <p className="text-xs text-[#A08070]">{o.items.length} item{o.items.length === 1 ? '' : 's'}</p>
                    </td>
                    <td className="px-5 py-3 text-[#6B5248]">
                      <p>{o.buyer?.name ?? '—'}</p>
                      <p className="text-xs text-[#A08070]">{o.buyer?.email}</p>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#2C1810]">₹{Number(o.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 text-xs text-[#6B5248]">{o.status}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[o.paymentStatus] ?? ''}`}>
                        {o.paymentStatus}
                      </span>
                      {o.refunds.length > 0 && (
                        <p className="text-[10px] text-[#A08070] mt-1">
                          ₹{(refundedSoFar(o) / 100).toLocaleString('en-IN')} refunded
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6B5248]">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3">
                      {(o.paymentStatus === 'PAID' || o.paymentStatus === 'REFUND_INITIATED') && remaining > 0 ? (
                        <button
                          onClick={() => setRefundTarget(o)}
                          className="text-xs font-semibold text-[#C0593A] hover:underline"
                        >
                          Refund
                        </button>
                      ) : (
                        <span className="text-xs text-[#A08070]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {refundTarget && (
        <RefundModal
          order={refundTarget}
          remainingPaise={Math.round(Number(refundTarget.totalAmount) * 100) - refundedSoFar(refundTarget)}
          onClose={() => setRefundTarget(null)}
          onDone={() => { setRefundTarget(null); load(); }}
        />
      )}
    </div>
  );
}

function RefundModal({
  order, remainingPaise, onClose, onDone,
}: {
  order: AdminOrder;
  remainingPaise: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState((remainingPaise / 100).toFixed(2));
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!reason.trim()) { setError('Reason is required.'); return; }
    const amountPaise = Math.round(parseFloat(amount) * 100);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) { setError('Enter a valid amount.'); return; }
    if (amountPaise > remainingPaise) { setError(`Amount exceeds the remaining refundable balance of ₹${(remainingPaise / 100).toFixed(2)}.`); return; }

    setSubmitting(true);
    setError('');
    try {
      await createRefund(order.id, reason.trim(), amountPaise);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create refund');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-[#2C1810] mb-1">Refund order #{order.id.slice(0, 8)}</h2>
        <p className="text-xs text-[#A08070] mb-4">Remaining refundable: ₹{(remainingPaise / 100).toLocaleString('en-IN')}</p>

        <label className="block text-xs font-semibold text-[#6B5248] mb-1">Amount (₹)</label>
        <input
          type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-[#EBE0D8] rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#C0593A]"
        />

        <label className="block text-xs font-semibold text-[#6B5248] mb-1">Reason</label>
        <textarea
          value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
          placeholder="Why is this order being refunded?"
          className="w-full border border-[#EBE0D8] rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#C0593A]"
        />

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} disabled={submitting}
            className="text-sm font-semibold text-[#6B5248] px-4 py-2 rounded-lg hover:bg-[#FAEEE9] disabled:opacity-40">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-lg disabled:opacity-40">
            {submitting ? 'Processing…' : 'Confirm Refund'}
          </button>
        </div>
      </div>
    </div>
  );
}
