"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package, IndianRupee, TrendingUp, ChevronRight, Star,
  Plus, Clock, CheckCircle2, Truck, XCircle, AlertCircle,
  Briefcase, Wrench, LayoutGrid, Edit2, Loader2, Save,
  ToggleLeft, ToggleRight, Trash2, X, MessageSquare, Send,
  BarChart2, Eye, Copy, Check, Gift, Users,
} from "lucide-react";
import {
  listMyOrders, listIncomingOrders, updateOrderStatus,
  getMyContractorProfile, getMyLabourProfile, listMyMaterials,
  updateMyContractorProfile, updateMyLabourProfile,
  createMaterial, updateMaterial, deleteMaterial,
  listSentEnquiries, listReceivedEnquiries, replyEnquiry,
  getMyAnalytics, getReferralStats,
  Order, Contractor, Labour, Material, Enquiry, MyAnalytics, ReferralStats,
} from "@/lib/api";
import {
  ORDER_STATUS, formatDate, initials,
  SPECIALTY_LABEL, TRADE_LABEL, TRADE_EMOJI, CATEGORY_EMOJI, CATEGORY_LABEL,
  INDIAN_STATES,
} from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import GettingStartedChecklist from "@/components/GettingStartedChecklist";
import JourneyNudge from "@/components/JourneyNudge";
import ImageUpload from "@/components/ImageUpload";
import ProfileStrengthMeter from "@/components/ProfileStrengthMeter";
import TierBadge from "@/components/TierBadge";
import AchievementBadges from "@/components/AchievementBadges";
import {
  getTier, getContractorBadges, getLabourBadges,
  getContractorCompletion, getLabourCompletion, getSupplierCompletion,
} from "@/lib/gamification";

const quickActionsHomeowner = [
  { label: "Buy Materials", href: "/materials", emoji: "🧱", desc: "Sand, cement, steel & more" },
  { label: "Hire Contractor", href: "/contractors", emoji: "👷", desc: "Civil, electrical, plumbing" },
  { label: "Hire Labour", href: "/labour", emoji: "🔧", desc: "Mistri, tiler, painter & more" },
  { label: "Post a Project", href: "/post-project", emoji: "📋", desc: "Get quotes from contractors" },
];

const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  accepted: CheckCircle2,
  in_progress: Truck,
  completed: CheckCircle2,
  cancelled: XCircle,
  disputed: AlertCircle,
};

const CONTRACTOR_SPECIALTIES = [
  "civil", "structural", "electrical", "plumbing", "interior", "architect", "painting", "other",
];
const LABOUR_TRADES = [
  "mason", "electrician", "plumber", "carpenter", "painter", "tiler", "welder", "helper", "other",
];
const MATERIAL_CATEGORIES = [
  "sand", "bricks", "cement", "steel", "wood", "tiles", "paint", "glass", "electrical", "plumbing", "other",
];
const MATERIAL_UNITS = ["ton", "kg", "bag", "cubic meter", "sq ft", "sq meter", "piece", "litre", "bundle", "feet", "meter"];

// ── Tag input ──────────────────────────────────────────────────────────────

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");

  function addTag(val: string) {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setInput("");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); }
    if (e.key === "Backspace" && !input && tags.length > 0) onChange(tags.slice(0, -1));
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2.5 border border-stone-200 rounded-xl focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 bg-white min-h-[42px]">
      {tags.map((t) => (
        <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded-full">
          {t}
          <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} className="text-stone-400 hover:text-red-500">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] text-sm text-stone-700 outline-none bg-transparent placeholder:text-stone-400"
      />
    </div>
  );
}

// ── Availability toggle ────────────────────────────────────────────────────

function AvailToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
        value ? "bg-green-50 border-green-300 text-green-700" : "bg-stone-50 border-stone-200 text-stone-500"
      }`}
    >
      {value ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
      {value ? "Available" : "Not available"}
    </button>
  );
}

// ── Contractor profile editor ──────────────────────────────────────────────

function ContractorProfileEditor({ profile, onSaved }: { profile: Contractor | null; onSaved: (p: Contractor) => void }) {
  const blank = {
    businessName: "", specialty: "civil", experienceYears: 0,
    licenseNumber: "", priceRangeMin: 0, priceRangeMax: 0, priceUnit: "per project",
    bio: "", skills: [] as string[], city: "", state: "", isAvailable: true, avatarUrl: "",
    portfolioImages: [] as string[],
  };
  const [form, setForm] = useState({ ...blank, ...(profile ?? {}) });
  const [saving, setSaving] = useState(false);
  const [saved, setSavedFlag] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) setForm({ ...blank, ...profile });
  }, [profile]);

  function set(key: string, val: any) { setForm((f) => ({ ...f, [key]: val })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload: any = {
        businessName: form.businessName,
        specialty: form.specialty,
        experienceYears: Number(form.experienceYears),
        bio: form.bio || undefined,
        skills: form.skills,
        city: form.city || undefined,
        state: form.state || undefined,
        isAvailable: form.isAvailable,
        ...(form.licenseNumber ? { licenseNumber: form.licenseNumber } : {}),
        ...(form.priceRangeMin ? { priceRangeMin: Number(form.priceRangeMin) } : {}),
        ...(form.priceRangeMax ? { priceRangeMax: Number(form.priceRangeMax) } : {}),
        ...(form.priceUnit ? { priceUnit: form.priceUnit } : {}),
        ...(form.avatarUrl ? { avatarUrl: form.avatarUrl } : {}),
        ...(form.portfolioImages?.length > 0 ? { portfolioImages: form.portfolioImages } : {}),
      };
      const updated = await updateMyContractorProfile(payload);
      onSaved(updated);
      setSavedFlag(true);
      setTimeout(() => setSavedFlag(false), 2000);
    } catch (e: any) {
      setError(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-bold text-stone-900 text-lg">My Profile</h2>
        <div className="flex items-center gap-3">
          <AvailToggle value={form.isAvailable} onChange={(v) => set("isAvailable", v)} />
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Business Name</label>
            <input className="input-field" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} required />
          </div>
          <div>
            <label className="label-text">Specialty</label>
            <select className="input-field" value={form.specialty} onChange={(e) => set("specialty", e.target.value)}>
              {CONTRACTOR_SPECIALTIES.map((s) => (
                <option key={s} value={s}>{SPECIALTY_LABEL[s] ?? s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Experience (years)</label>
            <input type="number" min={0} className="input-field" value={form.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} />
          </div>
          <div>
            <label className="label-text">License Number <span className="text-stone-400 font-normal">(optional)</span></label>
            <input className="input-field" value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} placeholder="e.g. LIC-2024-001" />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label-text">Min. Price (₹)</label>
            <input type="number" min={0} className="input-field" value={form.priceRangeMin || ""} onChange={(e) => set("priceRangeMin", e.target.value)} placeholder="e.g. 50000" />
          </div>
          <div>
            <label className="label-text">Max. Price (₹)</label>
            <input type="number" min={0} className="input-field" value={form.priceRangeMax || ""} onChange={(e) => set("priceRangeMax", e.target.value)} placeholder="e.g. 500000" />
          </div>
          <div>
            <label className="label-text">Price Unit</label>
            <input className="input-field" value={form.priceUnit} onChange={(e) => set("priceUnit", e.target.value)} placeholder="e.g. per project" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">City</label>
            <input className="input-field" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Mumbai" />
          </div>
          <div>
            <label className="label-text">State</label>
            <select className="input-field" value={form.state} onChange={(e) => set("state", e.target.value)}>
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label-text">Bio</label>
          <textarea rows={3} className="input-field resize-none" value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Tell clients about your experience and expertise…" />
        </div>

        <div>
          <label className="label-text">Skills <span className="text-stone-400 font-normal">(press Enter to add)</span></label>
          <TagInput tags={form.skills} onChange={(t) => set("skills", t)} placeholder="e.g. RCC Construction, Waterproofing…" />
        </div>

        <div>
          <label className="label-text">Profile Photo <span className="text-stone-400 font-normal">(optional)</span></label>
          <ImageUpload
            value={form.avatarUrl ? [form.avatarUrl] : []}
            onChange={(urls) => set("avatarUrl", urls[0] ?? "")}
            maxFiles={1}
            folder="avatars"
            label="Upload Profile Photo"
          />
        </div>

        <div>
          <label className="label-text">Portfolio Photos <span className="text-stone-400 font-normal">(up to 8 — show your past work)</span></label>
          <ImageUpload
            value={(form as any).portfolioImages ?? []}
            onChange={(urls) => set("portfolioImages", urls)}
            maxFiles={8}
            folder="portfolio"
            label="Upload Portfolio Images"
          />
        </div>
      </div>

      {profile && (
        <Link href={`/contractors/${profile.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-semibold">
          View public profile <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </form>
  );
}

// ── Labour profile editor ──────────────────────────────────────────────────

