'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-error" />
      </div>
      
      <h2 className="text-xl font-bold text-text-high mb-2">
        Terjadi Kesalahan
      </h2>
      
      <p className="text-sm text-text-muted mb-8 max-w-xs mx-auto">
        Maaf, kami mengalami masalah saat memuat data. Silakan coba lagi.
      </p>
      
      <button
        onClick={() => reset()}
        className="flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-blue-800 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary min-h-[44px] min-w-[140px] transition-colors"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Coba Lagi
      </button>
    </div>
  );
}
