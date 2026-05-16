
import React, { useEffect, useState } from 'react';
import { Eye, Search, Filter, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Order } from '../../types';

export const AdminOrders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const customerId = searchParams.get('customer');
  const [statusFilter, setStatusFilter] = useState('All');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await apiService.getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesCustomer = !customerId || (order as any).userId === customerId;
    return matchesStatus && matchesCustomer;
  });

  const clearCustomerFilter = () => {
    searchParams.delete('customer');
    setSearchParams(searchParams);
  };

  const statuses = ['All', 'Processing', 'Shipped', 'Delivered'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Orders</h1>
          <p className="text-gray-500 font-medium">Manage and track customer transactions across the store.</p>
        </div>
        {customerId && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl">
            <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Filter size={14} /> Filtering by Customer
            </span>
            <button onClick={clearCustomerFilter} className="p-1 hover:bg-amber-100 rounded-lg transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {['Total', 'Processing', 'Shipped', 'Delivered'].map((status, i) => {
           const count = status === 'Total' ? orders.length : orders.filter(o => o.status === status).length;
           return (
             <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-[var(--brand-primary)]/20">
               <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">{status}</p>
               <p className="text-2xl font-black text-slate-800 tracking-tight">{count}</p>
             </div>
           )
         })}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col xl:row gap-6 justify-between items-center">
         <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-1 hide-scrollbar">
           {statuses.map(status => (
             <button 
               key={status}
               onClick={() => setStatusFilter(status)}
               className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary)]/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
             >
               {status}
             </button>
           ))}
         </div>
         
         <div className="relative w-full xl:w-80 group">
           <input 
             type="text" 
             placeholder="Search Order ID..." 
             className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-transparent rounded-2xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)] outline-none transition-all"
           />
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors" />
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-8 py-6">Reference</th>
                <th className="px-8 py-6">Date</th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6">Connectivity</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Total</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-8 py-8"><div className="h-8 bg-gray-50 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                  <td className="px-8 py-6">
                    <span className="font-black text-[var(--brand-primary)] text-sm tracking-tight">{order.id}</span>
                  </td>
                  <td className="px-8 py-6 text-xs font-medium text-gray-500">
                    {new Date(order.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-gray-100 text-[10px] flex items-center justify-center font-black text-gray-500 border border-gray-200">
                         {((order as any).user?.name || 'C').charAt(0)}
                       </div>
                       <span className="text-xs font-black text-slate-700 tracking-tight">{(order as any).user?.name || 'Guest Customer'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digital Payment</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-slate-800">NPR {order.total.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] rounded-xl shadow-sm transition-all"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredOrders.length === 0 && (
            <div className="py-24 text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <Filter size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-800">No orders found</h3>
               <p className="text-sm text-gray-500 font-medium">Try clearing your filters to see more results.</p>
               <button 
                 onClick={clearCustomerFilter}
                 className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
               >
                 Show All Orders
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
