
import React, { useEffect, useState, useContext } from 'react';
import { ShopContext } from '../../App';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import { Link2, Plus, Trash2, Save, MoveUp, MoveDown, Layout } from 'lucide-react';

export const NavigationManager: React.FC = () => {
  const { site, setSite } = useContext(ShopContext) as any;
  const [navItems, setNavItems] = useState(site.navItems || []);
  const [footerColumns, setFooterColumns] = useState(site.footerColumns || []);

  const handleSave = async () => {
    try {
      const updatedSite = { ...site, navItems, footerColumns };
      await apiService.updateSiteSetting('site_customization', updatedSite);
      setSite(updatedSite);
      toast.success('Navigation updated successfully');
    } catch (error) {
      toast.error('Failed to update navigation');
    }
  };

  const addNavItem = () => {
    setNavItems([...navItems, { label: 'New Link', url: '/' }]);
  };

  const removeNavItem = (index: number) => {
    setNavItems(navItems.filter((_: any, i: number) => i !== index));
  };

  const updateNavItem = (index: number, field: string, value: string) => {
    const newItems = [...navItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setNavItems(newItems);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Navigation Links</h1>
          <p className="text-gray-500 font-medium mt-1">Manage the primary links in your store's header and informational footer columns.</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-8 py-3 bg-[var(--brand-primary)] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 hover:opacity-90 transition-all"
        >
          <Save size={18} /> Save Navigation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Header Navigation */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
                    <Link2 size={20} />
                 </div>
                 <h2 className="text-lg font-bold text-slate-800 tracking-tight">Main Header Links</h2>
              </div>
              <button 
                onClick={addNavItem}
                className="p-2 bg-gray-50 hover:bg-gray-100 text-slate-600 rounded-xl transition-all"
              >
                <Plus size={20} />
              </button>
           </div>

           <div className="space-y-4">
              {navItems.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl group">
                   <div className="flex-1 grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        value={item.label}
                        onChange={(e) => updateNavItem(idx, 'label', e.target.value)}
                        className="bg-white px-4 h-10 rounded-xl border border-gray-100 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Label"
                      />
                      <input 
                        type="text" 
                        value={item.url}
                        onChange={(e) => updateNavItem(idx, 'url', e.target.value)}
                        className="bg-white px-4 h-10 rounded-xl border border-gray-100 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="URL"
                      />
                   </div>
                   <button 
                    onClick={() => removeNavItem(idx)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              ))}
           </div>
        </section>

        {/* Footer Info */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
           <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-purple-500/10 text-purple-600 rounded-xl">
                 <Layout size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Footer Structure</h2>
           </div>

           <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
             <p className="text-gray-500 text-sm font-medium mb-4">
               Footer columns and structure have been moved to a dedicated management module.
             </p>
             <a 
               href="/admin/footer"
               className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm"
             >
               Manage Footer Structure
             </a>
           </div>
        </section>
      </div>
    </div>
  );
};
