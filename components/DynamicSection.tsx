import React, { useContext } from 'react';
import { ProductCard } from './ProductCard';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ShopContext } from '../App';
import { HeroSlider, HeroBottomPromoGrid } from './HeroSlider';

export const DynamicSection: React.FC<{ section: any; products: any[]; brands: any[] }> = ({ section, products, brands }) => {
  const navigate = useNavigate();
  const { site } = useContext(ShopContext);

  switch (section.sectionType) {
    case 'Hero Slider': {
      // Prioritize active heroSlides configured in HeroManager, fallback to section.items from HomepageBuilder
      const siteSlides = site?.heroSlides?.filter((s: any) => s && s.enabled !== false) || [];
      const slidesToUse = siteSlides.length > 0 ? siteSlides : (section.items || []);

      // Prioritize active heroSideCards configured in HeroManager, fallback to section.items.slice(1, 4)
      const siteSideCards = site?.heroSideCards?.filter((c: any) => c && c.enabled !== false) || [];
      const sideCardsToUse = siteSideCards.length > 0 ? siteSideCards : (section.items?.slice(1, 4) || []);

      return <HeroSlider slides={slidesToUse} sideCards={sideCardsToUse} />;
    }

    case 'Hero Bottom Promo Cards': {
      // Prioritize active heroBottomCards configured in HeroManager, fallback to section.items
      const siteCards = site?.heroBottomCards?.filter((c: any) => c && (c.title || c.image)) || [];
      const cardsToUse = siteCards.length > 0 ? siteCards : (section.items || []);

      return <HeroBottomPromoGrid cards={cardsToUse} />;
    }

    case 'Featured Products':
    case 'Best Sellers':
    case 'Trending Items':
    case 'Trending Products':
    case 'New Arrivals':
    case 'Recently Added':
    case 'Handpicked Featured':
    case 'Recommended Products':
    case 'Custom Product Collection':
    case 'Flash Deals': {
      // Filter products based on section type
      let displayProducts = products;
      if (section.sectionType === 'Trending Items' || section.sectionType === 'Trending Products') {
        displayProducts = products.filter(p => p.isTrending);
      } else if (section.sectionType === 'New Arrivals' || section.sectionType === 'Recently Added') {
        displayProducts = products.filter(p => p.isNew);
      } else if (section.sectionType === 'Handpicked Featured' || section.sectionType === 'Recommended Products') {
        displayProducts = products.filter(p => p.isFeatured);
      } else if (section.sectionType === 'Best Sellers') {
        displayProducts = products.filter(p => p.isBestSeller);
      } else if (section.sectionType === 'Flash Deals') {
        displayProducts = products.filter(p => p.isFlashDeal);
      }
      
      const leftCard = section.items?.find((item: any) => item.position === -1);
      const rightCard = section.items?.find((item: any) => item.position === 99);

      return (
        <div className="mb-20" style={{ backgroundColor: section.backgroundColor, padding: section.padding }}>
          <div className="flex items-center justify-between mb-8 pb-2">
             <div className="flex items-center gap-3">
                <div className="w-2 h-7 bg-slate-900 rounded-full"></div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase" style={{ color: section.textColor }}>
                     {section.title}
                   </h2>
                   {section.subtitle && <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest mt-0.5">{section.subtitle}</p>}
                </div>
             </div>
             <button onClick={() => navigate('/shop')} className="hidden sm:flex items-center gap-2 text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] hover:text-[var(--brand-accent)] transition-all group">
               VIEW ALL <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
             </button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* Show Left Card ONLY if position is even AND leftCard exists */}
            {leftCard && (section.position % 2 === 0) && (
               <div className="hidden lg:block w-[220px] flex-shrink-0 h-[450px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-xl border border-gray-100" onClick={() => navigate(leftCard.buttonUrl || '/shop')}>
                  <img src={leftCard.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-accent)] mb-2">{leftCard.subtitle}</span>
                     <h4 className="text-xl font-black text-white leading-tight mb-5">{leftCard.title}</h4>
                     <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--brand-accent)] hover:text-white transition-all shadow-lg">SHOP NOW</button>
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
               <div className="hidden lg:block w-[220px] flex-shrink-0 h-[450px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-xl border border-gray-100" onClick={() => navigate(rightCard.buttonUrl || '/shop')}>
                  <img src={rightCard.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-accent)] mb-2">{rightCard.subtitle}</span>
                     <h4 className="text-xl font-black text-white leading-tight mb-5">{rightCard.title}</h4>
                     <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--brand-accent)] hover:text-white transition-all shadow-lg">SHOP NOW</button>
                  </div>
               </div>
            )}
          </div>
        </div>
      );
    }
      
    case 'Promo Banner':
    case 'Ads Banner': {
      const bannerItem = section.items?.[0] || {};
      const img = section.bannerImage || bannerItem.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200";
      const targetUrl = section.linkUrl || bannerItem.buttonUrl || bannerItem.link || '/shop';

      return (
        <div 
          className="mb-16 relative min-h-[160px] md:min-h-[220px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5" 
          style={{ backgroundColor: section.backgroundColor || '#002D42' }}
          onClick={() => navigate(targetUrl)}
        >
           <img 
             src={img} 
             className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
             alt={section.title || 'Promo banner'} 
             onError={(e) => {
               (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200";
             }}
           />
           <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent flex items-center p-8 md:p-14">
              <div className="text-white max-w-xl">
                 {(section.badge || section.subtitle) && (
                   <span className="inline-block px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-[var(--brand-accent)] text-slate-900 mb-3 shadow-md">
                     {section.badge || section.subtitle}
                   </span>
                 )}
                 <h2 className="text-2xl md:text-4xl font-black mb-2 leading-tight uppercase tracking-tight drop-shadow">
                   {section.title}
                 </h2>
                 {section.subtitle && section.badge && (
                   <p className="text-sm md:text-base text-white/90 font-medium mb-3">{section.subtitle}</p>
                 )}
                 <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--brand-accent)] group-hover:translate-x-2 transition-transform">
                   Shop Now <ArrowRight size={16} />
                 </div>
              </div>
           </div>
        </div>
      );
    }

    case 'Promo Cards':
    case 'Multi Banner Grid': {
      const items = section.items || [];
      if (items.length === 0) return null;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {items.map((item: any, i: number) => (
            <div 
              key={i}
              onClick={() => navigate(item.buttonUrl || item.link || '/shop')}
              className="relative h-60 rounded-3xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300"
            >
              <img 
                src={item.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800"} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                alt="" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-6 flex flex-col justify-end">
                {item.subtitle && (
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-accent)] mb-1 drop-shadow">
                    {item.subtitle}
                  </span>
                )}
                <h3 className="text-xl font-black text-white leading-tight mb-2 drop-shadow">{item.title}</h3>
                <span className="text-xs font-black text-white/90 uppercase tracking-widest flex items-center gap-1 group-hover:text-[var(--brand-accent)] transition-colors">
                  {item.buttonText || 'Explore'} <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }
      
    case 'Shop by Brand':
      return (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6 pb-2">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[var(--brand-primary)] rounded-full"></div>
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
        <div className="mb-16 bg-[var(--brand-primary)] rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
           <div className="relative z-10 max-w-2xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">{section.title || 'Join the Almari Club'}</h2>
              <p className="text-white/80 mb-10 text-lg">{section.subtitle || 'Subscribe to receive updates, access to exclusive deals, and more.'}</p>
              <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => { e.preventDefault(); }}>
                 <input 
                   type="email" 
                   placeholder="Enter your email"
                   className="flex-1 px-8 py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/50 outline-none focus:bg-white/20 transition-all font-medium"
                 />
                 <button type="submit" className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer">
                   Subscribe
                 </button>
              </form>
           </div>
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none"></div>
        </div>
      );

    case 'Footer CTA':
      return (
        <div className="mb-16 relative h-[300px] md:h-[400px] rounded-[3rem] overflow-hidden group shadow-2xl">
           <img 
             src={section.bannerImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"} 
             className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
             alt="" 
             onError={(e) => {
               (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200";
             }}
           />
           <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent flex items-center p-12 md:p-24">
              <div className="max-w-xl text-white">
                 <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">{section.title || 'Ready to upgrade your lifestyle?'}</h2>
                 <button onClick={() => navigate('/shop')} className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer">
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
