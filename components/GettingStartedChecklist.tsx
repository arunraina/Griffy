"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { User } from "@/lib/api";

interface Step {
  id: string;
  label: string;
  desc: string;
  href: string;
  done: boolean;
}

function buildSteps(user: User, hasContractorProfile: boolean, hasLabourProfile: boolean, hasMaterial: boolean): Step[] {
  const profileDone = !!(user.city && user.state);

  if (user.role === "homeowner") {
    return [
      { id: "profile", label: "Complete your profile", desc: "Add city & state so we show local results", href: "/profile", done: profileDone },
      { id: "browse", label: "Browse contractors", desc: "Find verified contractors near you", href: "/contractors", done: false },
      { id: "project", label: "Post a project", desc: "Get bids from multiple contractors at once", href: "/post-project", done: false },
      { id: "enquiry", label: "Send your first enquiry", desc: "Directly contact a contractor or labour", href: "/contractors", done: false },
    ];
  }

  if (user.role === "contractor") {
    return [
      { id: "profile", label: "Create contractor profile", desc: "Set your specialty, experience & rates", href: "/profile", done: hasContractorProfile },
      { id: "location", label: "Add city & state", desc: "So homeowners near you can find you", href: "/profile", done: profileDone },
      { id: "bid", label: "Browse open projects", desc: "Find projects to bid on in your city", href: "/projects", done: false },
      { id: "enquiry", label: "Reply to your first enquiry", desc: "Check dashboard for incoming enquiries", href: "/dashboard", done: false },
    ];
  }

  if (user.role === "labour") {
    return [
      { id: "profile", label: "Create labour profile", desc: "Set your trade, rate & availability", href: "/profile", done: hasLabourProfile },
      { id: "location", label: "Add your city", desc: "Get discovered by homeowners nearby", href: "/profile", done: profileDone },
      { id: "available", label: "Set yourself as available", desc: "Turn on availability in your dashboard", href: "/dashboard", done: false },
      { id: "enquiry", label: "Reply to your first enquiry", desc: "Check dashboard for incoming enquiries", href: "/dashboard", done: false },
    ];
  }

  if (user.role === "supplier") {
    return [
      { id: "profile", label: "Complete your profile", desc: "Add city & contact details", href: "/profile", done: profileDone },
      { id: "material", label: "List your first material", desc: "Add product to reach 1L+ homeowners", href: "/dashboard", done: hasMaterial },
      { id: "orders", label: "Manage incoming orders", desc: "Accept and track orders from buyers", href: "/dashboard", done: false },
    ];
  }

  return [];
}

interface Props {
  user: User;
  hasContractorProfile?: boolean;
  hasLabourProfile?: boolean;
  hasMaterial?: boolean;
}

export default function GettingStartedChecklist({ user, hasContractorProfile = false, hasLabourProfile = false, hasMaterial = false }: Props) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("griffy_gsc_dismissed") === "1";
  });

  const steps = buildSteps(user, hasContractorProfile, hasLabourProfile, hasMaterial);
  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  if (dismissed || allDone) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-extrabold text-stone-900">Getting Started</h3>
          <p className="text-sm text-stone-500 mt-0.5">{completedCount}/{steps.length} steps complete</p>
        </div>
        <button onClick={() => { localStorage.setItem("griffy_gsc_dismissed", "1"); setDismissed(true); }} className="text-stone-300 hover:text-stone-500 transition-colors p-1 -mt-1 -mr-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-stone-100 rounded-full h-1.5 mb-4">
        <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${(completedCount / steps.length) * 100}%` }} />
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.href}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${step.done ? "opacity-60" : "hover:bg-orange-50"}`}
          >
            {step.done
              ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              : <Circle className="w-5 h-5 text-stone-300 shrink-0 group-hover:text-orange-400 transition-colors" />
            }
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold leading-tight ${step.done ? "line-through text-stone-400" : "text-stone-800"}`}>{step.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{step.desc}</p>
            </div>
            {!step.done && <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-400 shrink-0 transition-colors" />}
          </Link>
        ))}
      </div>
    </div>
  );
}
