import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { Expense } from '../../types';

const emptyExpense: Partial<Expense> = {
  title: '',
  category: 'Operations',
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  paymentMode: 'Cash',
  reference: '',
  notes: '',
};

export const AdminExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [draft, setDraft] = useState<Partial<Expense>>(emptyExpense);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => setExpenses(await apiService.getExpenses());

  useEffect(() => {
    load().catch(() => toast.error('Failed to load expenses'));
  }, []);

  const reset = () => {
    setDraft(emptyExpense);
    setEditingId(null);
  };

  const save = async () => {
    if (!draft.title?.trim() || !draft.category?.trim() || !Number(draft.amount)) {
      toast.error('Title, category, and amount are required');
      return;
    }
    if (editingId) await apiService.updateExpense(editingId, draft);
    else await apiService.createExpense(draft);
    toast.success(`Expense ${editingId ? 'updated' : 'created'}`);
    reset();
    await load();
  };

  const remove = async (id: string) => {
    await apiService.deleteExpense(id);
    toast.success('Expense deleted');
    await load();
  };

  const filtered = useMemo(() => expenses.filter(item => `${item.title} ${item.category} ${item.reference || ''}`.toLowerCase().includes(search.toLowerCase())), [expenses, search]);
  const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
      <aside className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
          <p className="text-sm text-gray-500">Enter real operating expenses for accurate finance reports.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
            {editingId && <button onClick={reset} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><X size={16} /></button>}
          </div>
          <input className="w-full h-10 px-3 border rounded-lg text-sm" placeholder="Expense title" value={draft.title || ''} onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))} />
          <select className="w-full h-10 px-3 border rounded-lg text-sm" value={draft.category || 'Operations'} onChange={e => setDraft(prev => ({ ...prev, category: e.target.value }))}>
            {['Operations', 'Rent', 'Salary', 'Delivery', 'Marketing', 'Utilities', 'Packaging', 'Maintenance', 'Other'].map(item => <option key={item}>{item}</option>)}
          </select>
          <input className="w-full h-10 px-3 border rounded-lg text-sm" type="number" placeholder="Amount" value={draft.amount || ''} onChange={e => setDraft(prev => ({ ...prev, amount: Number(e.target.value) }))} />
          <input className="w-full h-10 px-3 border rounded-lg text-sm" type="date" value={String(draft.date || '').slice(0, 10)} onChange={e => setDraft(prev => ({ ...prev, date: e.target.value }))} />
          <input className="w-full h-10 px-3 border rounded-lg text-sm" placeholder="Payment mode" value={draft.paymentMode || ''} onChange={e => setDraft(prev => ({ ...prev, paymentMode: e.target.value }))} />
          <input className="w-full h-10 px-3 border rounded-lg text-sm" placeholder="Reference / voucher no." value={draft.reference || ''} onChange={e => setDraft(prev => ({ ...prev, reference: e.target.value }))} />
          <textarea className="w-full min-h-20 p-3 border rounded-lg text-sm" placeholder="Notes" value={draft.notes || ''} onChange={e => setDraft(prev => ({ ...prev, notes: e.target.value }))} />
          <button onClick={save} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-bold hover:bg-[#003d61] transition">
            {editingId ? <Save size={16} /> : <Plus size={16} />} {editingId ? 'Update Expense' : 'Save Expense'}
          </button>
        </div>
      </aside>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-800">Expense Ledger</h2>
            <p className="text-sm text-gray-500">Showing NPR {total.toLocaleString()} in filtered expenses.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 border rounded-lg text-sm" placeholder="Search expenses" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-gray-500 border-b border-gray-100">
              <tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-5 py-4 font-bold text-slate-800">{item.title}<p className="text-xs font-normal text-gray-400">{item.reference}</p></td>
                  <td className="px-5 py-4 text-sm text-gray-600">{item.category}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{item.paymentMode || '-'}</td>
                  <td className="px-5 py-4 font-bold text-red-600">NPR {Number(item.amount).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingId(item.id); setDraft({ ...item, date: String(item.date).slice(0, 10) }); }} className="p-2 text-[var(--brand-primary)] hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => remove(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
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
