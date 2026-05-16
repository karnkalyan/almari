
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Save, 
  ArrowUp, 
  ArrowDown, 
  Layout, 
  Monitor,
  LayoutTemplate
} from 'lucide-react';
import { apiService } from '../../services/api';
import { SiteCustomization } from '../../types';

export const HeroManager: React.FC = () => {
  const [settings, setSettings] = useState<Partial<SiteCustomization>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getSiteSettings()
      .then(data => {
        setSettings(data.site_customization || data.site || {});
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch settings:', error);
        setLoading(false);
      });
  }, []);

  const save = async (newSettings: Partial<SiteCustomization>) => {
    try {
      await apiService.updateSiteSetting('site_customization', newSettings);
      setSettings(newSettings);
      toast.success('Hero configuration updated');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const update = (key: keyof SiteCustomization, value: any) => {
    const newSettings = { ...settings, [key]: value };
    save(newSettings);
  };

  if (loading) return <div className="p-8 text-center">Loading configuration...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Hero & Banners</h1>
          <p className="text-gray-500 font-medium mt-1">Design your storefront's first impression with dynamic sliders and promo cards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Main Hero Slider Section */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
                <Monitor size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Main Hero Slider</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">High-impact landing slides</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const slides = [...(settings.heroSlides || [])];
                slides.push({
                  badge: 'New Arrival',
                  title: 'New Slide Title',
                  subtitle: 'Slide description goes here',
                  image: '',
                  buttonText: 'Shop Now',
                  buttonUrl: '/shop',
                  enabled: true
                });
                update('heroSlides', slides);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl text-xs font-bold hover:bg-[#003d61] transition shadow-md"
            >
              <Plus size={16} /> Add Slide
            </button>
          </div>
          
          <div className="p-8 space-y-6">
            {(settings.heroSlides || []).map((slide, index) => (
              <div key={index} className="group relative bg-gray-50/50 border border-gray-100 rounded-[2rem] p-6 hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-8">
                  {/* Small Preview Area */}
                  <div className="space-y-3">
                    <div className="aspect-[4/5] bg-white rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center relative shadow-sm">
                      {slide.image ? (
                        <img src={slide.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={32} className="text-gray-200" />
                      )}
                    </div>
                    <input 
                      type="text"
                      placeholder="Image URL..."
                      value={slide.image || ''}
                      onChange={(e) => {
                        const slides = [...(settings.heroSlides || [])];
                        slides[index].image = e.target.value;
                        update('heroSlides', slides);
                      }}
                      className="w-full text-[10px] px-3 py-2 bg-white border border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Content Area */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <Field label="Badge Text" value={slide.badge} onChange={(v) => {
                        const slides = [...(settings.heroSlides || [])];
                        slides[index].badge = v;
                        update('heroSlides', slides);
                      }} />
                      <Field label="Main Title" value={slide.title} onChange={(v) => {
                        const slides = [...(settings.heroSlides || [])];
                        slides[index].title = v;
                        update('heroSlides', slides);
                      }} />
                      <Field label="Subtitle" value={slide.subtitle} onChange={(v) => {
                        const slides = [...(settings.heroSlides || [])];
                        slides[index].subtitle = v;
                        update('heroSlides', slides);
                      }} />
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Button Text" value={slide.buttonText} onChange={(v) => {
                          const slides = [...(settings.heroSlides || [])];
                          slides[index].buttonText = v;
                          update('heroSlides', slides);
                        }} />
                        <Field label="Button URL" value={slide.buttonUrl} onChange={(v) => {
                          const slides = [...(settings.heroSlides || [])];
                          slides[index].buttonUrl = v;
                          update('heroSlides', slides);
                        }} />
                      </div>
                       <div className="grid grid-cols-3 gap-4">
                        <Field label="Price (NPR)" value={slide.priceText} onChange={(v) => {
                          const slides = [...(settings.heroSlides || [])];
                          slides[index].priceText = v;
                          update('heroSlides', slides);
                        }} />
                        <Field label="Old Price" value={slide.oldPriceText} onChange={(v) => {
                          const slides = [...(settings.heroSlides || [])];
                          slides[index].oldPriceText = v;
                          update('heroSlides', slides);
                        }} />
                        <Field label="Text Color" type="color" value={slide.textColor || '#ffffff'} onChange={(v) => {
                          const slides = [...(settings.heroSlides || [])];
                          slides[index].textColor = v;
                          update('heroSlides', slides);
                        }} />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={slide.enabled !== false}
                            onChange={(e) => {
                              const slides = [...(settings.heroSlides || [])];
                              slides[index].enabled = e.target.checked;
                              update('heroSlides', slides);
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Active slide</span>
                        </label>
                        <div className="flex gap-2">
                           <button 
                            onClick={() => {
                              const slides = [...(settings.heroSlides || [])];
                              if (index > 0) {
                                [slides[index], slides[index-1]] = [slides[index-1], slides[index]];
                                update('heroSlides', slides);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-blue-500 transition"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              const slides = [...(settings.heroSlides || [])];
                              if (index < slides.length - 1) {
                                [slides[index], slides[index+1]] = [slides[index+1], slides[index]];
                                update('heroSlides', slides);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-blue-500 transition"
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              const slides = (settings.heroSlides || []).filter((_, i) => i !== index);
                              update('heroSlides', slides);
                            }}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hero Bottom Cards */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                <LayoutTemplate size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Hero Bottom Promo Cards</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Four-column highlights under the slider</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const cards = [...(settings.heroBottomCards || [])];
                cards.push({ title: 'New Promo', badge: 'SPECIAL', eyebrow: 'Check out', image: '', link: '/shop' });
                update('heroBottomCards', cards);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl text-xs font-bold hover:bg-[#003d61] transition shadow-md"
            >
              <Plus size={16} /> Add Card
            </button>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {(settings.heroBottomCards || []).map((card, index) => (
              <div key={index} className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 space-y-4">
                <div className="aspect-[4/3] bg-white rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center relative mb-4">
                  {card.image ? <img src={card.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-200" />}
                </div>
                <div className="space-y-3">
                  <Field label="Eyebrow" value={card.eyebrow} onChange={(v) => {
                    const cards = [...(settings.heroBottomCards || [])];
                    cards[index].eyebrow = v;
                    update('heroBottomCards', cards);
                  }} />
                  <Field label="Title" value={card.title} onChange={(v) => {
                    const cards = [...(settings.heroBottomCards || [])];
                    cards[index].title = v;
                    update('heroBottomCards', cards);
                  }} />
                  <Field label="Badge" value={card.badge} onChange={(v) => {
                    const cards = [...(settings.heroBottomCards || [])];
                    cards[index].badge = v;
                    update('heroBottomCards', cards);
                  }} />
                  <Field label="Image URL" value={card.image} onChange={(v) => {
                    const cards = [...(settings.heroBottomCards || [])];
                    cards[index].image = v;
                    update('heroBottomCards', cards);
                  }} />
                  <Field label="Link URL" value={card.link} onChange={(v) => {
                    const cards = [...(settings.heroBottomCards || [])];
                    cards[index].link = v;
                    update('heroBottomCards', cards);
                  }} />
                </div>
                <div className="flex items-center justify-end pt-2 border-t border-gray-200/50">
                  <button 
                    onClick={() => {
                      const cards = (settings.heroBottomCards || []).filter((_, i) => i !== index);
                      update('heroBottomCards', cards);
                    }}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hero Side Cards */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
                <Layout size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Hero Side Promo Cards</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Static right-side highlights</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const cards = [...(settings.heroSideCards || [])];
                cards.push({ eyebrow: 'New', title: 'New Promo', image: '', backgroundColor: '#eff6ff', buttonUrl: '/shop', enabled: true });
                update('heroSideCards', cards);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl text-xs font-bold hover:bg-[#003d61] transition shadow-md"
            >
              <Plus size={16} /> Add Card
            </button>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {(settings.heroSideCards || []).map((card, index) => (
              <div key={index} className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-white rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center relative">
                    {card.image ? <img src={card.image} alt="" className="w-full h-full object-contain" /> : <ImageIcon size={20} className="text-gray-200" />}
                  </div>
                  <div className="flex-1 space-y-3">
                    <Field label="Eyebrow" value={card.eyebrow} onChange={(v) => {
                      const cards = [...(settings.heroSideCards || [])];
                      cards[index].eyebrow = v;
                      update('heroSideCards', cards);
                    }} />
                    <Field label="Title" value={card.title} onChange={(v) => {
                      const cards = [...(settings.heroSideCards || [])];
                      cards[index].title = v;
                      update('heroSideCards', cards);
                    }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Image URL" value={card.image} onChange={(v) => {
                    const cards = [...(settings.heroSideCards || [])];
                    cards[index].image = v;
                    update('heroSideCards', cards);
                  }} />
                  <Field label="Background" type="color" value={card.backgroundColor} onChange={(v) => {
                    const cards = [...(settings.heroSideCards || [])];
                    cards[index].backgroundColor = v;
                    update('heroSideCards', cards);
                  }} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={card.enabled !== false}
                      onChange={(e) => {
                        const cards = [...(settings.heroSideCards || [])];
                        cards[index].enabled = e.target.checked;
                        update('heroSideCards', cards);
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Active</span>
                  </label>
                  <button 
                    onClick={() => {
                      const cards = (settings.heroSideCards || []).filter((_, i) => i !== index);
                      update('heroSideCards', cards);
                    }}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Promotional Banners */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl">
                <LayoutTemplate size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Promotional Row Banners</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Flexible grid banners across the page</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const banners = [...(settings.promoBanners || [])];
                banners.push({ title: 'New Offer', image: '', color: '#f8fafc', link: '/shop', badge: 'Special', position: 'afterHero', showOnHomepage: true });
                update('promoBanners', banners);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl text-xs font-bold hover:bg-[#003d61] transition shadow-md"
            >
              <Plus size={16} /> Add Banner
            </button>
          </div>
          
          <div className="p-8 space-y-6">
            {(settings.promoBanners || []).map((banner, index) => (
              <div key={index} className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <Field label="Banner Title" value={banner.title} onChange={(v) => {
                      const banners = [...(settings.promoBanners || [])];
                      banners[index].title = v;
                      update('promoBanners', banners);
                    }} />
                    <Field label="Badge" value={banner.badge} onChange={(v) => {
                      const banners = [...(settings.promoBanners || [])];
                      banners[index].badge = v;
                      update('promoBanners', banners);
                    }} />
                  </div>
                  <div className="space-y-4">
                    <Field label="Image URL" value={banner.image} onChange={(v) => {
                      const banners = [...(settings.promoBanners || [])];
                      banners[index].image = v;
                      update('promoBanners', banners);
                    }} />
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Position</label>
                      <select 
                        value={banner.position || 'afterHero'}
                        onChange={(e) => {
                          const banners = [...(settings.promoBanners || [])];
                          banners[index].position = e.target.value;
                          update('promoBanners', banners);
                        }}
                        className="w-full h-11 px-4 bg-white border border-gray-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="afterHero">After Hero Section</option>
                        <option value="afterProducts">After Products</option>
                        <option value="beforeFooter">Before Footer</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Field label="Link URL" value={banner.link} onChange={(v) => {
                      const banners = [...(settings.promoBanners || [])];
                      banners[index].link = v;
                      update('promoBanners', banners);
                    }} />
                    <div className="flex items-center justify-between gap-4">
                       <Field label="Background Color" type="color" value={banner.color} onChange={(v) => {
                          const banners = [...(settings.promoBanners || [])];
                          banners[index].color = v;
                          update('promoBanners', banners);
                        }} />
                        <div className="pt-5">
                           <button 
                            onClick={() => {
                              const banners = (settings.promoBanners || []).filter((_, i) => i !== index);
                              update('promoBanners', banners);
                            }}
                            className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; type?: string; onChange: (v: string) => void }> = ({ label, value, type = 'text', onChange }) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
    <input 
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 px-4 bg-white border border-gray-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
    />
  </div>
);

