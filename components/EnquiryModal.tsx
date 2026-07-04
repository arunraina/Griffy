"use client";

import { useState } from "react";
import { X, Send, IndianRupee, AlertTriangle } from "lucide-react";
import { createEnquiry, CreateEnquiryPayload } from "@/lib/api";

const CONTACT_RE = /(?:\+91[\s-]?)?[6-9]\d{9}|\b\d{10}\b|\b\d{5}[\s-]\d{5}\b|(?:instagram\.com\/|@)[a-zA-Z0-9_.]{3,}|(?:facebook\.com|fb\.com|fb\.gg)\/[a-zA-Z0-9.?=&_-]+|(?:wa\.me|whatsapp\.com\/send)[^\s]*/i;

function detectContactInfo(text: string): string | null {
  if (/(?:\+91[\s-]?)?[6-9]\d{9}|\b\d{10}\b|\b\d{5}[\s-]\d{5}\b/.test(text)) return "phone number";
  if (/(?:instagram\.com\/|@)[a-zA-Z0-9_.]{3,}/i.test(text)) return "Instagram handle";
  if (/(?:facebook\.com|fb\.com|fb\.gg)\//i.test(text)) return "Facebook link";
  if (/(?:wa\.me|whatsapp\.com\/send)/i.test(text)) return "WhatsApp link";
  return null;
}

interface Props {
  recipientType: "contractor" | "labour";
  targetId: string;
  recipientName: string;
  onClose: () => void;
  onSent?: () => void;
}

export default function EnquiryModal({ recipientType, targetId, recipientName, onClose, onSent }: Props) {
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [contactWarning, setContactWarning] = useState<string | null>(null);

  function handleMessageChange(val: string) {
    setMessage(val);
    const combined = [val, projectDescription].join(" ");
    setContactWarning(detectContactInfo(combined));
  }

  function handleDescChange(val: string) {
    setProjectDescription(val);
    const combined = [message, val].join(" ");
    setContactWarning(detectContactInfo(combined));
  }

  async function handleSend() {
    if (!message.trim()) { setError("Please write a message."); return; }
    const combined = [message, projectDescription].join(" ");
    const v = detectContactInfo(combined);
    if (v) { setError(`Sharing ${v}s is not allowed. Keep conversations on Griffy for your protection.`); return; }
    setSaving(true);
    setError("");
    try {
      const payload: CreateEnquiryPayload = {
        recipientType,
        targetId,
        message: message.trim(),
        budget: budget ? Number(budget) : undefined,
        projectDescription: projectDescription.trim() || undefined,
      };
      await createEnquiry(payload);
      setSent(true);
      onSent?.();
    } catch (e: any) {
      setError(e.message ?? "Failed to send enquiry");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 className="font-bold text-stone-900 text-lg">Send Enquiry</h2>
            <p className="text-sm text-stone-500 mt-0.5">To: {recipientName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-12 text-center">
            <p className="text-5xl mb-4">✅</p>
            <h3 className="font-bold text-stone-900 text-lg mb-2">Enquiry Sent!</h3>
            <p className="text-stone-500 text-sm mb-6">
              {recipientName} will review your message and reply soon. Check your dashboard for updates.
            </p>
            <button onClick={onClose} className="btn-primary">Done</button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>
            )}

            {contactWarning && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Sharing a {contactWarning} is not allowed. Please keep all contact on Griffy to stay protected.</span>
              </div>
            )}

            <div>
              <label className="label-text">Your message *</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder={`Hi ${recipientName.split(" ")[0]}, I'm looking for help with...`}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="label-text">Project description</label>
              <textarea
                rows={2}
                value={projectDescription}
                onChange={(e) => handleDescChange(e.target.value)}
                placeholder="Briefly describe the project scope, timeline, location..."
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="label-text">Budget (₹) — optional</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  min={0}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 50000"
                  className="input-field pl-8"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-stone-100">
              <button onClick={onClose} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={saving || !message.trim()}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {saving ? "Sending..." : "Send Enquiry"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
