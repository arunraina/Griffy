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

export type StorageFolder = 'avatars' | 'materials' | 'documents';

// Uploads a file directly to S3 via a presigned URL and returns the public
// URL to store on the record (KYC document, avatar, material image, etc.).
export async function uploadFile(folder: StorageFolder, file: File): Promise<string> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/storage/presigned-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ folder, contentType: file.type }),
  });
  if (!res.ok) throw new Error('Failed to get upload URL');
  const { url, publicUrl } = await res.json();

  const putRes = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  if (!putRes.ok) throw new Error('Failed to upload file');

  return publicUrl;
}
