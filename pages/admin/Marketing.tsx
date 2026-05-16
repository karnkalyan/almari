import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { FlashSale, Offer, Product } from '../../types';
import { toast } from 'react-hot-toast';

export const AdminMarketing: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [flashDraft, setFlashDraft] = useState({ title: '', description: '', discountPercentage: 10, startsAt: '', endsAt: '', productId: '' });
  const [offerDraft, setOfferDraft] = useState({ title: '', description: '', discountType: 'percentage', discountValue: 10 });

  const load = async () => {
    const [productResponse, saleResponse, offerResponse] = await Promise.all([
      apiService.getProducts({ limit: 100 }),
      apiService.getFlashSales(),
      apiService.getOffers(),
    ]);
    setProducts(productResponse.products);
    setFlashSales(saleResponse);
    setOffers(offerResponse);
  };

  useEffect(() => {
    load().catch(error => console.error('Failed to fetch marketing data:', error));
  }, []);

  const createFlashSale = async () => {
    const product = products.find(item => item.id === flashDraft.productId);
    if (!product || !flashDraft.title || !flashDraft.startsAt || !flashDraft.endsAt) return;
    await apiService.createFlashSale({
      title: flashDraft.title,
      description: flashDraft.description,
      discountPercentage: flashDraft.discountPercentage,
      startsAt: flashDraft.startsAt,
      endsAt: flashDraft.endsAt,
      products: [{ productId: product.id, originalPrice: product.price, salePrice: Math.round(product.price * (1 - flashDraft.discountPercentage / 100)) }],
    });
    setFlashDraft({ title: '', description: '', discountPercentage: 10, startsAt: '', endsAt: '', productId: '' });
    await load();
  };

  const createOffer = async () => {
    if (!offerDraft.title) return;
    await apiService.createOffer({ ...offerDraft, applicableCategories: [], applicableProducts: [] });
    setOfferDraft({ title: '', description: '', discountType: 'percentage', discountValue: 10 });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Marketing</h1>
        <p className="text-sm text-gray-500">Manage flash sales, offers, trending, featured, and homepage merchandising.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-slate-800">Create Flash Sale</h2>
          <input className="w-full h-10 px-3 border rounded-lg text-sm" placeholder="Title" value={flashDraft.title} onChange={e => setFlashDraft(prev => ({ ...prev, title: e.target.value }))} />
          <input className="w-full h-10 px-3 border rounded-lg text-sm" placeholder="Description" value={flashDraft.description} onChange={e => setFlashDraft(prev => ({ ...prev, description: e.target.value }))} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="h-10 px-3 border rounded-lg text-sm" type="number" value={flashDraft.discountPercentage} onChange={e => setFlashDraft(prev => ({ ...prev, discountPercentage: Number(e.target.value) }))} />
            <input className="h-10 px-3 border rounded-lg text-sm" type="datetime-local" value={flashDraft.startsAt} onChange={e => setFlashDraft(prev => ({ ...prev, startsAt: e.target.value }))} />
            <input className="h-10 px-3 border rounded-lg text-sm" type="datetime-local" value={flashDraft.endsAt} onChange={e => setFlashDraft(prev => ({ ...prev, endsAt: e.target.value }))} />
          </div>
          <select className="w-full h-10 px-3 border rounded-lg text-sm" value={flashDraft.productId} onChange={e => setFlashDraft(prev => ({ ...prev, productId: e.target.value }))}>
            <option value="">Select product</option>
            {products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          <button onClick={createFlashSale} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-bold"><Plus size={16} /> Create Flash Sale</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-slate-800">Create Offer</h2>
          <input className="w-full h-10 px-3 border rounded-lg text-sm" placeholder="Title" value={offerDraft.title} onChange={e => setOfferDraft(prev => ({ ...prev, title: e.target.value }))} />
          <input className="w-full h-10 px-3 border rounded-lg text-sm" placeholder="Description" value={offerDraft.description} onChange={e => setOfferDraft(prev => ({ ...prev, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select className="h-10 px-3 border rounded-lg text-sm" value={offerDraft.discountType} onChange={e => setOfferDraft(prev => ({ ...prev, discountType: e.target.value }))}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
            <input className="h-10 px-3 border rounded-lg text-sm" type="number" value={offerDraft.discountValue} onChange={e => setOfferDraft(prev => ({ ...prev, discountValue: Number(e.target.value) }))} />
          </div>
          <button onClick={createOffer} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-bold"><Plus size={16} /> Create Offer</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Flash Sale Activity</h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Active Time-Limited Deals</p>
            </div>
          </div>
          <MarketingList title="Sales" items={flashSales} onDelete={async id => { await apiService.deleteFlashSale(id); toast.success('Flash sale removed'); await load(); }} />
        </section>

        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Promotional Offers</h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Catalog-wide Campaigns</p>
            </div>
          </div>
          <MarketingList title="Offers" items={offers} onDelete={async id => { await apiService.deleteOffer(id); toast.success('Offer removed'); await load(); }} />
        </section>
      </div>

      <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Homepage Merchandising</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Quick Flag Management</p>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {products.map(product => (
            <ProductFlagRow key={product.id} product={product} onSaved={load} />
          ))}
        </div>
      </section>
    </div>
  );
};

const MarketingList: React.FC<{ title: string; items: any[]; onDelete: (id: string) => void }> = ({ title, items, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
        <tr>
          <th className="px-8 py-4">Identity</th>
          <th className="px-8 py-4">Benefits</th>
          <th className="px-8 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {items.map(item => (
          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
            <td className="px-8 py-4">
              <p className="font-black text-[var(--brand-primary)] text-sm tracking-tight">{item.title}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{item.startsAt ? 'Scheduled' : 'Global'}</p>
            </td>
            <td className="px-8 py-4">
               <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-wider">
                 {item.discountPercentage || item.discountValue}{item.discountType === 'percentage' || item.discountPercentage ? '%' : ' NPR'} OFF
               </span>
            </td>
            <td className="px-8 py-4 text-right">
              <button onClick={() => onDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {items.length === 0 && <div className="p-12 text-sm text-gray-400 font-bold uppercase tracking-widest text-center">Empty Registry</div>}
  </div>
);

const ProductFlagRow: React.FC<{ product: Product; onSaved: () => void }> = ({ product, onSaved }) => {
  const [value, setValue] = useState(product);
  const update = (key: keyof Product, checked: boolean) => setValue(prev => ({ ...prev, [key]: checked }));

  const save = async () => {
    await apiService.updateProduct(product.id, value);
    toast.success('Product flags updated');
    onSaved();
  };

  return (
    <div className="px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 p-1 flex items-center justify-center shadow-sm">
          <img src={product.primaryImage} alt="" className="max-w-full max-h-full object-contain" />
        </div>
        <div>
          <p className="font-black text-[var(--brand-primary)] text-sm tracking-tight">{product.name}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{product.category}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        {(['isNew', 'isFeatured', 'isTrending', 'isFlashDeal'] as (keyof Product)[]).map(key => (
          <label key={key} className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]" checked={Boolean(value[key])} onChange={e => update(key, e.target.checked)} />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] group-hover:text-[var(--brand-primary)] transition-colors">{String(key).replace('is', '')}</span>
          </label>
        ))}
        <div className="h-6 w-px bg-gray-100 hidden md:block mx-2"></div>
        <button onClick={save} className="p-2.5 bg-[var(--brand-primary)] text-white rounded-xl shadow-lg shadow-[var(--brand-primary)]/10 hover:bg-[#003d61] transition">
          <Save size={16} />
        </button>
      </div>
    </div>
  );
};
