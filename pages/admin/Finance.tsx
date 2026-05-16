import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, DollarSign, Package, Receipt, ShoppingCart, TrendingUp } from 'lucide-react';
import { apiService } from '../../services/api';
import { Expense, Order, Product, Purchase } from '../../types';

export const AdminFinance: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiService.getOrders(), apiService.getProducts({ limit: 500 }), apiService.getExpenses(), apiService.getPurchases()])
      .then(([orderData, productData, expenseData, purchaseData]) => {
        setOrders(orderData);
        setProducts(productData.products || []);
        setExpenses(expenseData);
        setPurchases(purchaseData);
      })
      .catch(error => console.error('Failed to load finance data:', error))
      .finally(() => setLoading(false));
  }, []);

  const finance = useMemo(() => {
    const grossSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const deliveredSales = orders.filter(order => order.status === 'Delivered').reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pendingSales = grossSales - deliveredSales;
    const purchaseCost = purchases.reduce((sum, purchase) => sum + Number(purchase.total || 0), 0);
    const operatingExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const totalOutflow = purchaseCost + operatingExpenses;
    const netProfit = grossSales - totalOutflow;
    const avgOrderValue = orders.length ? Math.round(grossSales / orders.length) : 0;
    return { grossSales, deliveredSales, pendingSales, purchaseCost, operatingExpenses, totalOutflow, netProfit, avgOrderValue };
  }, [orders, expenses, purchases]);

  const statusTotals = ['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => ({
    status,
    count: orders.filter(order => order.status === status).length,
    total: orders.filter(order => order.status === status).reduce((sum, order) => sum + Number(order.total || 0), 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Financial Management</h1>
        <p className="text-sm text-gray-500">Sales, purchases, expenses, profitability, order value, and inventory value from recorded entries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <Metric title="Gross Sales" value={finance.grossSales} icon={DollarSign} loading={loading} tone="green" />
        <Metric title="Net Profit" value={finance.netProfit} icon={TrendingUp} loading={loading} tone="blue" />
        <Metric title="Total Outflow" value={finance.totalOutflow} icon={ArrowDownRight} loading={loading} tone="red" />
        <Metric title="Average Order Value" value={finance.avgOrderValue} icon={Receipt} loading={loading} tone="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-slate-800">Revenue Breakdown</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FinanceLine label="Delivered revenue" value={finance.deliveredSales} icon={ArrowUpRight} />
            <FinanceLine label="Pending revenue" value={finance.pendingSales} icon={ShoppingCart} />
            <FinanceLine label="Purchase cost" value={finance.purchaseCost} icon={Package} negative />
            <FinanceLine label="Operating expenses" value={finance.operatingExpenses} icon={ArrowDownRight} negative />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-slate-800">Inventory Value</h2>
          </div>
          <div className="p-5">
            <p className="text-3xl font-black text-slate-800">NPR {products.reduce((sum, product) => sum + Number(product.price || 0), 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">Based on current product catalog price totals.</p>
            <p className="text-sm text-gray-500 mt-1">{products.length} active catalog items</p>
          </div>
        </section>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-slate-800">Order Status Financials</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-gray-500 border-b border-gray-100">
              <tr><th className="px-5 py-3">Status</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Revenue</th><th className="px-5 py-3">Share</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {statusTotals.map(row => (
                <tr key={row.status}>
                  <td className="px-5 py-4 font-bold text-slate-800">{row.status}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{row.count}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-800">NPR {row.total.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{finance.grossSales ? Math.round((row.total / finance.grossSales) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentLedger title="Recent Purchases" rows={purchases.slice(0, 6).map(item => ({
          id: item.id,
          date: item.date,
          name: item.supplier,
          meta: item.invoiceNo || item.status,
          amount: item.total,
        }))} />
        <RecentLedger title="Recent Expenses" rows={expenses.slice(0, 6).map(item => ({
          id: item.id,
          date: item.date,
          name: item.title,
          meta: item.category,
          amount: item.amount,
        }))} />
      </div>
    </div>
  );
};

const Metric: React.FC<{ title: string; value: number; icon: any; loading: boolean; tone: 'green' | 'blue' | 'red' | 'amber' }> = ({ title, value, icon: Icon, loading, tone }) => {
  const toneClass = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700',
  }[tone];
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${toneClass}`}><Icon size={20} /></div>
      <p className="text-sm text-gray-500 mt-4">{title}</p>
      <p className="text-2xl font-black text-slate-800 mt-1">{loading ? '...' : `NPR ${value.toLocaleString()}`}</p>
    </div>
  );
};

const FinanceLine: React.FC<{ label: string; value: number; icon: any; negative?: boolean }> = ({ label, value, icon: Icon, negative }) => (
  <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${negative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}><Icon size={18} /></div>
      <span className="text-sm font-semibold text-gray-600">{label}</span>
    </div>
    <span className={`font-black ${negative ? 'text-red-600' : 'text-slate-800'}`}>{negative ? '- ' : ''}NPR {value.toLocaleString()}</span>
  </div>
);

const RecentLedger: React.FC<{ title: string; rows: { id: string; date: string; name: string; meta?: string; amount: number }[] }> = ({ title, rows }) => (
  <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-gray-50">
      <h2 className="font-bold text-slate-800">{title}</h2>
    </div>
    <div className="divide-y divide-gray-100">
      {rows.map(row => (
        <div key={row.id} className="p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate">{row.name}</p>
            <p className="text-xs text-gray-500">{new Date(row.date).toLocaleDateString()} {row.meta ? `- ${row.meta}` : ''}</p>
          </div>
          <p className="font-black text-red-600 whitespace-nowrap">NPR {Number(row.amount || 0).toLocaleString()}</p>
        </div>
      ))}
      {rows.length === 0 && <div className="p-6 text-center text-sm text-gray-500">No records yet</div>}
    </div>
  </section>
);
