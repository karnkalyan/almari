import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { HeroSlide, HeroSideCard, HeroBottomCard, PromoBanner } from '../types';

const FALLBACK_HERO_IMAGE = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1200';
const FALLBACK_SIDE_IMAGE = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600';
const FALLBACK_PROMO_IMAGE = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600';

export interface HeroSliderProps {
  slides?: (HeroSlide | any)[];
  sideCards?: (HeroSideCard | any)[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ slides = [], sideCards = [] }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Filter active slides (enabled !== false)
  const activeSlides = slides.filter(s => s && s.enabled !== false && (s.title || s.image));
  const activeSideCards = sideCards.filter(c => c && c.enabled !== false && (c.title || c.image)).slice(0, 3);

  // Fallback defaults if no slides provided
  const displaySlides = activeSlides.length > 0 ? activeSlides : [
    {
      title: 'Fresh & Organic Fruits',
      subtitle: 'Special Summer Offer! Get up to 30% off on premium sourced organic items.',
      badge: 'Summer Offer',
      image: FALLBACK_HERO_IMAGE,
      buttonText: 'Shop Now',
      buttonUrl: '/shop',
      priceText: 'From NPR 99'
    }
  ];

  // Auto-slide rotation every 5 seconds
  useEffect(() => {
    if (displaySlides.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % displaySlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displaySlides.length, isHovered]);

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlide(prev => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlide(prev => (prev + 1) % displaySlides.length);
  };

  const slide = displaySlides[currentSlide] || displaySlides[0];
  const hasSideCards = activeSideCards.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
      {/* Main Slider Area */}
      <div 
        className={`${hasSideCards ? 'lg:col-span-9' : 'lg:col-span-12'} relative rounded-3xl overflow-hidden shadow-2xl h-[420px] md:h-[550px] bg-slate-900 group select-none`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slide Image with Fade Animation */}
        <div key={currentSlide} className="absolute inset-0 animate-fade-in duration-700">
          <img 
            src={slide.image || FALLBACK_HERO_IMAGE} 
            alt={slide.title || 'Hero Banner'} 
            className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_HERO_IMAGE;
            }}
          />
          {/* Overlay Gradient for optimal text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent flex items-center p-8 sm:p-12 md:p-16">
            <div className="max-w-xl text-white space-y-4">
              {slide.badge && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.25em] bg-[var(--brand-accent)] text-slate-900 shadow-xl drop-shadow">
                  <Sparkles size={13} /> {slide.badge}
                </span>
              )}

              <h1 
                className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.08] tracking-tight drop-shadow-md"
                style={{ color: slide.textColor || '#ffffff' }}
              >
                {slide.title}
              </h1>

              {slide.subtitle && (
                <p 
                  className="text-sm sm:text-base text-gray-200 font-medium max-w-lg leading-relaxed line-clamp-3 drop-shadow"
                  style={{ color: slide.textColor ? `${slide.textColor}ee` : undefined }}
                >
                  {slide.subtitle}
                </p>
              )}

              {(slide.priceText || slide.oldPriceText) && (
                <div className="flex items-center gap-3 pt-1">
                  {slide.priceText && (
                    <span className="text-xl sm:text-2xl font-black text-amber-400 drop-shadow">
                      {slide.priceText}
                    </span>
                  )}
                  {slide.oldPriceText && (
                    <span className="text-sm text-gray-400 line-through font-bold">
                      {slide.oldPriceText}
                    </span>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button 
                  onClick={() => navigate(slide.buttonUrl || '/shop')}
                  className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[var(--brand-accent)] hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-2.5 cursor-pointer hover:shadow-amber-500/20"
                >
                  {slide.buttonText || 'Discover Now'} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows (if multiple slides) */}
        {displaySlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer z-10"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer z-10"
            >
              <ChevronRight size={22} />
            </button>

            {/* Slide Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
              {displaySlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide 
                      ? 'w-7 bg-[var(--brand-accent)] shadow-md' 
                      : 'w-2.5 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Side Cards Area (3 Cards) */}
      {hasSideCards && (
        <div className="lg:col-span-3 flex flex-col gap-4">
          {activeSideCards.map((card: any, i: number) => (
            <div 
              key={i} 
              className="flex-1 relative rounded-3xl overflow-hidden group cursor-pointer border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 min-h-[160px]"
              style={{ backgroundColor: card.backgroundColor || '#eff6ff' }}
              onClick={() => navigate(card.buttonUrl || '/shop')}
            >
              <img 
                src={card.image || FALLBACK_SIDE_IMAGE} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={card.title || 'Promo highlight'} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_SIDE_IMAGE;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5">
                {(card.eyebrow || card.subtitle) && (
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] block mb-1 text-[var(--brand-accent)] drop-shadow">
                    {card.eyebrow || card.subtitle}
                  </span>
                )}
                <h3 className="text-lg font-black text-white leading-tight mb-2 line-clamp-2 drop-shadow">
                  {card.title}
                </h3>
                <div className="w-10 h-1 bg-[var(--brand-accent)] group-hover:w-20 transition-all duration-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const HeroBottomPromoGrid: React.FC<{ cards?: (HeroBottomCard | any)[] }> = ({ cards = [] }) => {
  const navigate = useNavigate();
  const activeCards = cards.filter(c => c && (c.title || c.image));
  if (activeCards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {activeCards.map((item: any, i: number) => {
        const linkUrl = item.link || item.buttonUrl || '/shop';
        const badgeText = item.badge || item.buttonText;
        const subtitleText = item.eyebrow || item.subtitle;

        return (
          <div 
            key={i} 
            className="relative h-48 rounded-3xl overflow-hidden group cursor-pointer shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1" 
            onClick={() => navigate(linkUrl)}
          >
             <img 
               src={item.image || FALLBACK_PROMO_IMAGE} 
               className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
               alt={item.title || 'Promo card'} 
               onError={(e) => {
                 (e.target as HTMLImageElement).src = FALLBACK_PROMO_IMAGE;
               }}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-6 flex flex-col justify-end">
                {subtitleText && (
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--brand-accent)] mb-1.5 drop-shadow">
                    {subtitleText}
                  </span>
                )}
                <h4 className="text-xl font-black text-white mb-2 leading-tight drop-shadow line-clamp-2">
                  {item.title}
                </h4>
                {badgeText && (
                  <p className="text-[11px] font-black text-white/90 uppercase tracking-widest border-b-2 border-transparent group-hover:border-[var(--brand-accent)] w-fit transition-all flex items-center gap-1.5">
                    {badgeText} <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </p>
                )}
             </div>
          </div>
        );
      })}
    </div>
  );
};

export const PromoRowBanner: React.FC<{ banner: PromoBanner | any }> = ({ banner }) => {
  const navigate = useNavigate();
  if (!banner || !banner.title) return null;

  return (
    <div 
      className="mb-14 relative min-h-[160px] md:min-h-[220px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
      style={{ backgroundColor: banner.color || '#002D42' }}
      onClick={() => navigate(banner.link || '/shop')}
    >
      {banner.image && (
        <img 
          src={banner.image} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
          alt={banner.title || 'Promotional Banner'} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_HERO_IMAGE;
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent flex items-center p-8 md:p-14">
        <div className="text-white max-w-xl">
          {banner.badge && (
            <span className="inline-block px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-[var(--brand-accent)] text-slate-900 mb-3 shadow-md">
              {banner.badge}
            </span>
          )}
          <h2 className="text-2xl md:text-4xl font-black mb-2 leading-tight uppercase tracking-tight drop-shadow">
            {banner.title}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--brand-accent)] group-hover:translate-x-2 transition-transform">
            Shop Now <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

