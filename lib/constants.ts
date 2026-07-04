export const CATEGORY_EMOJI: Record<string, string> = {
  sand: "🏖️", bricks: "🧱", cement: "🏗️", steel: "🔩",
  wood: "🪵", tiles: "⬜", paint: "🎨", glass: "🪟",
  electrical: "⚡", plumbing: "🔧", other: "📦",
};

export const CATEGORY_LABEL: Record<string, string> = {
  sand: "Sand & Aggregate", bricks: "Bricks & Blocks", cement: "Cement",
  steel: "Steel & TMT", wood: "Wood & Timber", tiles: "Tiles & Flooring",
  paint: "Paint", glass: "Glass", electrical: "Electrical",
  plumbing: "Plumbing", other: "Other",
};

export const SPECIALTY_LABEL: Record<string, string> = {
  civil: "Civil Contractor", structural: "Structural Engineer",
  electrical: "Electrical Contractor", plumbing: "Plumbing Contractor",
  interior: "Interior Designer", architect: "Architect",
  painting: "Painting Contractor", other: "Other",
};

export const TRADE_LABEL: Record<string, string> = {
  mason: "Mason / Mistri", electrician: "Electrician", plumber: "Plumber",
  carpenter: "Carpenter", painter: "Painter", tiler: "Tiler",
  welder: "Welder", helper: "Helper", other: "Other",
};

export const TRADE_EMOJI: Record<string, string> = {
  mason: "🧱", electrician: "⚡", plumber: "🔧", carpenter: "🪚",
  painter: "🎨", tiler: "⬜", welder: "🔥", helper: "🤝", other: "🛠️",
};

export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending:     { label: "Pending",     color: "bg-amber-100 text-amber-700" },
  accepted:    { label: "Accepted",    color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In Progress", color: "bg-purple-100 text-purple-700" },
  completed:   { label: "Delivered",   color: "bg-green-100 text-green-700" },
  cancelled:   { label: "Cancelled",   color: "bg-red-100 text-red-700" },
  disputed:    { label: "Disputed",    color: "bg-orange-100 text-orange-700" },
};

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
