
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Home, ShoppingCart, User, Search, Menu, Phone, Heart, Grid, X, ChevronDown, MapPin, ChevronRight, LayoutDashboard, ShoppingBag, ShieldCheck, Tag, Ticket, Mail, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { ChatWidget } from './ChatWidget';
import { ShopContext } from '../App';
import { CATEGORIES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { SiteCustomization } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { cart, cartTotal, site: contextSite } = useContext(ShopContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const site = contextSite || {};
  const activeAnnouncements = (site as any).announcements?.filter((a: any) => a.isActive) || [];

  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    const interval = setInterval(() => {
      setAnnouncementIdx(prev => (prev + 1) % activeAnnouncements.length);
    }, (site as any).announcementSpeed || 5000);
    return () => clearInterval(interval);
  }, [activeAnnouncements.length, (site as any).announcementSpeed]);

  useEffect(() => {
    if (contextSite) {
      if (contextSite.storeName) document.title = contextSite.storeName;
      if (contextSite.logoImage) {
        const link: HTMLLinkElement = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.href = contextSite.logoImage;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    }
  }, [contextSite]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);
        try {
          const categoryFilter = category === "All Categories" ? "" : category;
          const res = await apiService.getProducts({ 
            search: searchTerm, 
            category: categoryFilter,
            limit: 6 
          });
          setSearchSuggestions(res.products);
          setShowSuggestions(true);
        } catch (err) {
          setSearchSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, category]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const catParam = category === "All Categories" ? "" : `&category=${encodeURIComponent(category)}`;
    navigate(`/shop?search=${encodeURIComponent(searchTerm)}${catParam}`);
    setShowSuggestions(false);
  };

  const isAdmin = user && ['admin', 'super_admin', 'editor', 'sell_staff', 'crm_staff'].includes(user.role);
  const primaryColor = site.primaryColor || '#002f4a';
  const accentColor = site.accentColor || '#E5A823';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-inter" style={{ 
      ['--brand-primary' as any]: primaryColor,
      ['--brand-accent' as any]: accentColor
    }}>
      {/* Top Notification Bar */}
      <div className="text-gray-200 text-[11px] md:text-xs py-2 border-b" style={{ backgroundColor: primaryColor, borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center h-5 overflow-hidden relative w-full max-w-xl">
               {activeAnnouncements.length > 0 ? (
                 <div 
                   className="transition-all duration-1000 flex flex-col w-full"
                   style={{ transform: `translateY(-${announcementIdx * 1.25}rem)` }}
                 >
                   {activeAnnouncements.map((a: any, i: number) => (
                     <span key={i} className="h-5 font-bold tracking-tight uppercase text-[10px] flex items-center gap-2">
                       {a.text} {a.link && <Link to={a.link} className="underline decoration-white/20 hover:text-white transition">Details</Link>}
                     </span>
                   ))}
                 </div>
               ) : (
                 <span className="font-medium tracking-wide">
                   {site.announcement || "FREE delivery & 40% Discount for next 3 orders!"}
                 </span>
               )}
             </div>
             <span className="md:hidden">Free Delivery in KTM!</span>
          </div>
          <div className="flex gap-4 items-center">
             <div className="hidden md:flex gap-1 hover:text-white cursor-pointer transition">
               <MapPin size={14} className="text-[#E5A823]" />
               <span>{site.location || "Kathmandu, Nepal"}</span>
             </div>
             <div className="h-3 w-px bg-[#004266] hidden md:block"></div>
             {isAdmin && (
               <Link to="/admin" className="flex items-center gap-1 hover:text-[#E5A823] transition-colors font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                 <ShieldCheck size={12} /> Admin Panel
               </Link>
             )}
             <div className="h-3 w-px bg-[#004266] hidden md:block"></div>
             <div className="flex gap-3">
               <select className="bg-transparent border-none text-gray-300 text-xs focus:ring-0 cursor-pointer p-0 font-medium">
                 <option className="text-slate-800">English</option>
                 <option className="text-slate-800">Nepali</option>
               </select>
               <select className="bg-transparent border-none text-gray-300 text-xs focus:ring-0 cursor-pointer p-0 font-medium">
                 <option className="text-slate-800">NPR</option>
                 <option className="text-slate-800">USD</option>
               </select>
             </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 md:py-5">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            
            {/* Logo */}
            <div className="flex items-center gap-4 flex-shrink-0">
               <Link to="/" className="flex items-center gap-2 group">
                 <div className="relative flex items-baseline">
                   <div className="text-3xl font-bold tracking-tighter">
                     <span style={{ color: accentColor }}>{site.logoText?.charAt(0) || 'e'}</span>
                     <span style={{ color: primaryColor }}>{site.logoText?.substring(1) || 'Almari'}</span>
                   </div>
                   <div className="w-2 h-2 rounded-full ml-1 animate-pulse" style={{ backgroundColor: accentColor }}></div>
                 </div>
               </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl hidden lg:block" ref={searchRef}>
               <form onSubmit={handleSearch} className="flex h-[46px] rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[var(--brand-primary)]/20 focus-within:border-[var(--brand-primary)] transition-all bg-white shadow-sm relative">
                  <div className="w-40 border-r border-gray-100 relative group rounded-l-xl overflow-hidden">
                    <select 
                      className="w-full h-full bg-transparent border-none text-sm text-slate-700 font-medium px-4 focus:ring-0 cursor-pointer appearance-none"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>All Categories</option>
                      {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                 <div className="flex-1 relative">
                    <input 
                     type="text" 
                     placeholder="Search for products, brands..." 
                     className="w-full h-[46px] px-4 bg-white border-none text-sm focus:ring-0 text-slate-800 placeholder-gray-400"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                       {isSearching ? (
                         <div className="w-4 h-4 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                         <Search className="text-gray-400" size={18} />
                       )}
                    </div>
                 </div>
                  <button type="submit" className="text-white px-8 font-bold text-sm transition-colors uppercase tracking-wide rounded-r-xl" style={{ backgroundColor: primaryColor }}>
                    Search
                  </button>

                  {showSuggestions && (searchSuggestions.length > 0 || searchTerm.length > 1) && (
                    <div className="absolute top-[calc(100%+8px)] left-0 md:-left-20 md:-right-20 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Suggestions</span>
                         {searchSuggestions.length > 0 && (
                           <span className="text-[10px] font-bold text-[var(--brand-primary)]">{searchSuggestions.length} items found</span>
                         )}
                      </div>
                      <div className="p-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
                         {searchSuggestions.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {searchSuggestions.map((p: any) => (
                               <Link 
                                 key={p.id} 
                                 to={`/product/${p.id}`} 
                                 className="flex gap-4 p-4 bg-gray-50/50 hover:bg-white rounded-[1.5rem] border border-transparent hover:border-gray-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
                                 onClick={() => {
                                   setSearchTerm("");
                                   setShowSuggestions(false);
                                 }}
                               >
                                  <div className="w-20 h-20 rounded-2xl bg-white overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                                     <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  </div>
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                     <div className="flex items-center gap-1.5 mb-1">
                                        <span className="px-2 py-0.5 bg-white text-[8px] font-black text-gray-400 uppercase tracking-widest rounded-full border border-gray-100">
                                          {p.category}
                                        </span>
                                     </div>
                                     <p className="text-sm font-black text-slate-800 truncate leading-tight mb-1 group-hover:text-[var(--brand-primary)] transition-colors">{p.name}</p>
                                     <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-[var(--brand-primary)]">NPR {p.price.toLocaleString()}</span>
                                        {p.originalPrice > p.price && (
                                          <span className="text-[10px] text-gray-400 line-through">NPR {p.originalPrice.toLocaleString()}</span>
                                        )}
                                     </div>
                                  </div>
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-100 text-gray-300 group-hover:bg-[var(--brand-primary)] group-hover:text-white group-hover:border-[var(--brand-primary)] transition-all self-center">
                                     <ChevronRight size={16} />
                                  </div>
                               </Link>
                             ))}
                           </div>
                         ) : (
                           <div className="p-8 text-center text-gray-400">
                              <p className="text-xs font-bold">No exact matches found for "{searchTerm}"</p>
                           </div>
                         )}
                      </div>
                      {searchTerm.length > 0 && (
                        <button 
                          onClick={handleSearch}
                          className="w-full py-3.5 bg-gray-50 text-[var(--brand-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--brand-primary)] hover:text-white transition-all border-t border-gray-100"
                        >
                          View All Search Results
                        </button>
                      )}
                    </div>
                  )}
               </form>
             </div>

            {/* Actions */}
            <div className="flex items-center gap-6 flex-shrink-0">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full border flex items-center justify-center transition-all"
                      style={{ backgroundColor: 'white', borderColor: primaryColor + '20', color: primaryColor }}
                    >
                      <User size={20} />
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">Account</span>
                      <span className="text-sm font-black text-slate-800 leading-none" style={{ color: primaryColor }}>{user.name.split(' ')[0]}</span>
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
                    <Link to="/profile" className="block px-3 py-2 text-sm text-slate-700 hover:bg-gray-50 rounded-lg">My Profile</Link>
                    {isAdmin && <Link to="/admin" className="block px-3 py-2 text-sm font-bold hover:bg-blue-50 rounded-lg" style={{ color: primaryColor }}>Admin Panel</Link>}
                    <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">Logout</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-3 group">
                  <div 
                    className="w-10 h-10 rounded-full border flex items-center justify-center transition-all"
                    style={{ backgroundColor: 'white', borderColor: primaryColor + '20', color: primaryColor }}
                  >
                    <User size={20} />
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">Account</span>
                    <span className="text-sm font-black text-slate-800 leading-none" style={{ color: primaryColor }}>Login / Join</span>
                  </div>
                </Link>
              )}
              
              <Link to="/profile?tab=wishlist" className="hidden md:flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[#002f4a] group-hover:bg-[#002f4a] group-hover:text-[#E5A823] transition-colors relative">
                  <Heart size={20} />
                </div>
              </Link>

               <Link to="/cart" className="flex items-center gap-3 group">
                <div 
                  className="w-10 h-10 rounded-full border flex items-center justify-center transition-all relative"
                  style={{ backgroundColor: 'white', borderColor: primaryColor + '20', color: primaryColor }}
                >
                  <ShoppingBag size={20} />
                  {cart.length > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] text-white flex items-center justify-center font-black shadow-md border-2 border-white animate-bounce"
                      style={{ backgroundColor: accentColor }}
                    >
                      {cart.length}
                    </span>
                  )}
                </div>
                <div className="hidden md:flex flex-col">
                   <span className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">Your Cart</span>
                   <span className="text-sm font-black text-slate-800 leading-none" style={{ color: primaryColor }}>NPR {cartTotal.toLocaleString()}</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-4 lg:hidden">
             <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full h-11 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-[#002f4a] focus:border-[#002f4a] outline-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-gray-500">
                  <Search size={18} />
                </button>
             </form>
          </div>
        </div>
      </header>

      {/* Navigation Bar & Mega Menu */}
      <nav className="border-b border-gray-200 bg-white hidden lg:block relative z-30">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-8 h-full">
            {/* Mega Menu Trigger */}
            <div className="relative h-full flex items-center group" onMouseEnter={() => setShowMegaMenu(true)} onMouseLeave={() => setShowMegaMenu(false)}>
               <button className="flex items-center gap-3 px-6 h-full text-sm font-bold transition-colors text-white" style={{ backgroundColor: primaryColor }}>
                 <Grid size={18} style={{ color: accentColor }} />
                 Browse Categories
                 <ChevronDown size={14} className="ml-auto text-gray-300" />
               </button>
               
               {/* Mega Menu Dropdown */}
               <div className={`absolute top-full left-0 w-[900px] bg-white shadow-2xl border-t-2 rounded-b-lg p-6 transition-all duration-200 transform origin-top ${showMegaMenu ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`} style={{ borderTopColor: accentColor }}>
                 <div className="grid grid-cols-4 gap-8">
                    <div>
                      <h4 className="font-bold text-[var(--brand-primary)] mb-4 flex items-center gap-2 border-b pb-2">
                         <span className="text-[#E5A823]">●</span> Grocery
                      </h4>
                      <ul className="space-y-2">
                        {CATEGORIES.slice(0, 5).map(cat => (
                           <li key={cat}><Link to={`/shop?category=${encodeURIComponent(cat)}`} className="text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:font-bold transition-colors block py-1">{cat}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--brand-primary)] mb-4 flex items-center gap-2 border-b pb-2">
                         <span className="text-[#E5A823]">●</span> Essentials
                      </h4>
                      <ul className="space-y-2">
                        {CATEGORIES.slice(5, 9).map(cat => (
                           <li key={cat}><Link to={`/shop?category=${encodeURIComponent(cat)}`} className="text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:font-bold transition-colors block py-1">{cat}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--brand-primary)] mb-4 flex items-center gap-2 border-b pb-2">
                         <span className="text-[#E5A823]">●</span> Lifestyle
                      </h4>
                      <ul className="space-y-2">
                        {CATEGORIES.slice(9, 12).map(cat => (
                           <li key={cat}><Link to={`/shop?category=${encodeURIComponent(cat)}`} className="text-sm text-gray-600 hover:text-[var(--brand-primary)] hover:font-bold transition-colors block py-1">{cat}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-[#f0f9ff] rounded-lg p-4 flex flex-col items-center justify-center text-center">
                       <span className="text-[#E5A823] font-bold text-xs uppercase tracking-widest mb-2">Special Offer</span>
                       <h3 className="text-[#002f4a] font-bold text-lg mb-2">Organic Foods</h3>
                       <p className="text-sm text-gray-500 mb-4">Get 20% off on all organic vegetables this weekend.</p>
                       <Link to="/shop" className="text-sm font-bold text-[#002f4a] underline decoration-[#E5A823] underline-offset-4">Shop Now</Link>
                    </div>
                 </div>
               </div>
            </div>

            {/* Links */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-sm font-black text-slate-800 hover:opacity-70 uppercase tracking-widest transition-colors">Home</Link>
              <Link to="/shop" className="text-sm font-black text-slate-800 hover:opacity-70 uppercase tracking-widest transition-colors">Shop</Link>
              <Link to="/offers" className="text-sm font-black text-red-600 hover:text-red-700 uppercase tracking-widest transition-colors flex items-center gap-1">
                <Tag size={14} /> Offers
              </Link>
              <Link to="/coupons" className="text-sm font-black hover:opacity-70 uppercase tracking-widest transition-colors flex items-center gap-1" style={{ color: primaryColor }}>
                <Ticket size={14} /> Promos
              </Link>
              <Link to="/profile" className="text-sm font-black text-slate-800 hover:opacity-70 uppercase tracking-widest transition-colors">Track Order</Link>
              <Link to="/blog" className="text-sm font-black text-slate-800 hover:opacity-70 uppercase tracking-widest transition-colors">Blog</Link>
              <Link to="/about" className="text-sm font-black text-slate-800 hover:opacity-70 uppercase tracking-widest transition-colors">About</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm bg-gray-50 px-4 py-2 rounded-full">
             <Phone size={16} className="text-[#E5A823]" />
             <span>{site.supportPhone || "+977 9801234567"}</span>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (App-like UX) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around h-16 lg:hidden z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
         <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-[var(--brand-primary)]' : 'text-gray-400'}`}>
            <Home size={20} className={location.pathname === '/' ? 'fill-[var(--brand-primary)]' : ''} />
            <span className="text-[10px] font-bold">Home</span>
         </Link>
         <Link to="/shop" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/shop' ? 'text-[var(--brand-primary)]' : 'text-gray-400'}`}>
            <Grid size={20} className={location.pathname === '/shop' ? 'fill-[var(--brand-primary)]' : ''} />
            <span className="text-[10px] font-bold">Shop</span>
         </Link>
         <Link to="/cart" className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${location.pathname === '/cart' ? 'text-[var(--brand-primary)]' : 'text-gray-400'}`}>
            <div className="relative">
              <ShoppingCart size={20} className={location.pathname === '/cart' ? 'fill-[var(--brand-primary)]' : ''} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Cart</span>
         </Link>
         <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/profile' ? 'text-[var(--brand-primary)]' : 'text-gray-400'}`}>
            <User size={20} className={location.pathname === '/profile' ? 'fill-[var(--brand-primary)]' : ''} />
            <span className="text-[10px] font-bold">Profile</span>
         </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white pt-16 border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 md:p-12 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden border" style={{ borderColor: primaryColor + '20' }}>
             {/* Decorative circles */}
             <div className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-20" style={{ backgroundColor: accentColor }}></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

             <div className="lg:w-1/2 text-center lg:text-left relative z-10">
               <span className="text-sm font-bold uppercase mb-2 block" style={{ color: accentColor }}>Our Newsletter</span>
               <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: primaryColor }}>Join Almari for NPR 500 off!</h3>
               <p className="text-gray-400 text-sm">Register now to get latest updates on promotions & coupons.</p>
             </div>
             <div className="lg:w-1/2 w-full relative z-10">
               <form className="flex bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                 <input type="email" placeholder="Enter your email address" className="flex-1 h-10 border-none focus:ring-0 text-sm px-4 bg-transparent" />
                 <button className="px-6 rounded-md font-bold text-sm text-white" style={{ backgroundColor: primaryColor }}>Subscribe</button>
               </form>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
               <div className="text-2xl font-bold text-[#002f4a] mb-6">{site.logoText || site.storeName || 'Almari'}</div>
               <p className="text-gray-500 text-sm mb-6 leading-relaxed">{site.footerAbout || "Nepal's premier online shopping destination. Authentic products, best prices, and fast delivery."}</p>
               <p className="text-xl font-bold text-[#002f4a]">{site.supportPhone || "+977 9801234567"}</p>
            </div>
            
            {site.footerColumns && site.footerColumns.length > 0 ? (
              site.footerColumns.map((col: any, idx: number) => (
                <div key={idx}>
                  <h4 className="font-bold text-slate-800 mb-6">{col.title}</h4>
                  <ul className="space-y-3 text-sm text-gray-500">
                    {col.links?.map((link: any, linkIdx: number) => (
                      <li key={linkIdx}><Link to={link.url} className="hover:text-[var(--brand-primary)] transition-colors">{link.label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <>
                <div>
                  <h4 className="font-bold text-slate-800 mb-6">Company</h4>
                  <ul className="space-y-3 text-sm text-gray-500">
                    <li><Link to="/about">About Us</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                    <li><Link to="/blog">Blog</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-6">Support</h4>
                  <ul className="space-y-3 text-sm text-gray-500">
                    <li><Link to="/faq">FAQs</Link></li>
                    <li><Link to="/shipping">Shipping</Link></li>
                    <li><Link to="/returns">Returns</Link></li>
                  </ul>
                </div>
              </>
            )}
            
            <div>
              <h4 className="font-bold text-slate-800 mb-6">Payment Partners</h4>
              <div className="flex flex-wrap gap-4 opacity-50">
                {site.paymentPartners && site.paymentPartners.length > 0 ? (
                  site.paymentPartners.map((partner: any, idx: number) => (
                    <img key={idx} src={partner.logo} className="h-6 object-contain" alt={partner.name} title={partner.name} />
                  ))
                ) : (
                  <>
                    <img src="https://esewa.com.np/common/images/esewa_logo.png" className="h-6" alt="eSewa" />
                    <img src="https://khalti.com/static/resources/img/khalti-logo.png" className="h-4" alt="Khalti" />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-t py-8 text-center text-xs text-gray-500">
            <p>{site.copyrightText || "Copyright 2026 © Almari Store. All rights reserved."}</p>
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
};
