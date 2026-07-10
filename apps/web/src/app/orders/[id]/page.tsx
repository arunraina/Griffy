'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchOrder, fetchOrderHistory, downloadInvoice, type Order, type OrderStatusEvent } from '@/lib/orders';

const STEPPER_STATUSES = ['PLACED', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'] as const;

function StatusStepper({ status, history }: { status: Order['status']; history: OrderStatusEvent[] }) {
  if (status === 'REJECTED' || status === 'CANCELLED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
        <p className="text-sm font-semibold text-red-800">
          {status === 'REJECTED' ? 'Order rejected by seller' : 'Order cancelled'}
        </p>
      </div>
    );
  }

  const currentIndex = STEPPER_STATUSES.indexOf(status as (typeof STEPPER_STATUSES)[number]);
  const eventAt = (s: string) => history.find((h) => h.status === s)?.createdAt;

  return (
    <div className="flex items-center mb-6">
      {STEPPER_STATUSES.map((s, i) => {
        const done = i <= currentIndex;
        const at = eventAt(s);
        return (
          <div key={s} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <div className={`absolute top-3 right-1/2 w-full h-0.5 ${i <= currentIndex ? 'bg-[#C0593A]' : 'bg-[#EBE0D8]'}`} />
            )}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
              done ? 'bg-[#C0593A] text-white' : 'bg-white border-2 border-[#EBE0D8] text-[#A08070]'
            }`}>
              {done ? '✓' : i + 1}
            </div>
            <p className={`text-[10px] font-semibold mt-1.5 text-center ${done ? 'text-[#2C1810]' : 'text-[#A08070]'}`}>{s}</p>
            {at && <p className="text-[9px] text-[#A08070]">{new Date(at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<OrderStatusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceError, setInvoiceError] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  async function handleDownloadInvoice() {
    if (!order) return;
    setDownloadingInvoice(true);
    setInvoiceError('');
    try {
      await downloadInvoice(order.id);
    } catch (e) {
      setInvoiceError(e instanceof Error ? e.message : 'Failed to download invoice');
    } finally {
      setDownloadingInvoice(false);
    }
  }

  useEffect(() => {
    fetchOrder(params.id)
      .then((o) => setOrder(o))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
    fetchOrderHistory(params.id).then(setHistory).catch(() => setHistory([]));
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center text-[#A08070] text-sm">Loading order…</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-4">Order not found.</p>
          <Link href="/orders" className="text-[#C0593A] hover:underline font-semibold">Back to Orders →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/orders" className="text-sm text-[#C0593A] hover:underline mb-4 inline-block">← Back to Orders</Link>

        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-bold text-[#2C1810]">Order #{order.id.slice(0, 8)}</h1>
            {['PAID', 'REFUND_INITIATED', 'REFUNDED'].includes(order.paymentStatus) && (
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                className="text-xs font-semibold text-[#C0593A] hover:underline disabled:opacity-40"
              >
                {downloadingInvoice ? 'Preparing…' : 'Download Invoice'}
              </button>
            )}
          </div>
          <p className="text-xs text-[#A08070] mb-6">
            Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {invoiceError && <p className="text-xs text-red-600 -mt-5 mb-6">{invoiceError}</p>}

          <StatusStepper status={order.status} history={history} />

          <div className="space-y-3 mb-5">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b border-[#F0E8E2] pb-3">
                <div className="w-12 h-12 bg-[#FAEEE9] rounded-xl flex items-center justify-center text-xl shrink-0">🏗️</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2C1810] truncate">{item.material?.name ?? 'Material'}</p>
                  <p className="text-xs text-[#A08070]">Qty {item.quantity} × ₹{Number(item.unitPrice).toLocaleString('en-IN')}</p>
                </div>
                <p className="text-sm font-bold text-[#2C1810] shrink-0">₹{Number(item.lineTotal).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-bold text-[#2C1810] mb-6">
            <span>Total</span>
            <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
          </div>

          {order.shippingAddress && (
            <div className="bg-[#FDF8F5] rounded-xl p-4 mb-2">
              <p className="text-xs font-semibold text-[#A08070] uppercase tracking-wide mb-1">Shipping Address</p>
              <p className="text-sm text-[#2C1810]">{order.shippingAddress}</p>
            </div>
          )}

          {order.refunds && order.refunds.length > 0 && (
            <div className="bg-[#FDF8F5] rounded-xl p-4 mt-2">
              <p className="text-xs font-semibold text-[#A08070] uppercase tracking-wide mb-2">Refunds</p>
              <div className="space-y-2">
                {order.refunds.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-[#2C1810] font-semibold">₹{(r.amount / 100).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-[#A08070]">{r.reason}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                      r.status === 'PROCESSED' ? 'bg-green-100 text-green-800 border-green-200'
                      : r.status === 'FAILED' ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {r.status === 'PROCESSED' ? 'Refunded' : r.status === 'FAILED' ? 'Failed' : 'Processing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
