'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost,
  type AdminBlogPost, type BlogPostPayload,
} from '@/lib/admin';
import { SkeletonListRows } from '@/components/Skeleton';

const EMPTY_FORM: BlogPostPayload = {
  title: '', slug: '', excerpt: '', content: '', author: 'Griffy Editorial Team',
  status: 'DRAFT', metaTitle: '', metaDescription: '', tags: [], readTimeMinutes: undefined,
};

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BlogPostPayload>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAdminBlogPosts()
      .then(setPosts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(post: AdminBlogPost) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      status: post.status,
      metaTitle: post.metaTitle ?? '',
      metaDescription: post.metaDescription ?? '',
      tags: post.tags,
      readTimeMinutes: post.readTimeMinutes ?? undefined,
    });
    setSlugTouched(true);
    setFormError('');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload: BlogPostPayload = {
        ...form,
        tags: typeof form.tags === 'string'
          ? (form.tags as unknown as string).split(',').map((t) => t.trim()).filter(Boolean)
          : form.tags,
        readTimeMinutes: form.readTimeMinutes ? Number(form.readTimeMinutes) : undefined,
      };
      if (editingId) {
        await updateBlogPost(editingId, payload);
      } else {
        await createBlogPost(payload);
      }
      setShowForm(false);
      load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(post: AdminBlogPost) {
    setBusyId(post.id);
    try {
      await updateBlogPost(post.id, { status: post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' });
      load();
    } catch {
      /* leave state; admin can retry */
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      await deleteBlogPost(id);
      load();
    } catch {
      /* leave state; admin can retry */
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#2C1810]">Blog</h1>
          <p className="text-sm text-[#6B5248] mt-0.5">Create, edit, and publish posts on the public Griffy blog.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
        >
          + New Post
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-[#2C1810]">{editingId ? 'Edit Post' : 'New Post'}</h2>

          {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2">{formError}</div>}

          <div>
            <label className="text-xs font-semibold text-[#6B5248] block mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
              }}
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#6B5248] block mb-1">Slug</label>
            <input
              required
              value={form.slug}
              onChange={(e) => { setSlugTouched(true); setForm((f) => ({ ...f, slug: e.target.value })); }}
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#6B5248] block mb-1">Excerpt</label>
            <textarea
              required
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#6B5248] block mb-1">Content (blank line between paragraphs)</label>
            <textarea
              required
              rows={10}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#6B5248] block mb-1">Author</label>
              <input
                required
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B5248] block mb-1">Read time (minutes)</label>
              <input
                type="number"
                min={1}
                value={form.readTimeMinutes ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, readTimeMinutes: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#6B5248] block mb-1">Tags (comma-separated)</label>
            <input
              value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value.split(',').map((t) => t.trim()) as unknown as string[] }))}
              className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#6B5248] block mb-1">Meta title (SEO, optional)</label>
              <input
                value={form.metaTitle ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B5248] block mb-1">Meta description (SEO, optional)</label>
              <input
                value={form.metaDescription ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                className="w-full border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#6B5248] block mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'DRAFT' | 'PUBLISHED' }))}
              className="border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Post'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm font-semibold text-[#6B5248] px-5 py-2.5 rounded-xl border border-[#EBE0D8]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <SkeletonListRows count={5} />
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-10 text-center">
          <p className="text-4xl mb-3">✍️</p>
          <p className="font-semibold text-[#2C1810]">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-[#EBE0D8] shadow-sm p-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-semibold text-sm text-[#2C1810]">{p.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-[#A08070]">/blog/{p.slug} · {p.author}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(p)}
                  disabled={busyId === p.id}
                  className="text-xs font-semibold text-[#9E3F24] border border-[#E8C4B0] bg-[#FAEEE9] px-3 py-1.5 rounded-lg hover:bg-[#F0D8CC] disabled:opacity-50"
                >
                  {p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className="text-xs font-semibold text-[#2C1810] border border-[#EBE0D8] px-3 py-1.5 rounded-lg hover:border-[#C0593A]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={busyId === p.id}
                  className="text-xs font-semibold text-red-700 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
