
import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { 
  ArrowDown, 
  ArrowUp, 
  Plus, 
  Save, 
  Trash2, 
  Palette, 
  Monitor, 
  LayoutTemplate, 
  Megaphone, 
  Grid3X3, 
  Link2, 
  TableProperties, 
  Settings2,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/api';
import { SiteCustomization } from '../../types';

const defaults: SiteCustomization = {
  storeName: 'Almari',
  logoText: 'Almari',
  logoImage: '',
  primaryColor: '#002f4a',
  accentColor: '#E5A823',
  topBarText: 'FREE delivery & 40% Discount for next 3 orders!',
  topBarEnabled: true,
  topBarBackgroundColor: '#002f4a',
  topBarTextColor: '#f8fafc',
  topBarShowAdminLink: true,
  topBarShowLanguage: true,
  topBarShowCurrency: true,
  supportPhone: '+977 9801234567',
  supportEmail: 'support@almari.np',
  address: 'Kathmandu, Nepal',
  footerAbout: "Nepal's premier online shopping destination.",
  heroTitle: 'Fresh quality at the lowest price',
  heroSubtitle: 'Special discounts across groceries, electronics, fashion and home.',
  heroImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
  heroBadge: 'Weekend Discount',
  heroSlides: [],
  heroSideCards: [],
  flashPopupEnabled: true,
  flashPopupTitle: 'Flash Sale Live',
  flashPopupText: 'Grab hand-picked deals before they expire.',
  promoBanners: [],
  navItems: [],
  footerBusinessHours: 'Sunday-Friday: 9:00 - 20:00\nSaturday: 11:00 - 15:00',
  footerNewsletterTitle: 'Join Almari for NPR 500 off!',
  footerNewsletterSubtitle: 'Register now to get latest updates on promotions & coupons.',
  footerColumns: [],

  templateSettings: { homepageTemplate: 'classic', shopTemplate: 'sidebar', productTemplate: 'classic' },
  homepageProductSections: [],
  homeSections: {
    showPromoBanners: true,
    showNewArrivals: true,
    showBestSellers: true,
    showTrending: true,
    showRecommended: true,
    showFlashDeals: true,
    showDynamic: true,
    showCategorySections: true,
    showFeatures: true,
  },
  maxProductImageSizeMb: 2,
};

type SettingTab = 'brand' | 'header' | 'layout' | 'hero' | 'homepage' | 'navigation' | 'footer' | 'logic';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteCustomization>(defaults);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingTab>('brand');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiService.getSiteSettings();
      // Handle both array and object responses from API
      const siteCustomization = Array.isArray(data) 
        ? data.find((s: any) => s.key === 'site_customization')?.value
        : data.site_customization;

      if (siteCustomization) {
        const val = typeof siteCustomization === 'string' ? JSON.parse(siteCustomization) : siteCustomization;
        setSettings({ ...defaults, ...val });
      }
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
    }
  };

  const update = (key: keyof SiteCustomization, value: any) => setSettings((prev: SiteCustomization) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await apiService.updateSiteSetting('site_customization', settings);
      toast.success('Storefront configuration synchronized');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: SettingTab; label: string; icon: any }[] = [
    { id: 'brand', label: 'Brand & Identity', icon: Palette },
    { id: 'header', label: 'Top Bar & Header', icon: Monitor },
    { id: 'layout', label: 'Layout & Templates', icon: LayoutTemplate },
    { id: 'hero', label: 'Hero & Promotions', icon: Megaphone },
    { id: 'homepage', label: 'Homepage Sections', icon: Grid3X3 },
    { id: 'navigation', label: 'Navigation Menu', icon: Link2 },
    { id: 'footer', label: 'Footer & Company', icon: TableProperties },
    { id: 'logic', label: 'Store Logic', icon: Settings2 },
  ];

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Storefront Customizer</h1>
          <p className="text-gray-500 font-medium mt-2">Tailor your brand's digital presence. Changes reflect instantly across the ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.open('/', '_blank')}
            className="px-6 py-3 bg-white border border-gray-100 text-slate-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Monitor size={18} /> Preview Store
          </button>
          <button 
            onClick={save}
            disabled={saving}
            className="px-8 py-3 bg-[var(--brand-primary)] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} 
            {saving ? 'Synchronizing...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-y-[-2px]' 
                : 'text-gray-400 hover:bg-gray-50 hover:text-slate-600'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-10">
          {activeTab === 'brand' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
               <div>
                  <h3 className="text-xl font-black text-slate-800 mb-6">Visual Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Store Display Name</label>
                        <input 
                          type="text" 
                          value={settings.storeName}
                          onChange={(e) => update('storeName', e.target.value)}
                          className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 transition-all font-bold text-slate-700"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Typography Secondary Text</label>
                        <input 
                          type="text" 
                          value={settings.logoText}
                          onChange={(e) => update('logoText', e.target.value)}
                          className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 transition-all font-bold text-slate-700"
                        />
                     </div>
                  </div>
               </div>
               {/* Add more brand settings as needed, reflecting what's in VisualIdentity.tsx too */}
            </div>
          )}

          {activeTab === 'header' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
               <div>
                  <h3 className="text-xl font-black text-slate-800 mb-6">Announcement Bar</h3>
                  <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <p className="font-bold text-slate-800">Enable Announcement</p>
                           <p className="text-xs text-gray-400">Show a banner at the very top of the page.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.topBarEnabled} onChange={e => update('topBarEnabled', e.target.checked)} className="sr-only peer" />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-7 after:transition-all peer-checked:bg-[var(--brand-primary)]"></div>
                        </label>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Banner Headline</label>
                        <input type="text" value={settings.topBarText} onChange={e => update('topBarText', e.target.value)} className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 transition-all font-medium text-slate-700" />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Logic to implement other tabs based on the structure of SiteCustomization */}
          <div className="py-20 text-center text-gray-300">
             <Settings2 size={48} className="mx-auto mb-4 opacity-20" />
             <p className="text-sm font-bold uppercase tracking-widest">Select a tab to begin tailoring {settings.storeName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
