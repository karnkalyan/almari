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
      const sideCards = sliderItems.slice(1, 4); // Exactly 3 cards

      return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Main Slider Area */}
          <div className={`${sideCards.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12'} relative rounded-sm overflow-hidden shadow-2xl h-[400px] md:h-[550px] bg-slate-100 group`}>
            {mainSlide && (
              <div className="absolute inset-0">
                <img src={mainSlide.image} className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex items-center p-8 md:p-20">
                  <div className="max-w-2xl text-white">
                    <span className="inline-block px-5 py-2 rounded-sm text-[11px] font-black uppercase mb-6 tracking-[0.3em] bg-[var(--brand-accent)] text-slate-900 shadow-xl animate-fade-in-down">{mainSlide.subtitle}</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-10 leading-[1.1] tracking-tighter animate-fade-in-up">{mainSlide.title}</h1>
                    <button 
                      onClick={() => navigate(mainSlide.buttonUrl || '/shop')}
                      className="px-12 py-5 bg-white text-slate-900 rounded-sm font-black text-[12px] uppercase tracking-[0.2em] hover:bg-[var(--brand-accent)] hover:text-white transition-all shadow-2xl active:scale-95"
                    >
                      {mainSlide.buttonText || 'Discover Now'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Cards Area - 3 Cards */}
          {sideCards.length > 0 && (
            <div className="lg:col-span-3 flex flex-col gap-4">
              {sideCards.map((card: any, i: number) => (
                <div 
                  key={i} 
                  className="flex-1 relative rounded-sm overflow-hidden group cursor-pointer border border-gray-100 shadow-lg min-h-[170px]"
                  onClick={() => navigate(card.buttonUrl || '/shop')}
                >
                  <img src={card.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] block mb-1 text-[var(--brand-accent)]">{card.subtitle}</span>
                    <h3 className="text-lg font-black text-white leading-tight mb-3 line-clamp-2">{card.title}</h3>
                    <div className="w-10 h-1 bg-[var(--brand-accent)] group-hover:w-20 transition-all duration-500"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'Hero Bottom Promo Cards':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {section.items?.map((item: any, i: number) => (
            <div key={i} className="relative h-48 rounded-sm overflow-hidden group cursor-pointer shadow-xl border border-gray-100" onClick={() => navigate(item.buttonUrl || '/shop')}>
               <img src={item.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-accent)] mb-2">{item.subtitle}</span>
                  <h4 className="text-xl font-black text-white mb-3">{item.title}</h4>
                  <p className="text-[11px] font-black text-white/80 uppercase tracking-widest border-b-2 border-transparent group-hover:border-[var(--brand-accent)] w-fit transition-all">{item.buttonText}</p>
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
        <div className="mb-20" style={{ backgroundColor: section.backgroundColor, padding: section.padding }}>
          <div className="flex items-center justify-between mb-10 pb-2">
             <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-slate-900"></div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase" style={{ color: section.textColor }}>{section.title}</h2>
                   {section.subtitle && <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest mt-1">{section.subtitle}</p>}
                </div>
             </div>
             <button onClick={() => navigate('/shop')} className="hidden sm:flex items-center gap-3 text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] hover:text-[var(--brand-accent)] transition-all group">
               VIEW COLLECTION <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
             </button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* Show Left Card ONLY if position is even AND leftCard exists */}
            {leftCard && (section.position % 2 === 0) && (
               <div className="hidden lg:block w-[220px] flex-shrink-0 h-[450px] rounded-sm overflow-hidden relative group cursor-pointer shadow-2xl border border-gray-100" onClick={() => navigate(leftCard.buttonUrl || '/shop')}>
                  <img src={leftCard.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-accent)] mb-2">{leftCard.subtitle}</span>
                     <h4 className="text-xl font-black text-white leading-tight mb-5">{leftCard.title}</h4>
                     <button className="w-full py-3 bg-white text-slate-900 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-[var(--brand-accent)] hover:text-white transition-all shadow-lg">SHOP NOW</button>
                  </div>
               </div>
            )}
            
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {displayProducts.slice(0, 12).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Show Right Card ONLY if position is odd AND rightCard exists OR if position is even but no left card */}
            {rightCard && (section.position % 2 !== 0 || !leftCard) && (
               <div className="hidden lg:block w-[220px] flex-shrink-0 h-[450px] rounded-sm overflow-hidden relative group cursor-pointer shadow-2xl border border-gray-100" onClick={() => navigate(rightCard.buttonUrl || '/shop')}>
                  <img src={rightCard.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-accent)] mb-2">{rightCard.subtitle}</span>
                     <h4 className="text-xl font-black text-white leading-tight mb-5">{rightCard.title}</h4>
                     <button className="w-full py-3 bg-white text-slate-900 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-[var(--brand-accent)] hover:text-white transition-all shadow-lg">SHOP NOW</button>
                  </div>
               </div>
            )}
          </div>
        </div>
      );
      
    case 'Promo Banner':
      return (
        <div className="mb-20 relative h-[150px] md:h-[200px] rounded-sm overflow-hidden group cursor-pointer shadow-xl border border-gray-100" onClick={() => navigate(section.items?.[0]?.buttonUrl || '/shop')}>
           <img src={section.bannerImage || section.items?.[0]?.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
           <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent flex items-center p-12">
              <div className="text-white">
                 <h2 className="text-2xl md:text-4xl font-black mb-2 leading-tight uppercase tracking-tighter">{section.title}</h2>
                 <p className="text-sm md:text-lg text-white/80 font-bold">{section.subtitle}</p>
              </div>
           </div>
        </div>
      );
      
    case 'Shop by Brand':
      return (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6 pb-2">
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
