'use client';

import { useState, useActionState } from 'react';
import { login } from './actions';
import { BiometricLogin } from '@/components/biometric/BiometricLogin';

const initialState = {
  error: '',
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 bg-surface-base">
      <div className="max-w-md w-full mx-auto space-y-8 bg-surface-elevated p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-brand-primary">SI GPIB</h2>
          <p className="text-text-muted mt-2">Login ke Sistem Informasi Pos Pelkes</p>
        </div>

        <form className="space-y-6" action={formAction}>
          {state?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-high">Email / No. HP</label>
            <input 
              id="email"
              name="email"
              type="text"
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
              placeholder="Masukkan email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-high">Password</label>
            <input 
              id="password"
              name="password"
              type="password" 
              required 
              className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
              placeholder="Masukkan password"
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary active:bg-blue-900 min-h-[44px] disabled:opacity-50 transition-all duration-micro"
          >
            {isPending ? 'Memproses...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface-elevated px-2 text-text-muted font-medium">atau</span>
          </div>
        </div>

        {/* Komponen Biometric Login */}
        <BiometricLogin email={email} />
        
      </div>
    </div>
  );
}
