
import React, { useEffect, useState, useContext } from 'react';
import { ShopContext } from '../../App';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import { Settings2, Save, Grid3X3, LayoutTemplate, ShieldCheck, RefreshCw, Smartphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const StoreSettings: React.FC = () => {
  const { user } = useAuth();
  const { site, setSite } = useContext(ShopContext) as any;
  const [loading, setLoading] = useState(false);

  const defaultSections = [
    { title: 'Hot Flash Deals', flag: 'isFlashDeal', enabled: true },
    { title: 'New Arrivals', flag: 'isNew', enabled: true },
    { title: 'Best Sellers', flag: 'isBestSeller', enabled: true },
    { title: 'Trending Items', flag: 'isTrending', enabled: true },
    { title: 'Handpicked Featured', flag: 'isFeatured', enabled: true }
  ];
  const [homepageProductSections, setHomepageProductSections] = useState(site.homepageProductSections?.length ? site.homepageProductSections : defaultSections);
  const [homepageVisibility, setHomepageVisibility] = useState({
    showTopBar: site.topBarEnabled !== false,
    showHeroSection: site.showHeroSection !== false,
    showShopByBrand: site.showShopByBrand !== false,
    showFlashDeals: site.showFlashDeals !== false,
    showPromoCards: site.showPromoCards !== false,
    showCategories: site.showCategories !== false,
    showFooterBlocks: site.showFooterBlocks !== false
  });
  const [templateSettings, setTemplateSettings] = useState(site.templateSettings || {
    homepageTemplate: 'classic',
    shopTemplate: 'sidebar',
    productTemplate: 'classic'
  });

  if (user?.role !== 'super_admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedSite = { 
        ...site, 
        homepageProductSections, 
        templateSettings,
        topBarEnabled: homepageVisibility.showTopBar,
        showHeroSection: homepageVisibility.showHeroSection,
        showShopByBrand: homepageVisibility.showShopByBrand,
        showFlashDeals: homepageVisibility.showFlashDeals,
        showPromoCards: homepageVisibility.showPromoCards,
        showCategories: homepageVisibility.showCategories,
        showFooterBlocks: homepageVisibility.showFooterBlocks
      };
      await apiService.updateSiteSetting('site_customization', updatedSite);
      setSite(updatedSite);
      toast.success('Store logic and templates synchronized');
    } catch (error) {
      toast.error('Failed to save store settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (idx: number) => {
    const newSections = [...homepageProductSections];
    newSections[idx].enabled = !newSections[idx].enabled;
    setHomepageProductSections(newSections);
  };

  const moveSection = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === homepageProductSections.length - 1) return;
    
    const newSections = [...homepageProductSections];
    const temp = newSections[idx];
    newSections[idx] = newSections[direction === 'up' ? idx - 1 : idx + 1];
    newSections[direction === 'up' ? idx - 1 : idx + 1] = temp;
    setHomepageProductSections(newSections);
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Store Logic & Templates</h1>
          <p className="text-gray-500 font-medium mt-1">Configure structural templates and dynamic homepage behavior.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20 flex items-center gap-2 hover:opacity-90 transition-all"
        >
          {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} 
          Deploy Logic
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-10">
               <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
                  <Grid3X3 size={24} />
               </div>
               <h2 className="text-xl font-bold text-slate-800 tracking-tight">Homepage Product Sections</h2>
            </div>

            <div className="space-y-4">
                {homepageProductSections.map((section: any, idx: number) => (
                  <div key={idx} className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 transition-all hover:bg-white hover:shadow-xl group">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs ${section.enabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-200 text-gray-400'}`}>
                              {section.flag?.substring(2, 4).toUpperCase() || '??'}
                           </div>
                           <div className="flex-1 space-y-2">
                              <input 
                                className="w-full bg-transparent font-black text-slate-800 text-lg outline-none border-b border-transparent focus:border-slate-300 transition-all"
                                value={section.title}
                                onChange={e => {
                                  const n = [...homepageProductSections];
                                  n[idx].title = e.target.value;
                                  setHomepageProductSections(n);
                                }}
                              />
                              <select 
                                className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 font-bold text-[10px] uppercase tracking-widest text-gray-400 outline-none focus:border-[var(--brand-primary)]"
                                value={section.flag}
                                onChange={e => {
                                  const n = [...homepageProductSections];
                                  n[idx].flag = e.target.value;
                                  setHomepageProductSections(n);
                                }}
                              >
                                <option value="isFlashDeal">isFlashDeal</option>
                                <option value="isNew">isNew</option>
                                <option value="isBestSeller">isBestSeller</option>
                                <option value="isTrending">isTrending</option>
                                <option value="isFeatured">isFeatured</option>
                                <option value="isRecommended">isRecommended</option>
                                <option value="isPopular">isPopular</option>
                                <option value="isDynamic">isDynamic</option>
                              </select>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="flex flex-col gap-2">
                              <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-slate-800 disabled:opacity-30 transition-all"><ChevronLeft size={18} className="rotate-90" /></button>
                              <button onClick={() => moveSection(idx, 'down')} disabled={idx === homepageProductSections.length - 1} className="p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-slate-800 disabled:opacity-30 transition-all"><ChevronRight size={18} className="rotate-90" /></button>
                           </div>
                           <div className="h-12 w-[1px] bg-gray-200 hidden md:block"></div>
                           <label className="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" checked={section.enabled} onChange={() => toggleSection(idx)} className="sr-only peer" />
                             <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                           </label>
                        </div>
                     </div>
                  </div>
                ))}
            </div>
         </section>

         <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-10">
               <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
                  <LayoutTemplate size={24} />
               </div>
               <h2 className="text-xl font-bold text-slate-800 tracking-tight">System Templates</h2>
            </div>

            <div className="space-y-8">
               {[
                 { label: 'Homepage Experience', key: 'homepageTemplate', options: ['classic', 'market', 'editorial', 'modern'] },
                 { label: 'Shop Catalog Layout', key: 'shopTemplate', options: ['sidebar', 'topFilters', 'denseGrid', 'minimal'] },
                 { label: 'Product Presentation', key: 'productTemplate', options: ['classic', 'galleryLeft', 'marketplace', 'story'] }
               ].map((t) => (
                 <div key={t.key} className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.label}</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                       {t.options.map(opt => (
                         <button 
                           key={opt}
                           onClick={() => setTemplateSettings({...templateSettings, [t.key]: opt})}
                           className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                             templateSettings[t.key] === opt 
                               ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                               : 'bg-white text-gray-400 border-gray-100 hover:border-slate-300'
                           }`}
                         >
                           {opt}
                         </button>
                       ))}
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden group shadow-xl">
               <div className="relative z-10">
                  <h4 className="font-black text-lg mb-2 tracking-tight">Deployment Safety</h4>
                  <p className="text-white/40 text-xs font-medium leading-relaxed">Template changes affect all customer sessions instantly. Ensure you have previewed the templates in a staging environment.</p>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </div>
         </section>
      </div>
    </div>
  );
};
