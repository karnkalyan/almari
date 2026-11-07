import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../App';
import { ProductCard } from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { DynamicSection } from '../components/DynamicSection';
import { HeroSlider, HeroBottomPromoGrid, PromoRowBanner } from '../components/HeroSlider';
import { Product, PromoCode } from '../types';
import { apiService } from '../services/api';

export const Home: React.FC = () => {
  const { addToCart, site, setSite } = useContext(ShopContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [dynamicSections, setDynamicSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, promosRes, brandsRes, sectionsRes, siteSettingsRes] = await Promise.all([
          apiService.getProducts({ limit: 1000 }).catch(() => ({ products: [] })),
          apiService.getPromoCodes().catch(() => []),
          apiService.getBrands().catch(() => []),
          apiService.getHomepageSections().catch(() => []),
          apiService.getSiteSettings().catch(() => ({}))
        ]);

        if (productsRes && productsRes.products) setProducts(productsRes.products);
        if (promosRes) setPromoCodes(promosRes.filter((p: any) => p.isActive));
        if (brandsRes) setBrands(brandsRes);
        if (sectionsRes) setDynamicSections(sectionsRes);

        if (siteSettingsRes) {
          const siteCustomization = Array.isArray(siteSettingsRes)
            ? siteSettingsRes.find((s: any) => s.key === 'site_customization')?.value
            : siteSettingsRes.site_customization || siteSettingsRes.site;
          if (siteCustomization) {
            const parsed = typeof siteCustomization === 'string' ? JSON.parse(siteCustomization) : siteCustomization;
            if (setSite) setSite((prev: any) => ({ ...prev, ...parsed }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002f4a]"></div>
    </div>
  );

  const activeSections = dynamicSections.filter(s => s && s.isActive).sort((a, b) => a.position - b.position);
  const hasHeroSliderSection = activeSections.some(s => s.sectionType === 'Hero Slider');
  const hasHeroBottomCardsSection = activeSections.some(s => s.sectionType === 'Hero Bottom Promo Cards');

  // Promotional Row Banners configured in HeroManager
  const promoBanners = (site?.promoBanners || []).filter((b: any) => b && b.showOnHomepage !== false && (b.title || b.image));
  const afterHeroBanners = promoBanners.filter((b: any) => b.position === 'afterHero' || !b.position);
  const afterProductsBanners = promoBanners.filter((b: any) => b.position === 'afterProducts');
  const beforeFooterBanners = promoBanners.filter((b: any) => b.position === 'beforeFooter');

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6">
        
        {/* If no 'Hero Slider' in dynamic sections, fallback to direct HeroSlider from site configuration */}
        {!hasHeroSliderSection && site?.showHeroSection !== false && (
          <HeroSlider slides={site?.heroSlides || []} sideCards={site?.heroSideCards || []} />
        )}

        {/* If no 'Hero Bottom Promo Cards' in dynamic sections, fallback to direct bottom cards */}
        {!hasHeroBottomCardsSection && site?.heroBottomCards && site.heroBottomCards.length > 0 && (
          <HeroBottomPromoGrid cards={site.heroBottomCards} />
        )}

        {/* Promotional Row Banners: After Hero Section */}
        {afterHeroBanners.length > 0 && (
          <div className="space-y-6 mb-12">
            {afterHeroBanners.map((banner: any, i: number) => (
              <PromoRowBanner key={`after-hero-${i}`} banner={banner} />
            ))}
          </div>
        )}

        {/* Dynamic Homepage Sections */}
        <div className="space-y-16">
          {activeSections.map(section => (
            <DynamicSection key={section.id} section={section} products={products} brands={brands} />
          ))}
        </div>

        {/* Promotional Row Banners: After Products */}
        {afterProductsBanners.length > 0 && (
          <div className="space-y-6 my-16">
            {afterProductsBanners.map((banner: any, i: number) => (
              <PromoRowBanner key={`after-products-${i}`} banner={banner} />
            ))}
          </div>
        )}

        {/* Promotional Row Banners: Before Footer */}
        {beforeFooterBanners.length > 0 && (
          <div className="space-y-6 mt-16">
            {beforeFooterBanners.map((banner: any, i: number) => (
              <PromoRowBanner key={`before-footer-${i}`} banner={banner} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
