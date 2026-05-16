
import React, { useContext, useState } from 'react';
import { ShopContext } from '../App';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export const Checkout: React.FC = () => {
  const { cart, cartTotal, updateCartItemServices } = useContext(ShopContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const shippingCharge = cart.length > 0 ? 150 : 0;
  const serviceTotal = cart.reduce((sum, item) => {
    const selectedTitles = item.selectedServices || [];
    const services = (item.additionalServices || []).filter(service => selectedTitles.includes(service.title));
    const lineServiceTotal = services.reduce((lineSum, service) => lineSum + Number(service.amount || 0), 0) * item.quantity;
    return sum + lineServiceTotal;
  }, 0);
  const grossTotal = cartTotal + serviceTotal + shippingCharge;
  const payableTotal = Math.max(0, grossTotal - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await apiService.validatePromoCode(couponCode.trim(), grossTotal);
      setDiscount(Number(result.discount || 0));
      toast.success('Coupon applied');
    } catch {
      setDiscount(0);
      toast.error('Coupon is invalid or expired');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const firstName = String(formData.get('firstName') || '');
      const lastName = String(formData.get('lastName') || '');
      const street = String(formData.get('street') || '');
      const city = String(formData.get('city') || '');
      const phone = String(formData.get('phone') || '');
      const email = String(formData.get('email') || '');

      await apiService.createOrder({
        total: payableTotal,
        promoCode: couponCode.trim() || undefined,
        customer: { name: `${firstName} ${lastName}`.trim(), email, phone },
        address: { street, city, state: 'Bagmati', zipCode: '', country: 'Nepal' },
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          selectedServices: (item.additionalServices || []).filter(service => (item.selectedServices || []).includes(service.title)),
        })),
        shippingCharge,
      });
      setLoading(false);
      toast.success('Order placed successfully');
      navigate('/');
    } catch (error) {
      console.error('Failed to place order:', error);
      setLoading(false);
      toast.error('Failed to place order');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Checkout</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
           <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
             <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-gray-100 pb-2">Billing Details</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                 <input required name="firstName" type="text" className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                 <input required name="lastName" type="text" className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none" />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Company Name (Optional)</label>
                 <input type="text" className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none" />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Country / Region</label>
                 <select className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none">
                   <option>Nepal</option>
                 </select>
               </div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                 <input required name="street" type="text" placeholder="House number and street name" className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none mb-2" />
                 <input type="text" placeholder="Apartment, suite, unit, etc. (optional)" className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Town / City</label>
                 <input required name="city" type="text" className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                 <input required name="phone" type="tel" className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none" />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                 <input required name="email" type="email" className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] outline-none" />
               </div>
             </div>
           </div>
        </div>

        <div className="w-full lg:w-96">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24 shadow-sm">
             <h3 className="font-bold text-lg text-slate-800 mb-4">Your Order</h3>
             <div className="bg-gray-50 rounded p-4 mb-6">
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-2 border-b border-gray-200 pb-2">
                   <span>Product</span>
                   <span>Subtotal</span>
                </div>
                {/* Just showing total here for brevity */}
                {cart.map(item => (
                  <div key={item.id} className="py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>NPR {item.price * item.quantity}</span>
                    </div>
                    {(item.additionalServices || []).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {(item.additionalServices || []).map(service => {
                          const checked = (item.selectedServices || []).includes(service.title);
                          return (
                            <label key={`${item.id}-${service.title}`} className="flex items-center justify-between text-xs text-gray-600">
                              <span className="inline-flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={e => {
                                    const current = item.selectedServices || [];
                                    const next = e.target.checked
                                      ? [...current, service.title]
                                      : current.filter(title => title !== service.title);
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
                  </div>
                ))}
                <div className="flex justify-between text-sm py-2">
                   <span>Cart Subtotal</span>
                   <span>NPR {cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm py-2">
                   <span>Service Add-ons</span>
                   <span>NPR {serviceTotal}</span>
                </div>
                <div className="flex gap-2 py-2">
                   <input value={couponCode} onChange={event => setCouponCode(event.target.value)} placeholder="Coupon code" className="flex-1 h-10 px-3 border border-gray-200 rounded text-sm" />
                   <button type="button" onClick={applyCoupon} className="px-3 rounded bg-gray-100 text-sm font-bold text-slate-700">Apply</button>
                </div>
                {discount > 0 && <div className="flex justify-between text-sm py-2 text-green-700"><span>Coupon Discount</span><span>- NPR {discount}</span></div>}
                <div className="flex justify-between text-sm py-2">
                   <span>Shipping</span>
                   <span>NPR {shippingCharge}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[var(--brand-primary)] border-t border-gray-200 pt-2 mt-2">
                   <span>Total</span>
                   <span>NPR {payableTotal}</span>
                </div>
             </div>
             
             <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <input type="radio" name="payment" id="cod" defaultChecked className="mt-1 accent-[var(--brand-primary)]" />
                  <label htmlFor="cod" className="text-sm font-medium text-slate-800">
                    Cash on Delivery
                    <p className="text-xs text-gray-500 font-normal mt-1">Pay with cash upon delivery.</p>
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <input type="radio" name="payment" id="esewa" className="mt-1 accent-[var(--brand-primary)]" />
                  <label htmlFor="esewa" className="text-sm font-medium text-slate-800">
                    eSewa / Khalti
                    <p className="text-xs text-gray-500 font-normal mt-1">Make payment via digital wallets.</p>
                  </label>
                </div>
             </div>

             <Button fullWidth type="submit" disabled={loading} className="bg-[var(--brand-primary)] hover:bg-[#003d61]">
               {loading ? 'Processing...' : 'Place Order'}
             </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
