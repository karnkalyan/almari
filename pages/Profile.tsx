import React, { useEffect, useState } from 'react';
import { User, Package, Heart, LogOut, MapPin, LayoutDashboard, Settings, ShoppingBag, Plus, Save, Trash2 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Address, Order, Product } from '../types';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'wishlist' | 'address' | 'details'>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [draftAddress, setDraftAddress] = useState<Partial<Address>>({ type: 'home', street: '', city: '', state: '', zipCode: '', country: 'Nepal', isDefault: false });
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Redirect admin/staff users to the admin dashboard profile page
    if (['admin', 'super_admin', 'staff', 'manager'].includes(user.role)) {
      navigate('/admin/settings', { replace: true });
      return;
    }
  }, [loading, user, navigate]);

  const load = async () => {
    if (!user?.id) return;
    const [orderData, addressData, wishlistData] = await Promise.all([
      apiService.getUserOrders().catch(() => apiService.getOrders()),
      apiService.getUserAddresses().catch(() => Promise.resolve([])),
      apiService.getWishlist(user.id).catch(() => Promise.resolve([])),
    ]);
    setOrders(orderData);
    setAddresses(addressData);
    setWishlist((wishlistData || []).map((item: any) => item.product).filter(Boolean));
  };

  useEffect(() => {
    load().catch(error => console.error('Failed to fetch profile data:', error));
  }, [user?.id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'wishlist') setActiveTab('wishlist');
    if (tab === 'orders') setActiveTab('orders');
    if (tab === 'address') setActiveTab('address');
    if (tab === 'details') setActiveTab('details');
  }, [location.search]);

  useEffect(() => {
    const onWishlistChanged = () => load().catch(() => {});
    window.addEventListener('wishlist:changed', onWishlistChanged);
    return () => window.removeEventListener('wishlist:changed', onWishlistChanged);
  }, [user?.id]);

  const pendingOrders = orders.filter(order => order.status !== 'Delivered').length;

  const saveAddress = async (address: Partial<Address>) => {
    if (!address.street || !address.city) return;
    if (address.id) await apiService.updateAddress(address.id, address);
    else {
      await apiService.createAddress({
        type: address.type || 'home',
        street: address.street,
        city: address.city,
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || 'Nepal',
        isDefault: Boolean(address.isDefault),
      });
      setDraftAddress({ type: 'home', street: '', city: '', state: '', zipCode: '', country: 'Nepal', isDefault: false });
    }
    await load();
  };

  const deleteAddress = async (id: string) => {
    await apiService.deleteAddress(id);
    await load();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-[#f0f9ff] p-6 rounded-lg border border-blue-100">
              <h2 className="text-xl font-bold text-[var(--brand-primary)] mb-2">Hello, {user?.name || 'Customer'}!</h2>
              <p className="text-gray-600">From your account dashboard, you can view recent orders, manage addresses, and update account details.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Stat icon={ShoppingBag} label="Total Orders" value={orders.length} onClick={() => setActiveTab('orders')} />
              <Stat icon={Package} label="Pending Orders" value={pendingOrders} onClick={() => setActiveTab('orders')} />
              <Stat icon={Heart} label="Wishlist Items" value={wishlist.length} onClick={() => setActiveTab('wishlist')} />
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800">Order History</h2>
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                  <tr><th className="p-4">Order</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4">Total</th><th className="p-4">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-[var(--brand-primary)]">{order.id}</td>
                      <td className="p-4 text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="p-4"><Status status={order.status} /></td>
                      <td className="p-4 text-sm font-bold text-slate-800">NPR {order.total} for {order.items.length} items</td>
                      <td className="p-4">
                        <button onClick={() => navigate(`/order/${order.id}`)} className="text-sm font-bold text-[var(--brand-primary)] hover:underline bg-white border border-gray-200 px-3 py-1 rounded hover:bg-gray-50">View / Invoice</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'wishlist':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800">My Wishlist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map(product => <ProductCard key={product.id} product={product} onAddToCart={() => {}} />)}
            </div>
          </div>
        );
      case 'address':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800">My Addresses</h2>
            <AddressEditor address={draftAddress} onChange={setDraftAddress} onSave={() => saveAddress(draftAddress)} isNew />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map(address => (
                <AddressEditor key={address.id} address={address} onChange={(next) => setAddresses(prev => prev.map(item => item.id === address.id ? next as Address : item))} onSave={() => saveAddress(addresses.find(item => item.id === address.id) || address)} onDelete={() => deleteAddress(address.id)} />
              ))}
            </div>
          </div>
        );
      case 'details':
        return <AccountDetails user={user} />;
    }
  };

  if (loading || !user) return <div className="container mx-auto px-4 py-16 text-center text-gray-500">Loading account...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">My Account</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-6 text-center border-b border-gray-100 bg-[#f8fafc]">
              <div className="w-20 h-20 bg-[var(--brand-primary)] rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-md">{(user?.name || 'C').charAt(0)}</div>
              <h3 className="font-bold text-slate-800 text-lg">{user?.name || 'Customer'}</h3>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <nav className="p-2 space-y-1">
              <NavButton active={activeTab === 'dashboard'} icon={LayoutDashboard} label="Dashboard" onClick={() => setActiveTab('dashboard')} />
              <NavButton active={activeTab === 'orders'} icon={Package} label="Orders" onClick={() => setActiveTab('orders')} />
              <NavButton active={activeTab === 'wishlist'} icon={Heart} label="Wishlist" onClick={() => setActiveTab('wishlist')} />
              <NavButton active={activeTab === 'address'} icon={MapPin} label="Addresses" onClick={() => setActiveTab('address')} />
              <NavButton active={activeTab === 'details'} icon={Settings} label="Account Details" onClick={() => setActiveTab('details')} />
              <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition border-t border-gray-100 mt-2">
                <LogOut size={18} /> Logout
              </button>
            </nav>
          </div>
        </div>
        <div className="flex-1">{renderContent()}</div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ icon: any; label: string; value: number; onClick: () => void }> = ({ icon: Icon, label, value, onClick }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-4 hover:shadow-md transition cursor-pointer" onClick={onClick}>
    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[var(--brand-primary)]"><Icon size={24} /></div>
    <div><h3 className="font-bold text-slate-800 text-lg">{value}</h3><p className="text-sm text-gray-500">{label}</p></div>
  </div>
);

