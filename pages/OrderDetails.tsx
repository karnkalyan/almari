
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order } from '../types';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { apiService } from '../services/api';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | undefined>(undefined);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        setOrder(await apiService.getOrder(id));
      } catch (error) {
        console.error('Failed to fetch order:', error);
        setOrder(undefined);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Order Not Found</h2>
        <Link to="/profile">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }
  const baseSubtotal = order.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const servicesSubtotal = order.items.reduce((sum, item) => sum + ((Number((item as any).serviceTotal || 0) * Number(item.quantity || 1))), 0);
  const shippingCharge = Number((order as any).shippingCharge || 0);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-white border-b border-gray-200 py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
               <div className="flex items-center gap-2 mb-2">
                 <Link to="/profile" className="text-gray-500 hover:text-[var(--brand-primary)]">
                   <ArrowLeft size={20} />
                 </Link>
                 <h1 className="text-2xl font-bold text-slate-800">Order Details</h1>
               </div>
               <p className="text-gray-500 text-sm ml-7">
                 Order <span className="font-mono text-slate-800 font-bold">{order.id}</span> was placed on <span className="font-bold text-slate-800">{order.date}</span>.
               </p>
             </div>
             <div className="flex items-center gap-3">
               <button onClick={() => window.print()} className="px-4 py-1.5 rounded-full text-sm font-bold bg-white border border-gray-200 text-[var(--brand-primary)] hover:bg-gray-50">
                 Print Invoice
               </button>
               <span className="text-sm text-gray-500">Status:</span>
               <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
                 order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                 order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                 'bg-gray-100 text-gray-700'
               }`}>
                 {order.status === 'Delivered' ? <CheckCircle size={16} /> : <Clock size={16} />}
                 {order.status}
               </span>
             </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Order Items */}
          <div className="flex-1 space-y-8">
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-100 bg-[#f8fafc]">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <Package size={20} className="text-[var(--brand-primary)]" />
                   Items in Order
                 </h3>
               </div>
               <div className="divide-y divide-gray-100">
                 {order.items.map((item, idx) => (
                   <div key={idx} className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                      <div className="w-24 h-24 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0 flex items-center justify-center p-2">
                        <img src={item.primaryImage || item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-bold text-slate-800 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-500 mb-2">Category: {item.category}</p>
                        <p className="text-sm font-bold text-[var(--brand-primary)]">NPR {item.price} x {item.quantity}</p>
                        {Array.isArray((item as any).selectedServices) && (item as any).selectedServices.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {(item as any).selectedServices.map((service: any, serviceIndex: number) => (
                              <p key={serviceIndex} className="text-xs text-[var(--brand-primary)]">+ {service.title} (NPR {service.amount})</p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-slate-800 text-lg">
                        NPR {item.price * item.quantity}
                      </div>
                   </div>
                 ))}
               </div>
               <div className="p-6 bg-gray-50 border-t border-gray-200">
                 <div className="flex justify-between items-center max-w-xs ml-auto">
                   <span className="text-gray-600 font-medium">Subtotal</span>
                   <span className="font-bold text-slate-800">NPR {baseSubtotal}</span>
                 </div>
                 <div className="flex justify-between items-center max-w-xs ml-auto mt-2">
                   <span className="text-gray-600 font-medium">Service Add-ons</span>
                   <span className="font-bold text-slate-800">NPR {servicesSubtotal}</span>
                 </div>
                <div className="flex justify-between items-center max-w-xs ml-auto mt-2">
                  <span className="text-gray-600 font-medium">Shipping</span>
                  <span className="font-bold text-slate-800">NPR {shippingCharge}</span>
                </div>
                 <div className="flex justify-between items-center max-w-xs ml-auto mt-4 pt-4 border-t border-gray-200">
                   <span className="text-lg font-bold text-[var(--brand-primary)]">Total</span>
                   <span className="text-xl font-bold text-[var(--brand-primary)]">NPR {order.total}</span>
                 </div>
               </div>
             </div>
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-80 space-y-6">
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                   <MapPin size={18} className="text-[var(--brand-accent)]" />
                   Shipping Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                   <p className="font-bold text-slate-800">{(order as any).user?.name || 'Customer'}</p>
                   <p>{order.address?.street}</p>
                   <p>{order.address?.city}, {order.address?.zipCode}</p>
                   <p>{order.address?.country}</p>
                </div>
             </div>

             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                   <CreditCard size={18} className="text-[var(--brand-accent)]" />
                   Payment Method
                </h3>
                <div className="flex items-center gap-3">
                   <div className="bg-gray-100 px-3 py-1.5 rounded text-xs font-bold text-gray-700">eSewa</div>
                   <span className="text-sm text-gray-600">Payment successful</span>
                </div>
             </div>

             <div className="bg-[var(--brand-primary)] rounded-xl shadow-lg p-6 text-white text-center">
               <p className="font-bold text-lg mb-2">Need Help?</p>
               <p className="text-sm text-slate-300 mb-4">Have questions about your order?</p>
               <Button variant="secondary" fullWidth className="font-bold">Contact Support</Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
