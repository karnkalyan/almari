
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Shield, 
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus
} from 'lucide-react';
import { apiService } from '../../services/api';
import { User, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const Staff: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const availableRoles: UserRole[] = currentUser?.role === 'super_admin' 
    ? ['editor', 'admin', 'super_admin', 'sell_staff', 'crm_staff']
    : ['editor', 'admin', 'sell_staff', 'crm_staff'];

  const fetchUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch staff list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await apiService.updateUserRole(userId, role);
      toast.success('Role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) return toast.error('You cannot delete yourself');
    if (!window.confirm('Delete this user account?')) return;
    try {
      await apiService.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  // Filter: EXCEPT customer
  const filteredUsers = users.filter(u => 
    u.role !== 'customer' && u.role !== null && (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Staff & Access</h1>
          <p className="text-gray-500 font-medium mt-1">Define permissions and manage internal team accounts.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--brand-primary)]/20 hover:opacity-90 transition-all"
        >
          <UserPlus size={18} /> Provision Account
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name, email or permissions..." 
              className="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mr-2">Quick Filter:</span>
            {['All', 'Admin', 'Editor'].map(filter => (
              <button key={filter} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 text-gray-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all">
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Member</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Level</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Connectivity</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">State</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8"><div className="h-12 bg-gray-100 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-sm border border-brand-primary/5 shadow-sm">
                          {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-2xl" /> : u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm tracking-tight">{u.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                             <Clock size={10} /> Active Member
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        value={u.role}
                        disabled={u.role === 'super_admin' && currentUser?.role !== 'super_admin'}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 outline-none cursor-pointer shadow-sm ${
                          u.role === 'super_admin' ? 'bg-purple-600 text-white' :
                          u.role === 'admin' ? 'bg-blue-600 text-white' :
                          u.role === 'editor' ? 'bg-amber-500 text-white' :
                          'bg-slate-700 text-white'
                        } ${u.role === 'super_admin' && currentUser?.role !== 'super_admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {availableRoles.map(r => (
                          <option key={r} value={r} className="text-slate-800 bg-white">{r.replace('_', ' ').toUpperCase()}</option>
                        ))}
                        {u.role === 'super_admin' && currentUser?.role !== 'super_admin' && (
                          <option value="super_admin" className="text-slate-800 bg-white">SUPER ADMIN</option>
                        )}
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                           <Mail size={12} className="text-gray-400" /> {u.email}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-2">
                           <Shield size={12} className="text-gray-300" /> Authorized Access
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Synchronized
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right relative">
                       <button 
                        onClick={() => setActiveMenu(activeMenu === u.id ? null : u.id)}
                        className={`p-2.5 rounded-xl border transition-all ${activeMenu === u.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-gray-100 text-gray-400 hover:text-slate-800 hover:border-slate-800 shadow-sm'}`}
                       >
                         <MoreVertical size={16} />
                       </button>

                       {activeMenu === u.id && (
                         <>
                           <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                           <div className="absolute right-8 top-16 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                              <div className="p-2 space-y-1">
                                 <button 
                                   onClick={() => setActiveMenu(null)}
                                   className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[var(--brand-primary)] rounded-xl transition-colors"
                                 >
                                   <Edit size={14} /> Modify Access
                                 </button>
                                 <div className="h-px bg-gray-50 my-1 mx-2"></div>
                                 <button 
                                   onClick={() => { handleDelete(u.id); setActiveMenu(null); }}
                                   className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                 >
                                   <Trash2 size={14} /> Revoke Access
                                 </button>
                              </div>
                           </div>
                         </>
                       )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                     <div className="max-w-xs mx-auto">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-300">
                           <Users size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No team members found</h3>
                        <p className="text-sm text-gray-500 font-medium">Clear your filters or add a new user to expand your team.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
