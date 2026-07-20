'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerUser } from './actions';

const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  phone: z.string().regex(/^\+62[0-9]{8,13}$/, 'Harus diawali +62 dan berisi 8-13 angka'),
  password: z.string()
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
    }
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
    <div className="min-h-screen flex flex-col justify-center px-4 bg-surface-base py-12">
      <div className="max-w-md w-full mx-auto space-y-8 bg-surface-elevated p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-brand-primary">Daftar Akun</h2>
          <p className="text-text-muted mt-2">Buat akun SI GPIB baru</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {serverError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-high">Email</label>
            <input 
              {...register('email')}
              type="email"
              className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
              placeholder="user@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-high">No. Telepon / WA</label>
            <input 
              {...register('phone')}
              type="text"
              className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
              placeholder="+628123456789"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-high">Password</label>
            <input 
              {...register('password')}
              type="password"
              className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
              placeholder="Minimal 8 karakter, 1 huruf besar, 1 angka"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-text-high">Peran (Role)</label>
            <select 
              {...register('role')}
              className="mt-1 block w-full px-3 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            >
              <option value="user">User Biasa</option>
              <option value="pj">Penanggung Jawab (PJ)</option>
              <option value="kmj">Ketua Majelis Jemaat (KMJ)</option>
              <option value="admin_mupel">Admin Mupel</option>
              <option value="super_user">Super User</option>
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary active:bg-blue-900 min-h-[44px] disabled:opacity-50"
          >
            {isSubmitting ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-muted">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-brand-primary hover:underline font-medium">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
