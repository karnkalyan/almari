
import React, { useContext } from 'react';
import { ShopContext } from '../App';
import { Button } from '../components/Button';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, addToCart, updateCartItemServices, cartTotal } = useContext(ShopContext);
  const navigate = useNavigate();
  const shippingCharge = cart.length > 0 ? 150 : 0;
  const servicesTotal = cart.reduce((sum, item) => {
    const selected = (item.additionalServices || []).filter(service => (item.selectedServices || []).includes(service.title));
    return sum + (selected.reduce((acc, service) => acc + Number(service.amount || 0), 0) * item.quantity);
  }, 0);
  const grandTotal = cartTotal + servicesTotal + shippingCharge;

  // Helper to remove one instance
  const decreaseQuantity = (item: any) => {
    removeFromCart(item.id);
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  // Group cart items by ID for display
  const groupedCart = cart.reduce((acc: any, item) => {
    if (!acc[item.id]) {
      acc[item.id] = { ...item, quantity: 0 };
    }
    acc[item.id].quantity += item.quantity; 
    return acc;
  }, {});

  const cartItems = Object.values(groupedCart);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Product</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Price</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Quantity</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Subtotal</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cartItems.map((item: any) => (
                  <tr key={item.id}>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded border border-gray-100 flex items-center justify-center">
                           <img src={item.primaryImage || item.image} alt={item.name} className="max-w-full max-h-full object-contain p-1" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">
                      NPR {item.price}
                    </td>
                    <td className="p-4">
                       <div className="flex items-center border border-gray-200 rounded w-max">
                          <button className="px-2 py-1 text-gray-500 hover:bg-gray-100" onClick={() => decreaseQuantity(item)}>-</button>
                          <span className="px-2 text-sm font-medium">{item.quantity}</span>
                          <button className="px-2 py-1 text-gray-500 hover:bg-gray-100" onClick={() => addToCart(item)}>+</button>
                       </div>
                       {(item.additionalServices || []).length > 0 && (
                         <div className="mt-3 space-y-1">
                           {(item.additionalServices || []).map((service: any) => {
                             const checked = (item.selectedServices || []).includes(service.title);
                             return (
                               <label key={`${item.id}-${service.title}`} className="flex items-center justify-between gap-3 text-xs text-gray-600">
                                 <span className="inline-flex items-center gap-2">
                                   <input
                                     type="checkbox"
                                     checked={checked}
                                     onChange={(event) => {
                                       const current = item.selectedServices || [];
                                       const next = event.target.checked
                                         ? [...current, service.title]
                                         : current.filter((title: string) => title !== service.title);
                                       updateCartItemServices(item.id, next);
                                     }}
                                   />
                                   {service.title}
                                 </span>
                                 <span>+ NPR {service.amount}</span>
                               </label>
                             );
                           })}
                         </div>
                       )}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      NPR {(item.price * item.quantity) + (((item.additionalServices || []).filter((service: any) => (item.selectedServices || []).includes(service.title)).reduce((sum: number, service: any) => sum + Number(service.amount || 0), 0)) * item.quantity)}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)] hover:underline">
               <ArrowLeft size={16} />
               Continue Shopping
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="w-full lg:w-80">
           <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
             <h3 className="font-bold text-lg text-slate-800 mb-4">Cart Totals</h3>
             
             <div className="space-y-3 mb-6">
               <div className="flex justify-between text-sm text-gray-600">
                 <span>Subtotal</span>
                 <span>NPR {cartTotal}</span>
               </div>
               <div className="flex justify-between text-sm text-gray-600">
                 <span>Service Add-ons</span>
                 <span>NPR {servicesTotal}</span>
               </div>
               <div className="flex justify-between text-sm text-gray-600">
                 <span>Shipping</span>
                 <span>NPR {shippingCharge}</span>
               </div>
               <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-slate-800">
                 <span>Total</span>
                 <span>NPR {grandTotal}</span>
               </div>
             </div>

             <Button fullWidth onClick={() => navigate('/checkout')}>
               Proceed to Checkout
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};
