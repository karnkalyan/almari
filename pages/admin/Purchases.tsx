import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { Purchase, PurchaseItem } from '../../types';

type PurchaseDraft = Partial<Purchase> & { items: PurchaseItem[] };

const blankItem = (): PurchaseItem => ({ productName: '', sku: '', quantity: 1, unitCost: 0 });

const emptyPurchase = (): PurchaseDraft => ({
  supplier: '',
  invoiceNo: '',
  date: new Date().toISOString().slice(0, 10),
  tax: 0,
  shipping: 0,
  status: 'Received',
  notes: '',
  items: [blankItem()],
});

export const AdminPurchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [draft, setDraft] = useState<PurchaseDraft>(emptyPurchase());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => setPurchases(await apiService.getPurchases());

  useEffect(() => {
    load().catch(() => toast.error('Failed to load purchases'));
  }, []);

  const subtotal = useMemo(() => draft.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitCost || 0), 0), [draft.items]);
  const total = subtotal + Number(draft.tax || 0) + Number(draft.shipping || 0);

  const reset = () => {
    setDraft(emptyPurchase());
    setEditingId(null);
  };

  const updateItem = (index: number, item: Partial<PurchaseItem>) => {
    setDraft(prev => ({
      ...prev,
      items: prev.items.map((row, rowIndex) => rowIndex === index ? { ...row, ...item } : row),
    }));
  };

  const save = async () => {
    const items = draft.items.filter(item => item.productName.trim() && Number(item.quantity) > 0 && Number(item.unitCost) >= 0);
    if (!draft.supplier?.trim() || items.length === 0) {
      toast.error('Supplier and at least one item are required');
      return;
    }
    const payload = { ...draft, subtotal, total, items };
    if (editingId) await apiService.updatePurchase(editingId, payload);
    else await apiService.createPurchase(payload);
    toast.success(`Purchase ${editingId ? 'updated' : 'created'}`);
    reset();
    await load();
  };

  const remove = async (id: string) => {
    await apiService.deletePurchase(id);
    toast.success('Purchase deleted');
    await load();
  };

  const filtered = useMemo(() => purchases.filter(item => `${item.supplier} ${item.invoiceNo || ''} ${item.status}`.toLowerCase().includes(search.toLowerCase())), [purchases, search]);
  const filteredTotal = filtered.reduce((sum, item) => sum + Number(item.total || 0), 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
      <aside className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Purchases</h1>
          <p className="text-sm text-gray-500">Record supplier invoices and product purchase costs.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{editingId ? 'Edit Purchase' : 'Add Purchase'}</h3>
            {editingId && <button onClick={reset} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><X size={16} /></button>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input className="col-span-2 h-10 px-3 border rounded-lg text-sm" placeholder="Supplier name" value={draft.supplier || ''} onChange={e => setDraft(prev => ({ ...prev, supplier: e.target.value }))} />
            <input className="h-10 px-3 border rounded-lg text-sm" placeholder="Invoice no." value={draft.invoiceNo || ''} onChange={e => setDraft(prev => ({ ...prev, invoiceNo: e.target.value }))} />
            <input className="h-10 px-3 border rounded-lg text-sm" type="date" value={String(draft.date || '').slice(0, 10)} onChange={e => setDraft(prev => ({ ...prev, date: e.target.value }))} />
            <select className="h-10 px-3 border rounded-lg text-sm" value={draft.status || 'Received'} onChange={e => setDraft(prev => ({ ...prev, status: e.target.value }))}>
              {['Received', 'Ordered', 'Partially Received', 'Returned', 'Cancelled'].map(status => <option key={status}>{status}</option>)}
            </select>
            <input className="h-10 px-3 border rounded-lg text-sm" type="number" placeholder="Tax" value={draft.tax || ''} onChange={e => setDraft(prev => ({ ...prev, tax: Number(e.target.value) }))} />
            <input className="h-10 px-3 border rounded-lg text-sm" type="number" placeholder="Shipping" value={draft.shipping || ''} onChange={e => setDraft(prev => ({ ...prev, shipping: Number(e.target.value) }))} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700">Items</h4>
              <button onClick={() => setDraft(prev => ({ ...prev, items: [...prev.items, blankItem()] }))} className="text-xs font-bold text-[var(--brand-primary)] hover:underline">Add item</button>
            </div>
            {draft.items.map((item, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="flex gap-2">
                  <input className="min-w-0 flex-1 h-9 px-3 border rounded-lg text-sm" placeholder="Product / item" value={item.productName} onChange={e => updateItem(index, { productName: e.target.value })} />
                  {draft.items.length > 1 && <button onClick={() => setDraft(prev => ({ ...prev, items: prev.items.filter((_, itemIndex) => itemIndex !== index) }))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input className="h-9 px-3 border rounded-lg text-sm" placeholder="SKU" value={item.sku || ''} onChange={e => updateItem(index, { sku: e.target.value })} />
                  <input className="h-9 px-3 border rounded-lg text-sm" type="number" min="1" placeholder="Qty" value={item.quantity || ''} onChange={e => updateItem(index, { quantity: Number(e.target.value) })} />
                  <input className="h-9 px-3 border rounded-lg text-sm" type="number" placeholder="Unit cost" value={item.unitCost || ''} onChange={e => updateItem(index, { unitCost: Number(e.target.value) })} />
                </div>
                <p className="text-right text-xs font-bold text-slate-600">Line total: NPR {(Number(item.quantity || 0) * Number(item.unitCost || 0)).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <textarea className="w-full min-h-20 p-3 border rounded-lg text-sm" placeholder="Notes" value={draft.notes || ''} onChange={e => setDraft(prev => ({ ...prev, notes: e.target.value }))} />

          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><strong>NPR {subtotal.toLocaleString()}</strong></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax + Shipping</span><strong>NPR {(Number(draft.tax || 0) + Number(draft.shipping || 0)).toLocaleString()}</strong></div>
            <div className="flex justify-between text-base"><span className="font-bold text-slate-700">Total</span><strong>NPR {total.toLocaleString()}</strong></div>
          </div>

          <button onClick={save} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-bold hover:bg-[#003d61] transition">
            {editingId ? <Save size={16} /> : <Plus size={16} />} {editingId ? 'Update Purchase' : 'Save Purchase'}
          </button>
        </div>
      </aside>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-800">Purchase Register</h2>
            <p className="text-sm text-gray-500">Showing NPR {filteredTotal.toLocaleString()} in filtered purchases.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 border rounded-lg text-sm" placeholder="Search purchases" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-gray-500 border-b border-gray-100">
              <tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Supplier</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Total</th><th className="px-5 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-5 py-4 font-bold text-slate-800">{item.supplier}<p className="text-xs font-normal text-gray-400">{item.invoiceNo || '-'}</p></td>
                  <td className="px-5 py-4 text-sm text-gray-600">{item.items?.length || 0}</td>
                  <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">{item.status}</span></td>
                  <td className="px-5 py-4 font-bold text-red-600">NPR {Number(item.total).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingId(item.id); setDraft({ ...item, date: String(item.date).slice(0, 10), items: item.items?.length ? item.items : [blankItem()] }); }} className="p-2 text-[var(--brand-primary)] hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => remove(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">No purchases recorded yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
