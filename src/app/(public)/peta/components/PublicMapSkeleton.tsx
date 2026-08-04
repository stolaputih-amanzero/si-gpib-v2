export function PublicMapSkeleton() {
  return (
    <div
      className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center animate-pulse"
      role="status"
      aria-label="Memuat peta sebaran Pos Pelkes..."
    >
      <div className="text-center px-4">
        {/* Spinner */}
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-full border-4 border-gray-300 dark:border-gray-600" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#1E40AF] animate-spin" />
        </div>
        <p className="text-gray-600 dark:text-gray-300 font-medium text-base">
          Memuat peta sebaran...
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          Menyiapkan 500+ Pos Pelkes GPIB
        </p>
      </div>
    </div>
  );
}

export default PublicMapSkeleton;
