'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  fetchTurnkeyProject, fetchTurnkeyUpdates, acceptTurnkeyProject, declineTurnkeyProject,
  completeTurnkeyProject, cancelTurnkeyProject, postTurnkeyUpdate, proposeMilestone,
  submitMilestone, approveMilestone, requestMilestoneChanges,
  type TurnkeyProjectDetail, type TurnkeyProjectUpdate, type TurnkeyMilestone,
} from '@/lib/turnkey';
import { fetchMe, NotAuthenticatedError } from '@/lib/users';
import { createPaymentOrder, verifyPayment } from '@/lib/payments';
import { loadRazorpayScript } from '@/lib/razorpay';

const STATUS_STYLE: Record<string, string> = {
  REQUESTED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
};

const MILESTONE_STYLE: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600 border-gray-200',
  SUBMITTED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CHANGES_REQUESTED: 'bg-red-50 text-red-700 border-red-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
};

export default function TurnkeyProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [myId, setMyId] = useState<string | null>(null);
  const [project, setProject] = useState<TurnkeyProjectDetail | null>(null);
  const [updates, setUpdates] = useState<TurnkeyProjectUpdate[]>([]);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetchTurnkeyProject(params.id).then(setProject).catch(() => setNotFound(true));
    fetchTurnkeyUpdates(params.id).then(setUpdates).catch(() => undefined);
  }, [params.id]);

  useEffect(() => {
    fetchMe().then((me) => setMyId(me.id)).catch((e) => { if (e instanceof NotAuthenticatedError) setNeedsAuth(true); });
    load();
  }, [load]);

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-4">Log in to view this project.</p>
          <Link href={`/login?redirect=/turnkey-projects/${params.id}`} className="text-[#C0593A] hover:underline font-semibold">Log In →</Link>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <p className="text-[#2C1810] font-semibold">Project not found.</p>
      </div>
    );
  }

  if (!project || !myId) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#C0593A] border-t-transparent animate-spin" />
      </div>
    );
  }

  const isProvider = project.providerId === myId;
  const isCustomer = project.customerId === myId;
  const milestoneTotal = project.milestones.reduce((sum, m) => sum + Number(m.amount), 0);

  async function runAction(fn: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await fn();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <Link href="/turnkey-projects" className="text-xs text-[#A08070] hover:text-[#C0593A]">← Turnkey Projects</Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>{project.title}</h1>
              <p className="text-xs text-[#A08070] mt-1">
                {isProvider ? `Customer: ${project.customer?.name}` : `Provider: ${project.provider?.name ?? '—'}`}
              </p>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLE[project.status]}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-[#6B5248] mb-4">{project.description}</p>
          <div className="flex items-center gap-4 text-sm mb-3">
            <span className="font-bold text-[#C0593A]">₹{Number(project.budget).toLocaleString('en-IN')} budget</span>
            <span className="text-[#A08070]">{project.type === 'TURNKEY' ? 'Turnkey / Full Construction' : 'Land Plotting'}</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-1">
            <div className="bg-[#C0593A] h-full rounded-full" style={{ width: `${project.percentComplete}%` }} />
          </div>
          <p className="text-xs text-[#A08070]">{project.percentComplete}% complete</p>

          {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

          <div className="flex flex-wrap gap-2 mt-4">
            {project.status === 'REQUESTED' && isProvider && (
              <>
                <button disabled={busy} onClick={() => runAction(() => acceptTurnkeyProject(project.id))}
                  className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-xl disabled:opacity-50">
                  Accept Project
                </button>
                <button disabled={busy} onClick={() => runAction(() => declineTurnkeyProject(project.id))}
                  className="text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl disabled:opacity-50">
                  Decline
                </button>
              </>
            )}
            {(project.status === 'ACCEPTED' || project.status === 'IN_PROGRESS') && (
              <>
                <button disabled={busy} onClick={() => runAction(() => completeTurnkeyProject(project.id))}
                  className="text-sm font-semibold border border-green-200 text-green-700 hover:bg-green-50 px-4 py-2 rounded-xl disabled:opacity-50">
                  Mark Completed
                </button>
                <button disabled={busy} onClick={() => runAction(() => cancelTurnkeyProject(project.id))}
                  className="text-sm font-semibold border border-[#EBE0D8] text-[#6B5248] hover:bg-[#FAEEE9] px-4 py-2 rounded-xl disabled:opacity-50">
                  Cancel Project
                </button>
              </>
            )}
          </div>
        </div>

        {(project.status !== 'REQUESTED' && project.status !== 'CANCELLED') && (
          <MilestonesSection
            project={project}
            isProvider={isProvider}
            isCustomer={isCustomer}
            milestoneTotal={milestoneTotal}
            busy={busy}
            setBusy={setBusy}
            setError={setError}
            reload={load}
            router={router}
          />
        )}

        {(project.status === 'ACCEPTED' || project.status === 'IN_PROGRESS' || project.status === 'COMPLETED') && (
          <UpdatesSection projectId={project.id} isProvider={isProvider} updates={updates} reload={load} />
        )}
      </div>
    </div>
  );
}

