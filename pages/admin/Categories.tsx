import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit, ImagePlus, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { Category } from '../../types';

const emptyCategory = { name: '', description: '', parentId: '', image: '' };

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<Partial<Category>>(emptyCategory);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCategories = async () => setCategories(await apiService.getCategories());

  useEffect(() => {
    loadCategories().catch(error => console.error('Failed to fetch categories:', error));
  }, []);

  const readImageFile = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const resetForm = () => {
    setDraft(emptyCategory);
    setEditingId(null);
  };

  const saveCategory = async () => {
    if (!draft.name?.trim()) {
      toast.error('Category name is required');
      return;
    }
    if (editingId) await apiService.updateCategory(editingId, draft);
    else await apiService.createCategory({ name: draft.name, description: draft.description, parentId: draft.parentId, image: draft.image });
    toast.success(`Category ${editingId ? 'updated' : 'created'}`);
    resetForm();
    await loadCategories();
  };

  const deleteCategory = async (id: string) => {
    try {
      await apiService.deleteCategory(id);
      toast.success('Category deleted');
      await loadCategories();
    } catch {
      toast.error('Move products before deleting this category');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setDraft({ ...category, parentId: category.parentId || '' });
  };

  const parentCategories = categories.filter(category => !category.parentId);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
      <aside className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
          <p className="text-sm text-gray-500">Create parent categories and subcategories with storefront images.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{editingId ? 'Edit Category' : 'Add Category'}</h3>
            {editingId && <button onClick={resetForm} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><X size={16} /></button>}
          </div>
          <ImageInput image={draft.image || ''} onChange={image => setDraft(prev => ({ ...prev, image }))} readImageFile={readImageFile} />
          <input className="w-full h-10 px-3 border rounded-lg text-sm" placeholder="Category name" value={draft.name || ''} onChange={event => setDraft(prev => ({ ...prev, name: event.target.value }))} />
          <select className="w-full h-10 px-3 border rounded-lg text-sm" value={draft.parentId || ''} onChange={event => setDraft(prev => ({ ...prev, parentId: event.target.value }))}>
            <option value="">No parent category</option>
            {parentCategories.filter(item => item.id !== editingId).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <textarea className="w-full min-h-24 p-3 border rounded-lg text-sm" placeholder="Description" value={draft.description || ''} onChange={event => setDraft(prev => ({ ...prev, description: event.target.value }))} />
          <button onClick={saveCategory} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-bold hover:bg-[#003d61] transition">
            {editingId ? <Save size={16} /> : <Plus size={16} />} {editingId ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </aside>

      <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden h-fit">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Category Inventory</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Classification Hierarchy</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
              <tr>
                <th className="px-8 py-6 w-24">Media</th>
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Structure</th>
                <th className="px-8 py-6">Description</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(category => {
                const parent = parentCategories.find(item => item.id === category.parentId);
                return (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 p-1 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow overflow-hidden">
                        {category.image ? <img src={category.image} alt="" className="max-w-full max-h-full object-cover rounded-xl" /> : <ImagePlus size={20} className="text-gray-300" />}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-[var(--brand-primary)] text-sm tracking-tight">{category.name}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">ID: {category.id.slice(-8)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${category.parentId ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-[var(--brand-primary)]'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${category.parentId ? 'bg-amber-500' : 'bg-[var(--brand-primary)]'}`}></div>
                        {category.parentId ? parent?.name || 'Subcategory' : 'Main Branch'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px] font-medium">{category.description || '—'}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(category)} className="p-2.5 bg-white border border-gray-100 text-slate-400 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] hover:bg-blue-50 rounded-xl transition shadow-sm">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => deleteCategory(category.id)} className="p-2.5 bg-white border border-gray-100 text-slate-400 hover:text-red-600 hover:border-red-600 hover:bg-red-50 rounded-xl transition shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const ImageInput: React.FC<{ image: string; onChange: (image: string) => void; readImageFile: (file: File) => Promise<string> }> = ({ image, onChange, readImageFile }) => (
  <label className="h-36 w-full group relative block rounded-lg border border-gray-200 bg-gray-50 overflow-hidden cursor-pointer">
    <div className="absolute inset-0 flex items-center justify-center">
      {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={28} className="text-gray-400" />}
    </div>
    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-900/70 py-2 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
      <Upload size={13} /> Change image
    </div>
    <input type="file" accept="image/*" className="hidden" onChange={async event => {
      const file = event.target.files?.[0];
      if (file) onChange(await readImageFile(file));
      event.target.value = '';
    }} />
  </label>
);
