
import React, { useContext, useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Percent, Filter, ChevronDown, Zap, Clock, ShieldCheck } from 'lucide-react';
import { apiService } from '../services/api';
import { Product, SiteCustomization } from '../types';
import { ShopContext } from '../App';

const Offers: React.FC = () => {
  const { addToCart, site: globalSite } = useContext(ShopContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await apiService.getProducts({ limit: 200 });
        if (prodRes && prodRes.products) {
          // Filter only products with discounts
          setProducts(prodRes.products.filter(p => (p.discount && p.discount > 0) || p.isFlashDeal));
        }
      } catch (error) {
        console.error('Failed to fetch offers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002f4a]"></div>
      </div>
    );
  }

  const primaryColor = globalSite.primaryColor || '#002f4a';
  const accentColor = globalSite.accentColor || '#E5A823';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        
        {/* Header Banner */}
        <div className="bg-slate-900 rounded-[2rem] p-10 md:p-16 text-white relative overflow-hidden mb-12 shadow-xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
           <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Percent size={20} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Official Sale Event</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                 {globalSite.flashPopupTitle || "Exclusive Daily Deals"}
              </h1>
              <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed max-w-lg">
                 Grab your favorite premium products with massive discounts. Quality guaranteed.
              </p>
              <div className="flex flex-wrap gap-6">
                 <div className="flex items-center gap-2">
                    <Clock size={16} className="text-red-500" />
                    <div>
                       <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Time Remaining</p>
                       <p className="text-sm font-black">12h : 45m : 22s</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 border-l border-slate-700 pl-6">
                    <ShieldCheck size={16} className="text-green-500" />
                    <div>
                       <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Quality</p>
                       <p className="text-sm font-black">100% Authentic</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="absolute right-10 bottom-0 opacity-10 hidden lg:block">
              <Zap size={250} fill="white" />
           </div>
        </div>

        {/* Product Grid */}
        <div className="mb-6 flex items-center justify-between border-b pb-4">
           <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Active Offers ({products.length})</h2>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-lg text-[10px] font-black uppercase shadow-sm">
             <Filter size={12} /> Sort By <ChevronDown size={12} />
           </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border shadow-sm">
             <Percent size={48} className="mx-auto text-gray-200 mb-4" />
             <h3 className="text-xl font-black text-slate-800 mb-2">No Active Offers</h3>
             <p className="text-gray-400 text-sm">We're preparing new deals. Please check back later.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Offers;
