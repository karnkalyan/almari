import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, Settings2, Trash2, GripVertical, Save, Image as ImageIcon, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const SECTION_TYPES = [
  'Hero Slider', 'Hero Bottom Promo Cards', 'Promo Banner', 'Promo Cards',
  'Featured Products', 'Flash Deals', 'Shop by Brand', 'Shop by Category',
  'Trending Products', 'New Arrivals', 'Best Sellers', 'Recently Added',
  'Recommended Products', 'Custom Product Collection', 'Blog Section',
  'Testimonial Section', 'Video Banner', 'Newsletter', 'Custom HTML Block',
  'Ads Banner', 'Multi Banner Grid', 'Offer Countdown Banner', 'Featured Vendors',
  'Announcement Bar'
];

export const HomepageBuilder: React.FC = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);

  const fetchSections = async () => {
    try {
      const data = await apiService.getHomepageSections();
      setSections(data);
    } catch (error) {
      toast.error('Failed to load homepage sections');
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleAddSection = async (type: string) => {
    try {
      await apiService.createHomepageSection({
        title: `New ${type}`,
        sectionType: type,
        isActive: true,
        desktopVisible: true,
        tabletVisible: true,
        mobileVisible: true,
        position: sections.length
      });
      fetchSections();
      toast.success('Section created');
    } catch (error) {
      toast.error('Failed to create section');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      await apiService.deleteHomepageSection(id);
      fetchSections();
      toast.success('Section deleted');
    } catch (error) {
      toast.error('Failed to delete section');
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await apiService.updateHomepageSection(id, data);
      fetchSections();
      toast.success('Section updated');
      setEditingSection(null);
    } catch (error) {
      toast.error('Failed to update section');
    }
  };

  const moveSection = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return;
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    setSections(newSections);
    
    try {
      await apiService.reorderHomepageSections(newSections.map(s => s.id));
      toast.success('Sections reordered');
    } catch (error) {
      toast.error('Failed to save order');
      fetchSections();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Homepage Builder</h1>
          <p className="text-gray-500 font-medium mt-3">Design a fully dynamic, CMS-driven storefront experience.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          {sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group">
              <div className="p-6 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1 text-gray-300">
                    <button onClick={() => moveSection(index, 'up')} className="hover:text-slate-600"><ArrowUp size={16} /></button>
                    <button onClick={() => moveSection(index, 'down')} className="hover:text-slate-600"><ArrowDown size={16} /></button>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{section.title || section.sectionType}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{section.sectionType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={section.isActive} onChange={() => handleUpdate(section.id, { isActive: !section.isActive })} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand-primary)]"></div>
                  </label>
                  <button onClick={() => setEditingSection(section)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"><Settings2 size={18} /></button>
                  <button onClick={() => handleDelete(section.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
              
              {editingSection?.id === section.id && (
                <div className="p-10 bg-gray-50 space-y-10 animate-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-4">General Configuration</h4>
                       <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Section Title</label>
                            <input className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-sm shadow-sm focus:ring-2 focus:ring-slate-900/5 transition-all" value={editingSection.title || ''} onChange={e => setEditingSection({ ...editingSection, title: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Subtitle</label>
                            <input className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-sm shadow-sm focus:ring-2 focus:ring-slate-900/5 transition-all" value={editingSection.subtitle || ''} onChange={e => setEditingSection({ ...editingSection, subtitle: e.target.value })} />
                          </div>
                          <div className="flex items-center gap-6">
                            <div>
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Background</label>
                               <input type="color" className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white shadow-lg" value={editingSection.backgroundColor || '#ffffff'} onChange={e => setEditingSection({ ...editingSection, backgroundColor: e.target.value })} />
                            </div>
                            <div className="flex-1 space-y-3">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Visibility Control</label>
                               <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-xl shadow-sm"><input type="checkbox" checked={editingSection.desktopVisible} onChange={e => setEditingSection({ ...editingSection, desktopVisible: e.target.checked })} /> Desktop</label>
                                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-xl shadow-sm"><input type="checkbox" checked={editingSection.mobileVisible} onChange={e => setEditingSection({ ...editingSection, mobileVisible: e.target.checked })} /> Mobile</label>
                               </div>
                            </div>
                          </div>
                       </div>
                       <button onClick={() => handleUpdate(section.id, editingSection)} className="w-full py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"><Save size={16} /> Update Section Meta</button>
                    </div>

                    <div className="space-y-6">
                       <div className="flex items-center justify-between border-b pb-4">
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Section Content / Items</h4>
                          <button 
                            onClick={async () => {
                              const newItem = await apiService.createHomepageSectionItem(section.id, { title: 'New Item', position: section.items?.length || 0 });
                              const updatedSections = sections.map(s => s.id === section.id ? { ...s, items: [...(s.items || []), newItem] } : s);
                              setSections(updatedSections);
                              setEditingSection(updatedSections.find(s => s.id === section.id));
                              toast.success('Item added');
                            }}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Plus size={18} />
                          </button>
                       </div>
                       
                       <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {(editingSection.items || []).map((item: any, idx: number) => (
                            <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 group/item relative">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-300 group-hover/item:border-slate-200 transition-colors overflow-hidden">
                                     {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
                                  </div>
                                  <div className="flex-1">
                                     <input 
                                       className="w-full bg-transparent font-bold text-slate-800 text-sm outline-none border-b border-transparent focus:border-slate-200" 
                                       value={item.title || ''} 
                                       placeholder="Item Title"
                                       onChange={async (e) => {
                                         const val = e.target.value;
                                         const updatedItems = [...editingSection.items];
                                         updatedItems[idx].title = val;
                                         setEditingSection({ ...editingSection, items: updatedItems });
                                       }}
                                       onBlur={() => apiService.updateHomepageSectionItem(item.id, { title: item.title })}
                                     />
                                     <input 
                                       className="w-full bg-transparent text-[10px] font-bold text-gray-400 uppercase tracking-widest outline-none" 
                                       value={item.subtitle || ''} 
                                       placeholder="SUBTITLE"
                                       onChange={e => {
                                         const updatedItems = [...editingSection.items];
                                         updatedItems[idx].subtitle = e.target.value;
                                         setEditingSection({ ...editingSection, items: updatedItems });
                                       }}
                                       onBlur={() => apiService.updateHomepageSectionItem(item.id, { subtitle: item.subtitle })}
                                     />
                                  </div>
                                  <button 
                                    onClick={async () => {
                                      await apiService.deleteHomepageSectionItem(item.id);
                                      const updatedItems = editingSection.items.filter((i: any) => i.id !== item.id);
                                      setEditingSection({ ...editingSection, items: updatedItems });
                                      toast.success('Item removed');
                                    }}
                                    className="p-2 text-red-400 opacity-0 group-hover/item:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                               </div>
                               <div className="grid grid-cols-2 gap-3">
                                  <input 
                                    className="bg-gray-50 px-3 py-2 rounded-lg text-[10px] font-bold outline-none border border-transparent focus:bg-white focus:border-gray-200" 
                                    value={item.image || ''} 
                                    placeholder="Image URL"
                                    onChange={e => {
                                      const updatedItems = [...editingSection.items];
                                      updatedItems[idx].image = e.target.value;
                                      setEditingSection({ ...editingSection, items: updatedItems });
                                    }}
                                    onBlur={() => apiService.updateHomepageSectionItem(item.id, { image: item.image })}
                                  />
                                  <input 
                                    className="bg-gray-50 px-3 py-2 rounded-lg text-[10px] font-bold outline-none border border-transparent focus:bg-white focus:border-gray-200" 
                                    value={item.buttonUrl || ''} 
                                    placeholder="Link URL"
                                    onChange={e => {
                                      const updatedItems = [...editingSection.items];
                                      updatedItems[idx].buttonUrl = e.target.value;
                                      setEditingSection({ ...editingSection, items: updatedItems });
                                    }}
                                    onBlur={() => apiService.updateHomepageSectionItem(item.id, { buttonUrl: item.buttonUrl })}
                                  />
                               </div>
                            </div>
                          ))}
                          {(!editingSection.items || editingSection.items.length === 0) && (
                            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-widest">
                               No items in this section
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {sections.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <LayoutDashboard size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-black text-slate-800">Your Homepage is Empty</h3>
              <p className="text-sm text-gray-500 font-medium">Add a section from the library to start building.</p>
            </div>
          )}
        </div>

        <div className="xl:col-span-1">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-6">Component Library</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {SECTION_TYPES.map(type => (
                <button 
                  key={type}
                  onClick={() => handleAddSection(type)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-slate-900 hover:text-white group rounded-2xl transition-all text-left"
                >
                  <span className="font-bold text-sm text-slate-700 group-hover:text-white transition-colors">{type}</span>
                  <Plus size={16} className="text-gray-400 group-hover:text-white" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
