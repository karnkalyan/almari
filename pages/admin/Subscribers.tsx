
import React, { useEffect, useState } from 'react';
import { Search, Mail, Calendar, Download, Trash2, Send } from 'lucide-react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

export const AdminSubscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      // Assuming we might have a dedicated endpoint or it's part of users with a flag
      // For now, let's fetch users and filter or simulate if endpoint doesn't exist
      const users = await apiService.getUsers();
      // In a real app, you'd have a NewsletterSubscriber model
      // Let's simulate for now or fetch from a hypothetical endpoint
      setSubscribers(users.filter(u => u.role === 'customer').map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        date: u.createdAt,
        status: 'Active'
      })));
    } catch (error) {
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Status', 'Date Joined'],
      ...subscribers.map(s => [s.name, s.email, s.status, new Date(s.date).toLocaleDateString()])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    toast.success('Subscriber list exported');
  };

  const filtered = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Newsletter Audience</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your marketing reach and subscriber engagement.</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all"
           >
             <Download size={18} /> Export CSV
           </button>
           <button 
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--brand-primary)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--brand-primary)]/20 hover:opacity-90 transition-all"
           >
             <Send size={18} /> Blast Campaign
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search subscribers..." 
              className="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscriber</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Channel State</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrollment Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                   <tr key={i} className="animate-pulse">
                     <td colSpan={4} className="px-8 py-8"><div className="h-12 bg-gray-100 rounded-2xl w-full"></div></td>
                   </tr>
                 ))
              ) : filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {s.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                       <Calendar size={14} className="text-gray-400" />
                       {new Date(s.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center text-gray-400">
               <Mail size={40} className="mx-auto mb-4 opacity-20" />
               <p className="text-sm font-bold uppercase tracking-widest">No subscribers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
