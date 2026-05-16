import React, { useState, createContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Profile } from './pages/Profile';
import { Shop } from './pages/Shop';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OrderDetails } from './pages/OrderDetails';
import { Blog } from './pages/Blog';
import { BlogDetails } from './pages/BlogDetails';
import { About } from './pages/About';
import { Product, CartItem, SiteCustomization } from './types';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Coupons from './pages/Coupons';
import Offers from './pages/Offers';
import { apiService } from './services/api';

// Admin Imports
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/Products';
import { AdminProductForm } from './pages/admin/ProductForm';
import { AdminOrders } from './pages/admin/Orders';
import { AdminOrderDetails } from './pages/admin/AdminOrderDetails';
import { AdminCustomers } from './pages/admin/Customers';
import { AdminSettings } from './pages/admin/Settings';
import { AdminCoupons } from './pages/admin/Coupons';
import { AdminMessages } from './pages/admin/Messages';
import { AdminCategories } from './pages/admin/Categories';
import { AdminBrands } from './pages/admin/Brands';
import { AdminMarketing } from './pages/admin/Marketing';
import { AdminBlog } from './pages/admin/Blog';
import { AdminReviews } from './pages/admin/Reviews';
import { AdminFinance } from './pages/admin/Finance';
import { AdminExpenses } from './pages/admin/Expenses';
import { AdminPurchases } from './pages/admin/Purchases';
import { AdminProductFlags } from './pages/admin/ProductFlags';
import { HeroManager } from './pages/admin/HeroManager';
import { Staff } from './pages/admin/Staff';
import { BrandIdentity } from './pages/admin/VisualIdentity';
import { FooterManager } from './pages/admin/FooterManager';
import { StoreSettings } from './pages/admin/StoreSettings';
import { AdminSubscribers } from './pages/admin/Subscribers';
import { NavigationManager } from './pages/admin/NavigationManager';
import { AnnouncementManager } from './pages/admin/AnnouncementManager';
import { CommunicationSettings } from './pages/admin/CommunicationSettings';
import { HomepageBuilder } from './pages/admin/HomepageBuilder';


// Context Definition
interface ShopContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedServiceTitles?: string[]) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemServices: (productId: string, serviceTitles: string[]) => void;
  cartTotal: number;
  site: Partial<SiteCustomization>;
  setSite: (site: Partial<SiteCustomization>) => void;
}

export const ShopContext = createContext<ShopContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartItemServices: () => {},
  cartTotal: 0,
  site: {},
  setSite: () => {},
});

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

import { useAuth } from './contexts/AuthContext';

// Route wrapper to conditionally render Layout or AdminLayout
const AppRoutes = () => {
  const { user, loading: authLoading } = useAuth();
  const staffRoles = ['admin', 'super_admin', 'editor', 'sell_staff', 'crm_staff'];
  const isStaff = user && staffRoles.includes(user.role);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002f4a]"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin" element={isStaff ? <AdminLayout><Outlet /></AdminLayout> : <Navigate to="/login?admin=true" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/edit/:id" element={<AdminProductForm />} />
        <Route path="product-flags" element={<AdminProductFlags />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetails />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="users" element={<Staff />} />
        <Route path="hero" element={<HeroManager />} />
        <Route path="visual-identity" element={<BrandIdentity />} />
        <Route path="navigation" element={<NavigationManager />} />
        <Route path="footer" element={<FooterManager />} />
        <Route path="logic" element={<StoreSettings />} />
        <Route path="announcements" element={<AnnouncementManager />} />
        <Route path="marketing" element={<AdminMarketing />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="subscribers" element={<AdminSubscribers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="communication" element={<CommunicationSettings />} />
        <Route path="homepage-builder" element={<HomepageBuilder />} />

        <Route path="finance" element={<AdminFinance />} />
        <Route path="purchases" element={<AdminPurchases />} />
        <Route path="expenses" element={<AdminExpenses />} />
      </Route>

      {/* Storefront Routes */}
      <Route element={<Layout><Outlet /></Layout>}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetails />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/order/:id" element={<OrderDetails />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [site, setSite] = useState<Partial<SiteCustomization>>({});

  useEffect(() => {
    apiService.getSiteSettings().then(data => {
      if (data && data.site_customization) setSite(data.site_customization);
      else if (data && data.site) setSite(data.site); // Fallback
    });
  }, []);

  const injectStyles = () => {
    const primary = site.primaryColor || '#002f4a';
    const accent = site.accentColor || '#E5A823';
    const secondary = site.secondaryColor || '#64748b';
    const tertiary = site.tertiaryColor || '#94a3b8';
    const quaternary = site.quaternaryColor || '#cbd5e1';
    
    return (
      <style>{`
        :root {
          --brand-primary: ${primary};
          --brand-accent: ${accent};
          --brand-secondary: ${secondary};
          --brand-tertiary: ${tertiary};
          --brand-quaternary: ${quaternary};
        }
        .bg-brand-primary { background-color: var(--brand-primary); }
        .text-brand-primary { color: var(--brand-primary); }
        .bg-brand-accent { background-color: var(--brand-accent); }
        .text-brand-accent { color: var(--brand-accent); }
      `}</style>
    );
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    try {
      const user = JSON.parse(savedUser);
      apiService.getCart(user.id).then(items => {
        setCart(items.map((item: any) => ({
          ...item.product,
          quantity: item.quantity,
          selectedServices: item.selectedOptions?.services || [],
        })));
      }).catch(() => {});
    } catch {}
  }, []);

  const addToCart = (product: Product, selectedServiceTitles: string[] = []) => {
    // Check if item already exists
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const nextQuantity = existing ? existing.quantity + 1 : 1;
      const nextServices = selectedServiceTitles.length ? selectedServiceTitles : (existing?.selectedServices || []);
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          void apiService.saveCartItem(user.id, product.id, nextQuantity, { services: nextServices });
        }
      } catch {}
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1, selectedServices: nextServices } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedServices: nextServices }];
    });
  };

  const removeFromCart = (productId: string) => {
    // Remove all instances of this product for simplicity in this demo,
    // or we could decrement. Let's stick to remove item completely.
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartItemServices = (productId: string, serviceTitles: string[]) => {
    let nextQuantity = 1;
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        nextQuantity = item.quantity;
        return { ...item, selectedServices: serviceTitles };
      }
      return item;
    }));
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return;
      const user = JSON.parse(savedUser);
      void apiService.saveCartItem(user.id, productId, nextQuantity, { services: serviceTitles });
    } catch {}
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <AuthProvider>
      <ShopContext.Provider value={{ cart, addToCart, removeFromCart, updateCartItemServices, cartTotal, site, setSite }}>
        <Router>
          {injectStyles()}
          <Toaster position="top-right" />
          <ScrollToTop />
          <AppRoutes />
        </Router>
      </ShopContext.Provider>
    </AuthProvider>
  );
};

export default App;