function LabourProfileEditor({ profile, onSaved }: { profile: Labour | null; onSaved: (p: Labour) => void }) {
  const blank = {
    trade: "mason", experienceYears: 0, dailyRate: 0, weeklyRate: 0,
    bio: "", skills: [] as string[], languages: [] as string[], city: "", state: "", isAvailable: true, avatarUrl: "",
  };
  const [form, setForm] = useState({ ...blank, ...(profile ?? {}) });
  const [saving, setSaving] = useState(false);
  const [saved, setSavedFlag] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) setForm({ ...blank, ...profile });
  }, [profile]);

  function set(key: string, val: any) { setForm((f) => ({ ...f, [key]: val })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload: any = {
        trade: form.trade,
        experienceYears: Number(form.experienceYears),
        dailyRate: Number(form.dailyRate),
        bio: form.bio || undefined,
        skills: form.skills,
        languages: form.languages,
        city: form.city || undefined,
        state: form.state || undefined,
        isAvailable: form.isAvailable,
        ...(form.weeklyRate ? { weeklyRate: Number(form.weeklyRate) } : {}),
        ...(form.avatarUrl ? { avatarUrl: form.avatarUrl } : {}),
      };
      const updated = await updateMyLabourProfile(payload);
      onSaved(updated);
      setSavedFlag(true);
      setTimeout(() => setSavedFlag(false), 2000);
    } catch (e: any) {
      setError(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-bold text-stone-900 text-lg">My Profile</h2>
        <div className="flex items-center gap-3">
          <AvailToggle value={form.isAvailable} onChange={(v) => set("isAvailable", v)} />
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Trade</label>
            <select className="input-field" value={form.trade} onChange={(e) => set("trade", e.target.value)}>
              {LABOUR_TRADES.map((t) => (
                <option key={t} value={t}>{TRADE_LABEL[t] ?? t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Experience (years)</label>
            <input type="number" min={0} className="input-field" value={form.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Daily Rate (₹)</label>
            <input type="number" min={0} className="input-field" value={form.dailyRate || ""} onChange={(e) => set("dailyRate", e.target.value)} required placeholder="e.g. 800" />
          </div>
          <div>
            <label className="label-text">Weekly Rate (₹) <span className="text-stone-400 font-normal">(optional)</span></label>
            <input type="number" min={0} className="input-field" value={form.weeklyRate || ""} onChange={(e) => set("weeklyRate", e.target.value)} placeholder="e.g. 5000" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">City</label>
            <input className="input-field" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Delhi" />
          </div>
          <div>
            <label className="label-text">State</label>
            <select className="input-field" value={form.state} onChange={(e) => set("state", e.target.value)}>
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label-text">Bio</label>
          <textarea rows={3} className="input-field resize-none" value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Share your work experience and specialisation…" />
        </div>

        <div>
          <label className="label-text">Skills <span className="text-stone-400 font-normal">(press Enter to add)</span></label>
          <TagInput tags={form.skills} onChange={(t) => set("skills", t)} placeholder="e.g. RCC work, Brick laying…" />
        </div>

        <div>
          <label className="label-text">Languages <span className="text-stone-400 font-normal">(press Enter to add)</span></label>
          <TagInput tags={form.languages} onChange={(t) => set("languages", t)} placeholder="e.g. Hindi, English, Tamil…" />
        </div>

        <div>
          <label className="label-text">Profile Photo <span className="text-stone-400 font-normal">(optional)</span></label>
          <ImageUpload
            value={form.avatarUrl ? [form.avatarUrl] : []}
            onChange={(urls) => set("avatarUrl", urls[0] ?? "")}
            maxFiles={1}
            folder="avatars"
            label="Upload Profile Photo"
          />
        </div>
      </div>

      {profile && (
        <Link href={`/labour/${profile.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-semibold">
          View public profile <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </form>
  );
}

// ── Material form (create / edit) ──────────────────────────────────────────

type MatForm = {
  id?: string; name: string; category: string; description: string;
  pricePerUnit: number | ""; unit: string; minOrderQuantity: number | "";
  stockQuantity: number | ""; brand: string; deliveryDays: string;
  city: string; state: string; isAvailable: boolean; imageUrls: string[];
};

const BLANK_MAT: MatForm = {
  name: "", category: "cement", description: "", pricePerUnit: "",
  unit: "bag", minOrderQuantity: "", stockQuantity: "", brand: "",
  deliveryDays: "", city: "", state: "", isAvailable: true, imageUrls: [],
};

function MaterialFormPanel({
  initial, onSave, onCancel,
}: { initial: MatForm; onSave: (m: Material) => void; onCancel: () => void }) {
  const [form, setForm] = useState<MatForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!initial.id;

  function set(key: keyof MatForm, val: any) { setForm((f) => ({ ...f, [key]: val })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload: any = {
        name: form.name,
        category: form.category,
        pricePerUnit: Number(form.pricePerUnit),
        unit: form.unit,
        isAvailable: form.isAvailable,
        ...(form.description ? { description: form.description } : {}),
        ...(form.minOrderQuantity !== "" ? { minOrderQuantity: Number(form.minOrderQuantity) } : {}),
        ...(form.stockQuantity !== "" ? { stockQuantity: Number(form.stockQuantity) } : {}),
        ...(form.brand ? { brand: form.brand } : {}),
        ...(form.deliveryDays ? { deliveryDays: form.deliveryDays } : {}),
        ...(form.city ? { city: form.city } : {}),
        ...(form.state ? { state: form.state } : {}),
        ...(form.imageUrls.length > 0 ? { imageUrls: form.imageUrls } : {}),
      };
      const saved = isEdit
        ? await updateMaterial(initial.id!, payload)
        : await createMaterial(payload);
      onSave(saved);
    } catch (e: any) {
      setError(e.message ?? "Failed to save material");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-orange-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-stone-900">{isEdit ? "Edit Material" : "Add New Material"}</h3>
        <button type="button" onClick={onCancel} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-text">Material Name</label>
          <input className="input-field" value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="e.g. OPC Cement 53 Grade" />
        </div>
        <div>
          <label className="label-text">Category</label>
          <select className="input-field" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {MATERIAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABEL[c] ?? c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="label-text">Price per Unit (₹)</label>
          <input type="number" min={0} step="0.01" className="input-field" value={form.pricePerUnit} onChange={(e) => set("pricePerUnit", e.target.value)} required placeholder="e.g. 350" />
        </div>
        <div>
          <label className="label-text">Unit</label>
          <select className="input-field" value={form.unit} onChange={(e) => set("unit", e.target.value)}>
            {MATERIAL_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="label-text">Min. Order Qty <span className="text-stone-400 font-normal">(opt.)</span></label>
          <input type="number" min={0} className="input-field" value={form.minOrderQuantity} onChange={(e) => set("minOrderQuantity", e.target.value)} placeholder="e.g. 10" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="label-text">Stock Qty <span className="text-stone-400 font-normal">(opt.)</span></label>
          <input type="number" min={0} className="input-field" value={form.stockQuantity} onChange={(e) => set("stockQuantity", e.target.value)} placeholder="e.g. 500" />
        </div>
        <div>
          <label className="label-text">Brand <span className="text-stone-400 font-normal">(opt.)</span></label>
          <input className="input-field" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Ultratech" />
        </div>
        <div>
          <label className="label-text">Delivery Time <span className="text-stone-400 font-normal">(opt.)</span></label>
          <input className="input-field" value={form.deliveryDays} onChange={(e) => set("deliveryDays", e.target.value)} placeholder="e.g. 2–3 days" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-text">City <span className="text-stone-400 font-normal">(opt.)</span></label>
          <input className="input-field" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Pune" />
        </div>
        <div>
          <label className="label-text">State <span className="text-stone-400 font-normal">(opt.)</span></label>
          <select className="input-field" value={form.state} onChange={(e) => set("state", e.target.value)}>
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label-text">Description <span className="text-stone-400 font-normal">(opt.)</span></label>
        <textarea rows={2} className="input-field resize-none" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Product details, grade, specifications…" />
      </div>

      <div>
        <label className="label-text">Product Images <span className="text-stone-400 font-normal">(opt.)</span></label>
        <ImageUpload
          value={form.imageUrls}
          onChange={(urls) => set("imageUrls", urls)}
          maxFiles={5}
          folder="materials"
          label="Upload Product Images"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <AvailToggle value={form.isAvailable} onChange={(v) => set("isAvailable", v)} />
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-800 border border-stone-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : isEdit ? "Update" : "Add Material"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Supplier materials manager ─────────────────────────────────────────────

function SupplierMaterials({ materials: init, loading }: { materials: Material[]; loading: boolean }) {
  const [materials, setMaterials] = useState<Material[]>(init);
  const [form, setForm] = useState<MatForm | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => { setMaterials(init); }, [init]);

  function openCreate() { setForm({ ...BLANK_MAT }); }
  function openEdit(m: Material) {
    setForm({
      id: m.id, name: m.name, category: m.category, description: m.description ?? "",
      pricePerUnit: Number(m.pricePerUnit), unit: m.unit,
      minOrderQuantity: m.minOrderQuantity ?? "", stockQuantity: m.stockQuantity ?? "",
      brand: m.brand ?? "", deliveryDays: m.deliveryDays ?? "",
      city: m.city ?? "", state: m.state ?? "", isAvailable: m.isAvailable,
      imageUrls: m.imageUrls ?? [],
    });
  }

  function handleSaved(saved: Material) {
    setMaterials((prev) => {
      const exists = prev.find((x) => x.id === saved.id);
      return exists ? prev.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...prev];
    });
    setForm(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch {}
    setDeletingId(null);
    setConfirmId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-extrabold text-stone-900 text-lg">My Materials</h2>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all">
          <Plus className="w-4 h-4" /> Add Material
        </button>
      </div>

      {form && <MaterialFormPanel initial={form} onSave={handleSaved} onCancel={() => setForm(null)} />}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : materials.length === 0 && !form ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 mb-3">No materials listed yet.</p>
          <button onClick={openCreate} className="text-sm text-orange-500 font-semibold hover:text-orange-600">
            + Add your first material
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((m) => {
            const emoji = CATEGORY_EMOJI[m.category] ?? "📦";
            return (
              <div key={m.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 text-sm">{m.name}</p>
                    <p className="text-xs text-stone-500">{CATEGORY_LABEL[m.category]} · ₹{Number(m.pricePerUnit).toLocaleString("en-IN")}/{m.unit}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${m.isAvailable ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {m.isAvailable ? "In Stock" : "Unavailable"}
                    </span>
                    <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-stone-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmId(m.id)} className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {confirmId === m.id && (
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                    <p className="text-sm text-stone-600">Delete <strong>{m.name}</strong>?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmId(null)} className="px-3 py-1.5 text-xs font-semibold text-stone-600 border border-stone-200 rounded-lg">Cancel</button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        disabled={deletingId === m.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-60"
                      >
                        {deletingId === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Homeowner dashboard ────────────────────────────────────────────────────

function HomeownerDashboard({ user, orders, ordersLoading }: { user: any; orders: Order[]; ordersLoading: boolean }) {
  const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);
  const activeOrders = orders.filter((o) => ["pending", "accepted", "in_progress"].includes(o.status));

  return (
    <div className="space-y-8">
      <GettingStartedChecklist user={user} />

      {/* Location nudge — no city set */}
      {!user.city && (
        <JourneyNudge
          emoji="📍"
          title="Add your location for better results"
          description="Tell us your city and state so we can show contractors, labour and materials near you."
          ctaLabel="Update Profile"
          ctaHref="/profile"
          dismissKey="homeowner_add_location"
          variant="blue"
        />
      )}

      {/* First project nudge */}
      {orders.length === 0 && !ordersLoading && (
        <JourneyNudge
          emoji="📋"
          title="Post your first project"
          description="Describe your construction or renovation project and get bids from multiple verified contractors for free."
          ctaLabel="Post a Project"
          ctaHref="/post-project"
          dismissKey="homeowner_first_project"
          variant="orange"
          secondary={{ label: "Browse contractors", href: "/contractors" }}
        />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Package} color="blue" label="Active Orders" value={ordersLoading ? "—" : activeOrders.length} />
        <StatCard icon={IndianRupee} color="green" label="Total Spent"
          value={ordersLoading ? "—" : totalSpent >= 100000 ? `₹${(totalSpent / 100000).toFixed(1)}L` : `₹${totalSpent.toLocaleString("en-IN")}`} />
        <StatCard icon={TrendingUp} color="orange" label="Total Orders" value={ordersLoading ? "—" : orders.length} />
      </div>

      <div>
        <h2 className="font-extrabold text-stone-900 text-lg mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActionsHomeowner.map((qa) => (
            <Link key={qa.href} href={qa.href} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-orange-200 hover:shadow-md transition-all group">
              <span className="text-3xl mb-3 block">{qa.emoji}</span>
              <p className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors">{qa.label}</p>
              <p className="text-sm text-stone-500 mt-0.5">{qa.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-stone-900 text-lg">Recent Orders</h2>
          <Link href="/orders" className="text-sm text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <OrderList orders={orders} loading={ordersLoading} emptyText="No orders yet. Start by browsing materials or hiring a contractor." limit={5} />
      </div>
    </div>
  );
}

// ── Pro dashboard ──────────────────────────────────────────────────────────

type ProTab = "overview" | "bookings" | "listings" | "enquiries" | "analytics";

function ProDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<ProTab>("overview");
  const [incoming, setIncoming] = useState<(Order & { buyer?: any })[]>([]);
  const [incomingLoading, setIncomingLoading] = useState(true);
  const [profile, setProfile] = useState<Contractor | Labour | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyStatus, setReplyStatus] = useState<Record<string, string>>({});
  const [analytics, setAnalytics] = useState<MyAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [referral, setReferral] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);

  const isContractor = user.role === "contractor";
  const isLabour = user.role === "labour";
  const isSupplier = user.role === "supplier";

  const listingsLabel = isSupplier ? "My Materials" : "My Profile";

  useEffect(() => {
    listIncomingOrders(1, 20)
      .then((r) => setIncoming(r.data))
      .catch(() => {})
      .finally(() => setIncomingLoading(false));

    if (isContractor) {
      getMyContractorProfile().then((p) => setProfile(p)).catch(() => {});
    } else if (isLabour) {
      getMyLabourProfile().then((p) => setProfile(p)).catch(() => {});
    } else if (isSupplier) {
      setMaterialsLoading(true);
      listMyMaterials(1, 50).then((r) => setMaterials(r.data)).catch(() => {}).finally(() => setMaterialsLoading(false));
    }
    if (isContractor || isLabour) {
      setEnquiriesLoading(true);
      listReceivedEnquiries(1, 50).then((r) => setEnquiries(r.data)).catch(() => {}).finally(() => setEnquiriesLoading(false));
    }

    getReferralStats().then(setReferral).catch(() => undefined);
  }, [isContractor, isLabour, isSupplier]);

  function handleTabChange(tab: ProTab) {
    setActiveTab(tab);
    if (tab === "analytics" && !analytics && !analyticsLoading) {
      setAnalyticsLoading(true);
      getMyAnalytics().then(setAnalytics).catch(() => undefined).finally(() => setAnalyticsLoading(false));
    }
  }

  function copyReferralCode() {
    if (!referral?.code) return;
    navigator.clipboard.writeText(referral.code).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function submitReply(enquiryId: string) {
    const text = replyText[enquiryId];
    if (!text?.trim()) return;
    setReplyingId(enquiryId);
    try {
      const status = replyStatus[enquiryId] || "replied";
      const updated = await replyEnquiry(enquiryId, text.trim(), status);
      setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setReplyText((prev) => ({ ...prev, [enquiryId]: "" }));
    } catch {
    } finally {
      setReplyingId(null);
    }
  }

  async function changeStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, status);
      setIncoming((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
    } catch {
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingCount = incoming.filter((o) => o.status === "pending").length;
  const activeCount = incoming.filter((o) => ["accepted", "in_progress"].includes(o.status)).length;
  const completedCount = incoming.filter((o) => o.status === "completed").length;
  const earnings = incoming.filter((o) => o.status === "completed").reduce((s, o) => s + Number(o.amount), 0);

  const pendingEnquiries = enquiries.filter((e) => e.status === "pending").length;

  const tabs: { id: ProTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "bookings", label: `Bookings${incoming.length > 0 ? ` (${incoming.length})` : ""}` },
    { id: "listings", label: listingsLabel },
    ...(isContractor || isLabour
      ? [{ id: "enquiries" as ProTab, label: `Enquiries${pendingEnquiries > 0 ? ` (${pendingEnquiries})` : ""}` }]
      : []),
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-8 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => handleTabChange(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t.id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <GettingStartedChecklist
            user={user}
            hasContractorProfile={isContractor && !!profile}
            hasLabourProfile={isLabour && !!profile}
            hasMaterial={isSupplier && materials.length > 0}
          />

          {/* Gamification: Tier + Profile Strength + Achievements */}
          {(isContractor || isLabour) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Tier card */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-stone-500 mb-3">Your Tier</p>
                {profile ? (() => {
                  const jobs = isContractor ? (profile as Contractor).completedProjects : (profile as Labour).completedJobs;
                  const tier = getTier(jobs, profile.rating);
                  return (
                    <div className="space-y-3">
                      <TierBadge tier={tier} showProgress completedJobs={jobs} rating={profile.rating} size="lg" />
                      <p className="text-xs text-stone-400">{tier.description}</p>
                    </div>
                  );
                })() : (
                  <p className="text-sm text-stone-400">Complete your profile to unlock tiers.</p>
                )}
              </div>

              {/* Profile strength */}
              <ProfileStrengthMeter
                completion={
                  isContractor
                    ? getContractorCompletion(profile as Contractor | null)
                    : getLabourCompletion(profile as Labour | null)
                }
                role={user.role}
              />
            </div>
          )}

          {isSupplier && (
            <ProfileStrengthMeter
              completion={getSupplierCompletion(user, materials.length)}
              role="supplier"
            />
          )}

          {/* Achievement badges */}
          {isContractor && profile && (
            <AchievementBadges badges={getContractorBadges(profile as Contractor)} />
          )}
          {isLabour && profile && (
            <AchievementBadges badges={getLabourBadges(profile as Labour)} />
          )}

          {/* Verification nudge for contractors */}
          {isContractor && profile && !(profile as Contractor).isVerified && (
            <JourneyNudge
              emoji="🔍"
              title="Verification in progress"
              description="Our team is reviewing your contractor profile. Once verified, you'll appear in search results and can receive enquiries from homeowners."
              ctaLabel="View Profile"
              ctaHref="/profile"
              dismissKey="contractor_verification"
              variant="amber"
            />
          )}

          {/* No profile nudge */}
          {(isContractor || isLabour) && !profile && (
            <JourneyNudge
              emoji="👷"
              title={`Set up your ${isContractor ? "contractor" : "labour"} profile`}
              description="Create your professional profile so homeowners can find and hire you. It only takes 2 minutes."
              ctaLabel="Create Profile"
              ctaHref="/profile"
              dismissKey="create_pro_profile"
              variant="orange"
            />
          )}

          {/* Supplier nudge */}
          {isSupplier && materials.length === 0 && (
            <JourneyNudge
              emoji="🧱"
              title="List your first material"
              description="Add your products to reach homeowners actively searching for construction materials in your city."
              ctaLabel="Add Material"
              ctaHref="/dashboard"
              dismissKey="supplier_first_material"
              variant="blue"
              secondary={{ label: "View listings", href: "/materials" }}
            />
          )}

          {/* Referral card */}
          {referral?.code && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-5 h-5 text-orange-500" />
                    <p className="font-bold text-stone-900">Refer &amp; Grow</p>
                  </div>
                  <p className="text-sm text-stone-500 mb-3">Share your referral code and help your network join Griffy.</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-orange-200">
                      <span className="font-mono font-bold text-orange-600 text-lg tracking-widest">{referral.code}</span>
                    </div>
                    <button onClick={copyReferralCode}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${copied ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-stone-200 text-stone-700 hover:border-orange-300 hover:text-orange-500"}`}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy Code"}
                    </button>
                  </div>
                </div>
                <div className="text-center bg-white rounded-xl border border-orange-100 px-5 py-3 shrink-0">
                  <p className="text-2xl font-extrabold text-orange-500">{referral.referralCount}</p>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5"><Users className="w-3 h-3" /> People referred</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Clock} color="amber" label="Pending" value={incomingLoading ? "—" : pendingCount} />
            <StatCard icon={Truck} color="blue" label="Active" value={incomingLoading ? "—" : activeCount} />
            <StatCard icon={CheckCircle2} color="green" label="Completed" value={incomingLoading ? "—" : completedCount} />
            <StatCard icon={IndianRupee} color="orange" label="Earnings"
              value={incomingLoading ? "—" : earnings >= 100000 ? `₹${(earnings / 100000).toFixed(1)}L` : `₹${earnings.toLocaleString("en-IN")}`} />
          </div>

          {(isContractor || isLabour) && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-stone-900 text-lg">My Profile</h2>
                <button onClick={() => setActiveTab("listings")}
                  className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-semibold">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              </div>
              {profile ? (
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl shrink-0">
                    {isLabour ? (TRADE_EMOJI[(profile as Labour).trade] ?? "🛠️") : "👷"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-stone-900">
                        {isContractor ? (profile as Contractor).businessName : user.fullName}
                      </h3>
                      {(profile as any).isVerified && (
                        <span className="badge bg-blue-100 text-blue-700 text-xs">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-stone-500 text-sm mt-0.5">
                      {isContractor ? SPECIALTY_LABEL[(profile as Contractor).specialty] : TRADE_LABEL[(profile as Labour).trade]}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-stone-600">
                      {(profile as any).rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          {(profile as any).rating.toFixed(1)}
                        </span>
                      )}
                      {(profile as any).city && (
                        <span>{(profile as any).city}{(profile as any).state ? `, ${(profile as any).state}` : ""}</span>
                      )}
                      <span className={`font-semibold ${(profile as any).isAvailable ? "text-green-600" : "text-stone-400"}`}>
                        {(profile as any).isAvailable ? "● Available" : "● Not available"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-stone-500 text-sm mb-3">No profile created yet.</p>
                  <button onClick={() => setActiveTab("listings")} className="text-sm text-orange-500 font-semibold hover:text-orange-600">
                    Complete your profile →
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <h2 className="font-extrabold text-stone-900 text-lg mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {isSupplier && (
                <button onClick={() => setActiveTab("listings")}
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-orange-200 hover:shadow-md transition-all group text-left">
                  <span className="text-3xl mb-3 block">🧱</span>
                  <p className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors">Manage Materials</p>
                  <p className="text-sm text-stone-500 mt-0.5">Add, edit or remove listings</p>
                </button>
              )}
              <Link href="/profile" className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-orange-200 hover:shadow-md transition-all group">
                <span className="text-3xl mb-3 block">👤</span>
                <p className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors">Edit Profile</p>
                <p className="text-sm text-stone-500 mt-0.5">Update your info & location</p>
              </Link>
              <button onClick={() => setActiveTab("bookings")}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-orange-200 hover:shadow-md transition-all group text-left">
                <span className="text-3xl mb-3 block">📋</span>
                <p className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors">View Bookings</p>
                <p className="text-sm text-stone-500 mt-0.5">{pendingCount > 0 ? `${pendingCount} pending` : "No pending requests"}</p>
              </button>
              <Link href={isContractor ? "/contractors" : isLabour ? "/labour" : "/materials"}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-orange-200 hover:shadow-md transition-all group">
                <span className="text-3xl mb-3 block">🔍</span>
                <p className="font-bold text-stone-900 group-hover:text-orange-500 transition-colors">View Marketplace</p>
                <p className="text-sm text-stone-500 mt-0.5">See your public listing</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bookings tab */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-stone-900 text-lg">Incoming Bookings</h2>
          {incomingLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 animate-pulse h-20" />
              ))}
            </div>
          ) : incoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">No bookings yet. Complete your profile to attract customers.</p>
            </div>
          ) : (
            incoming.map((order) => {
              const sc = ORDER_STATUS[order.status] ?? { label: order.status, color: "bg-stone-100 text-stone-600" };
              const Icon = STATUS_ICONS[order.status] ?? Clock;
              const isPending = order.status === "pending";
              const isActive = order.status === "in_progress";
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-stone-800">{order.buyer?.fullName ?? "Customer"}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${sc.color}`}>
                          <Icon className="w-3 h-3" /> {sc.label}
                        </span>
                      </div>
                      <p className="text-sm text-stone-500 mt-0.5">
                        #{order.id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}
                      </p>
                      {order.notes && <p className="text-sm text-stone-600 mt-1 italic">"{order.notes}"</p>}
                      {order.deliveryAddress && (
                        <p className="text-xs text-stone-400 mt-1">📍 {order.deliveryAddress}</p>
                      )}
                    </div>
                    <span className="font-extrabold text-stone-900 shrink-0">₹{Number(order.amount).toLocaleString("en-IN")}</span>
                  </div>

                  {(isPending || isActive || order.status === "accepted") && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-stone-50 flex-wrap">
                      {isPending && (
                        <>
                          <button onClick={() => changeStatus(order.id, "accepted")} disabled={updatingId === order.id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
                            {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Accept
                          </button>
                          <button onClick={() => changeStatus(order.id, "cancelled")} disabled={updatingId === order.id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
                            <XCircle className="w-3.5 h-3.5" /> Decline
                          </button>
                        </>
                      )}
                      {order.status === "accepted" && (
                        <button onClick={() => changeStatus(order.id, "in_progress")} disabled={updatingId === order.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
                          {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                          Start Work
                        </button>
                      )}
                      {isActive && (
                        <button onClick={() => changeStatus(order.id, "completed")} disabled={updatingId === order.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
                          {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Mark Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Listings tab */}
      {activeTab === "listings" && (
        <div>
          {isSupplier && <SupplierMaterials materials={materials} loading={materialsLoading} />}
          {isContractor && (
            <ContractorProfileEditor
              profile={profile as Contractor | null}
              onSaved={(p) => setProfile(p)}
            />
          )}
          {isLabour && (
            <LabourProfileEditor
              profile={profile as Labour | null}
              onSaved={(p) => setProfile(p)}
            />
          )}
        </div>
      )}

      {/* Analytics tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <h2 className="font-extrabold text-stone-900 text-lg">My Analytics</h2>
          {analyticsLoading ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl border border-stone-100 h-28 animate-pulse" />)}
            </div>
          ) : !analytics ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
              <BarChart2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No analytics data yet. Complete more jobs to see insights.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Eye className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-extrabold text-stone-900">{analytics.profileViews.toLocaleString("en-IN")}</p>
                  <p className="text-sm text-stone-500 mt-0.5">Profile views</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-extrabold text-stone-900">{analytics.enquiryCount}</p>
                  <p className="text-sm text-stone-500 mt-0.5">Enquiries received</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 col-span-2 sm:col-span-1">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-extrabold text-stone-900">
                    {analytics.totalEarnings >= 100000
                      ? `₹${(analytics.totalEarnings / 100000).toFixed(1)}L`
                      : `₹${analytics.totalEarnings.toLocaleString("en-IN")}`}
                  </p>
                  <p className="text-sm text-stone-500 mt-0.5">Total earnings</p>
                </div>
              </div>

              {analytics.weeklyEarnings.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                  <h3 className="font-bold text-stone-900 mb-5">Earnings — Last 6 Weeks</h3>
                  {(() => {
                    const maxVal = Math.max(...analytics.weeklyEarnings.map((w) => w.earnings), 1);
                    return (
                      <div className="flex items-end gap-3 h-32">
                        {analytics.weeklyEarnings.map((week, i) => {
                          const pct = Math.max((week.earnings / maxVal) * 100, 2);
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                              <span className="text-xs text-stone-500 font-medium">
                                {week.earnings > 0
                                  ? week.earnings >= 1000
                                    ? `₹${(week.earnings / 1000).toFixed(0)}k`
                                    : `₹${week.earnings}`
                                  : "—"}
                              </span>
                              <div className="w-full rounded-t-lg bg-orange-400 transition-all" style={{ height: `${pct}%` }} />
                              <span className="text-[10px] text-stone-400 text-center leading-tight">{week.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {analytics.profileViews > 0 && analytics.enquiryCount > 0 && (
                <div className="bg-stone-50 rounded-2xl border border-stone-100 p-5">
                  <p className="text-sm font-semibold text-stone-700 mb-1">Enquiry conversion</p>
                  <p className="text-stone-500 text-sm">
                    {((analytics.enquiryCount / analytics.profileViews) * 100).toFixed(1)}% of profile views turn into enquiries.{" "}
                    {analytics.enquiryCount / analytics.profileViews >= 0.1
                      ? "Great engagement!"
                      : "Add more photos and a detailed bio to improve this."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Enquiries tab */}
      {activeTab === "enquiries" && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-stone-900 text-lg">Received Enquiries</h2>
          {enquiriesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 animate-pulse">
                  <div className="h-4 bg-stone-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-stone-200 rounded w-full mb-1" />
                  <div className="h-3 bg-stone-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : enquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
              <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="font-semibold text-stone-700 mb-1">No enquiries yet</p>
              <p className="text-stone-400 text-sm">When homeowners send you a quote request, it will appear here.</p>
            </div>
          ) : (
            enquiries.map((enq) => {
              const statusColors: Record<string, string> = {
                pending: "bg-amber-100 text-amber-700",
                replied: "bg-blue-100 text-blue-700",
                accepted: "bg-green-100 text-green-700",
                declined: "bg-red-100 text-red-700",
              };
              const isReplied = enq.status !== "pending";
              return (
                <div key={enq.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3 border-b border-stone-50">
                    <div>
                      <p className="font-bold text-stone-900">{enq.sender?.fullName ?? "Anonymous"}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{formatDate(enq.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusColors[enq.status] ?? "bg-stone-100 text-stone-600"}`}>
                      {enq.status}
                    </span>
                  </div>

                  <div className="px-5 py-4 space-y-3">
                    <p className="text-stone-700 text-sm leading-relaxed">{enq.message}</p>
                    {enq.projectDescription && (
                      <p className="text-stone-500 text-xs bg-stone-50 rounded-xl px-3 py-2">{enq.projectDescription}</p>
                    )}
                    {enq.budget && (
                      <p className="text-sm font-semibold text-stone-700">
                        Budget: <span className="text-green-600">₹{Number(enq.budget).toLocaleString("en-IN")}</span>
                      </p>
                    )}

                    {isReplied && enq.reply && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Your reply</p>
                        <p className="text-sm text-blue-900">{enq.reply}</p>
                      </div>
                    )}

                    {!isReplied && (
                      <div className="pt-3 border-t border-stone-100 space-y-2">
                        <textarea
                          rows={2}
                          placeholder="Type your reply..."
                          value={replyText[enq.id] ?? ""}
                          onChange={(e) => setReplyText((prev) => ({ ...prev, [enq.id]: e.target.value }))}
                          className="input-field resize-none"
                        />
                        <div className="flex items-center gap-2">
                          <select
                            value={replyStatus[enq.id] ?? "replied"}
                            onChange={(e) => setReplyStatus((prev) => ({ ...prev, [enq.id]: e.target.value }))}
                            className="input-field w-auto text-xs"
                          >
                            <option value="replied">Reply only</option>
                            <option value="accepted">Accept project</option>
                            <option value="declined">Decline</option>
                          </select>
                          <button
                            onClick={() => submitReply(enq.id)}
                            disabled={replyingId === enq.id || !replyText[enq.id]?.trim()}
                            className="btn-primary text-sm py-2 px-4 disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {replyingId === enq.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Send Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared components ──────────────────────────────────────────────────────

function StatCard({ icon: Icon, color, label, value }: { icon: any; color: string; label: string; value: string | number }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-extrabold text-stone-900">{value}</p>
      <p className="text-sm text-stone-500 mt-0.5">{label}</p>
    </div>
  );
}

function OrderList({ orders, loading, emptyText, limit }: { orders: Order[]; loading: boolean; emptyText: string; limit?: number }) {
  const shown = limit ? orders.slice(0, limit) : orders;
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-stone-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-stone-200 rounded w-1/2" />
                <div className="h-3 bg-stone-200 rounded w-1/3" />
              </div>
              <div className="h-5 bg-stone-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
        <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
        <p className="text-stone-500 text-sm">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {shown.map((order) => {
        const sc = ORDER_STATUS[order.status] ?? { label: order.status, color: "bg-stone-100 text-stone-600" };
        const Icon = STATUS_ICONS[order.status] ?? Clock;
        const emoji = order.type === "material" ? "📦" : order.type === "contractor" ? "👷" : "🔧";
        return (
          <Link key={order.id} href={`/orders/${order.id}`} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-4 hover:border-orange-200 transition-all group">
            <span className="text-2xl">{emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-800 text-sm capitalize">{order.type} order</p>
              <p className="text-xs text-stone-400 mt-0.5">#{order.id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${sc.color}`}>
                <Icon className="w-3 h-3" /> {sc.label}
              </span>
              <span className="font-bold text-stone-900 text-sm">₹{Number(order.amount).toLocaleString("en-IN")}</span>
              <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-400 transition-colors" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "enquiries">("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [sentEnquiries, setSentEnquiries] = useState<Enquiry[]>([]);
  const [sentEnquiriesLoading, setSentEnquiriesLoading] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const isHomeowner = !user || user.role === "homeowner" || user.role === "admin";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    listMyOrders(1, 10)
      .then((r) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
    if (isHomeowner) {
      setSentEnquiriesLoading(true);
      listSentEnquiries(1, 50)
        .then((r) => setSentEnquiries(r.data))
        .catch(() => {})
        .finally(() => setSentEnquiriesLoading(false));
    }
  }, [isAuthenticated, isHomeowner]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 font-extrabold text-lg flex items-center justify-center">
                {initials(user.fullName)}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-stone-900">Welcome back, {user.fullName.split(" ")[0]} 👋</h1>
                <p className="text-sm text-stone-500 capitalize">{user.role}{user.city ? ` · ${user.city}${user.state ? ", " + user.state : ""}` : ""}</p>
              </div>
            </div>
            <div className="flex gap-3">
              {isHomeowner && (
                <Link href="/post-project" className="btn-primary text-sm py-2 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Post a Project
                </Link>
              )}
              <Link href="/profile" className="btn-secondary text-sm py-2">Edit Profile</Link>
            </div>
          </div>

          {isHomeowner && (
            <div className="flex gap-1 mt-5 bg-stone-100 p-1 rounded-xl w-fit">
              {([
                { id: "overview", label: "Overview" },
                { id: "orders", label: "Orders" },
                { id: "enquiries", label: `Enquiries${sentEnquiries.length > 0 ? ` (${sentEnquiries.length})` : ""}` },
              ] as { id: typeof activeTab; label: string }[]).map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t.id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isHomeowner ? (
          <>
            {activeTab === "overview" && <HomeownerDashboard user={user} orders={orders} ordersLoading={ordersLoading} />}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="font-extrabold text-stone-900 text-lg">All Orders</h2>
                <OrderList orders={orders} loading={ordersLoading} emptyText="No orders found." />
                <Link href="/orders" className="block text-center text-sm text-orange-500 hover:text-orange-600 font-semibold py-2">
                  View full order history →
                </Link>
              </div>
            )}
            {activeTab === "enquiries" && (
              <div className="space-y-4">
                <h2 className="font-extrabold text-stone-900 text-lg">Sent Enquiries</h2>
                {sentEnquiriesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 animate-pulse">
                        <div className="h-4 bg-stone-200 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-stone-200 rounded w-full mb-1" />
                        <div className="h-3 bg-stone-200 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : sentEnquiries.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
                    <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                    <p className="font-semibold text-stone-700 mb-1">No enquiries sent yet</p>
                    <p className="text-stone-400 text-sm mb-5">Browse contractors and workers, then click "Request a Quote" to get started.</p>
                    <div className="flex justify-center gap-3">
                      <Link href="/contractors" className="btn-primary text-sm">Browse Contractors</Link>
                      <Link href="/labour" className="btn-secondary text-sm">Browse Labour</Link>
                    </div>
                  </div>
                ) : (
                  sentEnquiries.map((enq) => {
                    const statusColors: Record<string, string> = {
                      pending: "bg-amber-100 text-amber-700",
                      replied: "bg-blue-100 text-blue-700",
                      accepted: "bg-green-100 text-green-700",
                      declined: "bg-red-100 text-red-700",
                    };
                    return (
                      <div key={enq.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3 border-b border-stone-50">
                          <div>
                            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-0.5">
                              {enq.recipientType === "contractor" ? "👷 Contractor" : "🔧 Labour"} enquiry
                            </p>
                            <p className="text-xs text-stone-400">{formatDate(enq.createdAt)}</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusColors[enq.status] ?? "bg-stone-100 text-stone-600"}`}>
                            {enq.status}
                          </span>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                          <p className="text-stone-700 text-sm leading-relaxed">{enq.message}</p>
                          {enq.budget && (
                            <p className="text-sm font-semibold text-stone-600">
                              Budget: <span className="text-green-600">₹{Number(enq.budget).toLocaleString("en-IN")}</span>
                            </p>
                          )}
                          {enq.reply && (
                            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                              <p className="text-xs font-semibold text-green-700 mb-1">Their reply</p>
                              <p className="text-sm text-green-900">{enq.reply}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        ) : (
          <ProDashboard user={user} />
        )}
      </div>
    </div>
  );
}
