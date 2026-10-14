import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Shield, 
  Trash2, 
  Edit2, 
  X, 
  Lock, 
  UserCheck, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { apiService } from '../../services/api';
import { User, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const Staff: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer' as UserRole
  });

  // Edit user form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer' as UserRole,
    password: ''
  });

  const availableRolesForCreation: { value: UserRole; label: string }[] = [
    { value: 'customer', label: 'Customer' },
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'sell_staff', label: 'Sales Staff' },
    { value: 'crm_staff', label: 'CRM Staff' },
    ...(currentUser?.role === 'super_admin' ? [{ value: 'super_admin' as UserRole, label: 'Super Admin' }] : [])
  ];

  const fetchUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      toast.error('Name, email, and password are required');
      return;
    }
    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createUser({
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        phone: newUser.phone.trim() || undefined,
        role: newUser.role
      });
      toast.success('User added successfully');
      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'customer'
      });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await apiService.updateUserRole(userId, role);
      toast.success('User role updated');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: (user.role as UserRole) || 'customer',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    try {
      const updatePayload: any = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim() || null,
        role: editFormData.role
      };
      if (editFormData.password.trim()) {
        updatePayload.password = editFormData.password.trim();
      }

      await apiService.updateUser(editingUser.id, updatePayload);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userToDelete: User) => {
    // Crucial restriction: Admin cannot remove super admin
    if (userToDelete.role === 'super_admin') {
      toast.error('Super admin accounts cannot be deleted');
      return;
    }
    if (userToDelete.id === currentUser?.id) {
      toast.error('You cannot delete your own account');
      return;
    }

    const confirmMsg = `Are you sure you want to delete user "${userToDelete.name}" (${userToDelete.email})?\n\nThis will remove the user and their associated data. This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await apiService.deleteUser(userToDelete.id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedRoleFilter === 'all') return true;
    if (selectedRoleFilter === 'admin') return u.role === 'admin';
    if (selectedRoleFilter === 'super_admin') return u.role === 'super_admin';
    if (selectedRoleFilter === 'staff') return ['editor', 'sell_staff', 'crm_staff'].includes(u.role);
    if (selectedRoleFilter === 'customer') return u.role === 'customer' || !u.role;

    return true;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200"><Shield size={12} /> Super Admin</span>;
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200"><Shield size={12} /> Admin</span>;
      case 'editor':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">Editor</span>;
      case 'sell_staff':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">Sales</span>;
      case 'crm_staff':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-700 border border-cyan-200">CRM</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">Customer</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manage Users</h1>
          <p className="text-gray-500 font-medium mt-1">Add, manage, and remove administrators, staff, and customer accounts.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[var(--brand-primary)]/20 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or role..." 
            className="w-full h-11 pl-12 pr-4 bg-gray-50 border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)] transition-all font-medium text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1 hidden sm:inline">Role Filter:</span>
          {[
            { id: 'all', label: 'All Users' },
            { id: 'admin', label: 'Admins' },
            { id: 'staff', label: 'Staff' },
            { id: 'customer', label: 'Customers' },
            ...(currentUser?.role === 'super_admin' ? [{ id: 'super_admin', label: 'Super Admin' }] : [])
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedRoleFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedRoleFilter === f.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-5">User</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Contact</th>
                <th className="px-6 py-5">Joined</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6">
                      <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isSuperAdmin = u.role === 'super_admin';
                  const isSelf = u.id === currentUser?.id;
                  const canDelete = !isSuperAdmin && !isSelf;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* User Info */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-sm border border-slate-200/50 shadow-sm overflow-hidden flex-shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                              {u.name}
                              {isSelf && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black uppercase">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                              <Mail size={12} className="text-gray-400" />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role selection/badge */}
                      <td className="px-6 py-5">
                        {isSuperAdmin ? (
                          <div className="flex items-center gap-1.5">
                            {getRoleBadge(u.role)}
                            <Lock size={12} className="text-purple-600" title="Protected role" />
                          </div>
                        ) : (
                          <select
                            value={u.role || 'customer'}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            disabled={currentUser?.role !== 'super_admin' && currentUser?.role !== 'admin'}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 focus:ring-2 focus:ring-[var(--brand-primary)]/20 outline-none cursor-pointer shadow-sm text-slate-700"
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="sell_staff">Sales Staff</option>
                            <option value="crm_staff">CRM Staff</option>
                            {currentUser?.role === 'super_admin' && (
                              <option value="super_admin">Super Admin</option>
                            )}
                          </select>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-5">
                        <div className="space-y-1 text-xs text-slate-600">
                          {u.phone ? (
                            <p className="flex items-center gap-1.5 font-medium">
                              <Phone size={12} className="text-gray-400" /> {u.phone}
                            </p>
                          ) : (
                            <span className="text-gray-400 italic">No phone recorded</span>
                          )}
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-5">
                        <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                          <Calendar size={12} className="text-gray-400" />
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Edit User"
                            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                          >
                            <Edit2 size={16} />
                          </button>

                          {isSuperAdmin ? (
                            <span 
                              title="Super admin accounts are protected and cannot be deleted"
                              className="px-2.5 py-1.5 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-not-allowed"
                            >
                              <Lock size={12} /> Protected
                            </span>
                          ) : isSelf ? (
                            <span 
                              title="You cannot delete yourself"
                              className="px-2.5 py-1.5 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-bold cursor-not-allowed"
                            >
                              Current
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDelete(u)}
                              title="Delete User"
                              className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="max-w-sm mx-auto text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Users size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">No users found</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Try adjusting your search query or role filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800">Add User</h3>
                <p className="text-xs text-gray-500 mt-0.5">Create a new user account with specific role and permissions.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-slate-800 hover:bg-gray-100 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+977 9800000000"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  User Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] outline-none transition font-medium cursor-pointer"
                >
                  {availableRolesForCreation.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {currentUser?.role !== 'super_admin' && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Note: Super Admin accounts can only be created by Super Admins.
                  </p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[var(--brand-primary)] text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800">Edit User</h3>
                <p className="text-xs text-gray-500 mt-0.5">Modify account information and permissions.</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="p-2 text-gray-400 hover:text-slate-800 hover:bg-gray-100 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+977 9800000000"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Reset Password (leave empty to keep current)
                </label>
                <input
                  type="password"
                  minLength={6}
                  placeholder="New password (optional)"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  User Role
                </label>
                <select
                  value={editFormData.role}
                  disabled={editingUser.role === 'super_admin' && currentUser?.role !== 'super_admin'}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] outline-none transition font-medium cursor-pointer disabled:opacity-50"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="sell_staff">Sales Staff</option>
                  <option value="crm_staff">CRM Staff</option>
                  {currentUser?.role === 'super_admin' && (
                    <option value="super_admin">Super Admin</option>
                  )}
                  {editingUser.role === 'super_admin' && currentUser?.role !== 'super_admin' && (
                    <option value="super_admin">Super Admin (Locked)</option>
                  )}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[var(--brand-primary)] text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
