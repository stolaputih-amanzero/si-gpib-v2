'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, ShieldCheck } from 'lucide-react';

export function MobileSplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Menyiapkan Layanan Digital...');

  useEffect(() => {
    // Check if splash screen was already shown in this session
    const hasSeenSplash = sessionStorage.getItem('gpib_splash_shown');
    if (hasSeenSplash === 'true') {
      setIsVisible(false);
      return;
    }

    // Step 1: Progress animation
    const timer1 = setTimeout(() => {
      setProgress(45);
      setStatusText('Memuat Pos Pelayanan & Bajem...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Menyiapkan Sistem Informasi...');
    }, 900);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Selamat Datang');
    }, 1400);

    // Fade out and hide
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1700);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('gpib_splash_shown', 'true');
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('gpib_splash_shown', 'true');
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 select-none cursor-pointer bg-gradient-to-b from-[#091533] via-[#0D214F] to-[#050C1E] text-white transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-primary/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-[90px] pointer-events-none" />

      {/* Decorative Top Accent Tag */}
      <div className="w-full pt-safe flex items-center justify-between z-10 opacity-90 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-amber-300 tracking-wider uppercase shadow-lg">
          <Sparkles size={13} className="text-amber-400 animate-pulse" />
          <span>GPIB DIGITAL PLATFORM</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-white/60 bg-black/20 px-2.5 py-1 rounded-full border border-white/10">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span>v2.2 Official</span>
        </div>
      </div>

      {/* Main Center Branding & Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto z-10 w-full max-w-xs text-center space-y-6">
        {/* Animated Logo Container Card - NO BLACK BACKGROUND */}
        <div className="relative group">
          {/* Pulsing Outer Ring */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-amber-400/30 via-brand-primary/40 to-amber-300/20 blur-xl opacity-75 animate-pulse" />

          {/* Glassmorphic Logo Card */}
          <div className="relative w-36 h-36 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex items-center justify-center p-5 transition-transform duration-500 transform group-hover:scale-105">
            <Image
              src="/logo-si-gpib.png"
              alt="Logo SI GPIB"
              width={120}
              height={120}
              priority
              className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-700"
            />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 drop-shadow-md">
            SI GPIB
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300/90">
            Sistem Informasi GPIB
          </p>
          <p className="text-xs text-white/70 font-medium max-w-[240px] mx-auto leading-relaxed pt-1">
            Pos Pelayanan Kesaksian & Bagian Jemaat di Seluruh Indonesia
          </p>
        </div>
      </div>

      {/* Bottom Progress & Loading Footer */}
      <div className="w-full max-w-xs pb-safe space-y-3 z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
        {/* Custom Shimmer Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/10 relative p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-brand-primary rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(251,191,36,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Text */}
        <div className="flex items-center justify-between text-[11px] font-medium text-white/70 px-1">
          <span className="truncate">{statusText}</span>
          <span className="font-bold text-amber-300 tabular-nums shrink-0">{progress}%</span>
        </div>

        {/* Tap to skip hint */}
        <p className="text-[10px] text-white/40 text-center tracking-wide font-normal pt-1">
          Ketuk layar untuk melanjutkan
        </p>
      </div>
    </div>
  );
}

export default MobileSplashScreen;
