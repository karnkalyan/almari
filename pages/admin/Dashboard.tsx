
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Expense, Order, Product, Purchase } from '../../types';
import { ShoppingBag, ShoppingCart, Users, TrendingUp, ArrowRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    grossSales: 0,
    totalOutflow: 0,
    purchaseCost: 0,
    operatingExpenses: 0,
    netProfit: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [orders, products, users, expenses, purchases]: [Order[], { products?: Product[] }, any[], Expense[], Purchase[]] = await Promise.all([
          apiService.getOrders(),
          apiService.getProducts(),
          apiService.getUsers(),
          apiService.getExpenses(),
          apiService.getPurchases(),
        ]);

        const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
        const purchaseCost = purchases.reduce((acc, purchase) => acc + Number(purchase.total || 0), 0);
        const operatingExpenses = expenses.reduce((acc, expense) => acc + Number(expense.amount || 0), 0);
        const totalOutflow = purchaseCost + operatingExpenses;
        const netProfit = totalRevenue - totalOutflow;
        const totalOrders = orders.length;
        const totalProducts = products.products?.length || 0;
        const totalCustomers = users.length;
        setRecentOrders(orders.slice(0, 5));
        setTopProducts((products.products || []).slice(0, 5));

        setStats({
          totalRevenue,
          grossSales: totalRevenue,
          totalOutflow,
          purchaseCost,
          operatingExpenses,
          netProfit,
          totalOrders,
          totalProducts,
          totalCustomers,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Revenue',
      value: loading ? '...' : `NPR ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: `${stats.totalOrders} recorded orders`
    },
    {
      label: 'Total Outflow',
      value: loading ? '...' : `NPR ${stats.totalOutflow.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-red-500',
      trend: `Purchases NPR ${stats.purchaseCost.toLocaleString()}`
    },
    {
      label: 'Net Profit',
      value: loading ? '...' : `NPR ${stats.netProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      trend: `Expenses NPR ${stats.operatingExpenses.toLocaleString()}`
    },
    {
      label: 'Total Orders',
      value: loading ? '...' : stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      trend: 'Live order count'
    },
    {
      label: 'Total Products',
      value: loading ? '...' : stats.totalProducts,
      icon: ShoppingBag,
      color: 'bg-[var(--brand-accent)]',
      trend: 'Catalog items'
    },
    {
      label: 'Total Customers',
      value: loading ? '...' : stats.totalCustomers,
      icon: Users,
      color: 'bg-purple-500',
      trend: 'Registered users'
    },
  ];

  const exportData = () => {
    if (recentOrders.length === 0) {
      toast.error('No order data to export');
      return;
    }
    const headers = ['Order ID', 'Customer', 'Date', 'Status', 'Total'];
    const rows = recentOrders.map(o => [
      o.id,
      (o as any).user?.name || 'Guest',
      new Date(o.createdAt!).toLocaleDateString(),
      o.status,
      o.total
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `almari_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders exported to CSV');
  };

  const createReport = () => {
    // Open a new window with a printable report summary
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const html = `
      <html>
        <head>
          <title>Almari Store Performance Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #334155; }
            h1 { color: #002f4a; border-bottom: 2px solid #E5A823; padding-bottom: 10px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 40px 0; }
            .stat { background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; }
            .stat-label { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; }
            .stat-value { font-size: 24px; font-weight: 900; color: #002f4a; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { text-align: left; padding: 12px; background: #002f4a; color: white; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Almari Store Performance Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          
          <div class="grid">
            <div class="stat">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value">NPR ${stats.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total Orders</div>
              <div class="stat-value">${stats.totalOrders}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Net Profit</div>
              <div class="stat-value">NPR ${stats.netProfit.toLocaleString()}</div>
            </div>
          </div>
          
          <h3>Recent Transactions</h3>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${recentOrders.map(o => `
                <tr>
                  <td>${o.id}</td>
                  <td>${(o as any).user?.name || 'Guest'}</td>
                  <td>${new Date(o.createdAt!).toLocaleDateString()}</td>
                  <td>${o.status}</td>
                  <td>NPR ${o.total.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            &copy; ${new Date().getFullYear()} Almari Premium Marketplace. Confidential Business Document.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    reportWindow.document.write(html);
    reportWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Welcome back, Admin! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportData}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-gray-50 transition shadow-sm"
          >
            Export Data
          </button>
          <button 
            onClick={createReport}
            className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl text-sm font-bold hover:bg-[#003d61] transition shadow-md shadow-[var(--brand-primary)]/10"
          >
            Create Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
            <div className="flex justify-between items-start z-10 relative">
              <div className={`w-12 h-12 rounded-2xl ${stat.color} bg-opacity-10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={22} className={stat.color.replace('bg-', 'text-')} />
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50 z-10 relative">
              <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${stat.color}`}></div>
                {stat.trend}
              </span>
            </div>
            
            {/* Background decoration */}
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-5 ${stat.color} blur-2xl group-hover:opacity-10 transition-opacity`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
             <div>
               <h3 className="font-black text-slate-800 text-lg tracking-tight">Recent Transactions</h3>
               <p className="text-xs text-gray-500 mt-1">Latest 5 orders placed on the storefront.</p>
             </div>
             <Link to="/admin/orders" className="p-2 bg-white border border-gray-200 rounded-xl text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition group">
               <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </Link>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-gray-50/30 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                 <tr>
                   <th className="px-8 py-5">Order ID</th>
                   <th className="px-8 py-5">Customer</th>
                   <th className="px-8 py-5 text-center">Status</th>
                   <th className="px-8 py-5 text-right">Amount</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {recentOrders.map(order => (
                   <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                     <td className="px-8 py-5">
                       <div className="flex flex-col">
                         <span className="font-black text-[var(--brand-primary)] text-sm tracking-tight">{order.id}</span>
                         <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(order.createdAt!).toLocaleDateString()}</span>
                       </div>
                     </td>
                     <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                           {((order as any).user?.name || 'C').charAt(0)}
                         </div>
                         <span className="text-sm font-bold text-slate-700">{(order as any).user?.name || 'Guest'}</span>
                       </div>
                     </td>
                     <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${
                          order.status === 'Delivered' ? 'bg-green-500/10 text-green-600' : 
                          order.status === 'Processing' ? 'bg-blue-500/10 text-blue-600' : 
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                          {order.status}
                        </span>
                     </td>
                     <td className="px-8 py-5 text-right font-black text-slate-800 text-sm">
                       NPR {order.total.toLocaleString()}
                     </td>
                   </tr>
                 ))}
                 {!loading && recentOrders.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-8 py-12 text-center text-sm text-gray-500 font-medium">No transactions found</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

        {/* Top Selling Products - Simplified View */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-8 border-b border-gray-50 bg-gray-50/50">
             <h3 className="font-black text-slate-800 text-lg tracking-tight">Top Performance</h3>
             <p className="text-xs text-gray-500 mt-1">Products with highest interaction.</p>
           </div>
           <div className="divide-y divide-gray-50">
             {topProducts.map((product, i) => (
               <div key={product.id} className="p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-[var(--brand-accent)] group-hover:text-[var(--brand-primary)] transition-colors">
                   {i + 1}
                 </div>
                 <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 p-2 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                   <img src={product.primaryImage || product.image} alt="" className="w-full h-full object-contain" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-[var(--brand-primary)] transition-colors">{product.name}</h4>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{product.category}</p>
                 </div>
                 <div className="text-sm font-black text-[var(--brand-primary)] bg-slate-50 px-3 py-1 rounded-lg">
                   {Number(product.price || 0).toLocaleString()}
                 </div>
               </div>
             ))}
             {!loading && topProducts.length === 0 && (
               <div className="p-12 text-center text-sm text-gray-500 font-medium">Inventory is empty</div>
             )}
           </div>
           <div className="p-6 bg-gray-50/30 border-t border-gray-50 text-center">
             <Link to="/admin/products" className="text-xs font-black text-[var(--brand-primary)] uppercase tracking-[0.2em] hover:text-[#003d61] transition-colors flex items-center justify-center gap-2">
               Full Catalog <ArrowRight size={14} />
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
};
