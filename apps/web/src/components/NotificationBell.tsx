'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, type Notification } from '@/lib/notifications';

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

export default function NotificationBell() {
  const router = useRouter();
  const { unreadCount, refresh } = useNotifications();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchNotifications({ pageSize: 10 })
      .then((page) => setItems(page.items))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleItemClick(n: Notification) {
    if (!n.isRead) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, isRead: true } : i)));
      await markNotificationRead(n.id);
      refresh();
    }
    setOpen(false);
    if (n.linkUrl) router.push(n.linkUrl);
  }

  async function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsRead();
    refresh();
  }

  const hasUnread = items.some((n) => !n.isRead);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative text-gray-600 hover:text-[#C0593A] transition-colors w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#FAEEE9]"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#C0593A] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <div className="bg-white border border-[#EBE0D8] rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0E8E2]">
              <span className="text-sm font-semibold text-[#2C1810]">Notifications</span>
              {hasUnread && (
                <button onClick={handleMarkAllRead} className="text-xs font-semibold text-[#C0593A] hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-sm text-[#A08070] px-4 py-6 text-center">Loading…</p>
              ) : items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-2xl mb-2">🔔</p>
                  <p className="text-sm text-[#6B5248]">No notifications yet</p>
                </div>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-[#F5EFEA] last:border-b-0 hover:bg-[#FAEEE9] transition-colors ${
                      n.isRead ? '' : 'bg-[#FAEEE9]/60'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#2C1810] truncate">{n.title}</p>
                        <p className="text-xs text-[#6B5248] mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[11px] text-[#A08070] mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#C0593A] shrink-0 mt-1.5" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
