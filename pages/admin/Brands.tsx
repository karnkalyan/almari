import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit, ImagePlus, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { Brand } from '../../types';

const emptyBrand: Partial<Brand> = { name: '', logo: '', description: '', isActive: true };

export const AdminBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [draft, setDraft] = useState<Partial<Brand>>(emptyBrand);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadBrands = async () => setBrands(await apiService.getBrands());

  useEffect(() => {
    loadBrands().catch(error => console.error('Failed to fetch brands:', error));
  }, []);

  const readImageFile = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const resetForm = () => {
    setDraft(emptyBrand);
    setEditingId(null);
  };

  const saveBrand = async () => {
    if (!draft.name?.trim()) {
      toast.error('Brand name is required');
      return;
    }
    if (editingId) await apiService.updateBrand(editingId, draft);
    else await apiService.createBrand(draft);
    toast.success(`Brand ${editingId ? 'updated' : 'created'}`);
    resetForm();
    await loadBrands();
  };

  const deleteBrand = async (id: string) => {
    try {
      await apiService.deleteBrand(id);
      toast.success('Brand deleted');
      await loadBrands();
    } catch {
      toast.error('Brand could not be deleted');
    }
  };

  const startEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setDraft(brand);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
      <aside className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Brands</h1>
          <p className="text-sm text-gray-500">Create brand records with logos for product pages and filters.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{editingId ? 'Edit Brand' : 'Add Brand'}</h3>
            {editingId && <button onClick={resetForm} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><X size={16} /></button>}
          </div>
          <LogoInput logo={draft.logo || ''} onChange={logo => setDraft(prev => ({ ...prev, logo }))} readImageFile={readImageFile} />
          <input className="w-full h-10 px-3 border rounded-lg text-sm" placeholder="Brand name" value={draft.name || ''} onChange={event => setDraft(prev => ({ ...prev, name: event.target.value }))} />
          <textarea className="w-full min-h-24 p-3 border rounded-lg text-sm" placeholder="Description" value={draft.description || ''} onChange={event => setDraft(prev => ({ ...prev, description: event.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={draft.isActive !== false} onChange={event => setDraft(prev => ({ ...prev, isActive: event.target.checked }))} /> Active brand</label>
          <button onClick={saveBrand} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-bold hover:bg-[#003d61] transition">
            {editingId ? <Save size={16} /> : <Plus size={16} />} {editingId ? 'Update Brand' : 'Create Brand'}
          </button>
        </div>
      </aside>

      <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden h-fit">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Brand Directory</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Partnership Registry</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
              <tr>
                <th className="px-8 py-6 w-24">Media</th>
                <th className="px-8 py-6">Brand Identity</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Description</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {brands.map(brand => (
                <tr key={brand.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 p-1 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow overflow-hidden">
                      {brand.logo ? <img src={brand.logo} alt="" className="max-w-full max-h-full object-contain" /> : <ImagePlus size={20} className="text-gray-300" />}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-[var(--brand-primary)] text-sm tracking-tight">{brand.name}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">SLUG: {brand.slug}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${brand.isActive ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${brand.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      {brand.isActive ? 'Active' : 'Hidden'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px] font-medium">{brand.description || '—'}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(brand)} className="p-2.5 bg-white border border-gray-100 text-slate-400 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] hover:bg-blue-50 rounded-xl transition shadow-sm">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => deleteBrand(brand.id)} className="p-2.5 bg-white border border-gray-100 text-slate-400 hover:text-red-600 hover:border-red-600 hover:bg-red-50 rounded-xl transition shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const LogoInput: React.FC<{ logo: string; onChange: (logo: string) => void; readImageFile: (file: File) => Promise<string> }> = ({ logo, onChange, readImageFile }) => (
  <label className="h-36 w-full group relative block rounded-lg border border-gray-200 bg-gray-50 overflow-hidden cursor-pointer">
    <div className="absolute inset-0 flex items-center justify-center">
      {logo ? <img src={logo} alt="" className="h-full w-full object-contain p-4" /> : <ImagePlus size={28} className="text-gray-400" />}
    </div>
    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-900/70 py-2 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
      <Upload size={13} /> Change logo
    </div>
    <input type="file" accept="image/*" className="hidden" onChange={async event => {
      const file = event.target.files?.[0];
      if (file) onChange(await readImageFile(file));
      event.target.value = '';
    }} />
  </label>
);
