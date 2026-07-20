'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { findBestAnswer, isGreeting } from '@/lib/faq-data';
import { useAuth } from '@/lib/auth-provider';

interface Message {
  from: 'bot' | 'user';
  text: string;
  showContactLink?: boolean;
}

const GREETING: Message = {
  from: 'bot',
  text: "Hi! I'm Griffy's help assistant. Ask me something like \"how do I post a project\" or \"how do referrals work\".",
};

const FALLBACK = "I don't have an answer for that yet. Try rephrasing, browse the full Help Center, or reach our team directly.";

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  if (!user) return null;

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;

    const reply: Message = isGreeting(q)
      ? { from: 'bot', text: "Hey there! Ask me anything about Griffy — signing up, orders, posting a project, referrals, whatever you're stuck on." }
      : (() => {
          const match = findBestAnswer(q);
          return match ? { from: 'bot', text: match.answer } : { from: 'bot', text: FALLBACK, showContactLink: true };
        })();

    setMessages((prev) => [...prev, { from: 'user', text: q }, reply]);
    setInput('');
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-80 sm:w-96 h-[28rem] bg-white rounded-2xl border border-[#EBE0D8] shadow-xl flex flex-col overflow-hidden">
          <div className="bg-[#C0593A] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <p className="text-sm font-bold">Griffy Help</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-white/80 hover:text-white text-lg leading-none">
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FDF8F5]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] text-sm rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.from === 'user' ? 'bg-[#C0593A] text-white rounded-br-sm' : 'bg-white border border-[#EBE0D8] text-[#2C1810] rounded-bl-sm'
                  }`}
                >
                  {m.text}
                  {m.showContactLink && (
                    <Link href="/contact" className="block mt-2 text-xs font-semibold text-[#C0593A] hover:underline">
                      Contact our team →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-[#EBE0D8] flex gap-2 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 border border-[#EBE0D8] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#C0593A]"
            />
            <button type="submit" className="bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-semibold px-4 rounded-xl transition-colors">
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close help chat' : 'Open help chat'}
        className="w-14 h-14 rounded-full bg-[#C0593A] hover:bg-[#9E3F24] text-white shadow-lg flex items-center justify-center text-2xl transition-colors"
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
}
