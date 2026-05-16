
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('admin') ? 'admin@example.com' : '');
  const [password, setPassword] = useState(searchParams.get('admin') ? 'admin123' : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const staffRoles = ['admin', 'super_admin', 'editor', 'sell_staff', 'crm_staff'];
      navigate(staffRoles.includes(savedUser.role) ? '/admin' : '/profile');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-400px)] py-12 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Welcome Back</h1>
        <p className="text-gray-500 text-center mb-8 text-sm">Enter your credentials to access your account.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] outline-none transition-colors"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <Link to="#" className="text-xs text-[var(--brand-primary)] hover:underline">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-center mb-4">
             <input type="checkbox" id="remember" className="rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]" />
             <label htmlFor="remember" className="ml-2 text-sm text-gray-600">Remember me</label>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <Button fullWidth size="lg" className="bg-[var(--brand-primary)] hover:bg-[#003d61]" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="text-[var(--brand-primary)] font-bold hover:underline">Register now</Link>
        </div>
      </div>
    </div>
  );
};