const Status: React.FC<{ status: string }> = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'Delivered' ? 'bg-green-100 text-green-700' : status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{status}</span>
);

const NavButton: React.FC<{ active: boolean; icon: any; label: string; onClick: () => void }> = ({ active, icon: Icon, label, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition ${active ? 'bg-[#f0f9ff] text-[var(--brand-primary)] font-bold border-l-4 border-[var(--brand-primary)]' : 'text-gray-600 hover:bg-gray-50'}`}>
    <Icon size={18} /> {label}
  </button>
);

const AddressEditor: React.FC<{ address: Partial<Address>; onChange: (address: Partial<Address>) => void; onSave: () => void; onDelete?: () => void; isNew?: boolean }> = ({ address, onChange, onSave, onDelete, isNew }) => (
  <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <input className="h-10 px-3 border rounded-lg text-sm" placeholder="Type" value={address.type || ''} onChange={e => onChange({ ...address, type: e.target.value })} />
      <input className="h-10 px-3 border rounded-lg text-sm" placeholder="Street" value={address.street || ''} onChange={e => onChange({ ...address, street: e.target.value })} />
      <input className="h-10 px-3 border rounded-lg text-sm" placeholder="City" value={address.city || ''} onChange={e => onChange({ ...address, city: e.target.value })} />
      <input className="h-10 px-3 border rounded-lg text-sm" placeholder="State" value={address.state || ''} onChange={e => onChange({ ...address, state: e.target.value })} />
      <input className="h-10 px-3 border rounded-lg text-sm" placeholder="Zip Code" value={address.zipCode || ''} onChange={e => onChange({ ...address, zipCode: e.target.value })} />
      <input className="h-10 px-3 border rounded-lg text-sm" placeholder="Country" value={address.country || ''} onChange={e => onChange({ ...address, country: e.target.value })} />
    </div>
    <div className="flex justify-between items-center">
      <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={Boolean(address.isDefault)} onChange={e => onChange({ ...address, isDefault: e.target.checked })} /> Default address</label>
      <div className="flex gap-2">
        {onDelete && <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>}
        <button onClick={onSave} className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-bold">{isNew ? <Plus size={16} /> : <Save size={16} />} {isNew ? 'Add Address' : 'Save'}</button>
      </div>
    </div>
  </div>
);

const AccountDetails: React.FC<{ user: any }> = ({ user }) => {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });

  const save = async () => {
    if (!user?.id) return;
    const updated = await apiService.updateUser(user.id, form);
    localStorage.setItem('user', JSON.stringify(updated));
    toast.success('Account updated');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Account Details</h2>
      <input className="w-full h-10 px-3 border rounded-lg text-sm" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Name" />
      <input className="w-full h-10 px-3 border rounded-lg text-sm" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" />
      <input className="w-full h-10 px-3 border rounded-lg text-sm" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone" />
      <button onClick={save} className="inline-flex items-center gap-2 bg-[var(--brand-primary)] text-white px-4 py-2 rounded font-medium hover:bg-[#003d61] transition"><Save size={16} /> Save Changes</button>
    </div>
  );
};
