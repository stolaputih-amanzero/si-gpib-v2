import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#091533] via-[#0D214F] to-[#050C1E] text-white select-none">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-primary/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Glassmorphic Animated Logo Card */}
      <div className="relative z-10 flex flex-col items-center space-y-5">
        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-amber-400/25 blur-lg animate-pulse" />
          <div className="relative w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center p-4">
            <Image
              src="/logo-si-gpib.png"
              alt="Logo SI GPIB"
              width={96}
              height={96}
              priority
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
        </div>

        {/* Text & Spinner */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">
            SI GPIB
          </h2>
          <p className="text-xs text-amber-300/80 font-medium uppercase tracking-widest">
            Memuat Halaman...
          </p>
        </div>

        {/* Pulsing dots */}
        <div className="flex items-center gap-1.5 pt-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
