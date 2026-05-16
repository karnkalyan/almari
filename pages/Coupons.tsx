
import React, { useEffect, useState } from 'react';
import { Ticket, Clock, ShieldCheck, Tag, Copy, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { PromoCode } from '../types';

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const data = await apiService.getPromoCodes();
        setCoupons(data.filter((c: any) => c.isActive));
      } catch (error) {
        console.error('Failed to fetch coupons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002f4a]"></div>
      </div>
    );
  }

  return (
    <div className="py-12 animate-in fade-in duration-700">
      <div className="container mx-auto px-4">
        
        <div className="max-w-3xl mx-auto text-center mb-12">
           <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">Available Coupons</h1>
           <p className="text-gray-500 font-medium text-lg">Use these promo codes at checkout to get amazing discounts on your favorite products.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 flex flex-col group hover:scale-[1.02] transition-all duration-300">
              <div className="p-8 flex-1">
                 <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#002f4a]">
                      <Ticket size={24} />
                    </div>
                    {coupon.expiresAt && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase tracking-widest">
                        <Clock size={12} /> {new Date(coupon.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                 </div>

                 <h3 className="text-2xl font-black text-slate-800 mb-2">
                   {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `NPR ${coupon.discountValue} OFF`}
                 </h3>
                 <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                   Applicable on orders above NPR {coupon.minOrderValue || 0}. Valid for a limited time only.
                 </p>

                 <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex items-center justify-between group-hover:border-[#002f4a] transition-all">
                    <span className="text-xl font-black text-[#002f4a] tracking-[0.2em]">{coupon.code}</span>
                    <button 
                      onClick={() => copyToClipboard(coupon.code)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#002f4a] hover:bg-[#002f4a] hover:text-white px-4 py-2 rounded-xl transition-all"
                    >
                      {copiedCode === coupon.code ? <><CheckCircle size={14} /> COPIED</> : <><Copy size={14} /> COPY</>}
                    </button>
                 </div>
              </div>
              
              <div className="bg-slate-900 p-4 text-center">
                 <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">Verified & Secure Coupon</span>
              </div>
            </div>
          ))}
        </div>

        {coupons.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
             <Tag size={64} className="mx-auto text-gray-200 mb-4" />
             <h3 className="text-2xl font-black text-slate-800 mb-2">No Active Coupons</h3>
             <p className="text-gray-400">Check back later for new promotional offers.</p>
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { icon: ShieldCheck, title: '100% Genuine', desc: 'All codes are verified by Almari.' },
             { icon: Tag, title: 'Stackable Offers', desc: 'Use with existing flash deals.' },
             { icon: Ticket, title: 'Easy Redeem', desc: 'Apply at the final checkout step.' }
           ].map((f, i) => (
             <div key={i} className="bg-white p-8 rounded-[2rem] border shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#002f4a] flex-shrink-0">
                  <f.icon size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 mb-1">{f.title}</h4>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Coupons;
