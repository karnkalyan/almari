
import React, { useContext } from 'react';
import { ShopContext } from '../App';
import { ShieldCheck, Truck, Clock, Award, Users, MapPin, Mail, Phone, Heart } from 'lucide-react';

export const About: React.FC = () => {
  const { site } = useContext(ShopContext);

  const stats = [
    { label: 'Happy Customers', value: '50k+', icon: Users, color: 'bg-blue-500' },
    { label: 'Quality Products', value: '10k+', icon: Award, color: 'bg-amber-500' },
    { label: 'Fast Delivery', value: '24h', icon: Truck, color: 'bg-green-500' },
    { label: 'Support 24/7', value: 'Live', icon: Clock, color: 'bg-rose-500' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#002f4a]">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover opacity-30" 
            alt="About Hero"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">About {site.storeName || 'Almari'}</h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Your trusted destination for premium organic food and high-quality lifestyle products in Nepal.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[10px] font-black text-[#E5A823] uppercase tracking-[0.3em] mb-4 block">Our Story</span>
              <h2 className="text-4xl font-black text-slate-800 mb-6 leading-tight">Elevating Shopping Standards in Nepal since 2025</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                {site.footerAbout || "Almari started with a simple mission: to provide every household in Nepal with access to genuine, high-quality products at fair prices. We believe that everyone deserves the best, whether it's organic produce from local farms or the latest global tech."}
              </p>
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                       <ShieldCheck className="text-green-500" size={20} />
                       <span>100% Authentic</span>
                    </div>
                    <p className="text-sm text-gray-400">Every product is verified for quality and authenticity.</p>
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                       <Heart className="text-rose-500" size={20} />
                       <span>Customer First</span>
                    </div>
                    <p className="text-sm text-gray-400">Our support team is always ready to assist you.</p>
                 </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-[3rem] overflow-hidden shadow-2xl relative z-10">
                 <img src="https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=1200" alt="Team" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#E5A823]/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -top-8 -left-8 w-64 h-64 bg-[#002f4a]/10 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gray-50">
         <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
               {stats.map((stat, i) => (
                 <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:scale-105 transition-all">
                    <div className={`w-16 h-16 ${stat.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-gray-200 group-hover:rotate-6 transition-transform`}>
                       <stat.icon size={28} />
                    </div>
                    <h4 className="text-3xl font-black text-slate-800 mb-1">{stat.value}</h4>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Contact Banner */}
      <section className="py-20">
         <div className="container mx-auto px-4">
            <div className="bg-[#002f4a] rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center text-white">
               <div className="relative z-10 max-w-3xl mx-auto">
                  <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">Need assistance? Our team is here to help you 24/7</h2>
                  <div className="flex flex-wrap justify-center gap-8">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E5A823]"><Phone size={20} /></div>
                        <div className="text-left">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Call Us</p>
                           <p className="font-bold">{site.supportPhone || '+977 9801234567'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E5A823]"><Mail size={20} /></div>
                        <div className="text-left">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Email Us</p>
                           <p className="font-bold">{site.supportEmail || 'hello@almari.com'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E5A823]"><MapPin size={20} /></div>
                        <div className="text-left">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Visit Us</p>
                           <p className="font-bold">{site.address || 'Kathmandu, Nepal'}</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
               <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E5A823]/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
            </div>
         </div>
      </section>
    </div>
  );
};
