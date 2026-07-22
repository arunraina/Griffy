import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description: 'Construction cost guides, material explainers, and hiring tips from the Griffy team.',
  path: '/blog',
});

interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  tags: string[];
  readTimeMinutes: number | null;
  publishedAt: string | null;
}

async function fetchPosts(): Promise<BlogPostSummary[]> {
  try {
    const res = await fetch(`${API_BASE}/blog`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await fetchPosts();

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <section className="bg-white border-b border-[#EBE0D8] px-6 py-16 text-center">
        <div className="max-w-[700px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FAEEE9] text-[#9E3F24] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            ✍️ Blog
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-5" style={{ fontFamily: 'Georgia, serif' }}>
            Guides &amp; Insights
          </h1>
          <p className="text-[#6B5248] text-base leading-relaxed max-w-xl mx-auto">
            Construction cost guides, material explainers, and hiring tips from the Griffy team.
          </p>
        </div>
      </section>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
            <p className="text-4xl mb-3">✍️</p>
            <p className="font-semibold text-[#2C1810]">No posts yet — check back soon.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="block bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 hover:border-[#C0593A] transition-colors"
              >
                <h2 className="text-lg font-bold text-[#2C1810] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  {p.title}
                </h2>
                <p className="text-sm text-[#6B5248] leading-relaxed mb-3">{p.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-[#A08070]">
                  <span>{p.author}</span>
                  {p.publishedAt && (
                    <>
                      <span>·</span>
                      <span>{new Date(p.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </>
                  )}
                  {p.readTimeMinutes && (
                    <>
                      <span>·</span>
                      <span>{p.readTimeMinutes} min read</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
