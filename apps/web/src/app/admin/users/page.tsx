'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchAdminUsers, setAdminRole, startImpersonation, ADMIN_ROLES, type AdminUser, type AdminRole } from '@/lib/admin';
import { useAuth } from '@/lib/auth-provider';
import { SkeletonListRows } from '@/components/Skeleton';
import CreateUserModal from '@/components/admin/CreateUserModal';
import StatusChangeModal from '@/components/admin/StatusChangeModal';
import StatusChip from '@/components/admin/StatusChip';
import { beginImpersonation } from '@/lib/impersonation';

const ROLES = ['', 'HOMEOWNER', 'CONTRACTOR', 'LABOUR', 'SERVICE_EXPERT', 'MATERIAL_SUPPLIER', 'LAND_OWNER', 'PROPERTY_SELLER', 'BUILDER', 'PROPERTY_AGENT', 'ADMIN'];

// Sentinel for the role <select> -- distinct from the empty placeholder
// value (which means "no selection made"), this one means "explicitly set
// adminRole to null", i.e. remove admin access entirely.
const REMOVE_ADMIN_ACCESS = '__REMOVE__';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [statusModalTarget, setStatusModalTarget] = useState<AdminUser | null>(null);
  const [impersonateTarget, setImpersonateTarget] = useState<AdminUser | null>(null);
  const [impersonating, setImpersonating] = useState(false);
  const [impersonateError, setImpersonateError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { me } = useAuth();
  const isSuperAdmin = me?.adminRole === 'SUPER_ADMIN';
  // A regular Admin can manage the scoped tiers too (matches the backend's
  // setAdminRole rules) -- just never grant Super Admin or touch an
  // existing Super Admin, and never their own row.
  const canManageRoles = isSuperAdmin || me?.adminRole === 'ADMIN';
  const roleOptions = isSuperAdmin ? ADMIN_ROLES : ADMIN_ROLES.filter((r) => r !== 'SUPER_ADMIN');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAdminUsers(search || undefined, role || undefined)
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [search, role]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  // Mirrors the hierarchy rule already enforced server-side (AdminHierarchyService):
  // a regular Admin can't touch any admin's status, only a Super Admin can.
  function canChangeStatus(u: AdminUser): boolean {
    if (u.id === me?.id) return false;
    if (u.adminRole && !isSuperAdmin) return false;
    return true;
  }

  function canActAsUser(u: AdminUser): boolean {
    return isSuperAdmin && u.id !== me?.id && u.adminRole !== 'SUPER_ADMIN';
  }

  async function handleSetAdminRole(u: AdminUser, value: string) {
    if (!value) return;
    setUpdating(u.id);
    setOpenMenuId(null);
    try {
      await setAdminRole(u.id, value === REMOVE_ADMIN_ACCESS ? null : (value as AdminRole));
      load();
    } catch { /* retry available */ } finally { setUpdating(null); }
  }

  async function handleImpersonate() {
    if (!impersonateTarget) return;
    setImpersonating(true);
    setImpersonateError('');
    try {
      const { impersonationToken, targetUser } = await startImpersonation(impersonateTarget.id);
      beginImpersonation(impersonationToken, { id: targetUser.id, name: targetUser.name, role: targetUser.role });
      window.location.href = '/home';
    } catch (e) {
      setImpersonateError(e instanceof Error ? e.message : 'Failed to start impersonation');
      setImpersonating(false);
    }
  }

  function RoleSelect({ u }: { u: AdminUser }) {
    if (!canManageRoles || u.id === me?.id || (u.adminRole === 'SUPER_ADMIN' && !isSuperAdmin)) return null;
    return (
      <select
        value=""
        onChange={(e) => handleSetAdminRole(u, e.target.value)}
        disabled={updating === u.id}
        className="w-full text-xs border border-[#EBE0D8] rounded-lg px-2 py-1.5 disabled:opacity-40"
      >
        <option value="">{u.adminRole ? 'Change admin role…' : 'Grant admin role…'}</option>
        {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
        {u.adminRole && <option value={REMOVE_ADMIN_ACCESS}>Remove admin access</option>}
      </select>
    );
  }

  function RowMenu({ u }: { u: AdminUser }) {
    const open = openMenuId === u.id;
    return (
      <div className="relative">
        <button
          onClick={() => setOpenMenuId(open ? null : u.id)}
          className="text-[#A08070] hover:text-[#C0593A] px-2 py-1 text-lg leading-none"
        >
          ⋮
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-[#EBE0D8] rounded-xl shadow-lg w-56 p-2 space-y-1">
              <Link
                href={`/admin/profile/${u.id}`}
                onClick={() => setOpenMenuId(null)}
                className="block text-sm text-[#2C1810] hover:bg-[#FAEEE9] rounded-lg px-3 py-2"
              >
                View / Edit Profile
              </Link>
              {canActAsUser(u) && (
                <button
                  onClick={() => { setOpenMenuId(null); setImpersonateTarget(u); }}
                  className="w-full text-left text-sm text-[#6B2FB3] hover:bg-[#F3E8FF] rounded-lg px-3 py-2"
                >
                  👁️ Act as User
                </button>
              )}
              {canChangeStatus(u) && (
                <button
                  onClick={() => { setOpenMenuId(null); setStatusModalTarget(u); }}
                  className="w-full text-left text-sm text-[#2C1810] hover:bg-[#FAEEE9] rounded-lg px-3 py-2"
                >
                  Change Status…
                </button>
              )}
              {canManageRoles && (u.id !== me?.id) && !(u.adminRole === 'SUPER_ADMIN' && !isSuperAdmin) && (
                <div className="border-t border-[#F0E8E2] pt-1.5 mt-1.5">
                  <RoleSelect u={u} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#2C1810]">Users</h1>
          <p className="text-sm text-[#6B5248] mt-0.5">Search and manage platform users. Showing up to 100 results.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="shrink-0 text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] text-white px-4 py-2.5 rounded-xl"
        >
          + Add User
        </button>
      </div>

      <CreateUserModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={load} />

      {statusModalTarget && (
        <StatusChangeModal
          userId={statusModalTarget.id}
          userName={statusModalTarget.name}
          currentStatus={statusModalTarget.accountStatus}
          onClose={() => setStatusModalTarget(null)}
          onChanged={() => { setStatusModalTarget(null); load(); }}
        />
      )}

      {impersonateTarget && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => !impersonating && setImpersonateTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
              <p className="text-sm text-[#2C1810]">
                You are about to view Griffy as <span className="font-semibold">{impersonateTarget.name}</span> ({impersonateTarget.role}).
                Your admin session will be preserved. All actions you take will be logged.
              </p>
              {impersonateError && <p className="text-xs text-red-600 mt-3">{impersonateError}</p>}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setImpersonateTarget(null)}
                  disabled={impersonating}
                  className="flex-1 text-sm font-semibold text-[#6B5248] border border-[#EBE0D8] px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImpersonate}
                  disabled={impersonating}
                  className="flex-1 text-sm font-semibold bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white px-4 py-2 rounded-lg"
                >
                  {impersonating ? 'Starting…' : `Confirm — View as ${impersonateTarget.name}`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or phone…"
          className="flex-1 min-w-[220px] border border-[#EBE0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}
          className="border border-[#EBE0D8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C0593A]">
          {ROLES.map((r) => <option key={r} value={r}>{r || 'All roles'}</option>)}
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      {loading ? (
        <SkeletonListRows count={6} />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-semibold text-[#2C1810]">No users match</p>
        </div>
      ) : (
        <>
          {/* Mobile: card list — a table's columns don't reflow at 360px, they just get
              clipped by the overflow-x-auto wrapper below, so this is a separate layout,
              not a CSS-only fix. */}
          <div className="md:hidden space-y-3">
            {rows.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <Link href={`/admin/profile/${u.id}`} className="font-semibold text-[#2C1810] hover:text-[#C0593A] hover:underline">
                      #{u.userNumber} · {u.name}
                    </Link>
                    {u.isFirstParty && <span className="text-[10px] font-semibold text-[#9E3F24] bg-[#FAEEE9] px-1.5 py-0.5 rounded">Griffy</span>}
                  </div>
                  <StatusChip status={u.accountStatus} expiresAt={u.statusExpiresAt} />
                </div>
                <p className="text-sm text-[#6B5248]">{u.email}</p>
                {u.phone && <p className="text-xs text-[#A08070]">{u.phone}</p>}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0E8E2]">
                  <div className="text-xs text-[#A08070]">
                    <span className="font-semibold text-[#6B5248]">{u.role}</span>
                    {u.adminRole && <span className="ml-1 text-[10px] font-semibold text-[#9E3F24] bg-[#FAEEE9] px-1.5 py-0.5 rounded">{u.adminRole}</span>}
                    {' '}· Joined {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </div>
                  <RowMenu u={u} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/tablet: table */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#EBE0D8] shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EBE0D8] text-left text-xs text-[#A08070] uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">City</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-b border-[#F0E8E2] last:border-none">
                    <td className="px-5 py-3 text-xs text-[#A08070] font-semibold">{u.userNumber}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/profile/${u.id}`} className="font-semibold text-[#2C1810] hover:text-[#C0593A] hover:underline">
                        {u.name}
                      </Link>
                      {u.isFirstParty && <span className="text-[10px] font-semibold text-[#9E3F24] bg-[#FAEEE9] px-1.5 py-0.5 rounded">Griffy</span>}
                    </td>
                    <td className="px-5 py-3 text-[#6B5248]">
                      <p>{u.email}</p>
                      {u.phone && <p className="text-xs text-[#A08070]">{u.phone}</p>}
                    </td>
                    <td className="px-5 py-3 text-[#6B5248] text-xs">{u.city ? `${u.city}${u.state ? `, ${u.state}` : ''}` : <span className="text-[#A08070]">—</span>}</td>
                    <td className="px-5 py-3 text-[#6B5248] text-xs">
                      {u.role}
                      {u.adminRole && <span className="ml-1 text-[10px] font-semibold text-[#9E3F24] bg-[#FAEEE9] px-1.5 py-0.5 rounded">{u.adminRole}</span>}
                    </td>
                    <td className="px-5 py-3">
                      <StatusChip status={u.accountStatus} expiresAt={u.statusExpiresAt} />
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6B5248]">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <RowMenu u={u} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
