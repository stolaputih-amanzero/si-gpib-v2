'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { requestPasswordReset } from './actions';

const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setServerError(null);
    const formData = new FormData();
    formData.append('email', data.email);

    const result = await requestPasswordReset(formData);
    
    if (result?.error) {
      setServerError(result.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 bg-surface-base py-12">
      <div className="max-w-md w-full mx-auto space-y-8 bg-surface-elevated p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-brand-primary">Lupa Password</h2>
          <p className="text-text-muted mt-2">Masukkan email Anda untuk menerima link reset password.</p>
        </div>

        {success ? (
          <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm text-center">
            Link reset password telah dikirim ke email Anda. Silakan periksa inbox atau folder spam Anda.
          </div>
        ) : (
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

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary active:bg-blue-900 min-h-[44px] disabled:opacity-50"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-brand-primary hover:underline font-medium text-sm">
            Kembali ke halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}
