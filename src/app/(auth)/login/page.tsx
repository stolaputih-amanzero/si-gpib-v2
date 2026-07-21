'use client';

import Image from 'next/image';
import { useState, useActionState } from 'react';
import { login } from './actions';
import { BiometricLogin } from '@/components/biometric/BiometricLogin';
import { Sparkles, Lock, Mail } from 'lucide-react';

const initialState = {
  error: '',
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-gradient-to-b from-surface-base via-surface-elevated/50 to-surface-base relative overflow-hidden">
      {/* Background Subtle Ambient Lights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto space-y-7 bg-surface-elevated/95 backdrop-blur-xl p-7 sm:p-9 rounded-3xl shadow-2xl border border-border-subtle relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Header Branding */}
        <div className="text-center flex flex-col items-center">
          <div className="relative group mb-3">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-400/30 to-brand-primary/40 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-20 h-20 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 p-3.5 flex items-center justify-center shadow-soft">
              <Image 
                src="/logo-si-gpib.png" 
                alt="Logo SI GPIB" 
                width={72} 
                height={72} 
                className="w-full h-full object-contain filter drop-shadow-sm"
                priority
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-extrabold uppercase tracking-widest mb-1.5 border border-brand-primary/20">
            <Sparkles size={12} className="text-amber-500" />
            <span>Sistem Informasi GPIB</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-brand-primary tracking-tight">
            Selamat Datang
          </h1>
          <p className="text-text-muted mt-1 text-xs sm:text-sm font-medium">
            Masuk ke Sistem Informasi Pos Pelayanan Kesaksian
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-4" action={formAction}>
          {state?.error && (
            <div className="p-3.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl animate-in shake duration-300">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-text-high mb-1">
              Email / No. HP
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input 
                id="email"
                name="email"
                type="text"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border-subtle rounded-xl bg-surface-base text-text-high placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/40 text-xs sm:text-sm min-h-[46px] transition-all"
                placeholder="Masukkan email atau no. hp terdaftar"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-text-high mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input 
                id="password"
                name="password"
                type="password" 
                required 
                className="w-full pl-10 pr-4 py-3 border border-border-subtle rounded-xl bg-surface-base text-text-high placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/40 text-xs sm:text-sm min-h-[46px] transition-all"
                placeholder="Masukkan kata sandi"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full mt-2 flex justify-center items-center py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-primary via-blue-700 to-brand-primary hover:opacity-95 active:scale-[0.98] shadow-lg shadow-brand-primary/20 focus:outline-none focus:ring-4 focus:ring-brand-primary/20 min-h-[48px] disabled:opacity-50 transition-all"
          >
            {isPending ? 'Memproses Masuk...' : 'Masuk ke Aplikasi'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-extrabold tracking-widest">
            <span className="bg-surface-elevated px-3 text-text-muted">Atau Gunakan Biometrik</span>
          </div>
        </div>

        {/* Biometric Login */}
        <BiometricLogin email={email} />
      </div>
    </div>
  );
}
