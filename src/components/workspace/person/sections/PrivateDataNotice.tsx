import { Lock } from 'lucide-react';

export function PrivateDataNotice() {
  return (
    <div className="p-8 text-center bg-surface-1 border border-border-dashed border-border-subtle rounded-2xl animate-tab-fade">
      <Lock size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
      <h3 className="font-bold text-text-strong text-lg">Akses Dibatasi</h3>
      <p className="text-sm text-text-muted mt-2 max-w-sm mx-auto">
        Data ini bersifat privat (EIA Privacy Matrix). Anda tidak memiliki izin untuk melihat informasi ini karena Anda bukan pemilik profil atau tidak memiliki otoritas Super User.
      </p>
    </div>
  );
}
