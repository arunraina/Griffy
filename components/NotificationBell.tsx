"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";

interface NotifItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_EMOJI: Record<string, string> = {
  enquiry_received: "💬",
  enquiry_replied: "💬",
  bid_received: "📋",
  bid_status_changed: "🏆",
  order_placed: "📦",
  order_status: "🔄",
  welcome: "👋",
};

export default function NotificationBell() {
  const { unreadCount, refresh } = useNotifications();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchItems() {
    const token = typeof window !== "undefined" ? localStorage.getItem("griffy_token") : null;
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/notifications?page=1&limit=8`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems(data ?? []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function markRead(id: string) {
    const token = typeof window !== "undefined" ? localStorage.getItem("griffy_token") : null;
    if (!token) return;
    await fetch(`${BASE}/notifications/${id}/read`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    refresh();
  }

  async function markAllRead() {
    const token = typeof window !== "undefined" ? localStorage.getItem("griffy_token") : null;
    if (!token) return;
    await fetch(`${BASE}/notifications/read-all`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    refresh();
  }

  function handleOpen() {
    setOpen((v) => {
      if (!v) fetchItems();
      return !v;
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-stone-600 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <h3 className="font-bold text-stone-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-stone-400 hover:text-orange-500 transition-colors font-medium">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-6 text-center text-stone-400 text-sm">Loading…</div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-stone-200 mx-auto mb-2" />
                <p className="text-sm text-stone-400">No notifications yet</p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => { if (!n.isRead) markRead(n.id); setOpen(false); }}
                  className={`flex gap-3 px-4 py-3 border-b border-stone-50 cursor-pointer transition-colors hover:bg-stone-50 ${!n.isRead ? "bg-orange-50/60" : ""}`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{TYPE_EMOJI[n.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold text-stone-900" : "text-stone-700"}`}>{n.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-stone-400 mt-1">{relativeTime(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-stone-100">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              View all notifications <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
