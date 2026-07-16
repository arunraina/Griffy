'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchConversation, fetchMessages, sendChatMessage, markConversationRead, type Message } from '@/lib/chat';
import { fetchMe } from '@/lib/users';

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const [myId, setMyId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState('');
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [needsAuth, setNeedsAuth] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetchMessages(params.id).then(setMessages).catch(() => undefined);
    markConversationRead(params.id).catch(() => undefined);
  }, [params.id]);

  useEffect(() => {
    fetchMe().then((me) => setMyId(me.id)).catch(() => setNeedsAuth(true));
    fetchConversation(params.id).then((c) => {
      if (c?.otherUser) { setOtherName(c.otherUser.name); setOtherAvatar(c.otherUser.avatarUrl); }
    });
    load();
    const interval = setInterval(load, 5_000);
    return () => clearInterval(interval);
  }, [params.id, load]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = input.trim();
    if (!body) return;
    setSending(true);
    setError('');
    try {
      const message = await sendChatMessage(params.id, body);
      setMessages((prev) => (prev ? [...prev, message] : [message]));
      setInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#2C1810] font-semibold mb-4">Log in to view this conversation.</p>
          <Link href="/login" className="text-[#C0593A] hover:underline font-semibold">Log In →</Link>
        </div>
      </div>
    );
  }

  const initials = otherName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex flex-col">
      <div className="max-w-2xl w-full mx-auto flex flex-col flex-1 px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/messages" className="text-[#A08070] hover:text-[#C0593A] text-lg">←</Link>
          {otherAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={otherAvatar} alt={otherName} className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#FAEEE9] text-[#C0593A] text-xs font-bold flex items-center justify-center">
              {initials}
            </div>
          )}
          <p className="text-sm font-bold text-[#2C1810]">{otherName || 'Conversation'}</p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#EBE0D8] p-4 space-y-3 min-h-[50vh] max-h-[65vh]">
          {!messages ? (
            <p className="text-sm text-[#A08070] text-center mt-8">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-[#A08070] text-center mt-8">No messages yet. Say hello!</p>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === myId;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    mine ? 'bg-[#C0593A] text-white' : 'bg-[#FAEEE9] text-[#2C1810]'
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-[#A08070]'}`}>
                      {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

        <form onSubmit={handleSend} className="flex gap-2 mt-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 bg-white border border-[#EBE0D8] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C0593A] transition-colors"
          />
          <button type="submit" disabled={sending || !input.trim()}
            className="bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-40 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
