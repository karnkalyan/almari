
import React, { useEffect, useState, useContext } from 'react';
import { ShopContext } from '../../App';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import { TableProperties, Plus, Trash2, Save, Link as LinkIcon, MoveUp, MoveDown, Globe, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const FooterManager: React.FC = () => {
  const { user } = useAuth();
  const { site, setSite } = useContext(ShopContext) as any;
  const [loading, setLoading] = useState(false);
  
  const [footerAbout, setFooterAbout] = useState(site.footerAbout || '');
  const [footerColumns, setFooterColumns] = useState(site.footerColumns || []);
  const [footerBusinessHours, setFooterBusinessHours] = useState(site.footerBusinessHours || '');
  const [supportPhone, setSupportPhone] = useState(site.supportPhone || '');
  const [copyrightText, setCopyrightText] = useState(site.copyrightText || '');
  const [paymentPartners, setPaymentPartners] = useState(site.paymentPartners || []);

  if (user?.role !== 'super_admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedSite = { ...site, footerAbout, footerColumns, footerBusinessHours, supportPhone, copyrightText, paymentPartners };
      await apiService.updateSiteSetting('site_customization', updatedSite);
      setSite(updatedSite);
      toast.success('Footer architecture updated');
    } catch (error) {
      toast.error('Failed to save footer settings');
    } finally {
      setLoading(false);
    }
  };

  const addColumn = () => {
    setFooterColumns([...footerColumns, { title: 'New Column', links: [] }]);
  };

  const removeColumn = (idx: number) => {
    setFooterColumns(footerColumns.filter((_: any, i: number) => i !== idx));
  };

  const addLink = (colIdx: number) => {
    const newCols = [...footerColumns];
    newCols[colIdx].links.push({ label: 'New Link', url: '#' });
    setFooterColumns(newCols);
  };

  const removeLink = (colIdx: number, linkIdx: number) => {
    const newCols = [...footerColumns];
    newCols[colIdx].links = newCols[colIdx].links.filter((_: any, i: number) => i !== linkIdx);
    setFooterColumns(newCols);
  };

  const updateLink = (colIdx: number, linkIdx: number, field: string, value: string) => {
    const newCols = [...footerColumns];
    newCols[colIdx].links[linkIdx] = { ...newCols[colIdx].links[linkIdx], [field]: value };
    setFooterColumns(newCols);
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Footer Structure</h1>
          <p className="text-gray-500 font-medium mt-1">Design the foundational information layer of your storefront.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20 flex items-center gap-2 hover:opacity-90 transition-all"
        >
          {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} 
          Save Structure
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
           <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl">
                       <TableProperties size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Information Columns</h2>
                 </div>
                 <button 
                   onClick={addColumn}
                   className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-slate-600 rounded-xl text-xs font-bold transition-all"
                 >
                   <Plus size={16} /> Add Column
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {footerColumns.map((col: any, colIdx: number) => (
                   <div key={colIdx} className="bg-gray-50/50 rounded-3xl border border-gray-100 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                         <input 
                           type="text" 
                           value={col.title}
                           onChange={(e) => {
                             const newCols = [...footerColumns];
                             newCols[colIdx].title = e.target.value;
                             setFooterColumns(newCols);
                           }}
                           className="bg-transparent font-black text-slate-800 text-sm outline-none focus:text-[var(--brand-primary)]"
                         />
                         <button onClick={() => removeColumn(colIdx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                         </button>
                      </div>

                      <div className="space-y-2">
                         {col.links.map((link: any, linkIdx: number) => (
                           <div key={linkIdx} className="flex gap-2 group">
                              <input 
                                type="text" 
                                value={link.label}
                                onChange={(e) => updateLink(colIdx, linkIdx, 'label', e.target.value)}
                                className="flex-1 bg-white px-3 py-2 rounded-xl border border-gray-100 text-[10px] font-bold text-slate-600 outline-none"
                                placeholder="Label"
                              />
                              <input 
                                type="text" 
                                value={link.url}
                                onChange={(e) => updateLink(colIdx, linkIdx, 'url', e.target.value)}
                                className="flex-1 bg-white px-3 py-2 rounded-xl border border-gray-100 text-[10px] font-bold text-slate-600 outline-none"
                                placeholder="URL"
                              />
                              <button onClick={() => removeLink(colIdx, linkIdx)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                 <Trash2 size={14} />
                              </button>
                           </div>
                         ))}
                         <button 
                           onClick={() => addLink(colIdx)}
                           className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-slate-300 hover:text-slate-600 transition-all"
                         >
                           Add Link
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </section>

           <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
                    <Globe size={24} />
                 </div>
                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">Company Narrative</h2>
              </div>
               <textarea 
                 value={footerAbout}
                 onChange={(e) => setFooterAbout(e.target.value)}
                 className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:ring-2 focus:ring-slate-900/5 transition-all font-medium text-slate-600 text-sm min-h-[120px]"
                 placeholder="Brief description about the company for the footer..."
               />
               <div className="mt-6 space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Support Phone Number</label>
                    <input 
                      type="text" 
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-slate-700 text-sm"
                      placeholder="+977 9801234567"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Copyright Text</label>
                    <input 
                      type="text" 
                      value={copyrightText}
                      onChange={(e) => setCopyrightText(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-slate-700 text-sm"
                      placeholder="© 2026 Almari Store. All rights reserved."
                    />
                 </div>
               </div>
            </section>
            
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-green-500/10 text-green-600 rounded-2xl">
                        <TableProperties size={24} />
                     </div>
                     <h2 className="text-xl font-bold text-slate-800 tracking-tight">Payment Partners</h2>
                  </div>
                  <button 
                    onClick={() => setPaymentPartners([...paymentPartners, { name: 'New Partner', logo: '', enabled: true }])}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-slate-600 rounded-xl text-xs font-bold transition-all"
                  >
                    <Plus size={16} /> Add Partner
                  </button>
               </div>
               
               <div className="space-y-4">
                  {paymentPartners.map((partner: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                       <input 
                         type="text" 
                         value={partner.name}
                         onChange={(e) => setPaymentPartners(paymentPartners.map((p: any, i: number) => i === idx ? { ...p, name: e.target.value } : p))}
                         className="flex-1 px-4 py-2 bg-white border border-gray-100 rounded-xl outline-none font-bold text-sm"
                         placeholder="Partner Name (e.g., eSewa)"
                       />
                       <input 
                         type="text" 
                         value={partner.logo}
                         onChange={(e) => setPaymentPartners(paymentPartners.map((p: any, i: number) => i === idx ? { ...p, logo: e.target.value } : p))}
                         className="flex-1 px-4 py-2 bg-white border border-gray-100 rounded-xl outline-none text-sm"
                         placeholder="Logo URL"
                       />
                       <button onClick={() => setPaymentPartners(paymentPartners.filter((_: any, i: number) => i !== idx))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                       </button>
                    </div>
                  ))}
               </div>
            </section>
         </div>

        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-xl">
              <h3 className="text-xl font-black mb-6 tracking-tight">Visual Preview</h3>
              <div className="space-y-8 opacity-60">
                 <div className="space-y-3">
                    <div className="w-20 h-2 bg-white/20 rounded-full"></div>
                    <div className="w-full h-2 bg-white/10 rounded-full"></div>
                    <div className="w-2/3 h-2 bg-white/10 rounded-full"></div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    {footerColumns.slice(0, 2).map((c: any, i: number) => (
                      <div key={i} className="space-y-3">
                         <div className="w-12 h-1.5 bg-white/30 rounded-full mb-4"></div>
                         <div className="w-full h-1 bg-white/5 rounded-full"></div>
                         <div className="w-full h-1 bg-white/5 rounded-full"></div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
           </div>

           <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6">Operations Window</h3>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Hours Display</label>
                 <textarea 
                   value={footerBusinessHours}
                   onChange={(e) => setFooterBusinessHours(e.target.value)}
                   className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-slate-700 text-xs min-h-[100px]"
                   placeholder="Sunday-Friday: 9:00 - 18:00..."
                 />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const RefreshCw = ({ className, size }: any) => <RotateCcw className={className} size={size} />;
