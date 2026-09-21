import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Info, 
  Image as ImageIcon, 
  Layout, 
  Users, 
  Award, 
  ShieldCheck, 
  Heart,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Clock,
  Headphones
} from 'lucide-react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

export const AboutUsManagement: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    about_hero_title: '',
    about_hero_subtitle: '',
    about_hero_image: '',
    about_story_title: '',
    about_story_content: '',
    about_story_image: '',
    about_footer_text: '',
    // Stats
    stat_customers: '50k+',
    stat_products: '10k+',
    stat_delivery: '24h',
    stat_support: '24/7',
    // Contact
    contact_phone: '+977 9801234567',
    contact_email: 'hello@cinedaraz.com',
    contact_address: 'Kathmandu, Nepal'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await apiService.getSiteSettings();
      const customization = Array.isArray(data)
        ? data.find((s: any) => s.key === 'site_customization')?.value
        : data.site_customization;

      if (customization) {
        const val = typeof customization === 'string' ? JSON.parse(customization) : customization;
        setSettings({
          about_hero_title: val.about_hero_title || '',
          about_hero_subtitle: val.about_hero_subtitle || '',
          about_hero_image: val.about_hero_image || '',
          about_story_title: val.about_story_title || '',
          about_story_content: val.about_story_content || '',
          about_story_image: val.about_story_image || '',
          about_footer_text: val.footerAbout || '',
          stat_customers: val.stat_customers || '50k+',
          stat_products: val.stat_products || '10k+',
          stat_delivery: val.stat_delivery || '24h',
          stat_support: val.stat_support || '24/7',
          contact_phone: val.contact_phone || '+977 9801234567',
          contact_email: val.contact_email || 'hello@cinedaraz.com',
          contact_address: val.contact_address || 'Kathmandu, Nepal'
        });
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load settings');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = await apiService.getSiteSettings();
      const customization = Array.isArray(data)
        ? data.find((s: any) => s.key === 'site_customization')?.value
        : data.site_customization;

      const currentVal = typeof customization === 'string' ? JSON.parse(customization) : (customization || {});

      const updatedVal = {
        ...currentVal,
        about_hero_title: settings.about_hero_title,
        about_hero_subtitle: settings.about_hero_subtitle,
        about_hero_image: settings.about_hero_image,
        about_story_title: settings.about_story_title,
        about_story_content: settings.about_story_content,
        about_story_image: settings.about_story_image,
        footerAbout: settings.about_footer_text,
        stat_customers: settings.stat_customers,
        stat_products: settings.stat_products,
        stat_delivery: settings.stat_delivery,
        stat_support: settings.stat_support,
        contact_phone: settings.contact_phone,
        contact_email: settings.contact_email,
        contact_address: settings.contact_address
      };

      await apiService.updateSiteSetting('site_customization', updatedVal);
      toast.success('About Us updated successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="relative z-10">
           <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Editor v2.0</span>
           </div>
           <h1 className="text-5xl font-black text-slate-800 tracking-tight leading-none mb-4">About Us Management</h1>
           <p className="text-slate-500 font-medium max-w-2xl text-lg">Curate the story and core identity of CineDaraz for your customers.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-12 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all flex items-center gap-4"
        >
          <Save size={20} /> PUBLISH CHANGES
        </button>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full -mr-64 -mt-64 pointer-events-none opacity-50"></div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 space-y-12">
          {/* Hero & Story Sections */}
          <section className="p-12 bg-white border border-gray-100 rounded-[4rem] shadow-sm space-y-10">
            <div className="flex items-center gap-4 pb-8 border-b border-gray-50">
              <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center"><Layout size={28} /></div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Main Content</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">Hero and Story Narrative</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Hero Title</label>
                  <input
                    className="w-full h-16 px-8 bg-gray-50 border-none rounded-[2rem] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all text-lg shadow-inner"
                    value={settings.about_hero_title}
                    onChange={e => setSettings({ ...settings, about_hero_title: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Hero Image</label>
                  <input
                    className="w-full h-16 px-8 bg-gray-50 border-none rounded-[2rem] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all text-lg shadow-inner"
                    value={settings.about_hero_image}
                    onChange={e => setSettings({ ...settings, about_hero_image: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Hero Subtitle</label>
                  <textarea
                    className="w-full min-h-[100px] p-8 bg-gray-50 border-none rounded-[2.5rem] font-medium text-slate-600 focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all text-lg shadow-inner resize-none"
                    value={settings.about_hero_subtitle}
                    onChange={e => setSettings({ ...settings, about_hero_subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-10 border-t border-gray-50 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Story Heading</label>
                  <input
                    className="w-full h-16 px-8 bg-gray-50 border-none rounded-[2rem] font-bold text-slate-800 focus:ring-4 focus:ring-amber-500/5 focus:bg-white transition-all text-lg shadow-inner"
                    value={settings.about_story_title}
                    onChange={e => setSettings({ ...settings, about_story_title: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Story Content</label>
                  <textarea
                    className="w-full min-h-[250px] p-10 bg-gray-50 border-none rounded-[3rem] font-medium text-slate-600 focus:ring-4 focus:ring-amber-500/5 focus:bg-white transition-all text-lg shadow-inner leading-relaxed"
                    value={settings.about_story_content}
                    onChange={e => setSettings({ ...settings, about_story_content: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="p-12 bg-white border border-gray-100 rounded-[4rem] shadow-sm space-y-10">
            <div className="flex items-center gap-4 pb-8 border-b border-gray-50">
              <div className="w-14 h-14 rounded-3xl bg-green-50 text-green-600 flex items-center justify-center shadow-inner"><TrendingUp size={28} /></div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Performance Stats</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">Impact numbers for the Team section</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 flex items-center gap-2"><Users size={12} /> Customers</label>
                <input
                  className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-black text-slate-800 focus:bg-white shadow-inner text-center text-xl"
                  value={settings.stat_customers}
                  onChange={e => setSettings({ ...settings, stat_customers: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 flex items-center gap-2"><Award size={12} /> Products</label>
                <input
                  className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-black text-slate-800 focus:bg-white shadow-inner text-center text-xl"
                  value={settings.stat_products}
                  onChange={e => setSettings({ ...settings, stat_products: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 flex items-center gap-2"><Clock size={12} /> Delivery</label>
                <input
                  className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-black text-slate-800 focus:bg-white shadow-inner text-center text-xl"
                  value={settings.stat_delivery}
                  onChange={e => setSettings({ ...settings, stat_delivery: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3 flex items-center gap-2"><Headphones size={12} /> Support</label>
                <input
                  className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-black text-slate-800 focus:bg-white shadow-inner text-center text-xl"
                  value={settings.stat_support}
                  onChange={e => setSettings({ ...settings, stat_support: e.target.value })}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Contact & Footer Sidebar */}
        <div className="space-y-12">
          <section className="p-12 bg-slate-900 rounded-[4rem] text-white shadow-2xl space-y-10 relative overflow-hidden group">
            <div className="relative z-10 space-y-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Direct Support</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Connect globally</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-3 flex items-center gap-2"><Phone size={12} /> Hotline</label>
                  <input
                    className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none focus:bg-white/10 transition-all"
                    value={settings.contact_phone}
                    onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-3 flex items-center gap-2"><Mail size={12} /> Email</label>
                  <input
                    className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none focus:bg-white/10 transition-all"
                    value={settings.contact_email}
                    onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-3 flex items-center gap-2"><MapPin size={12} /> Headquarters</label>
                  <input
                    className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none focus:bg-white/10 transition-all"
                    value={settings.contact_address}
                    onChange={e => setSettings({ ...settings, contact_address: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          </section>

          <section className="p-12 bg-white border border-gray-100 rounded-[4rem] shadow-sm space-y-8">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Footer Bio</h3>
            <p className="text-xs font-bold text-slate-400 leading-relaxed">This summarized version appears in the site footer globally.</p>
            <textarea
              className="w-full min-h-[150px] p-8 bg-gray-50 border-none rounded-[2.5rem] font-medium text-slate-600 focus:ring-4 focus:ring-slate-500/5 focus:bg-white transition-all text-lg shadow-inner resize-none"
              value={settings.about_footer_text}
              onChange={e => setSettings({ ...settings, about_footer_text: e.target.value })}
              placeholder="CineDaraz is your trusted..."
            />
          </section>
        </div>
      </div>
    </div>
  );
};
