import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Key, 
  Save, 
  LogOut, 
  Clock, 
  MapPin,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';

export const AdminProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, we'd call an API to update the profile
      // await apiService.updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      // await apiService.changePassword(formData.currentPassword, formData.newPassword);
      toast.success('Password changed successfully');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-8">
           <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-slate-700 to-slate-800 border-4 border-white/10 flex items-center justify-center text-4xl font-black overflow-hidden shadow-2xl">
                 {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover" /> : user?.name.charAt(0)}
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 bg-[var(--brand-primary)] text-white rounded-2xl shadow-xl hover:scale-110 transition-transform">
                 <Camera size={18} />
              </button>
           </div>
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-3xl font-black tracking-tight">{user?.name}</h1>
                 <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">{user?.role.replace('_', ' ')}</span>
              </div>
              <p className="text-white/40 font-medium flex items-center gap-2 text-sm">
                 <Mail size={14} /> {user?.email}
              </p>
           </div>
        </div>
        <button 
          onClick={logout}
          className="relative z-10 px-8 py-4 bg-white/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 border border-white/5"
        >
          <LogOut size={18} /> Log Out Session
        </button>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Account Info */}
         <div className="lg:col-span-2 space-y-10">
            <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
               <div className="flex items-center gap-4 pb-6 border-b border-gray-50">
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><User size={20} /></div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Account Information</h2>
               </div>
               
               <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                     <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                     <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                     />
                  </div>
                  <div className="md:col-span-2 flex justify-end pt-4">
                     <button 
                        type="submit" 
                        disabled={loading}
                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3"
                     >
                        {loading ? <Clock className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
                     </button>
                  </div>
               </form>
            </section>

            <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
               <div className="flex items-center gap-4 pb-6 border-b border-gray-50">
                  <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl"><Key size={20} /></div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Security & Privacy</h2>
               </div>
               
               <form onSubmit={handlePasswordChange} className="space-y-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                     <input 
                        type="password" 
                        value={formData.currentPassword}
                        onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                        className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-inner"
                     />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                        <input 
                           type="password" 
                           value={formData.newPassword}
                           onChange={e => setFormData({...formData, newPassword: e.target.value})}
                           className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-inner"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                        <input 
                           type="password" 
                           value={formData.confirmPassword}
                           onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                           className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-inner"
                        />
                     </div>
                  </div>
                  <div className="flex justify-end pt-4">
                     <button 
                        type="submit" 
                        disabled={loading}
                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3"
                     >
                        Update Security
                     </button>
                  </div>
               </form>
            </section>
         </div>

         {/* Stats Sidebar */}
         <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-gray-50 pb-4">Role Privileges</h3>
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shadow-sm"><CheckCircle2 size={18} /></div>
                     <div>
                        <p className="text-xs font-black text-slate-800 leading-none">Catalog Access</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">Full Management</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shadow-sm"><CheckCircle2 size={18} /></div>
                     <div>
                        <p className="text-xs font-black text-slate-800 leading-none">Finance View</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">Full Reporting</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shadow-sm"><CheckCircle2 size={18} /></div>
                     <div>
                        <p className="text-xs font-black text-slate-800 leading-none">Core Identity</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">Master Access</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-gradient-to-br from-[var(--brand-primary)] to-slate-900 rounded-[3rem] text-white shadow-2xl space-y-6">
               <Shield size={40} className="text-white/20" />
               <div>
                  <h3 className="text-xl font-black">Security Audit</h3>
                  <p className="text-white/50 text-xs font-medium mt-2 leading-relaxed">Your account is protected by enterprise-grade encryption. Last login from Kathmandu, Nepal.</p>
               </div>
               <div className="pt-4 flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Secure Connection</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
