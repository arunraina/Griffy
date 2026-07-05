import { createClient } from './supabase';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface KycDetail {
  id: string | null;
  userId: string;
  aadhaarNumber: string | null;
  panNumber: string | null;
  gstNumber: string | null;
  businessName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  bankAccountHolderName: string | null;
  panCardUrl: string | null;
  bankProofUrl: string | null;
  status: KycStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
}

export interface KycSubmitInput {
  aadhaarNumber?: string;
  panNumber?: string;
  gstNumber?: string;
  businessName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountHolderName?: string;
  panCardUrl?: string;
  bankProofUrl?: string;
}

export async function fetchMyKyc(): Promise<KycDetail> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/users/me/kyc`, { headers });
  if (!res.ok) throw new Error('Failed to load KYC details');
  return res.json();
}

export async function submitMyKyc(data: KycSubmitInput): Promise<KycDetail> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/users/me/kyc`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit KYC details');
  return res.json();
}
