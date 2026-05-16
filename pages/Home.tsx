
import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../App';
import { ProductCard } from '../components/ProductCard';
import { ArrowLeft, ArrowRight, Truck, ShieldCheck, Tag, CreditCard, Smartphone, Shirt, ShoppingBag, Zap, ChevronLeft, ChevronRight, Clock, Percent, Ticket, Sparkles, TrendingUp, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DynamicSection } from '../components/DynamicSection';
import { Button } from '../components/Button';
import { Product, SiteCustomization, HeroSlide, HeroSideCard, PromoCode } from '../types';
import { apiService } from '../services/api';

// SIDE PROMO CARD - (250px width, minimal radius)
const SidePromoCard: React.FC<{ title: string, badge: string, image: string, color: string, align: 'left' | 'right' }> = ({ title, badge, image, color, align }) => (
  <div className={`hidden lg:flex flex-shrink-0 w-[250px] h-[550px] rounded-sm overflow-hidden relative group cursor-pointer shadow-md self-start ${align === 'right' ? 'ml-6' : 'mr-6'}`}>
     <img src={image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90 mb-2">{badge}</span>
        <h4 className="text-xl font-black text-white leading-tight mb-4">{title}</h4>
        <button className="w-fit px-6 py-2 bg-white text-slate-900 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors">
          SHOP NOW
        </button>
     </div>
  </div>
);

export const Home: React.FC = () => {
  const { addToCart, site } = useContext(ShopContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [dynamicSections, setDynamicSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, promosRes, brandsRes, sectionsRes] = await Promise.all([
          apiService.getProducts({ limit: 1000 }),
          apiService.getPromoCodes(),
          apiService.getBrands(),
          apiService.getHomepageSections().catch(() => []) // Fallback if API is unavailable during migration
        ]);
        if (productsRes && productsRes.products) setProducts(productsRes.products);
        if (promosRes) setPromoCodes(promosRes.filter((p: any) => p.isActive));
        if (brandsRes) setBrands(brandsRes);
        if (sectionsRes) setDynamicSections(sectionsRes);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const slides = site.heroSlides?.filter(s => s.enabled !== false) || [];
  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);



  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002f4a]"></div>
    </div>
  );

  const primaryColor = site.primaryColor || '#002f4a';
  const accentColor = site.accentColor || '#E5A823';

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6">
        
        {/* 2. DYNAMIC HOMEPAGE SECTIONS */}
        <div className="space-y-16">
          {dynamicSections.filter(s => s.isActive).sort((a, b) => a.position - b.position).map(section => (
            <DynamicSection key={section.id} section={section} products={products} brands={brands} />
          ))}
        </div>
      </div>
    </div>
  );
};
