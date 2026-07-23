import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  featuredImage: string | null;
  readTimeMinutes: number | null;
  publishedAt: string | null;
  updatedAt: string;
}

async function fetchPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE}/blog/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  if (!post) return buildMetadata({ title: 'Post not found', description: 'This blog post may have been removed or is unavailable.', path: `/blog/${params.slug}` });

  return buildMetadata({
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
    path: `/blog/${post.slug}`,
    type: 'article',
    image: post.featuredImage ?? undefined,
    keywords: post.tags,
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-[#2C1810]">Post not found</p>
          <p className="text-sm text-[#A08070] mt-2">This blog post may have been removed or is unavailable.</p>
          <Link href="/blog" className="text-sm text-[#C0593A] hover:underline mt-4 inline-block">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const paragraphs = post.content.split('\n\n').filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Organization', name: post.author },
    datePublished: post.publishedAt ?? post.updatedAt,
    dateModified: post.updatedAt,
    ...(post.featuredImage ? { image: post.featuredImage } : {}),
    publisher: { '@type': 'Organization', name: 'Griffy' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://griffy.in/blog/${post.slug}` },
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="max-w-[760px] mx-auto px-4 sm:px-6 py-12">
        <Link href="/blog" className="text-xs text-[#A08070] hover:text-[#C0593A]">← All Posts</Link>

        <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mt-4 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          {post.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-[#A08070] mb-8">
          <span>{post.author}</span>
          {post.publishedAt && (
            <>
              <span>·</span>
              <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </>
          )}
          {post.readTimeMinutes && (
            <>
              <span>·</span>
              <span>{post.readTimeMinutes} min read</span>
            </>
          )}
        </div>

        <div className="prose-content space-y-4">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-[#2C1810] text-base leading-relaxed">{para}</p>
          ))}
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-[#EBE0D8]">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs text-[#6B5248] bg-white border border-[#EBE0D8] rounded-full px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
