'use client';

import { Wrench } from 'lucide-react';
import Link from 'next/link';

export function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <Wrench className="w-8 h-8 text-blue-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Peta Sebaran Segera Hadir
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Portal interaktif Peta Sebaran Pos Pelkes GPIB sedang dalam tahap penyempurnaan dan akan segera bisa Anda akses.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
