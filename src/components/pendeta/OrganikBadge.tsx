interface OrganikBadgeProps {
  jenis: 'Organik' | 'Non-Organik';
  size?: 'sm' | 'md';
}

export function OrganikBadge({ jenis, size = 'md' }: OrganikBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider ${sizeClasses[size]} ${
        jenis === 'Organik'
          ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
          : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
      }`}
    >
      {jenis}
    </span>
  );
}