function MilestonesSection({
  project, isProvider, isCustomer, milestoneTotal, busy, setBusy, setError, reload, router,
}: {
  project: TurnkeyProjectDetail;
  isProvider: boolean;
  isCustomer: boolean;
  milestoneTotal: number;
  busy: boolean;
  setBusy: (b: boolean) => void;
  setError: (e: string) => void;
  reload: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);

  async function handlePropose(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    setBusy(true);
    setError('');
    try {
      await proposeMilestone(project.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        amount: Number(amount),
        sequence: project.milestones.length + 1,
      });
      setTitle(''); setDescription(''); setAmount(''); setShowForm(false);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to propose milestone');
    } finally {
      setBusy(false);
    }
  }

  async function handlePay(m: TurnkeyMilestone) {
    setPayingId(m.id);
    setError('');
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Could not load payment gateway. Check your connection.');

      const amountInPaise = Math.round(Number(m.amount) * 100);
      const payOrder = await createPaymentOrder('milestone', m.id, amountInPaise);

      window.Razorpay && new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        amount: payOrder.amount,
        currency: payOrder.currency,
        name: 'Griffy',
        description: `Milestone: ${m.title}`,
        order_id: payOrder.razorpayOrderId,
        theme: { color: '#C0593A' },
        modal: { confirm_close: true, ondismiss: () => setPayingId(null) },
        handler: async (response) => {
          try {
            await verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            reload();
          } catch {
            setError('Payment verification failed — contact support if the amount was deducted.');
          } finally {
            setPayingId(null);
          }
        },
      }).open();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start payment');
      setPayingId(null);
    }
  }

  async function handleAction(fn: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await fn();
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  function handleRequestChanges(milestoneId: string) {
    const note = window.prompt('What needs to change?');
    if (!note?.trim()) return;
    handleAction(() => requestMilestoneChanges(milestoneId, note.trim()));
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#2C1810]">Milestones</h2>
        {isProvider && milestoneTotal < Number(project.budget) && (
          <button onClick={() => setShowForm((v) => !v)} className="text-xs font-semibold text-[#C0593A] hover:underline">
            {showForm ? 'Cancel' : '+ Propose Milestone'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handlePropose} className="bg-[#FDF8F5] rounded-xl p-4 mb-4 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Milestone title (e.g. Foundation)"
            className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2}
            className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A] resize-none" />
          <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (₹)"
            className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" />
          <p className="text-xs text-[#A08070]">
            Remaining budget: ₹{(Number(project.budget) - milestoneTotal).toLocaleString('en-IN')}
          </p>
          <button type="submit" disabled={busy} className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-lg disabled:opacity-50">
            Add Milestone
          </button>
        </form>
      )}

      {project.milestones.length === 0 ? (
        <p className="text-sm text-[#A08070]">No milestones proposed yet.</p>
      ) : (
        <div className="space-y-3">
          {project.milestones.map((m) => (
            <div key={m.id} className="border border-[#EBE0D8] rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-[#2C1810]">{m.sequence}. {m.title}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${MILESTONE_STYLE[m.status]}`}>
                  {m.status.replace('_', ' ')}
                </span>
              </div>
              {m.description && <p className="text-xs text-[#6B5248] mb-2">{m.description}</p>}
              <p className="text-sm font-bold text-[#C0593A] mb-2">₹{Number(m.amount).toLocaleString('en-IN')}</p>
              {m.changesRequestedNote && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2">
                  Changes requested: {m.changesRequestedNote}
                </p>
              )}
              {m.paymentStatus === 'PAID' && (
                <p className="text-xs font-semibold text-green-700">✓ Paid</p>
              )}

              <div className="flex gap-2 mt-2">
                {isProvider && (m.status === 'PENDING' || m.status === 'CHANGES_REQUESTED') && (
                  <button disabled={busy} onClick={() => handleAction(() => submitMilestone(m.id))}
                    className="text-xs font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
                    Submit for Review
                  </button>
                )}
                {isCustomer && m.status === 'SUBMITTED' && (
                  <>
                    <button disabled={busy} onClick={() => handleAction(() => approveMilestone(m.id))}
                      className="text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
                      Approve
                    </button>
                    <button disabled={busy} onClick={() => handleRequestChanges(m.id)}
                      className="text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg disabled:opacity-50">
                      Request Changes
                    </button>
                  </>
                )}
                {isCustomer && m.status === 'APPROVED' && m.paymentStatus !== 'PAID' && (
                  <button disabled={payingId === m.id} onClick={() => handlePay(m)}
                    className="text-xs font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
                    {payingId === m.id ? 'Processing…' : `Pay ₹${Number(m.amount).toLocaleString('en-IN')}`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UpdatesSection({
  projectId, isProvider, updates, reload,
}: { projectId: string; isProvider: boolean; updates: TurnkeyProjectUpdate[]; reload: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState('');
  const [percent, setPercent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() || !percent) return;
    setPosting(true);
    setError('');
    try {
      await postTurnkeyUpdate(projectId, { note: note.trim(), percentComplete: Number(percent) });
      setNote(''); setPercent(''); setShowForm(false);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to post update');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#2C1810]">Progress Updates</h2>
        {isProvider && (
          <button onClick={() => setShowForm((v) => !v)} className="text-xs font-semibold text-[#C0593A] hover:underline">
            {showForm ? 'Cancel' : '+ Post Update'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#FDF8F5] rounded-xl p-4 mb-4 space-y-3">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's been done?" rows={3}
            className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A] resize-none" />
          <input type="number" min={0} max={100} value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="% complete"
            className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={posting} className="text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2 rounded-lg disabled:opacity-50">
            Post Update
          </button>
        </form>
      )}

      {updates.length === 0 ? (
        <p className="text-sm text-[#A08070]">No updates posted yet.</p>
      ) : (
        <div className="space-y-3">
          {updates.map((u) => (
            <div key={u.id} className="border-l-2 border-[#C0593A] pl-4">
              <p className="text-xs text-[#A08070] mb-1">
                {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {u.percentComplete}% complete
              </p>
              <p className="text-sm text-[#6B5248]">{u.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
