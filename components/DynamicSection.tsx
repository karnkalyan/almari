import React from 'react';
import { ProductCard } from './ProductCard';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const DynamicSection: React.FC<{ section: any; products: any[]; brands: any[] }> = ({ section, products, brands }) => {
  const navigate = useNavigate();
  const primaryColor = 'var(--brand-primary)';

  switch (section.sectionType) {
    case 'Hero Slider':
      const sliderItems = section.items || [];
      const mainSlide = sliderItems[0];
      const sideCards = sliderItems.slice(1, 4); // Take up to 3 cards

      return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Main Slider Area */}
          <div className={`${sideCards.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12'} relative rounded-sm overflow-hidden shadow-xl h-[400px] md:h-[550px] bg-slate-100`}>
            {mainSlide && (
              <div className="absolute inset-0">
                <img src={mainSlide.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center p-8 md:p-16">
                  <div className="max-w-xl text-white">
                    <span className="inline-block px-4 py-1.5 rounded-sm text-[10px] font-black uppercase mb-4 tracking-[0.2em] bg-[var(--brand-accent)] text-slate-900 shadow-lg">{mainSlide.subtitle}</span>
                    <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">{mainSlide.title}</h1>
                    <button 
                      onClick={() => navigate(mainSlide.buttonUrl || '/shop')}
                      className="px-10 py-4 bg-white text-slate-900 rounded-sm font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
                    >
                      {mainSlide.buttonText || 'Discover Collection'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Cards Area */}
          {sideCards.length > 0 && (
            <div className="lg:col-span-3 flex flex-col gap-4">
              {sideCards.map((card: any, i: number) => (
                <div 
                  key={i} 
                  className="flex-1 relative rounded-sm overflow-hidden p-6 group cursor-pointer border border-gray-100 shadow-md h-[170px]"
                  onClick={() => navigate(card.buttonUrl || '/shop')}
                >
                  <img src={card.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end">
                    <div className="p-2 relative z-10">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] block mb-1 text-[var(--brand-accent)]">{card.subtitle}</span>
                      <h3 className="text-base font-black text-white leading-tight mb-3 line-clamp-2">{card.title}</h3>
                      <div className="w-8 h-0.5 bg-white group-hover:w-16 transition-all duration-500"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'Hero Bottom Promo Cards':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {section.items?.map((item: any, i: number) => (
            <div key={i} className="relative h-44 rounded-2xl overflow-hidden group cursor-pointer shadow-sm border border-gray-100" onClick={() => navigate(item.buttonUrl || '/shop')}>
               <img src={item.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-5 flex flex-col justify-end">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#E5A823] mb-1">{item.subtitle}</span>
                  <h4 className="text-xl font-black text-white mb-2">{item.title}</h4>
                  <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">{item.buttonText}</p>
               </div>
            </div>
          ))}
        </div>
      );

    case 'Featured Products':
    case 'Best Sellers':
    case 'Trending Items':
    case 'New Arrivals':
    case 'Handpicked Featured':
    case 'Flash Deals':
      // Filter products based on type
      let displayProducts = products;
      if (section.sectionType === 'Trending Items') displayProducts = products.filter(p => p.isTrending);
      if (section.sectionType === 'New Arrivals') displayProducts = products.filter(p => p.isNew);
      if (section.sectionType === 'Handpicked Featured') displayProducts = products.filter(p => p.isFeatured);
      if (section.sectionType === 'Best Sellers') displayProducts = products.filter(p => p.isBestSeller);
      if (section.sectionType === 'Flash Deals') displayProducts = products.filter(p => p.isFlashDeal);
      
      const leftCard = section.items?.find((item: any) => item.position === -1);
      const rightCard = section.items?.find((item: any) => item.position === 99);

      return (
        <div className="mb-16" style={{ backgroundColor: section.backgroundColor, padding: section.padding }}>
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[var(--brand-primary)]"></div>
                <div>
                   <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase" style={{ color: section.textColor }}>{section.title}</h2>
                   {section.subtitle && <p className="text-sm text-gray-500 font-medium mt-1">{section.subtitle}</p>}
                </div>
             </div>
             <button onClick={() => navigate('/shop')} className="hidden sm:flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[var(--brand-primary)] transition-colors">
               VIEW ALL <ArrowRight size={14} />
             </button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {leftCard && (
               <div className="hidden lg:block w-64 flex-shrink-0 h-[450px] rounded-sm overflow-hidden relative group cursor-pointer shadow-md" onClick={() => navigate(leftCard.buttonUrl || '/shop')}>
                  <img src={leftCard.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90 mb-2">{leftCard.subtitle}</span>
                     <h4 className="text-xl font-black text-white leading-tight mb-4">{leftCard.title}</h4>
                     <button className="w-fit px-6 py-2 bg-white text-slate-900 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors">SHOP NOW</button>
                  </div>
               </div>
            )}
            
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {displayProducts.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {rightCard && (
               <div className="hidden lg:block w-64 flex-shrink-0 h-[450px] rounded-sm overflow-hidden relative group cursor-pointer shadow-md" onClick={() => navigate(rightCard.buttonUrl || '/shop')}>
                  <img src={rightCard.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90 mb-2">{rightCard.subtitle}</span>
                     <h4 className="text-xl font-black text-white leading-tight mb-4">{rightCard.title}</h4>
                     <button className="w-fit px-6 py-2 bg-white text-slate-900 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors">SHOP NOW</button>
                  </div>
               </div>
            )}
          </div>
        </div>
      );
      
    case 'Shop by Brand':
      return (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[var(--brand-primary)]"></div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{section.title || 'Shop by Brand'}</h2>
             </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {brands.slice(0, 7).map((brand, i) => (
              <div key={i} onClick={() => navigate(`/shop?brand=${brand.id}`)} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group h-32">
                 {brand.logo ? (
                   <img src={brand.logo} alt={brand.name} className="w-16 h-16 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                 ) : (
                   <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center font-bold text-gray-400 group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors">
                     {brand.name.substring(0, 2).toUpperCase()}
                   </div>
                 )}
                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center truncate w-full">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'Newsletter':
      return (
        <div className="mb-16 bg-[var(--brand-primary)] rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
           <div className="relative z-10 max-w-2xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">{section.title || 'Join the Almari Club'}</h2>
              <p className="text-white/80 mb-10 text-lg">{section.subtitle || 'Subscribe to receive updates, access to exclusive deals, and more.'}</p>
              <form className="flex flex-col sm:flex-row gap-4">
                 <input 
                   type="email" 
                   placeholder="Enter your email"
                   className="flex-1 px-8 py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/50 outline-none focus:bg-white/20 transition-all"
                 />
                 <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">
                   Subscribe
                 </button>
              </form>
           </div>
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        </div>
      );

    case 'Footer CTA':
      return (
        <div className="mb-16 relative h-[300px] md:h-[400px] rounded-[3rem] overflow-hidden group">
           <img src={section.bannerImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
           <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-12 md:p-24">
              <div className="max-w-xl text-white">
                 <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">{section.title || 'Ready to upgrade your lifestyle?'}</h2>
                 <button onClick={() => navigate('/shop')} className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">
                    SHOP COLLECTION
                 </button>
              </div>
           </div>
        </div>
      );

    default:
      return null;
  }
};
