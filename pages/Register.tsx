
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export const Register: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-400px)] py-12 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Create Account</h1>
        <p className="text-gray-500 text-center mb-8 text-sm">Join Almari Nepal for exclusive offers.</p>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] outline-none transition-colors"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] outline-none transition-colors"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] outline-none transition-colors"
              placeholder="Create a strong password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] outline-none transition-colors"
              placeholder="Repeat password"
            />
          </div>
          
          <div className="flex items-start mb-4">
             <input type="checkbox" id="terms" required className="mt-1 rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]" />
             <label htmlFor="terms" className="ml-2 text-sm text-gray-600">I agree to the <Link to="#" className="text-[var(--brand-primary)] hover:underline">Terms of Service</Link> and <Link to="#" className="text-[var(--brand-primary)] hover:underline">Privacy Policy</Link>.</label>
          </div>

          <Button fullWidth size="lg" className="bg-[var(--brand-primary)] hover:bg-[#003d61]">Create Account</Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-[var(--brand-primary)] font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
};
