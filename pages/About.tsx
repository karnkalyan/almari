import React, { useContext } from 'react';
import { ShopContext } from '../App';
import { 
  ShieldCheck, 
  Truck, 
  Clock, 
  Award, 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  Heart,
  Headphones,
  TrendingUp
} from 'lucide-react';

export const About: React.FC = () => {
  const { site } = useContext(ShopContext) as any;

  const stats = [
    { 
      label: 'Happy Customers', 
      value: site.stat_customers || '50k+', 
      icon: Users, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Quality Products', 
      value: site.stat_products || '10k+', 
      icon: Award, 
      color: 'bg-amber-500' 
    },
    { 
      label: 'Fast Delivery', 
      value: site.stat_delivery || '24h', 
      icon: Truck, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Support 24/7', 
      value: site.stat_support || 'Live', 
      icon: Headphones, 
      color: 'bg-rose-500' 
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#002f4a]">
          <img 
            src={site.about_hero_image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200"} 
            className="w-full h-full object-cover opacity-30" 
            alt="About Hero"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <span className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white/80 border border-white/20 mb-6 inline-block">Established 2025</span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-none">
            {site.about_hero_title || `About ${site.storeName || 'eAlmari'}`}
          </h1>
          <p className="text-white/80 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
            {site.about_hero_subtitle || "Your trusted destination for premium organic food and high-quality lifestyle products in Nepal."}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div>
                <span className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-[0.4em] mb-4 block">The Narrative</span>
                <h2 className="text-5xl font-black text-slate-800 leading-tight">
                  {site.about_story_title || "Elevating Shopping Standards in Nepal"}
                </h2>
              </div>
              <p className="text-gray-500 text-xl leading-relaxed font-medium">
                {site.about_story_content || site.footerAbout || "Almari started with a simple mission: to provide every household in Nepal with access to genuine, high-quality products at fair prices."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="p-8 bg-gray-50 rounded-[2.5rem] space-y-4 border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shadow-sm">
                       <ShieldCheck size={24} />
                    </div>
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">100% Authentic</h3>
                    <p className="text-sm text-gray-500 font-medium">Every product is verified for quality and authenticity.</p>
                 </div>
                 <div className="p-8 bg-gray-50 rounded-[2.5rem] space-y-4 border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm">
                       <Heart size={24} />
                    </div>
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Customer First</h3>
                    <p className="text-sm text-gray-500 font-medium">Our support team is always ready to assist you.</p>
                 </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative z-10 border-[12px] border-white">
                 <img src={site.about_story_image || "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=1200"} alt="Story" className="w-full h-full object-cover aspect-[4/5]" />
              </div>
              <div className="absolute -bottom-12 -right-12 w-80 h-80 bg-[var(--brand-primary)]/10 rounded-full blur-[100px] -z-10"></div>
              <div className="absolute -top-12 -left-12 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Team Impact */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
         <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20 space-y-4">
               <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Our Momentum</span>
               <h2 className="text-5xl font-black text-white tracking-tight">The eAlmari Team</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
               {stats.map((stat, i) => (
                 <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[3rem] flex flex-col items-center text-center group hover:bg-white/10 transition-all duration-500">
                    <div className={`w-20 h-20 ${stat.color} text-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl group-hover:-translate-y-2 transition-transform`}>
                       <stat.icon size={32} />
                    </div>
                    <h4 className="text-5xl font-black text-white mb-3 tracking-tighter">{stat.value}</h4>
                    <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em]">{stat.label}</p>
                 </div>
               ))}
            </div>
         </div>
         <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] -z-0"></div>
      </section>

      {/* Contact Banner */}
      <section className="py-32">
         <div className="container mx-auto px-4">
            <div className="bg-[#002D42] rounded-[5rem] p-16 md:p-32 relative overflow-hidden text-center text-white border border-white/5 shadow-2xl">
               <div className="relative z-10 max-w-5xl mx-auto space-y-16">
                  <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">Need assistance? Our team is here to help you 24/7</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                     <div className="flex flex-col items-center gap-6 group">
                        <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-900 transition-all duration-500 shadow-xl"><Phone size={32} /></div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Call Us</p>
                           <p className="text-2xl font-black tracking-tight">{site.contact_phone || '+977 9801234567'}</p>
                        </div>
                     </div>
                     <div className="flex flex-col items-center gap-6 group">
                        <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-900 transition-all duration-500 shadow-xl"><Mail size={32} /></div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Email Us</p>
                           <p className="text-2xl font-black tracking-tight">{site.contact_email || 'hello@ealmari.com'}</p>
                        </div>
                     </div>
                     <div className="flex flex-col items-center gap-6 group">
                        <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-900 transition-all duration-500 shadow-xl"><MapPin size={32} /></div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Visit Us</p>
                           <p className="text-2xl font-black tracking-tight">{site.contact_address || 'Kathmandu, Nepal'}</p>
                        </div>
                     </div>
                  </div>
               </div>
               {/* Decorative blobs */}
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-64 -mt-64 blur-[120px] pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full -ml-64 -mb-64 blur-[120px] pointer-events-none"></div>
            </div>
         </div>
      </section>
    </div>
  );
};
