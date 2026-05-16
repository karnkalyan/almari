
import React, { useEffect, useState, useContext } from 'react';
import { ShopContext } from '../../App';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import { Megaphone, Plus, Trash2, Save, Power, Zap } from 'lucide-react';

export const AnnouncementManager: React.FC = () => {
  const { site, setSite } = useContext(ShopContext) as any;
  const [announcements, setAnnouncements] = useState(site.announcements || []);
  const [speed, setSpeed] = useState(site.announcementSpeed || 5000);

  const handleSave = async () => {
    try {
      const updatedSite = { ...site, announcements, announcementSpeed: speed };
      await apiService.updateSiteSetting('site_customization', updatedSite);
      setSite(updatedSite);
      toast.success('Announcements updated successfully');
    } catch (error) {
      toast.error('Failed to update announcements');
    }
  };

  const addAnnouncement = () => {
    setAnnouncements([...announcements, { text: 'New Announcement Message', link: '', isActive: true }]);
  };

  const removeAnnouncement = (index: number) => {
    setAnnouncements(announcements.filter((_: any, i: number) => i !== index));
  };

  const updateAnnouncement = (index: number, field: string, value: any) => {
    const newItems = [...announcements];
    newItems[index] = { ...newItems[index], [field]: value };
    setAnnouncements(newItems);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Announcement Manager</h1>
          <p className="text-gray-500 font-medium mt-1">Configure high-visibility messages that appear at the very top of your homepage.</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-8 py-3 bg-[var(--brand-primary)] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 hover:opacity-90 transition-all"
        >
          <Save size={18} /> Save Announcements
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
           <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
                       <Megaphone size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Active Messages</h2>
                 </div>
                 <button 
                   onClick={addAnnouncement}
                   className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-slate-600 rounded-xl transition-all text-xs font-bold flex items-center gap-2"
                 >
                   <Plus size={16} /> Add Message
                 </button>
              </div>

              <div className="space-y-4">
                 {announcements.map((item: any, idx: number) => (
                   <div key={idx} className={`p-6 rounded-3xl border transition-all ${item.isActive ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50/50 border-transparent opacity-60'}`}>
                      <div className="flex gap-6">
                         <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Text</label>
                               <input 
                                 type="text" 
                                 value={item.text}
                                 onChange={(e) => updateAnnouncement(idx, 'text', e.target.value)}
                                 className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all font-bold text-slate-700 text-sm"
                                 placeholder="e.g. Get 20% off on all organic vegetables this weekend."
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Action Link (Optional)</label>
                               <input 
                                 type="text" 
                                 value={item.link}
                                 onChange={(e) => updateAnnouncement(idx, 'link', e.target.value)}
                                 className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all font-bold text-slate-700 text-sm"
                                 placeholder="/shop or https://..."
                               />
                            </div>
                         </div>
                         <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => updateAnnouncement(idx, 'isActive', !item.isActive)}
                              className={`p-3 rounded-xl transition-all ${item.isActive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                              title={item.isActive ? 'Deactivate' : 'Activate'}
                            >
                               <Power size={18} />
                            </button>
                            <button 
                              onClick={() => removeAnnouncement(idx)}
                              className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                              title="Remove"
                            >
                               <Trash2 size={18} />
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}

                 {announcements.length === 0 && (
                   <div className="text-center py-12 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No announcements configured</p>
                   </div>
                 )}
              </div>
           </section>
        </div>

        <div className="space-y-6">
           <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
                    <Zap size={20} />
                 </div>
                 <h2 className="text-lg font-bold text-slate-800 tracking-tight">Display Settings</h2>
              </div>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rotation Speed (ms)</label>
                    <input 
                      type="number" 
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-bold text-slate-700 text-sm"
                      step={500}
                      min={1000}
                    />
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider ml-1 mt-1">1000ms = 1 second</p>
                 </div>
              </div>
           </section>

           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                 <h3 className="text-xl font-bold mb-4">Preview</h3>
                 <div className="h-10 bg-white/10 backdrop-blur-md border border-white/5 rounded-xl flex items-center justify-center px-4 overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                       {announcements.find((a: any) => a.isActive)?.text || 'Sample Message'}
                    </p>
                 </div>
                 <p className="text-white/40 text-[10px] mt-4 font-bold uppercase tracking-widest text-center">Messages will fade in/out on your storefront</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
           </div>
        </div>
      </div>
    </div>
  );
};
