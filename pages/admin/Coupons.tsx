import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Save, Search, Trash2, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { PromoCode } from '../../types';

const emptyCoupon: Partial<PromoCode> = {
  code: '',
  discountType: 'percentage',
  discountValue: 10,
  minOrderValue: 0,
  maxDiscount: 0,
  isActive: true,
  usageLimit: 0,
};

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<PromoCode[]>([]);
  const [draft, setDraft] = useState<Partial<PromoCode>>(emptyCoupon);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadCoupons = async () => setCoupons(await apiService.getPromoCodes());

  useEffect(() => {
    loadCoupons().catch(error => {
      console.error('Failed to fetch coupons:', error);
      toast.error('Failed to load coupons');
    });
  }, []);

  const resetForm = () => {
    setDraft(emptyCoupon);
    setEditingId(null);
  };

  const saveCoupon = async () => {
    if (!draft.code?.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    const payload = {
      ...draft,
      code: draft.code.trim().toUpperCase(),
      discountValue: Number(draft.discountValue || 0),
      minOrderValue: Number(draft.minOrderValue || 0) || undefined,
      maxDiscount: Number(draft.maxDiscount || 0) || undefined,
      usageLimit: Number(draft.usageLimit || 0) || undefined,
    };
    if (editingId) await apiService.updatePromoCode(editingId, payload);
    else await apiService.createPromoCode(payload as any);
    toast.success(`Coupon ${editingId ? 'updated' : 'created'}`);
    resetForm();
    await loadCoupons();
  };

  const deleteCoupon = async (id: string) => {
    await apiService.deletePromoCode(id);
    toast.success('Coupon deleted');
    await loadCoupons();
  };

  const filtered = useMemo(() => coupons.filter(coupon => coupon.code.toLowerCase().includes(search.toLowerCase())), [coupons, search]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
      <aside className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Coupons</h1>
          <p className="text-gray-500 text-sm">Create and manage checkout discount codes.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h3>
            {editingId && <button onClick={resetForm} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><X size={16} /></button>}
          </div>
          <input className="w-full h-10 px-3 border rounded-lg text-sm uppercase" placeholder="Coupon code" value={draft.code || ''} onChange={event => setDraft(prev => ({ ...prev, code: event.target.value }))} />
          <select className="w-full h-10 px-3 border rounded-lg text-sm" value={draft.discountType || 'percentage'} onChange={event => setDraft(prev => ({ ...prev, discountType: event.target.value as any }))}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </select>
          <input className="w-full h-10 px-3 border rounded-lg text-sm" type="number" placeholder="Discount value" value={draft.discountValue || ''} onChange={event => setDraft(prev => ({ ...prev, discountValue: Number(event.target.value) }))} />
          <input className="w-full h-10 px-3 border rounded-lg text-sm" type="number" placeholder="Minimum order value" value={draft.minOrderValue || ''} onChange={event => setDraft(prev => ({ ...prev, minOrderValue: Number(event.target.value) }))} />
          <input className="w-full h-10 px-3 border rounded-lg text-sm" type="number" placeholder="Max discount" value={draft.maxDiscount || ''} onChange={event => setDraft(prev => ({ ...prev, maxDiscount: Number(event.target.value) }))} />
          <input className="w-full h-10 px-3 border rounded-lg text-sm" type="number" placeholder="Usage limit" value={draft.usageLimit || ''} onChange={event => setDraft(prev => ({ ...prev, usageLimit: Number(event.target.value) }))} />
          <input className="w-full h-10 px-3 border rounded-lg text-sm" type="date" value={draft.expiresAt ? String(draft.expiresAt).slice(0, 10) : ''} onChange={event => setDraft(prev => ({ ...prev, expiresAt: event.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={draft.isActive !== false} onChange={event => setDraft(prev => ({ ...prev, isActive: event.target.checked }))} /> Active coupon</label>
          <button onClick={saveCoupon} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-bold hover:bg-[#003d61] transition">
            {editingId ? <Save size={16} /> : <Plus size={16} />} {editingId ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </div>
      </aside>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-800">Coupon List</h2>
            <p className="text-sm text-gray-500">Coupons are available during checkout.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search coupons..." className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
              <tr><th className="px-6 py-4">Code</th><th className="px-6 py-4">Discount</th><th className="px-6 py-4">Minimum</th><th className="px-6 py-4">Expires</th><th className="px-6 py-4">Usage</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(coupon => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-[var(--brand-primary)] font-mono">{coupon.code}</td>
                  <td className="px-6 py-4 font-bold">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `NPR ${coupon.discountValue}`}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{coupon.minOrderValue ? `NPR ${coupon.minOrderValue}` : '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'No expiry'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{coupon.usedCount}/{coupon.usageLimit || '∞'}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{coupon.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingId(coupon.id); setDraft(coupon); }} className="px-3 py-2 bg-blue-50 text-[var(--brand-primary)] rounded-lg text-sm font-bold">Edit</button>
                      <button onClick={() => deleteCoupon(coupon.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
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
