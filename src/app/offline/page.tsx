'use client';

import { WifiOff, Map, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-base">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <WifiOff className="w-10 h-10 text-brand-primary" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2 text-center text-text-high">
        Anda Sedang Offline
      </h1>
      
      <p className="text-text-muted text-center mb-8 max-w-sm">
        Data yang sudah dilihat tetap bisa diakses. 
        Form yang sedang diisi tersimpan otomatis dan akan dikirimkan saat jaringan kembali.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <button 
          onClick={() => window.location.href = '/pos-pelkes'} 
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary min-h-[44px]"
        >
          <Map className="w-5 h-5 mr-2" />
          Lihat Data Pos Pelkes Tersimpan
        </button>
        
        <button 
          onClick={() => window.location.reload()} 
          className="w-full flex justify-center items-center py-3 px-4 border border-brand-primary rounded-md shadow-sm text-sm font-medium text-brand-primary bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary min-h-[44px]"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Cek Koneksi Internet
        </button>
      </div>

      <p className="text-xs text-text-muted mt-8 text-center px-4">
        Tip: Aktifkan mode pesawat lalu matikan lagi untuk merefresh koneksi.
      </p>
    </div>
  );
}
