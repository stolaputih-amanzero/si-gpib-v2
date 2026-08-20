'use client';

import { useState } from 'react';
import { X, QrCode, Check, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { UnifiedPersonData } from '@/types/person.types';

interface PersonQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: UnifiedPersonData;
  nip?: string | null;
}

export function PersonQrCodeModal({
  isOpen,
  onClose,
  person,
  nip,
}: PersonQrCodeModalProps) {
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const displayName = person.identity.nama_lengkap || 'Pelayan GPIB';
  const roleLabel = person.overview.current_role_label || 'Pelayan GPIB';
  const orgName = person.overview.current_organization_name || 'Sinode GPIB';
  const personId = person.id_person;
  const resolvedNip = nip || (person as any)?.nip || (person as any)?.profile?.data?.nip || (person as any)?.id_pendeta;

  const getPublicBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return origin;
      }
    }
    return process.env.NEXT_PUBLIC_PUBLIC_URL || 'https://sigpib.amanzero.space';
  };

  const verificationUrl = `${getPublicBaseUrl()}/people/${personId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
    verificationUrl
  )}&color=0f172a&bgcolor=ffffff`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    toast.success('Tautan Tersalin', 'Tautan verifikasi profil berhasil disalin ke papan klip.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-elevated w-full max-w-sm rounded-2xl border border-border-subtle shadow-2xl overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border-subtle bg-surface-sunken">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <QrCode className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-high">QR Verifikasi</h2>
              <p className="text-[11px] text-text-muted">Pindai untuk verifikasi profil resmi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-high hover:bg-surface-elevated transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body: Clean QR Code */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-white rounded-2xl border-2 border-amber-600/30 shadow-md inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt={`QR Code ${displayName}`}
              className="size-48 sm:size-52 object-contain"
            />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-sm text-text-high leading-tight">
              {displayName}
            </h3>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              {roleLabel}
            </p>
            <p className="text-[11px] text-text-muted">
              {orgName} {resolvedNip ? `• NIP: ${resolvedNip}` : ''}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-surface-sunken border-t border-border-subtle flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface-base border border-border-strong text-xs font-bold text-text-high transition-all cursor-pointer min-h-[38px]"
          >
            {copiedLink ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5 text-text-muted" />}
            <span>{copiedLink ? 'Tersalin' : 'Salin Tautan'}</span>
          </button>

          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer min-h-[38px]"
          >
            <ExternalLink className="size-3.5" />
            <span>Buka</span>
          </a>
        </div>
      </div>
    </div>
  );
}
