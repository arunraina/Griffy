'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchConversations, type Conversation } from '@/lib/chat';
import { NotAuthenticatedError } from '@/lib/users';
import { SkeletonListRows } from '@/components/Skeleton';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchConversations()
      .then(setConversations)
      .catch((e) => {
        if (e instanceof NotAuthenticatedError) setNeedsAuth(true);
        else setLoadError(true);
      });
    const interval = setInterval(() => {
      fetchConversations().then(setConversations).catch(() => undefined);
    }, 20_000);
    return () => clearInterval(interval);
  }, []);

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-4">Log in to view your messages.</p>
          <Link href="/login?redirect=/messages" className="text-[#C0593A] hover:underline font-semibold">Log In →</Link>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-2">Could not load your messages.</p>
          <p className="text-sm text-[#6B5248]">Check your connection and try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-[#2C1810] mb-6" style={{ fontFamily: 'Georgia, serif' }}>Messages</h1>

        {!conversations ? (
          <SkeletonListRows count={5} />
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-10 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-semibold text-[#2C1810] mb-1">No conversations yet</p>
            <p className="text-sm text-[#6B5248]">Messages you send to contractors, labour, service experts, or property sellers will show up here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => {
              const initials = c.otherUser.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <Link key={c.id} href={`/messages/${c.id}`}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4 hover:border-[#D8B8A8] transition-colors">
                  {c.otherUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.otherUser.avatarUrl} alt={c.otherUser.name} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-[#FAEEE9] text-[#C0593A] text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#2C1810] truncate">{c.otherUser.name}</p>
                      <span className="text-xs text-[#A08070] flex-shrink-0">{timeAgo(c.lastMessageAt)}</span>
                    </div>
                    <p className="text-sm text-[#6B5248] truncate mt-0.5">
                      {c.lastMessage?.body ?? 'No messages yet'}
                    </p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="bg-[#C0593A] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {c.unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
