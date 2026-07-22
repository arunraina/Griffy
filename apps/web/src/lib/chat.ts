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

export interface ChatUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  sender: ChatUser;
}

export interface Conversation {
  id: string;
  otherUser: ChatUser;
  lastMessage: Message | null;
  lastMessageAt: string;
  unreadCount: number;
}

export async function startConversation(otherUserId: string): Promise<Conversation> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/chat/conversations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ otherUserId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to start conversation');
  }
  return res.json();
}

export async function fetchConversations(): Promise<Conversation[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/chat/conversations`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchConversation(conversationId: string): Promise<{ id: string; otherUser: ChatUser } | null> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/chat/conversations/${conversationId}`, { headers });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/chat/conversations/${conversationId}/messages`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function sendChatMessage(conversationId: string, body: string): Promise<Message> {
  const headers = await authHeaders();
  const res = await fetch(`${API}/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to send message');
  }
  return res.json();
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const headers = await authHeaders();
  await fetch(`${API}/chat/conversations/${conversationId}/read`, { method: 'PATCH', headers });
}

export async function fetchUnreadChatCount(): Promise<number> {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${API}/chat/unread-count`, { headers });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
}
