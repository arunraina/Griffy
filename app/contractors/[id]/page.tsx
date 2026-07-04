import type { Metadata } from "next";
import ContractorDetail from "./ContractorDetail";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function fetchContractor(id: string) {
  try {
    const res = await fetch(`${API}/contractors/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const c = await fetchContractor(params.id);
  if (!c) return { title: "Contractor | Griffy" };

  const title = `${c.businessName} — ${c.specialty} Contractor${c.city ? " in " + c.city : ""} | Griffy`;
  const description = c.bio?.slice(0, 155) ??
    `Hire ${c.businessName}, a verified ${c.specialty} contractor${c.city ? " in " + c.city : ""} on Griffy. ${c.completedProjects ?? 0} projects completed.`;

  return {
    title,
    description,
    alternates: { canonical: `/contractors/${params.id}` },
    openGraph: {
      title,
      description,
      type: "profile",
      images: c.avatarUrl ? [{ url: c.avatarUrl, width: 400, height: 400 }] : [],
    },
    twitter: { card: "summary", title, description },
  };
}

export default function ContractorPage() {
  return <ContractorDetail />;
}
