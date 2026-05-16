import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Plus, Save, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { Product, ProductFlag } from '../../types';

export const AdminProductFlags: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [flags, setFlags] = useState<ProductFlag[]>([]);
  const [activeFlagId, setActiveFlagId] = useState<string>('');
  const [newFlag, setNewFlag] = useState({ name: '', color: '#0f766e' });
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [productsData, flagsData] = await Promise.all([
      apiService.getProducts({ limit: 500 }),
      apiService.getProductFlags(),
    ]);
    setProducts(productsData.products || []);
    setFlags(flagsData || []);
    if (!activeFlagId && flagsData.length) setActiveFlagId(flagsData[0].id);
  };

  useEffect(() => {
    load().catch(() => toast.error('Failed to load product flags'));
  }, []);

  const activeFlag = flags.find((flag) => flag.id === activeFlagId);
  const activeProductIds = new Set(activeFlag?.productIds || []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => `${product.name} ${product.sku || ''} ${product.category}`.toLowerCase().includes(term));
  }, [products, search]);

  const createFlag = async () => {
    if (!newFlag.name.trim()) return toast.error('Flag name is required');
    await apiService.createProductFlag({ name: newFlag.name.trim(), color: newFlag.color, isActive: true });
    setNewFlag({ name: '', color: '#0f766e' });
    toast.success('Flag created');
    await load();
  };

  const toggleProduct = (productId: string) => {
    if (!activeFlag) return;
    const current = new Set(activeFlag.productIds || []);
    if (current.has(productId)) current.delete(productId);
    else current.add(productId);
    const next = Array.from(current);
    setFlags((prev) => prev.map((flag) => flag.id === activeFlag.id ? { ...flag, productIds: next } : flag));
  };

  const saveAssignments = async () => {
    if (!activeFlag) return;
    setSaving(true);
    try {
      const updated = await apiService.setFlagProducts(activeFlag.id, activeFlag.productIds || []);
      setFlags((prev) => prev.map((flag) => flag.id === activeFlag.id ? updated : flag));
      toast.success('Flag assignments updated');
    } catch {
      toast.error('Failed to save assignments');
    } finally {
      setSaving(false);
    }
  };

  const removeFlag = async (id: string) => {
    await apiService.deleteProductFlag(id);
    toast.success('Flag deleted');
    const nextFlags = flags.filter((item) => item.id !== id);
    setFlags(nextFlags);
    setActiveFlagId(nextFlags[0]?.id || '');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Product Flags</h1>
        <p className="text-sm text-gray-500">Create any custom flag and assign products to it. Example: Featured, Trending, Best Offer, Leading, Flash.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <aside className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-slate-800">Create New Flag</h2>
            <input className="w-full h-10 px-3 border rounded-lg text-sm" placeholder="Flag name" value={newFlag.name} onChange={(event) => setNewFlag((prev) => ({ ...prev, name: event.target.value }))} />
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Color</label>
              <input type="color" value={newFlag.color} onChange={(event) => setNewFlag((prev) => ({ ...prev, color: event.target.value }))} className="h-10 w-16 p-1 border rounded-lg bg-white" />
            </div>
            <button onClick={createFlag} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-bold">
              <Plus size={16} /> Add Flag
            </button>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-slate-800">Flag List</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {flags.map((flag) => (
                <div key={flag.id} className={`px-4 py-3 flex items-center justify-between gap-3 ${flag.id === activeFlagId ? 'bg-blue-50' : 'bg-white'}`}>
                  <button onClick={() => setActiveFlagId(flag.id)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: flag.color || '#0f766e' }} />
                    <span className="font-semibold text-slate-800 truncate">{flag.name}</span>
                    <span className="text-xs text-gray-500">{(flag.productIds || []).length} products</span>
                  </button>
                  <button onClick={() => removeFlag(flag.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                </div>
              ))}
              {flags.length === 0 && <p className="px-5 py-8 text-sm text-gray-500 text-center">No flags yet</p>}
            </div>
          </section>
        </aside>

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <div>
              <h2 className="font-bold text-slate-800">{activeFlag ? `Assign Products to "${activeFlag.name}"` : 'Select a flag to assign products'}</h2>
              <p className="text-sm text-gray-500">Choose products that should appear under this flag.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input className="h-10 px-3 border rounded-lg text-sm w-full md:w-64" placeholder="Search products" value={search} onChange={(event) => setSearch(event.target.value)} />
              <button onClick={saveAssignments} disabled={!activeFlag || saving} className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-bold disabled:opacity-60">
                <Save size={15} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const selected = activeProductIds.has(product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  disabled={!activeFlag}
                  className={`text-left border rounded-xl p-4 transition ${selected ? 'border-[var(--brand-primary)] bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category} • {product.sku || product.id}</p>
                    </div>
                    {selected && <span className="h-6 w-6 rounded-full bg-[var(--brand-primary)] text-white inline-flex items-center justify-center"><Check size={14} /></span>}
                  </div>
                </button>
              );
            })}
            {filteredProducts.length === 0 && <p className="col-span-full text-sm text-gray-500 text-center py-8">No products match search</p>}
          </div>
        </section>
      </div>
    </div>
  );
};
