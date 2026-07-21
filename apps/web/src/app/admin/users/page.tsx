'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchAdminUsers, suspendUser, unsuspendUser, setAdminRole, ADMIN_ROLES, type AdminUser, type AdminRole } from '@/lib/admin';
import { useAuth } from '@/lib/auth-provider';
import { SkeletonListRows } from '@/components/Skeleton';
import CreateUserModal from '@/components/admin/CreateUserModal';

const ROLES = ['', 'HOMEOWNER', 'CONTRACTOR', 'LABOUR', 'SERVICE_EXPERT', 'MATERIAL_SUPPLIER', 'LAND_OWNER', 'PROPERTY_SELLER', 'BUILDER', 'PROPERTY_AGENT', 'ADMIN'];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const { me } = useAuth();
  const isSuperAdmin = me?.adminRole === 'SUPER_ADMIN';

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

  async function handleToggleSuspend(u: AdminUser) {
    setUpdating(u.id);
    try {
      if (u.isSuspended) await unsuspendUser(u.id); else await suspendUser(u.id);
      load();
    } catch { /* retry available */ } finally { setUpdating(null); }
  }

  async function handleSetAdminRole(u: AdminUser, value: string) {
    if (!value) return;
    setUpdating(u.id);
    try {
      await setAdminRole(u.id, value as AdminRole);
      load();
    } catch { /* retry available */ } finally { setUpdating(null); }
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
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${u.isSuspended ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                    {u.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
                <p className="text-sm text-[#6B5248]">{u.email}</p>
                {u.phone && <p className="text-xs text-[#A08070]">{u.phone}</p>}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0E8E2]">
                  <div className="text-xs text-[#A08070]">
                    <span className="font-semibold text-[#6B5248]">{u.role}</span>
                    {u.adminRole && <span className="ml-1 text-[10px] font-semibold text-[#9E3F24] bg-[#FAEEE9] px-1.5 py-0.5 rounded">{u.adminRole}</span>}
                    {' '}· Joined {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </div>
                  <button
                    onClick={() => handleToggleSuspend(u)}
                    disabled={updating === u.id || !!u.adminRole}
                    title={u.adminRole ? 'Cannot suspend an admin from here' : undefined}
                    className={`text-xs font-semibold hover:underline disabled:opacity-40 py-1 ${u.isSuspended ? 'text-green-700' : 'text-red-600'}`}
                  >
                    {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                </div>
                {isSuperAdmin && (
                  <select
                    value={u.adminRole ?? ''}
                    onChange={(e) => handleSetAdminRole(u, e.target.value)}
                    disabled={updating === u.id}
                    className="mt-2 w-full text-xs border border-[#EBE0D8] rounded-lg px-2 py-1.5 disabled:opacity-40"
                  >
                    <option value="">{u.adminRole ? 'Change admin role…' : 'Grant admin role…'}</option>
                    {ADMIN_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>

          {/* Desktop/tablet: table */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#EBE0D8] shadow-sm overflow-hidden overflow-x-auto">
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
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${u.isSuspended ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6B5248]">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSuspend(u)}
                          disabled={updating === u.id || !!u.adminRole}
                          title={u.adminRole ? 'Cannot suspend an admin from here' : undefined}
                          className={`text-xs font-semibold hover:underline disabled:opacity-40 ${u.isSuspended ? 'text-green-700' : 'text-red-600'}`}
                        >
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                        {isSuperAdmin && (
                          <select
                            value={u.adminRole ?? ''}
                            onChange={(e) => handleSetAdminRole(u, e.target.value)}
                            disabled={updating === u.id}
                            className="text-xs border border-[#EBE0D8] rounded-lg px-1.5 py-1 disabled:opacity-40"
                          >
                            <option value="">{u.adminRole ? 'Change role…' : 'Grant admin…'}</option>
                            {ADMIN_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        )}
                      </div>
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
