import { createClient } from './supabase';
import { getImpersonationToken } from './impersonation';
import { NotAuthenticatedError } from './users';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function authHeaders(): Promise<Record<string, string>> {
  const impersonationToken = getImpersonationToken();
  if (impersonationToken) {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${impersonationToken}` };
  }
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new NotAuthenticatedError();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export type ReportTargetType =
  | 'CONTRACTOR' | 'LABOUR' | 'SERVICE_EXPERT' | 'MATERIAL_SUPPLIER'
  | 'BUILDER' | 'PROPERTY_AGENT' | 'MATERIAL' | 'LAND' | 'PROPERTY';

export async function submitReport(targetType: ReportTargetType, targetId: string, reason: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/reports`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ targetType, targetId, reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to submit report');
  }
}

export interface AdminReport {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  reporter: { name: string; email: string };
}

export async function fetchAdminReports(status?: string): Promise<AdminReport[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/reports${status ? `?status=${status}` : ''}`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function updateReportStatus(id: string, status: 'RESOLVED' | 'DISMISSED'): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/admin/reports/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update report');
}
