import React, { useEffect, useState, useContext, useRef } from 'react';
import { ShopContext } from '../../App';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import { Palette, Save, RefreshCw, Smartphone, Monitor, Upload, Trash2, Link as LinkIcon, RotateCcw, ShieldAlert, Sparkles, Droplets } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const BrandIdentity: React.FC = () => {
  const { user } = useAuth();
  const { site, setSite } = useContext(ShopContext) as any;
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Strictly for super admin
  if (user?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10 border border-rose-100">
          <ShieldAlert size={48} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Access Restricted</h2>
          <p className="text-gray-500 font-medium max-w-sm mx-auto mt-2">Brand Identity settings are mission-critical and reserved for Super Administrators only.</p>
        </div>
        <Navigate to="/admin" replace />
      </div>
    );
  }

  const [colors, setColors] = useState({
    primaryColor: site.primaryColor || '#002f4a',
    secondaryColor: site.secondaryColor || '#64748b',
    tertiaryColor: site.tertiaryColor || '#94a3b8',
    quaternaryColor: site.quaternaryColor || '#cbd5e1',
    accentColor: site.accentColor || '#E5A823',
    accentHighlights: site.accentHighlights || '#f59e0b'
  });

  const [branding, setBranding] = useState({
    storeName: site.storeName || '',
    logoText: site.logoText || '',
    logoImage: site.logoImage || ''
  });

  useEffect(() => {
    setColors({
      primaryColor: site.primaryColor || '#002f4a',
      secondaryColor: site.secondaryColor || '#64748b',
      tertiaryColor: site.tertiaryColor || '#94a3b8',
      quaternaryColor: site.quaternaryColor || '#cbd5e1',
      accentColor: site.accentColor || '#E5A823',
      accentHighlights: site.accentHighlights || '#f59e0b'
    });
    setBranding({
      storeName: site.storeName || '',
      logoText: site.logoText || '',
      logoImage: site.logoImage || ''
    });
  }, [site]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedSite = { ...site, ...colors, ...branding };
      await apiService.updateSiteSetting('site_customization', updatedSite);
      setSite(updatedSite);
      toast.success('Brand Identity synchronized across storefront');
    } catch (error) {
      toast.error('Failed to update brand assets');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      const freshSettings = await apiService.getSiteSettings();
      const customization = freshSettings['site_customization'];
      if (customization) {
        setSite(customization);
        toast.success('Identity assets reverted to last saved state');
      }
    } catch (err) {
      toast.error('Failed to reset identity assets');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBranding(prev => ({ ...prev, logoImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const ColorField = ({ label, value, onChange }: any) => {
    return (
      <div className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 hover:border-slate-300 hover:bg-white hover:shadow-xl transition-all duration-300 group">
        <div
          className="relative w-16 h-16 rounded-2xl shadow-inner border border-black/5 flex-shrink-0 cursor-pointer overflow-hidden group-hover:scale-105 transition-transform duration-300"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 pointer-events-none">
            <Droplets size={20} className="text-white drop-shadow-md" />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">{label}</label>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded-md uppercase tracking-widest">HEX</span>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="bg-transparent font-black text-slate-800 outline-none w-full text-base uppercase tracking-wider border-b border-transparent focus:border-slate-300 transition-colors"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-100 flex items-center gap-1.5">
              <ShieldAlert size={12} />
              Super Admin Only
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none">Visual Identity Studio</h1>
          <p className="text-slate-500 font-medium mt-3 max-w-2xl text-sm">Design the heartbeat of your store. Changes applied here instantly update colors, typography, and logos across the entire customer-facing storefront.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-none justify-center px-6 py-4 bg-gray-50 border border-gray-200 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 hover:text-slate-900 transition-all"
          >
            <RotateCcw size={16} /> Revert To Saved
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 sm:flex-none justify-center px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 hover:-translate-y-1"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={18} />}
            {loading ? 'DEPLOYING...' : 'PUBLISH IDENTITY'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">

          {/* Logo & Branding Card */}
          <section className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-gray-100 relative">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-50">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Monitor size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Typography & Brand Mark</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Configure your storefront's name and upload primary visual assets.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2">Store Display Name</label>
                  <input
                    type="text"
                    value={branding.storeName}
                    onChange={(e) => setBranding(p => ({ ...p, storeName: e.target.value }))}
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800"
                    placeholder="Almari Premium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2">Header Accent Text (If no logo)</label>
                  <input
                    type="text"
                    value={branding.logoText}
                    onChange={(e) => setBranding(p => ({ ...p, logoText: e.target.value }))}
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-800 tracking-widest uppercase"
                    placeholder="ALMARI"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2">Primary Logo Asset</label>

                {branding.logoImage ? (
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200 flex flex-col items-center justify-center gap-4 relative group">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-full">
                      <img src={branding.logoImage} className="max-h-24 max-w-full object-contain" alt="Logo Preview" />
                    </div>
                    <button
                      onClick={() => setBranding(p => ({ ...p, logoImage: '' }))}
                      className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-xl hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={14} /> Remove Asset
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 h-[168px] bg-indigo-50/50 rounded-3xl border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center gap-3 hover:bg-indigo-50 hover:border-indigo-400 cursor-pointer transition-all"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                      <Upload size={24} />
                    </div>
                    <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Click to upload logo</p>
                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                  </div>
                )}

                <div className="relative pt-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest">OR</span>
                  </div>
                </div>

                <div className="relative">
                  <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={branding.logoImage.startsWith('data:') ? '' : branding.logoImage}
                    onChange={(e) => setBranding(p => ({ ...p, logoImage: e.target.value }))}
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-600 text-sm"
                    placeholder="Paste external image URL..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Color Palette Card */}
          <section className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-50">
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
                <Palette size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Master Color Engine</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Click the color swatches to adjust the global theme.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ColorField label="Brand Primary" value={colors.primaryColor} onChange={(v: string) => setColors(p => ({ ...p, primaryColor: v }))} />
              <ColorField label="Brand Accent" value={colors.accentColor} onChange={(v: string) => setColors(p => ({ ...p, accentColor: v }))} />
              <ColorField label="Secondary Surface" value={colors.secondaryColor} onChange={(v: string) => setColors(p => ({ ...p, secondaryColor: v }))} />
              <ColorField label="Muted Accents" value={colors.tertiaryColor} onChange={(v: string) => setColors(p => ({ ...p, tertiaryColor: v }))} />
              <ColorField label="Border System" value={colors.quaternaryColor} onChange={(v: string) => setColors(p => ({ ...p, quaternaryColor: v }))} />
              <ColorField label="Highlight Engine" value={colors.accentHighlights} onChange={(v: string) => setColors(p => ({ ...p, accentHighlights: v }))} />
            </div>
          </section>

        </div>

        {/* Live Preview Sidebar */}
        <div className="space-y-8 sticky top-8">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden group shadow-2xl border border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full -ml-24 -mb-24 group-hover:scale-125 transition-transform duration-1000 blur-3xl pointer-events-none" style={{ backgroundColor: colors.accentColor + '40' }}></div>

            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2 tracking-tight">Live Contrast Check</h3>
              <p className="text-slate-400 text-xs mb-8 font-medium">Preview how your colors interact in the wild.</p>

              <div className="space-y-4">
                {/* Fake Notification card */}
                <div className="bg-white rounded-2xl p-4 shadow-xl text-slate-800 transition-all transform hover:-translate-y-1">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.primaryColor, color: 'white' }}>
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">New Order #1042</h4>
                      <p className="text-xs text-slate-500 mt-1">Check out our new UI contrast!</p>
                    </div>
                  </div>
                  <button className="w-full mt-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-colors" style={{ backgroundColor: colors.accentColor, color: colors.primaryColor }}>
                    View Details
                  </button>
                </div>

                {/* Fake Badge */}
                <div className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                  <span className="text-xs font-bold text-slate-300">Highlight Demo</span>
                  <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: colors.accentHighlights + '20', color: colors.accentHighlights }}>
                    Trending
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                  Ensure your <span className="font-bold text-white">Primary</span> and <span className="font-bold text-white">Accent</span> colors have sufficient contrast against white and dark backgrounds for accessibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};