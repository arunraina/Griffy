import type { Metadata } from "next";
import LabourDetail from "./LabourDetail";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function fetchLabour(id: string) {
  try {
    const res = await fetch(`${API}/labour/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const w = await fetchLabour(params.id);
  if (!w) return { title: "Hire Labour | Griffy" };

  const name = w.user?.fullName ?? "Worker";
  const trade = w.trade ?? "Skilled Worker";
  const title = `${name} — ${trade}${w.city ? " in " + w.city : ""} | Griffy`;
  const description = w.bio?.slice(0, 155) ??
    `Hire ${name}, a skilled ${trade}${w.city ? " in " + w.city : ""}. ₹${Number(w.dailyRate).toLocaleString("en-IN")}/day. ${w.completedJobs ?? 0} jobs done.`;

  return {
    title,
    description,
    alternates: { canonical: `/labour/${params.id}` },
    openGraph: {
      title,
      description,
      type: "profile",
      images: w.avatarUrl ? [{ url: w.avatarUrl, width: 400, height: 400 }] : [],
    },
    twitter: { card: "summary", title, description },
  };
}

export default function LabourPage() {
  return <LabourDetail />;
}
