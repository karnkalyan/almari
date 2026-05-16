import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Edit, Plus, Save, Trash2, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { BlogPost } from '../../types';

const emptyPost: Partial<BlogPost> = { title: '', slug: '', excerpt: '', content: '', image: '', isPublished: true };

export const AdminBlog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [draft, setDraft] = useState<Partial<BlogPost>>(emptyPost);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  const totalPublished = useMemo(() => posts.filter(post => post.isPublished).length, [posts]);

  const loadPosts = async () => setPosts(await apiService.getBlogPosts(true));

  useEffect(() => {
    loadPosts().catch(() => toast.error('Failed to load blog posts'));
  }, []);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;
    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ color: [] }, { background: [] }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
          ['clean'],
        ],
      },
      placeholder: 'Write detailed blog content here...',
    });
    quill.on('text-change', () => setDraft(prev => ({ ...prev, content: quill.root.innerHTML || '' })));
    quillRef.current = quill;
  }, []);

  useEffect(() => {
    if (quillRef.current && quillRef.current.root.innerHTML !== (draft.content || '')) {
      quillRef.current.root.innerHTML = draft.content || '';
    }
  }, [draft.content]);

  const reset = () => {
    setEditingId(null);
    setDraft(emptyPost);
    if (quillRef.current) quillRef.current.root.innerHTML = '';
  };

  const savePost = async () => {
    if (!draft.title?.trim() || !draft.content?.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) await apiService.updateBlogPost(editingId, draft);
      else await apiService.createBlogPost(draft);
      toast.success(`Blog post ${editingId ? 'updated' : 'created'}`);
      reset();
      await loadPosts();
    } catch {
      toast.error('Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    await apiService.deleteBlogPost(id);
    toast.success('Blog post deleted');
    if (editingId === id) reset();
    await loadPosts();
  };

  const editPost = (post: BlogPost) => {
    setEditingId(post.id);
    setDraft(post);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Blog Management</h1>
          <p className="text-sm text-gray-500">Create and manage storefront blog articles with a rich content editor.</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="rounded-lg bg-white border border-gray-200 px-4 py-2"><strong>{posts.length}</strong> Total Blogs</div>
          <div className="rounded-lg bg-white border border-gray-200 px-4 py-2"><strong>{totalPublished}</strong> Published</div>
        </div>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">{editingId ? 'Edit Blog Post' : 'Create Blog Post'}</h3>
          {editingId && <button onClick={reset} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><X size={16} /></button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="h-10 px-3 border rounded-lg text-sm" placeholder="Post title" value={draft.title || ''} onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))} />
          <input className="h-10 px-3 border rounded-lg text-sm" placeholder="Slug (optional)" value={draft.slug || ''} onChange={e => setDraft(prev => ({ ...prev, slug: e.target.value }))} />
          <input className="h-10 px-3 border rounded-lg text-sm md:col-span-2" placeholder="Featured image URL" value={draft.image || ''} onChange={e => setDraft(prev => ({ ...prev, image: e.target.value }))} />
          <textarea className="min-h-20 p-3 border rounded-lg text-sm md:col-span-2" placeholder="Excerpt" value={draft.excerpt || ''} onChange={e => setDraft(prev => ({ ...prev, excerpt: e.target.value }))} />
        </div>
        <div ref={editorRef} className="min-h-48 bg-white border border-gray-200 rounded-lg" />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={Boolean(draft.isPublished)} onChange={e => setDraft(prev => ({ ...prev, isPublished: e.target.checked }))} />
            Published
          </label>
          <button onClick={savePost} disabled={saving} className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-bold hover:bg-[#003d61] disabled:opacity-70">
            {editingId ? <Save size={16} /> : <Plus size={16} />} {saving ? 'Saving...' : editingId ? 'Update Blog' : 'Create Blog'}
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-slate-800">Blog List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Updated</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800">{post.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{post.excerpt || 'No excerpt'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{post.slug}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${post.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : '-'}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => editPost(post)} className="p-2 text-[var(--brand-primary)] hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => deletePost(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">No blog posts yet</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
