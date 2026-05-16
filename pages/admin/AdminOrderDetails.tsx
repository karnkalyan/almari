
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order } from '../../types';
import { ArrowLeft, Package, MapPin, Printer, Download, CheckCircle, Clock, Truck } from 'lucide-react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import { SiteCustomization } from '../../types';

export const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [status, setStatus] = useState<string>('');
  const [site, setSite] = useState<Partial<SiteCustomization>>({});

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const found = await apiService.getOrder(id);
        setOrder(found);
        setStatus(found.status);
        apiService.getSiteSettings().then(data => setSite(data.site || {})).catch(() => {});
      } catch (error) {
        console.error('Failed to fetch order:', error);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) return <div>Loading...</div>;
  const baseSubtotal = order.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const servicesSubtotal = order.items.reduce((sum, item) => sum + ((Number((item as any).serviceTotal || 0) * Number(item.quantity || 1))), 0);
  const shippingCharge = Number((order as any).shippingCharge || 0);

  const handleStatusChange = (newStatus: string) => {
      setStatus(newStatus);
  };

  const saveStatus = async () => {
    if (!order) return;
    try {
      const updated = await apiService.updateOrderStatus(order.id, status);
      setOrder(updated);
      toast.success('Order status updated');
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const logoText = site.logoText || site.storeName || 'Almari';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/orders')} className="p-2 hover:bg-gray-200 rounded-full transition">
               <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
               <h1 className="text-2xl font-bold text-slate-800">Order {order.id}</h1>
               <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()} by <span className="text-[var(--brand-primary)] font-bold">{(order as any).user?.name || 'Customer'}</span></p>
            </div>
         </div>
         <div className="flex gap-3">
            <button onClick={() => window.print()} className="no-print flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">
               <Printer size={16} /> Print
            </button>
            <button onClick={() => window.print()} className="no-print flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">
               <Download size={16} /> Invoice
            </button>
         </div>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-invoice, #print-invoice * { visibility: visible; }
          #print-invoice { position: absolute; left: 0; top: 0; width: 100%; display: block !important; background: white; color: #0f172a; padding: 32px; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div id="print-invoice" className="hidden">
        <div className="max-w-4xl mx-auto border border-slate-200 p-8">
          <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
            <div>
              {site.logoImage ? <img src={site.logoImage} alt={logoText} className="h-14 object-contain mb-3" /> : <h2 className="text-3xl font-black">{logoText}</h2>}
              <p className="text-sm text-slate-500">{site.address || 'Kathmandu, Nepal'}</p>
              <p className="text-sm text-slate-500">{site.supportEmail || 'support@almari.np'} | {site.supportPhone || '+977 9801234567'}</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-black uppercase">Invoice</h1>
              <p className="text-sm text-slate-500">#{order.id}</p>
              <p className="text-sm text-slate-500">{new Date(order.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div>
              <h3 className="font-bold uppercase text-slate-500 mb-2">Bill To</h3>
              <p className="font-bold">{(order as any).user?.name || 'Customer'}</p>
              <p>{(order as any).user?.email || 'customer@example.com'}</p>
            </div>
            <div>
              <h3 className="font-bold uppercase text-slate-500 mb-2">Ship To</h3>
              <p>{order.address?.street}</p>
              <p>{order.address?.city}, {order.address?.zipCode}</p>
              <p>{order.address?.country}</p>
            </div>
          </div>
          <table className="w-full text-sm border-collapse mb-8">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left p-3">Item</th>
                <th className="text-right p-3">Qty</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="p-3">
                    <p>{item.name}</p>
                    {Array.isArray((item as any).selectedServices) && (item as any).selectedServices.length > 0 && (
                      <div className="mt-1 text-xs text-slate-500">
                        {(item as any).selectedServices.map((service: any, serviceIndex: number) => (
                          <p key={serviceIndex}>+ {service.title} (NPR {service.amount})</p>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right">{item.quantity}</td>
                  <td className="p-3 text-right">NPR {item.price}</td>
                  <td className="p-3 text-right">NPR {(item.price * item.quantity) + (Number((item as any).serviceTotal || 0) * Number(item.quantity || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ml-auto w-72 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>NPR {baseSubtotal}</span></div>
            <div className="flex justify-between"><span>Service Add-ons</span><span>NPR {servicesSubtotal}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>NPR {shippingCharge}</span></div>
            <div className="flex justify-between text-xl font-black border-t border-slate-200 pt-3"><span>Total</span><span>NPR {order.total}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Info */}
         <div className="lg:col-span-2 space-y-6">
            {/* Status Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4">Order Status</h3>
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <select 
                    value={status} 
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="h-10 px-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-slate-800 font-medium focus:ring-2 focus:ring-[var(--brand-primary)] outline-none min-w-[200px]"
                  >
                     <option value="Processing">Processing</option>
                     <option value="Shipped">Shipped</option>
                     <option value="Delivered">Delivered</option>
                     <option value="Cancelled">Cancelled</option>
                  </select>
                  <button onClick={saveStatus} className="h-10 px-6 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-bold hover:bg-[#003d61] transition shadow-md">
                     Update Status
                  </button>
               </div>
               {/* Simple Timeline Visual */}
               <div className="mt-8 flex items-center relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10"></div>
                  <div className={`flex-1 flex flex-col items-center gap-2 ${['Processing', 'Shipped', 'Delivered'].includes(status) ? 'opacity-100' : 'opacity-40'}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['Processing', 'Shipped', 'Delivered'].includes(status) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <Clock size={14} />
                     </div>
                     <span className="text-xs font-bold text-gray-600">Processing</span>
                  </div>
                  <div className={`flex-1 flex flex-col items-center gap-2 ${['Shipped', 'Delivered'].includes(status) ? 'opacity-100' : 'opacity-40'}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['Shipped', 'Delivered'].includes(status) ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <Truck size={14} />
                     </div>
                     <span className="text-xs font-bold text-gray-600">Shipped</span>
                  </div>
                  <div className={`flex-1 flex flex-col items-center gap-2 ${status === 'Delivered' ? 'opacity-100' : 'opacity-40'}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === 'Delivered' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <CheckCircle size={14} />
                     </div>
                     <span className="text-xs font-bold text-gray-600">Delivered</span>
                  </div>
               </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-100 bg-[#f8fafc]">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                     <Package size={20} className="text-[var(--brand-primary)]" /> Order Items
                  </h3>
               </div>
               <div className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                     <div key={idx} className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded border border-gray-100 flex items-center justify-center p-1">
                           <img src={item.primaryImage || item.image} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1">
                           <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                           <p className="text-xs text-gray-500">{item.category}</p>
                           {Array.isArray((item as any).selectedServices) && (item as any).selectedServices.length > 0 && (
                             <div className="mt-2 space-y-1">
                               {(item as any).selectedServices.map((service: any, serviceIndex: number) => (
                                 <p key={serviceIndex} className="text-xs text-[var(--brand-primary)]">+ {service.title} (NPR {service.amount})</p>
                               ))}
                             </div>
                           )}
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-bold text-slate-800">NPR {item.price}</p>
                           <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right w-24">
                           <p className="text-sm font-bold text-[var(--brand-primary)]">NPR {item.price * item.quantity}</p>
                        </div>
                     </div>
                  ))}
               </div>
               <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <div className="w-64 space-y-2">
                     <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>NPR {baseSubtotal}</span>
                     </div>
                     <div className="flex justify-between text-sm text-gray-600">
                        <span>Service Add-ons</span>
                        <span>NPR {servicesSubtotal}</span>
                     </div>
                     <div className="flex justify-between text-sm text-gray-600">
                        <span>Shipping</span>
                        <span className="font-medium">NPR {shippingCharge}</span>
                     </div>
                     <div className="flex justify-between text-lg font-bold text-[var(--brand-primary)] border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span>NPR {order.total}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Customer Info */}
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Customer</h3>
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold">JD</div>
                  <div>
                     <p className="font-bold text-slate-800 text-sm">{(order as any).user?.name || 'Customer'}</p>
                     <p className="text-xs text-gray-500">12 Orders</p>
                  </div>
               </div>
               <div className="text-sm text-gray-600 space-y-2">
                  <p className="flex items-center gap-2">{(order as any).user?.email || 'customer@example.com'}</p>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Shipping Address</h3>
               <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.address?.street}</p>
                  <p>{order.address?.city}, {order.address?.zipCode}</p>
                  <p>{order.address?.country}</p>
               </div>
               <div className="mt-4 pt-4 border-t border-gray-100">
                   <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                      <MapPin size={12} /> Billing Address same as shipping
                   </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
