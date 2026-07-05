'use client';

import { useEffect, useState } from 'react';
import { fetchMyKyc, submitMyKyc, type KycDetail, type KycSubmitInput } from '@/lib/kyc';
import { uploadFile } from '@/lib/storage';

const STATUS_BADGE: Record<KycDetail['status'], { label: string; cls: string }> = {
  NOT_SUBMITTED: { label: 'Not submitted', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  PENDING: { label: '⏳ Under review', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  VERIFIED: { label: '✅ Verified', cls: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED: { label: '❌ Rejected', cls: 'bg-red-50 text-red-700 border-red-200' },
};

export default function KycSection() {
  const [kyc, setKyc] = useState<KycDetail | null>(null);
  const [form, setForm] = useState<KycSubmitInput>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'pan' | 'bank' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyKyc()
      .then((data) => {
        setKyc(data);
        setForm({
          aadhaarNumber: data.aadhaarNumber ?? '',
          panNumber: data.panNumber ?? '',
          gstNumber: data.gstNumber ?? '',
          businessName: data.businessName ?? '',
          bankAccountNumber: data.bankAccountNumber ?? '',
          bankIfsc: data.bankIfsc ?? '',
          bankAccountHolderName: data.bankAccountHolderName ?? '',
          panCardUrl: data.panCardUrl ?? '',
          bankProofUrl: data.bankProofUrl ?? '',
        });
      })
      .catch(() => setError('Could not load KYC details.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(field: 'panCardUrl' | 'bankProofUrl', kind: 'pan' | 'bank', file: File) {
    setUploading(kind);
    setError('');
    try {
      const url = await uploadFile('documents', file);
      setForm((f) => ({ ...f, [field]: url }));
    } catch {
      setError('Upload failed — please try again.');
    } finally {
      setUploading(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const updated = await submitMyKyc(form);
      setKyc(updated);
    } catch {
      setError('Could not save KYC details — please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="bg-white rounded-2xl border border-[#EBE0D8] p-8 text-center text-sm text-[#A08070]">Loading…</div>;
  }

  const badge = kyc ? STATUS_BADGE[kyc.status] : STATUS_BADGE.NOT_SUBMITTED;
  const locked = kyc?.status === 'VERIFIED';

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-[#2C1810]">KYC & Bank Details</h2>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badge.cls}`}>{badge.label}</span>
        </div>
        <p className="text-xs text-[#6B5248]">
          Required to receive escrow payouts on Griffy. Verified by our team, usually within 24–48 hours.
        </p>
        {kyc?.status === 'REJECTED' && kyc.rejectionReason && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
            Rejected: {kyc.rejectionReason} — update the details below and resubmit.
          </p>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5 space-y-4">
        <p className="text-xs font-bold text-[#A08070] uppercase tracking-wide">Identity</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-1.5">Aadhaar Number</label>
            <input disabled={locked} value={form.aadhaarNumber ?? ''} onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value })}
              placeholder="XXXX XXXX XXXX" maxLength={12}
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A] disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-1.5">PAN Number</label>
            <input disabled={locked} value={form.panNumber ?? ''} onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
              placeholder="ABCDE1234F" maxLength={10}
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A] disabled:bg-gray-50" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B5248] mb-1.5">PAN Card Copy</label>
          {form.panCardUrl ? (
            <a href={form.panCardUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C0593A] hover:underline">✓ Uploaded — view file</a>
          ) : (
            <input disabled={locked} type="file" accept="image/*,.pdf"
              onChange={(e) => e.target.files?.[0] && handleUpload('panCardUrl', 'pan', e.target.files[0])}
              className="text-xs text-[#6B5248]" />
          )}
          {uploading === 'pan' && <p className="text-xs text-[#A08070] mt-1">Uploading…</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5 space-y-4">
        <p className="text-xs font-bold text-[#A08070] uppercase tracking-wide">Business (if applicable)</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-1.5">Business Name</label>
            <input disabled={locked} value={form.businessName ?? ''} onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A] disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-1.5">GST Number</label>
            <input disabled={locked} value={form.gstNumber ?? ''} onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
              placeholder="Optional"
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A] disabled:bg-gray-50" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5 space-y-4">
        <p className="text-xs font-bold text-[#A08070] uppercase tracking-wide">Bank Account (for payouts)</p>
        <div>
          <label className="block text-xs font-semibold text-[#6B5248] mb-1.5">Account Holder Name</label>
          <input disabled={locked} value={form.bankAccountHolderName ?? ''} onChange={(e) => setForm({ ...form, bankAccountHolderName: e.target.value })}
            className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A] disabled:bg-gray-50" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-1.5">Account Number</label>
            <input disabled={locked} value={form.bankAccountNumber ?? ''} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A] disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-1.5">IFSC Code</label>
            <input disabled={locked} value={form.bankIfsc ?? ''} onChange={(e) => setForm({ ...form, bankIfsc: e.target.value.toUpperCase() })}
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C0593A] disabled:bg-gray-50" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B5248] mb-1.5">Bank Proof (cancelled cheque / passbook copy)</label>
          {form.bankProofUrl ? (
            <a href={form.bankProofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C0593A] hover:underline">✓ Uploaded — view file</a>
          ) : (
            <input disabled={locked} type="file" accept="image/*,.pdf"
              onChange={(e) => e.target.files?.[0] && handleUpload('bankProofUrl', 'bank', e.target.files[0])}
              className="text-xs text-[#6B5248]" />
          )}
          {uploading === 'bank' && <p className="text-xs text-[#A08070] mt-1">Uploading…</p>}
        </div>
      </div>

      {!locked && (
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors">
          {saving ? 'Submitting…' : kyc?.status === 'REJECTED' ? 'Resubmit for Review' : 'Submit for Verification'}
        </button>
      )}

      <p className="text-[11px] text-[#A08070] text-center">
        Aadhaar/PAN entries are stored as provided — this is a data-collection step for our team to verify manually,
        not a live government e-KYC check.
      </p>
    </div>
  );
}
