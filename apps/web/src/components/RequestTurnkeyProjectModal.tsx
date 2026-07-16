'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTurnkeyProject, type TurnkeyProjectType } from '@/lib/turnkey';
import { NotAuthenticatedError } from '@/lib/users';

interface Props {
  open: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
}

export default function RequestTurnkeyProjectModal({ open, onClose, providerId, providerName }: Props) {
  const router = useRouter();
  const [type, setType] = useState<TurnkeyProjectType>('TURNKEY');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  function resetAndClose() {
    setTitle(''); setDescription(''); setBudget(''); setTargetEndDate(''); setError('');
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !budget) { setError('Please fill in all required fields.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const project = await createTurnkeyProject({
        providerId, type, title: title.trim(), description: description.trim(),
        budget: Number(budget), targetEndDate: targetEndDate || undefined,
      });
      router.push(`/turnkey-projects/${project.id}`);
    } catch (err) {
      if (err instanceof NotAuthenticatedError) router.push('/login');
      else setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={resetAndClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#2C1810]">Request a Turnkey Project</h2>
            <p className="text-xs text-[#A08070] mt-0.5">With {providerName} — full-service, milestone-based payment</p>
          </div>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-1">Project Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as TurnkeyProjectType)}
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C0593A]">
              <option value="TURNKEY">Turnkey / Full Construction</option>
              <option value="LAND_PLOTTING">Land Plotting</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 2000 sq ft independent house"
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C0593A]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              placeholder="Describe scope, location, requirements…"
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C0593A] resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-1">Total Budget (₹)</label>
            <input type="number" min={1} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="2500000"
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C0593A]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B5248] mb-1">Target Completion (optional)</label>
            <input type="date" value={targetEndDate} onChange={(e) => setTargetEndDate(e.target.value)}
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C0593A]" />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={resetAndClose} disabled={submitting}
              className="text-sm font-semibold text-[#6B5248] px-4 py-2 rounded-lg hover:bg-[#FAEEE9] disabled:opacity-40">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-lg disabled:opacity-40">
              {submitting ? 'Submitting…' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
