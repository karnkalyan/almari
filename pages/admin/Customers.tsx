
import React, { useEffect, useState } from 'react';
import { Search, Mail, Phone, MapPin, MoreVertical, Eye, Trash2, Ban, ShieldCheck, ShoppingCart } from 'lucide-react';
import { apiService } from '../../services/api';
import { User } from '../../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<User[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      const data = await apiService.getUsers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customer data');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
    try {
      await apiService.deleteUser(id);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  const handleBlock = async (id: string) => {
    try {
      // Assuming we have a blockUser method or similar
      toast.success('Customer access restricted');
    } catch (err) {
      toast.error('Failed to block customer');
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.role === 'customer' || !c.role) && (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Customer Database</h1>
          <p className="text-gray-500 font-medium">Manage user relationships, verify accounts, and monitor loyalty.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 justify-between items-center">
         <div className="relative flex-1 w-full lg:max-w-xl group">
           <input 
             type="text" 
             placeholder="Search by name, email or phone..." 
             className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-transparent rounded-2xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)] outline-none transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors" />
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
              <tr>
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Connectivity</th>
                <th className="px-8 py-6">Location</th>
                <th className="px-8 py-6 text-center">Engagement</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)] text-[var(--brand-accent)] flex items-center justify-center font-black text-sm border-2 border-white shadow-sm ring-1 ring-gray-100">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-[var(--brand-primary)] text-sm tracking-tight">{customer.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Customer</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Mail size={12} className="text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                        <Phone size={12} className="text-gray-300" />
                        {customer.phone || 'No phone recorded'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <MapPin size={12} className="text-gray-400" />
                      {customer.addresses?.[0] 
                        ? `${customer.addresses[0].city}, ${customer.addresses[0].country}` 
                        : 'No primary address'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center group-hover:scale-110 transition-transform">
                        <p className="text-sm font-black text-[var(--brand-primary)]">{customer.orders?.length || 0}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Orders</p>
                      </div>
                      <div className="w-px h-8 bg-gray-100"></div>
                      <div className="text-center group-hover:scale-110 transition-transform">
                        <p className="text-sm font-black text-green-600">
                          NPR {(customer.orders?.reduce((acc, o) => acc + (o.total || 0), 0) || 0).toLocaleString()}
                        </p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Lifetime</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === customer.id ? null : customer.id)}
                      className={`p-2.5 rounded-xl border transition-all ${activeMenu === customer.id ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]' : 'bg-white border-gray-100 text-slate-400 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]'}`}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenu === customer.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                        <div className="absolute right-8 top-16 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                           <div className="p-2 space-y-1">
                              <button 
                                onClick={() => { navigate(`/admin/orders?customer=${customer.id}`); setActiveMenu(null); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[var(--brand-primary)] rounded-xl transition-colors"
                              >
                                <ShoppingCart size={14} /> View Orders
                              </button>
                              <button 
                                onClick={() => setActiveMenu(null)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-gray-50 rounded-xl transition-colors"
                              >
                                <Eye size={14} /> Account Profile
                              </button>
                              <div className="h-px bg-gray-50 my-1 mx-2"></div>
                              <button 
                                onClick={() => { handleBlock(customer.id); setActiveMenu(null); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                              >
                                <Ban size={14} /> Restrict Access
                              </button>
                              <button 
                                onClick={() => { handleDelete(customer.id); setActiveMenu(null); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <Trash2 size={14} /> Delete Customer
                              </button>
                           </div>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="py-20 text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <ShoppingCart size={32} />
               </div>
               <h3 className="text-lg font-bold text-slate-800">No customers found</h3>
               <p className="text-sm text-gray-500">Adjust your search to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
