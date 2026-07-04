import type { Metadata } from "next";
import MaterialDetail from "./MaterialDetail";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function fetchMaterial(id: string) {
  try {
    const res = await fetch(`${API}/materials/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const m = await fetchMaterial(params.id);
  if (!m) return { title: "Buy Materials | Griffy" };

  const title = `${m.name}${m.city ? " in " + m.city : ""} — Buy Online | Griffy`;
  const description = m.description?.slice(0, 155) ??
    `Buy ${m.name} at ₹${Number(m.pricePerUnit).toLocaleString("en-IN")} per ${m.unit}${m.city ? " in " + m.city : ""}. Fast delivery. Verified supplier.`;

  return {
    title,
    description,
    alternates: { canonical: `/materials/${params.id}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: m.imageUrls?.[0] ? [{ url: m.imageUrls[0], width: 800, height: 800 }] : [],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function MaterialPage() {
  return <MaterialDetail />;
}
