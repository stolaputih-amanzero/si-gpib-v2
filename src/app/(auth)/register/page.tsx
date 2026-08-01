'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerUser } from './actions';
import { Sparkles, Mail, Phone, Lock, UserCheck, ArrowLeft, UserPlus } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  phone: z.string().regex(/^\+62[0-9]{8,13}$/, 'Harus diawali +62 dan berisi 8-13 angka'),
  password: z
    .string()
    .min(8, 'Minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus mengandung minimal 1 huruf besar')
    .regex(/[0-9]/, 'Harus mengandung minimal 1 angka'),
  role: z.enum(['super_user', 'admin_mupel', 'kmj', 'pj', 'user']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'user',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('password', data.password);
    formData.append('role', data.role);

    const result = await registerUser(formData);

    if (result?.error) {
      setServerError(result.error);
    } else {
      router.push('/login?registered=true');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 bg-gradient-to-b from-surface-base via-surface-elevated/50 to-surface-base relative overflow-hidden">
      {/* Background Subtle Ambient Lights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto space-y-6 bg-surface-elevated/95 backdrop-blur-xl p-7 sm:p-9 rounded-3xl shadow-2xl border border-border-subtle relative z-10 animate-in fade-in zoom-in-95 duration-500">
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
            <span>Pendaftaran Akun Baru</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-brand-primary tracking-tight">
            Buat Akun SI GPIB
          </h1>
          <p className="text-text-muted mt-1 text-xs sm:text-sm font-medium">
            Lengkapi data di bawah ini untuk mendaftar akun pengguna
          </p>
        </div>

        {/* Register Form */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="p-3.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl animate-in shake duration-300">
              {serverError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-text-high mb-1">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                {...register('email')}
                id="email"
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-border-subtle rounded-xl bg-surface-base text-text-high placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/40 text-xs sm:text-sm min-h-[46px] transition-all"
                placeholder="user@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs font-medium text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-text-high mb-1">
              No. Telepon / WA
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                {...register('phone')}
                id="phone"
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-border-subtle rounded-xl bg-surface-base text-text-high placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/40 text-xs sm:text-sm min-h-[46px] transition-all"
                placeholder="+628123456789"
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs font-medium text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-text-high mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                {...register('password')}
                id="password"
                type="password"
                className="w-full pl-10 pr-4 py-3 border border-border-subtle rounded-xl bg-surface-base text-text-high placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/40 text-xs sm:text-sm min-h-[46px] transition-all"
                placeholder="Min. 8 karakter, 1 kapital, 1 angka"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs font-medium text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-bold uppercase tracking-wider text-text-high mb-1">
              Peran (Role)
            </label>
            <div className="relative">
              <UserCheck size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <select
                {...register('role')}
                id="role"
                className="w-full pl-10 pr-4 py-3 border border-border-subtle rounded-xl bg-surface-base text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary/40 text-xs sm:text-sm min-h-[46px] transition-all appearance-none cursor-pointer"
              >
                <option value="user">User Biasa</option>
                <option value="pj">Penanggung Jawab (PJ)</option>
                <option value="kmj">Ketua Majelis Jemaat (KMJ)</option>
                <option value="admin_mupel">Admin Mupel</option>
                <option value="super_user">Super User</option>
              </select>
            </div>
            {errors.role && <p className="mt-1 text-xs font-medium text-red-500">{errors.role.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-primary via-blue-700 to-brand-primary hover:opacity-95 active:scale-[0.98] shadow-lg shadow-brand-primary/20 focus:outline-none focus:ring-4 focus:ring-brand-primary/20 min-h-[48px] disabled:opacity-50 transition-all"
          >
            <UserPlus size={18} />
            <span>{isSubmitting ? 'Memproses Pendaftaran...' : 'Daftar Akun Baru'}</span>
          </button>
        </form>

        {/* Navigation Footer */}
        <div className="pt-4 text-center border-t border-border-subtle">
          <p className="text-xs text-text-muted flex items-center justify-center gap-1.5 flex-wrap">
            <span>Sudah memiliki akun?</span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-brand-primary font-extrabold hover:underline active:scale-95 transition-transform"
            >
              <ArrowLeft size={14} />
              <span>Masuk di sini (Login)</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
