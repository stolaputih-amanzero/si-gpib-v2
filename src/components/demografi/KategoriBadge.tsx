import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';

interface KategoriBadgeProps {
  kode: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function KategoriBadge({ kode, size = 'md', showLabel = true }: KategoriBadgeProps) {
  const kategori = KATEGORI_PELKAT.find(k => k.kode === kode);
  
  if (!kategori) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        {kode}
      </span>
    );
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} transition-colors`}
      style={{ 
        backgroundColor: `${kategori.warna}1A`, // ~10% opacity for soft luxury background
        color: kategori.warna,
        border: `1px solid ${kategori.warna}33` // ~20% opacity border
      }}
    >
      <span className="leading-none">{kategori.icon}</span>
      {showLabel && <span>{kategori.nama}</span>}
    </span>
  );
}
