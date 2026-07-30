'use client';

import { useProfileAkun, useDeviceBiometric, useRevokeDeviceBiometric } from '@/hooks/use-profile';
import { Shield, Smartphone, KeyRound, Bell, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface AkunKeamananSectionProps {
  userId?: string;
  isSelf?: boolean;
  onOpenPasswordModal?: () => void;
}

export function AkunKeamananSection({ userId, isSelf = true, onOpenPasswordModal }: AkunKeamananSectionProps) {
  const { toast, confirm } = useToast();
  const { data: akun, isLoading: isAkunLoading } = useProfileAkun(userId);
  const { data: devices, isLoading: isDevicesLoading } = useDeviceBiometric(userId);
  const revokeMutation = useRevokeDeviceBiometric();

  const handleRevokeDevice = (deviceId: string, deviceName: string) => {
    confirm({
      title: 'Cabut Perangkat Biometrik',
      message: `Apakah Anda yakin ingin mencabut perangkat biometrik "${deviceName}"? Perangkat ini tidak dapat digunakan lagi untuk login biometrik.`,
      confirmText: 'Ya, Cabut',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await revokeMutation.mutateAsync(deviceId);
          toast.success('Perangkat Dicabut', `Perangkat "${deviceName}" berhasil dicabut dari akun.`);
        } catch (err: any) {
          toast.error('Gagal Mencabut', err?.message || 'Terjadi kesalahan saat mencabut perangkat.');
        }
      },
    });
  };

  if (isAkunLoading) {
    return <div className="card-flat p-6 h-48 skeleton" />;
  }

  let lastLoginStr = 'Belum pernah';
  if (akun?.last_login_at) {
    try {
      lastLoginStr = formatDistanceToNow(new Date(akun.last_login_at), { addSuffix: true, locale: id });
    } catch {
      lastLoginStr = 'Aktif sekarang';
    }
  }

  return (
    <div className="space-y-4 animate-rise">
      {/* Account Info Card */}
      <div className="card-flat p-5 space-y-4 bg-surface-1">
        <h3 className="font-display font-semibold text-base text-ink-primary flex items-center gap-2 border-b border-line-hairline pb-3">
          <Shield size={18} className="text-brand-600" />
          <span>Informasi Akun & Otorisasi</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-ink-tertiary font-medium block">Email Terdaftar</span>
            <span className="font-mono font-semibold text-ink-primary mt-0.5 block">{akun?.email || '-'}</span>
          </div>
          <div>
            <span className="text-ink-tertiary font-medium block">Nomor Telepon / WA</span>
            <span className="font-mono font-semibold text-ink-primary mt-0.5 block">{akun?.no_hp || '-'}</span>
          </div>
          <div>
            <span className="text-ink-tertiary font-medium block">Role Akses Sistem (RBAC)</span>
            <span className="font-bold text-brand-600 uppercase mt-0.5 block">{akun?.role || 'pelayan'}</span>
          </div>
          <div>
            <span className="text-ink-tertiary font-medium block">Login Terakhir</span>
            <span className="font-medium text-ink-primary mt-0.5 block tnum">{lastLoginStr}</span>
          </div>
        </div>

        {isSelf && onOpenPasswordModal && (
          <div className="pt-2 border-t border-line-hairline">
            <button
              type="button"
              onClick={onOpenPasswordModal}
              className="btn btn-secondary w-full sm:w-auto min-h-[48px] text-xs sm:text-sm font-semibold"
            >
              <KeyRound size={16} />
              <span>Ganti Kata Sandi</span>
            </button>
          </div>
        )}
      </div>

      {/* Biometric Devices Card */}
      <div className="card-flat p-5 space-y-4 bg-surface-1">
        <div className="flex items-center justify-between border-b border-line-hairline pb-3">
          <h3 className="font-display font-semibold text-base text-ink-primary flex items-center gap-2">
            <Smartphone size={18} className="text-purple-600" />
            <span>Perangkat Biometrik (Passkey)</span>
          </h3>
          <span className="text-xs font-mono text-ink-tertiary tnum">
            {devices?.length || 0} Terdaftar
          </span>
        </div>

        {isDevicesLoading ? (
          <div className="h-20 skeleton" />
        ) : devices && devices.length > 0 ? (
          <div className="space-y-2">
            {devices.map((device) => (
              <div
                key={device.id}
                className="p-3.5 rounded-2xl bg-surface-sunken border border-line-subtle flex items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-ink-primary truncate">
                      {device.friendly_name || 'Perangkat Sidik Jari / Passkey'}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      {device.device_type || 'Platform'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-tertiary tnum">
                    Terakhir digunakan:{' '}
                    {device.last_used_at
                      ? formatDistanceToNow(new Date(device.last_used_at), { addSuffix: true, locale: id })
                      : 'Aktif'}
                  </p>
                </div>

                {isSelf && (
                  <button
                    type="button"
                    onClick={() => handleRevokeDevice(device.id, device.friendly_name || 'Perangkat Biometrik')}
                    disabled={revokeMutation.isPending}
                    className="p-2.5 rounded-xl text-bad hover:bg-bad-soft transition-all min-h-[48px] min-w-[48px] flex items-center justify-center shrink-0"
                    title="Cabut Perangkat"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-surface-sunken border border-line-subtle text-center space-y-2">
            <p className="text-xs text-ink-secondary">
              Belum ada perangkat biometrik terdaftar untuk akun ini.
            </p>
          </div>
        )}
      </div>

      {/* Push Notifications Card */}
      <div className="card-flat p-5 space-y-3 bg-surface-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink-primary">Notifikasi Push Perangkat</h4>
              <p className="text-xs text-ink-tertiary">Pemberitahuan bantuan, permohonan pos, & pengingat pastoral</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-ok-soft text-ok border border-ok/20 shrink-0">
            <CheckCircle2 size={14} /> Aktif
          </span>
        </div>
      </div>
    </div>
  );
}
