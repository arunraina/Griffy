'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, type Notification } from '@/lib/notifications';
import { useNotifications } from '@/context/NotificationContext';
import { SkeletonListRows } from '@/components/Skeleton';

const TYPE_EMOJI: Record<string, string> = {
  'booking.created': '📅',
  'booking.confirmed': '✅',
  'booking.cancelled': '❌',
  'booking.completed': '🏁',
  'order.placed': '🛒',
  'order.status_changed': '📦',
  'order.rejected': '🚫',
  'profile.approved': '🎉',
  'profile.rejected': '✏️',
  'project.bid_received': '💰',
  'project.bid_accepted': '✅',
  'project.bid_rejected': '📄',
};

function emojiFor(type: string): string {
  return TYPE_EMOJI[type] ?? '🔔';
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const { refresh } = useNotifications();

  useEffect(() => {
    fetchNotifications({ pageSize: 50 })
      .then((page) => setItems(page.items))
      .catch(() => setNeedsAuth(true))
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    await markNotificationRead(id);
    refresh();
  }

  async function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsRead();
    refresh();
  }

  if (!loading && needsAuth) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-4">Log in to view your notifications.</p>
          <Link href="/login" className="text-[#C0593A] hover:underline font-semibold">Log In →</Link>
        </div>
      </div>
    );
  }

  const hasUnread = items.some((n) => !n.isRead);

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>Notifications</h1>
          {hasUnread && (
            <button onClick={handleMarkAllRead} className="text-sm font-semibold text-[#C0593A] hover:underline">
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <SkeletonListRows count={6} />
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-10 text-center">
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-semibold text-[#2C1810] mb-1">No notifications yet</p>
            <p className="text-sm text-[#6B5248]">We&apos;ll let you know when something needs your attention.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => {
              const content = (
                <div
                  className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${
                    n.isRead ? 'bg-white border-[#EBE0D8]' : 'bg-[#FAEEE9] border-[#E8C4B0]'
                  }`}
                >
                  <span className="text-xl shrink-0">{emojiFor(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2C1810]">{n.title}</p>
                    <p className="text-sm text-[#6B5248] mt-0.5">{n.body}</p>
                    <p className="text-xs text-[#A08070] mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#C0593A] shrink-0 mt-1.5" />}
                </div>
              );

              return n.linkUrl ? (
                <Link key={n.id} href={n.linkUrl} onClick={() => !n.isRead && handleMarkRead(n.id)}>
                  {content}
                </Link>
              ) : (
                <button key={n.id} onClick={() => !n.isRead && handleMarkRead(n.id)} className="w-full text-left">
                  {content}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
