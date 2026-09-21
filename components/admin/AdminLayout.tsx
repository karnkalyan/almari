import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Info,
  ChevronDown,
  Palette,
  Megaphone,
  Monitor,
  Link2,
  Tag,
  Newspaper,
  Ticket,
  MessageSquare,
  PackagePlus,
  ReceiptText,
  WalletCards,
  Home,
  SlidersHorizontal,
  Tags,
  Award,
  ShieldCheck,
  Mail,
  TableProperties,
  Settings2,
  Lock,
  Blocks,
  MailWarning,
  LayoutPanelTop
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ShopContext } from '../../App';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../../constants';

const SOCKET_URL = API_BASE_URL.replace('/api', '');

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { site } = React.useContext(ShopContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('new_message', (data) => {
      if (user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'crm_staff') {
        toast((t) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--brand-primary)] text-white rounded-full flex items-center justify-center font-bold">
              {data.message.sender === 'customer' ? 'C' : 'A'}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-800">New Message Received</p>
              <p className="text-[10px] text-gray-500 line-clamp-1">{data.message.text}</p>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/admin/messages');
              }}
              className="px-2 py-1 bg-[var(--brand-primary)] text-white text-[10px] font-bold rounded"
            >
              View
            </button>
          </div>
        ), { duration: 5000, position: 'bottom-right' });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, navigate]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', roles: ['admin', 'super_admin', 'editor', 'sell_staff', 'crm_staff'] },

    { type: 'header', label: 'Store Management' },
    { icon: ShoppingBag, label: 'Products', path: '/admin/products', roles: ['admin', 'super_admin', 'editor'] },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders', roles: ['admin', 'super_admin', 'sell_staff'] },
    { icon: Users, label: 'Customers', path: '/admin/customers', roles: ['admin', 'super_admin', 'crm_staff', 'sell_staff'] },
    { icon: Ticket, label: 'Coupons', path: '/admin/coupons', roles: ['admin', 'super_admin'] },

    { type: 'header', label: 'Catalog Assets' },
    { icon: SlidersHorizontal, label: 'Product Flags', path: '/admin/product-flags', roles: ['admin', 'super_admin', 'editor'] },
    { icon: Tags, label: 'Categories', path: '/admin/categories', roles: ['admin', 'super_admin', 'editor'] },
    { icon: Award, label: 'Brands', path: '/admin/brands', roles: ['admin', 'super_admin', 'editor'] },

    { type: 'header', label: 'Identity & Structure (Super Admin Only)' },
    { icon: Blocks, label: 'Homepage Builder', path: '/admin/homepage-builder', roles: ['super_admin'] },
    { icon: Palette, label: 'Branding', path: '/admin/visual-identity', roles: ['super_admin'] },
    { icon: Info, label: 'About Us Content', path: '/admin/about-us', roles: ['super_admin'] },
    { icon: Monitor, label: 'Hero & Promotions', path: '/admin/hero', roles: ['admin', 'super_admin', 'editor'] },
    { icon: Megaphone, label: 'Announcements', path: '/admin/announcements', roles: ['admin', 'super_admin', 'editor'] },
    { icon: Link2, label: 'Header Navigation', path: '/admin/navigation', roles: ['super_admin'] },
    { icon: LayoutPanelTop, label: 'Footer Architecture', path: '/admin/footer', roles: ['super_admin'] },
    { icon: Settings2, label: 'Store Logic', path: '/admin/logic', roles: ['super_admin'] },

    { type: 'header', label: 'Communication' },
    { icon: MailWarning, label: 'Email & SMS Rules', path: '/admin/communication', roles: ['admin', 'super_admin'] },
    { icon: MessageSquare, label: 'Support Inbox', path: '/admin/messages', roles: ['admin', 'super_admin', 'crm_staff'] },
    { icon: Mail, label: 'Subscribers', path: '/admin/subscribers', roles: ['admin', 'super_admin', 'crm_staff'] },
    { icon: Newspaper, label: 'Blog Manager', path: '/admin/blog', roles: ['admin', 'super_admin', 'editor'] },

    { type: 'header', label: 'Platform & Finance' },
    { icon: ShieldCheck, label: 'User Management', path: '/admin/users', roles: ['super_admin'] },
    { icon: PackagePlus, label: 'Purchases', path: '/admin/purchases', roles: ['admin', 'super_admin'] },
    { icon: ReceiptText, label: 'Expenses', path: '/admin/expenses', roles: ['admin', 'super_admin'] },
    { icon: WalletCards, label: 'Finance Engine', path: '/admin/finance', roles: ['admin', 'super_admin'] },
  ];

  const filteredMenuItems = menuItems.filter((item: any) =>
    item.type === 'header' || !item.roles || (user?.role && item.roles.includes(user.role)) || user?.role === 'super_admin'
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const logoText = site.logoText || site.storeName || 'Almari';

  return (
    <div className="h-[100dvh] bg-slate-50 font-inter flex overflow-hidden w-full relative">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-slate-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col`}
      >
        <div className="p-6 lg:p-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] flex items-center justify-center font-black text-xl shadow-lg shadow-[var(--brand-primary)]/20 border border-white/10">
              {logoText.charAt(0)}
            </div>
            <div>
              <p className="font-black text-xl tracking-tighter leading-none">{logoText}</p>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Admin Suite</p>
            </div>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar overscroll-contain">
          {filteredMenuItems.map((item: any, index) => {
            if (item.type === 'header') {
              return (
                <p key={index} className="px-4 pt-6 pb-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                  {item.label} {item.label.includes('Super Admin') && <Lock size={10} className="text-amber-500" />}
                </p>
              );
            }

            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                    ? 'bg-white text-slate-900 shadow-xl shadow-black/20 font-bold translate-x-1.5'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.icon && <item.icon size={18} className={isActive ? 'text-[var(--brand-primary)]' : 'text-white/30 group-hover:text-white transition-colors'} />}
                <span className="text-sm tracking-tight">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] shadow-glow"></div>}
              </Link>
            );
          })}

          <div className="pt-8 px-4 pb-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all font-bold border border-white/5 bg-white/5"
            >
              <LogOut size={18} />
              <span className="text-sm">Exit Session</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-slate-50 relative">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition">
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[var(--brand-primary)] rounded-full hidden sm:block"></div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                  {(filteredMenuItems.find((i: any) => location.pathname === i.path || (i.path !== '/admin' && location.pathname.startsWith(i.path))) as any)?.label || 'Overview'}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="relative hidden xl:block w-80 group">
              <input
                type="text"
                placeholder="Search Products..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                    navigate(`/admin/products?search=${encodeURIComponent(e.currentTarget.value.trim())}`);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full h-11 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)] outline-none transition-all font-medium text-slate-600"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--brand-primary)] transition-colors" />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button className="relative p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition group">
                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="h-8 w-px bg-slate-100 mx-2"></div>

              <Link to="/admin/profile" className="flex items-center gap-3 pl-2 group hover:opacity-80 transition-all">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-800 leading-none group-hover:text-[var(--brand-primary)] transition-colors">{user?.name}</p>
                  <p className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest mt-1">{user?.role.replace('_', ' ')}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center font-black text-slate-600 shadow-sm overflow-hidden group-hover:shadow-md transition-all">
                  {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name.charAt(0)}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
