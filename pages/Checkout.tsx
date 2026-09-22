import React, { useContext, useState } from 'react';
import { ShopContext } from '../App';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { QrCode, Banknote, Wallet, ShieldCheck, CheckCircle2, Copy } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, cartTotal, updateCartItemServices, site } = useContext(ShopContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qr' | 'esewa'>('cod');
  const [transactionRef, setTransactionRef] = useState('');

  const primaryColor = site?.primaryColor || '#002D42';
  const accentColor = site?.accentColor || '#D49B24';

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (paymentMethod === 'qr' && !transactionRef.trim()) {
      toast.error('Please enter the Transaction ID / Reference Code after scanning the QR code.');
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const firstName = String(formData.get('firstName') || '');
      const lastName = String(formData.get('lastName') || '');
      const street = String(formData.get('street') || '');
      const city = String(formData.get('city') || '');
      const phone = String(formData.get('phone') || '');
      const email = String(formData.get('email') || '');

      const customerNotes = paymentMethod === 'qr'
        ? `Payment Method: QR Code (Ref: ${transactionRef.trim()})`
        : `Payment Method: ${paymentMethod.toUpperCase()}`;

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
        notes: customerNotes
      });

      setLoading(false);
      toast.success('Order placed successfully! Thank you for shopping with eAlmari.');
      navigate('/');
    } catch (error) {
      console.error('Failed to place order:', error);
      setLoading(false);
      toast.error('Failed to place order');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
          <p className="text-slate-500 text-sm mt-1">Complete your delivery address and choose your preferred payment method.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Billing / Shipping Details Form */}
          <div className="flex-1 w-full space-y-6">
             <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
               <h2 className="text-lg font-black text-slate-900 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                 <span>1. Delivery Details</span>
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">First Name *</label>
                   <input required name="firstName" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition" placeholder="John" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Last Name *</label>
                   <input required name="lastName" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition" placeholder="Doe" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Country / Region</label>
                   <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)] outline-none font-medium">
                     <option>Nepal</option>
                   </select>
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Street Address *</label>
                   <input required name="street" type="text" placeholder="House / Building number, Street or Ward" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Town / City *</label>
                   <input required name="city" type="text" placeholder="Kathmandu / Lalitpur / Pokhara" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Mobile Number (Active) *</label>
                   <input required name="phone" type="tel" placeholder="98XXXXXXXX" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address *</label>
                   <input required name="email" type="email" placeholder="you@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition" />
                 </div>
               </div>
             </div>

             {/* Payment Method Selection Card */}
             <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
               <h2 className="text-lg font-black text-slate-900 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                 <span>2. Payment Method</span>
               </h2>

               <div className="space-y-4">
                 {/* Option 1: Cash on Delivery */}
                 <label 
                   onClick={() => setPaymentMethod('cod')} 
                   className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[var(--brand-primary)] bg-slate-50/70 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                 >
                   <input 
                     type="radio" 
                     name="payment" 
                     checked={paymentMethod === 'cod'} 
                     onChange={() => setPaymentMethod('cod')} 
                     className="mt-1 w-4 h-4 accent-[var(--brand-primary)]" 
                   />
                   <div className="flex-1">
                     <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                       <Banknote size={18} className="text-emerald-600" /> Cash on Delivery (COD)
                     </div>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed">Pay with cash directly to the delivery person upon receiving your parcel.</p>
                   </div>
                 </label>

                 {/* Option 2: Scan & Pay with Merchant QR Code */}
                 <label 
                   onClick={() => setPaymentMethod('qr')} 
                   className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-[var(--brand-primary)] bg-slate-50/70 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                 >
                   <input 
                     type="radio" 
                     name="payment" 
                     checked={paymentMethod === 'qr'} 
                     onChange={() => setPaymentMethod('qr')} 
                     className="mt-1 w-4 h-4 accent-[var(--brand-primary)]" 
                   />
                   <div className="flex-1">
                     <div className="flex items-center justify-between flex-wrap gap-2">
                       <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                         <QrCode size={18} className="text-indigo-600" /> {site?.merchantQrName || 'Scan & Pay (Fonepay / Bank QR)'}
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">Instant Verification</span>
                     </div>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed">Pay instantly via any Nepali mobile banking app, Fonepay, eSewa, or Khalti.</p>
                   </div>
                 </label>

                 {/* Display Uploaded Merchant QR Code if QR Selected */}
                 {paymentMethod === 'qr' && (
                   <div className="p-6 bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-indigo-100 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                     <div className="text-center">
                       <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                         Official Merchant QR
                       </span>
                       <h3 className="text-base font-black text-slate-900 mt-2">
                         {site?.merchantQrAccountName || site?.storeName || 'eAlmari Store'}
                       </h3>
                       {site?.merchantQrAccountNumber && (
                         <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center justify-center gap-1">
                           <span>A/C or Fonepay ID: <strong className="text-slate-800">{site.merchantQrAccountNumber}</strong></span>
                           <button 
                             type="button" 
                             onClick={() => copyToClipboard(site.merchantQrAccountNumber || '', 'Account details')}
                             className="text-indigo-600 hover:text-indigo-800"
                           >
                             <Copy size={13} />
                           </button>
                         </p>
                       )}
                     </div>

                     {/* QR Code Container */}
                     <div className="flex flex-col items-center justify-center">
                       <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-100 max-w-[240px] w-full aspect-square flex items-center justify-center overflow-hidden">
                         {site?.merchantQrCode ? (
                           <img 
                             src={site.merchantQrCode} 
                             alt="Merchant Payment QR Code" 
                             className="w-full h-full object-contain" 
                           />
                         ) : (
                           <div className="text-center p-4">
                             <QrCode size={48} className="mx-auto text-slate-400 mb-2" />
                             <p className="text-xs font-bold text-slate-700">{site?.storeName || 'eAlmari'} QR</p>
                             <p className="text-[10px] text-slate-400 mt-1">Scan via Fonepay / Bank App</p>
                           </div>
                         )}
                       </div>
                       <div className="mt-3 text-center">
                         <span className="text-xs font-black text-slate-900">Amount to Pay: </span>
                         <span className="text-sm font-black" style={{ color: primaryColor }}>NPR {payableTotal.toLocaleString()}</span>
                       </div>
                     </div>

                     {/* Instructions */}
                     <div className="bg-amber-50/70 border border-amber-200/60 p-3.5 rounded-xl text-xs text-amber-900 leading-relaxed">
                       <p className="font-bold mb-0.5">Instructions:</p>
                       <p>{site?.merchantQrInstructions || '1. Scan this QR code using Fonepay, eSewa, Khalti, or your Mobile Banking app. 2. Enter total amount and complete the transfer. 3. Enter the Transaction ID / Ref Code below.'}</p>
                     </div>

                     {/* Transaction ID Input */}
                     <div className="space-y-1.5">
                       <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                         Transaction ID / Reference Number <span className="text-rose-500">*</span>
                       </label>
                       <input 
                         type="text" 
                         value={transactionRef} 
                         onChange={(e) => setTransactionRef(e.target.value)} 
                         placeholder="e.g. 19284729103 or Ref Code" 
                         className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                         required={paymentMethod === 'qr'}
                       />
                       <p className="text-[10px] text-slate-400">Please provide the reference number shown in your payment receipt.</p>
                     </div>
                   </div>
                 )}

                 {/* Option 3: eSewa / Khalti Digital Wallets */}
                 <label 
                   onClick={() => setPaymentMethod('esewa')} 
                   className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'esewa' ? 'border-[var(--brand-primary)] bg-slate-50/70 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                 >
                   <input 
                     type="radio" 
                     name="payment" 
                     checked={paymentMethod === 'esewa'} 
                     onChange={() => setPaymentMethod('esewa')} 
                     className="mt-1 w-4 h-4 accent-[var(--brand-primary)]" 
                   />
                   <div className="flex-1">
                     <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                       <Wallet size={18} className="text-emerald-500" /> Digital Wallets (eSewa / Khalti)
                     </div>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed">Pay with your registered digital wallet balance upon confirmation.</p>
                   </div>
                 </label>
               </div>
             </div>
          </div>

          {/* Order Summary Column */}
          <div className="w-full lg:w-96 flex-shrink-0 sticky top-24">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
               <h3 className="font-black text-lg text-slate-900 mb-4 pb-3 border-b border-slate-100">Order Summary</h3>
               
               <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-3">
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                    {cart.map(item => (
                      <div key={item.id} className="text-xs border-b border-slate-100/80 pb-2.5 last:border-b-0">
                        <div className="flex justify-between items-center font-bold text-slate-800">
                          <span className="truncate max-w-[180px]">{item.name}</span>
                          <span className="text-slate-900 font-extrabold flex-shrink-0">NPR {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 font-medium">
                       <span>Cart Subtotal</span>
                       <span className="font-bold text-slate-800">NPR {cartTotal.toLocaleString()}</span>
                    </div>

                    {serviceTotal > 0 && (
                      <div className="flex justify-between text-slate-600 font-medium">
                         <span>Service Add-ons</span>
                         <span className="font-bold text-slate-800">NPR {serviceTotal.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600 font-medium">
                       <span>Shipping Delivery</span>
                       <span className="font-bold text-slate-800">NPR {shippingCharge.toLocaleString()}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>Coupon Discount</span>
                        <span>- NPR {discount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Coupon Code Input */}
                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                     <input 
                       value={couponCode} 
                       onChange={event => setCouponCode(event.target.value)} 
                       placeholder="Coupon code" 
                       className="flex-1 h-9 px-3 border border-slate-200 bg-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" 
                     />
                     <button 
                       type="button" 
                       onClick={applyCoupon} 
                       className="px-3 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-900 transition"
                     >
                       Apply
                     </button>
                  </div>

                  {/* Total Amount */}
                  <div className="flex justify-between items-baseline pt-3 border-t-2 border-slate-200">
                     <span className="text-sm font-black text-slate-900">Payable Total</span>
                     <span className="text-xl font-black" style={{ color: primaryColor }}>
                       NPR {payableTotal.toLocaleString()}
                     </span>
                  </div>
               </div>

               <Button 
                 fullWidth 
                 type="submit" 
                 size="lg" 
                 disabled={loading || cart.length === 0} 
                 className="rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg hover:shadow-xl transition-all"
                 style={{ backgroundColor: primaryColor }}
               >
                 {loading ? 'Submitting Order...' : 'Confirm & Place Order'}
               </Button>

               <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                 <ShieldCheck size={14} className="text-emerald-500" /> 100% Secure Checkout Guarantee
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
