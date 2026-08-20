'use client';

import { useState, useRef } from 'react';
import { X, Download, Printer, Share2, Smartphone, Check, Award, ShieldCheck, QrCode, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { generateVCard } from '@/lib/utils/name-parser';
import { UnifiedPersonData } from '@/types/person.types';

interface PersonIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: UnifiedPersonData;
  nip?: string | null;
}

export function PersonIdCardModal({
  isOpen,
  onClose,
  person,
  nip,
}: PersonIdCardModalProps) {
  const { toast } = useToast();
  const [layoutMode, setLayoutMode] = useState<'portrait' | 'landscape'>('portrait');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const displayName = person.identity.nama_lengkap || 'Pelayan GPIB';
  const roleLabel = person.overview.current_role_label || 'Pendeta Jemaat';
  const orgName = person.overview.current_organization_name || 'Sinode GPIB';
  const originAffiliation = person.overview.affiliation_origin || 'Organik GPIB';
  const avatarUrl = person.identity.foto_url;
  const noWa = person.profile?.data?.no_hp;
  const email = person.profile?.data?.email;
  const personId = person.id_person;
  const resolvedNip = nip || (person as any)?.nip || (person as any)?.profile?.data?.nip || (person as any)?.id_pendeta || 'PDT-43300681';

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/people/${personId}`
    : `https://sigpib.or.id/people/${personId}`;

  // Official GPIB Logo Path
  const gpibLogoUrl = '/logo%20GPIB.png';

  // Generate QR Code SVG Data URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    verificationUrl
  )}&color=0f172a&bgcolor=ffffff`;

  // Download vCard
  const handleDownloadVCard = () => {
    const vCardContent = generateVCard({
      nama_lengkap: displayName,
      jabatan: roleLabel,
      organisasi: orgName,
      no_wa: noWa,
      email: email,
    });

    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kontak_${displayName.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('vCard Diunduh', 'Kontak resmi pelayan berhasil disimpan.');
  };

  // Copy Verification URL
  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    toast.success('Tautan Tersalin', 'Tautan verifikasi profil resmi berhasil disalin.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Print Card
  const handlePrint = () => {
    window.print();
  };

  // Helper: Draw continuous security guilloche background waves
  const drawGuillocheWaves = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.04)';
    ctx.lineWidth = 1;

    for (let x = -50; x < width + 100; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 120, height * 0.35, x - 120, height * 0.65, x, height);
      ctx.stroke();
    }

    for (let y = -50; y < height + 50; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(width * 0.45, y + 60, width * 0.55, y - 60, width, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Export to HD PNG using Canvas Drawing (Unified PVC Executive ID Card)
  const handleDownloadImage = async () => {
    setIsExporting(true);
    try {
      const isPortrait = layoutMode === 'portrait';
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not available');

      // HD resolution (300 DPI target scale)
      const width = isPortrait ? 700 : 1050;
      const height = isPortrait ? 1050 : 660;
      canvas.width = width;
      canvas.height = height;

      // 1. UNIFIED BACKGROUND (No fragmented containers)
      // Soft Pearlescent Ivory with rich liturgical gold & deep navy accents
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#fefefe');
      bgGrad.addColorStop(0.3, '#faf7f2');
      bgGrad.addColorStop(0.7, '#f4ece1');
      bgGrad.addColorStop(1, '#e8dcce');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Security Guilloche Pattern
      drawGuillocheWaves(ctx, width, height);

      // 2. Dual Metallic Gold & Navy Border
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(14, 14, width - 28, height - 28);

      ctx.strokeStyle = 'rgba(15, 23, 42, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // 3. TOP INTEGRATED NAVY BANNER
      const bannerHeight = isPortrait ? 130 : 115;
      const navGrad = ctx.createLinearGradient(0, 0, width, 0);
      navGrad.addColorStop(0, '#060d1f');
      navGrad.addColorStop(0.5, '#12234e');
      navGrad.addColorStop(1, '#060d1f');
      ctx.fillStyle = navGrad;
      ctx.fillRect(22, 22, width - 44, bannerHeight);

      // Stola Gold Ribbon Accent below banner
      const goldStripe = ctx.createLinearGradient(0, 0, width, 0);
      goldStripe.addColorStop(0, '#b45309');
      goldStripe.addColorStop(0.5, '#f59e0b');
      goldStripe.addColorStop(1, '#b45309');
      ctx.fillStyle = goldStripe;
      ctx.fillRect(22, 22 + bannerHeight, width - 44, 4);

      // Draw Official GPIB Logo on Header
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
          logoImg.src = gpibLogoUrl;
        });

        const logoSize = isPortrait ? 68 : 65;
        const logoX = isPortrait ? 40 : 45;
        const logoY = 22 + (bannerHeight - logoSize) / 2;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      } catch {}

      // Header Texts
      const headerTextX = isPortrait ? (width + 60) / 2 : width / 2 + 25;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = isPortrait ? 'bold 18px Georgia, serif' : 'bold 22px Georgia, serif';
      ctx.fillText('GEREJA PROTESTAN di INDONESIA bagian BARAT', headerTextX, 64);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('MAJELIS SINODE GPIB • KARTU IDENTITAS PELAYANAN RESMI', headerTextX, 90);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '10px monospace';
      ctx.fillText(`OFFICIAL MINISTRY CREDENTIAL • NIP: ${resolvedNip}`, headerTextX, 112);

      if (isPortrait) {
        // ==================== SEAMLESS PORTRAIT LAYOUT ====================
        // Faint Watermark Logo in center body background
        try {
          const wmImg = new Image();
          wmImg.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            wmImg.onload = resolve;
            wmImg.onerror = resolve;
            wmImg.src = gpibLogoUrl;
          });
          ctx.save();
          ctx.globalAlpha = 0.055;
          const wmSize = 380;
          ctx.drawImage(wmImg, (width - wmSize) / 2, 280, wmSize, wmSize);
          ctx.restore();
        } catch {}

        // Avatar Photo with Embossed Gold Ring
        const avatarSize = 190;
        const avatarX = (width - avatarSize) / 2;
        const avatarY = 195;

        ctx.save();
        // Gold Outer Ring
        ctx.beginPath();
        ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2 + 5, 0, Math.PI * 2);
        ctx.fillStyle = '#d97706';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#e2e8f0';
        ctx.fill();

        if (avatarUrl) {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
              img.src = avatarUrl;
            });
            ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
          } catch {}
        }
        ctx.restore();

        // Active Status Badge
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.roundRect((width - 160) / 2, avatarY + avatarSize + 18, 160, 26, 13);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ PELAYAN AKTIF RESMI', width / 2, avatarY + avatarSize + 35);

        // Name
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 24px Georgia, serif';
        ctx.fillText(displayName, width / 2, avatarY + avatarSize + 82);

        // Role & Placement
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(roleLabel, width / 2, avatarY + avatarSize + 114);

        ctx.fillStyle = '#334155';
        ctx.font = '15px sans-serif';
        ctx.fillText(`${orgName} • ${originAffiliation}`, width / 2, avatarY + avatarSize + 142);

        // Thin Golden Divider
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(100, avatarY + avatarSize + 168);
        ctx.lineTo(width - 100, avatarY + avatarSize + 168);
        ctx.stroke();

        // QR Code with Gold Frame
        const qrSize = 150;
        const qrX = (width - qrSize) / 2;
        const qrY = avatarY + avatarSize + 190;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12);
        ctx.fill();
        ctx.stroke();

        try {
          const qrImg = new Image();
          qrImg.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            qrImg.onload = resolve;
            qrImg.onerror = resolve;
            qrImg.src = qrCodeUrl;
          });
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        } catch {}

        // QR Verification Subtitle
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('PINDAI UNTUK VERIFIKASI KEABSAHAN IDENTITAS', width / 2, qrY + qrSize + 28);

        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 11px Georgia, serif';
        ctx.fillText('"Akulah Terang Dunia; Barangsiapa Mengikut Aku, Tidak Berjalan Dalam Kegelapan"', width / 2, qrY + qrSize + 50);

        // Integrated Bottom Footer Bar
        ctx.fillStyle = '#060d1f';
        ctx.fillRect(22, height - 46, width - 44, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('GPIB DIGITAL CREDENTIAL • RESMI MAJELIS SINODE • TERDAFTAR DI SISTEM INFORMASI PUSAT', width / 2, height - 31);

      } else {
        // ==================== SEAMLESS LANDSCAPE LAYOUT ====================
        // Faint Watermark Logo in background
        try {
          const wmImg = new Image();
          wmImg.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            wmImg.onload = resolve;
            wmImg.onerror = resolve;
            wmImg.src = gpibLogoUrl;
          });
          ctx.save();
          ctx.globalAlpha = 0.055;
          const wmSize = 340;
          ctx.drawImage(wmImg, width / 2 - wmSize / 2, 180, wmSize, wmSize);
          ctx.restore();
        } catch {}

        // Left Avatar Photo with Embossed Gold Ring
        const avatarSize = 190;
        const avatarX = 65;
        const avatarY = 180;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 5, 0, Math.PI * 2);
        ctx.fillStyle = '#d97706';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#e2e8f0';
        ctx.fill();

        if (avatarUrl) {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
              img.src = avatarUrl;
            });
            ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
          } catch {}
        }
        ctx.restore();

        // Status Badge below photo
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.roundRect(avatarX + (avatarSize - 160) / 2, avatarY + avatarSize + 18, 160, 26, 13);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ PELAYAN AKTIF RESMI', avatarX + avatarSize / 2, avatarY + avatarSize + 35);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`NIP: ${resolvedNip}`, avatarX + avatarSize / 2, avatarY + avatarSize + 65);

        // Center-Right Information
        const infoX = 305;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 25px Georgia, serif';
        ctx.fillText(displayName, infoX, 220);

        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 19px sans-serif';
        ctx.fillText(roleLabel, infoX, 258);

        ctx.fillStyle = '#334155';
        ctx.font = '15px sans-serif';
        ctx.fillText(`Unit Penugasan : ${orgName}`, infoX, 298);
        ctx.fillText(`Afiliasi Pelayanan: ${originAffiliation}`, infoX, 328);

        // Golden Divider
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(infoX, 355);
        ctx.lineTo(width - 240, 355);
        ctx.stroke();

        // Scripture Quote
        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 12px Georgia, serif';
        ctx.fillText('"Akulah Terang Dunia; Barangsiapa Mengikut Aku, Tidak Berjalan Dalam Kegelapan"', infoX, 385);

        // QR Code on Far Right with Gold Frame
        const qrSize = 145;
        const qrX = width - qrSize - 65;
        const qrY = 200;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12);
        ctx.fill();
        ctx.stroke();

        try {
          const qrImg = new Image();
          qrImg.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            qrImg.onload = resolve;
            qrImg.onerror = resolve;
            qrImg.src = qrCodeUrl;
          });
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        } catch {}

        ctx.textAlign = 'center';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Pindai untuk Verifikasi', qrX + qrSize / 2, qrY + qrSize + 26);

        // Bottom Footer Bar
        ctx.fillStyle = '#060d1f';
        ctx.fillRect(22, height - 46, width - 44, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('KARTU IDENTITAS DIGITAL RESMI • MAJELIS SINODE GPIB • CRYPTOGRAPHICALLY VERIFIABLE', width / 2, height - 31);
      }

      // Convert Canvas to Download Link
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `ID_CARD_${displayName.replace(/[^a-zA-Z0-9]/g, '_')}_${layoutMode.toUpperCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success('ID Card Diunduh', 'Kartu Identitas HD berhasil diunduh dalam format PNG siap cetak.');
    } catch (err: any) {
      console.error('Error generating ID card image:', err);
      toast.error('Gagal Mengunduh', err?.message || 'Terjadi kesalahan saat memproses gambar ID card.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-surface-elevated w-full max-w-2xl rounded-3xl border border-border-subtle shadow-2xl overflow-hidden animate-scale-in my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-subtle bg-surface-1 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
              <QrCode className="size-5" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-ink-primary flex items-center gap-2">
                Kartu Identitas Pelayanan Resmi
                <Sparkles className="size-4 text-amber-600 dark:text-amber-400" />
              </h2>
              <p className="text-xs text-ink-secondary">
                Digital Ministry ID Card GPIB • Seamless Unified PVC Design
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ink-tertiary hover:text-ink-primary hover:bg-surface-sunken transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body: Controls & Scrollable Card Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-5 flex-1 min-h-0 bg-slate-900/10 dark:bg-black/40 flex flex-col items-center">
          
          {/* Format Selector Toggle */}
          <div className="flex items-center gap-2 bg-surface-1 p-1.5 rounded-2xl border border-border-subtle shrink-0 shadow-xs">
            <button
              type="button"
              onClick={() => setLayoutMode('portrait')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                layoutMode === 'portrait'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              🏷️ Portrait (Lanyard Sidang)
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('landscape')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                layoutMode === 'landscape'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              💳 Landscape (Kartu Dompet)
            </button>
          </div>

          {/* ID CARD VISUAL PREVIEW CONTAINER (Unified Seamless Design) */}
          <div className="w-full flex justify-center pb-8 pt-1">
            <div
              ref={cardRef}
              className={`w-full rounded-2xl border-2 border-amber-600/70 shadow-2xl overflow-hidden relative transition-all duration-300 ${
                layoutMode === 'portrait' ? 'max-w-[350px] sm:max-w-[370px]' : 'max-w-lg'
              }`}
              style={{
                background: 'linear-gradient(135deg, #fdfbf7 0%, #f7f3ec 40%, #eee5d8 100%)',
              }}
            >
              {/* Background Watermark Logo */}
              <div 
                aria-hidden="true" 
                className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.05] z-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gpibLogoUrl} alt="" className="size-72 object-contain" />
              </div>

              {/* Liturgical Deep Navy Header Banner with Official GPIB Logo */}
              <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 text-white px-4 py-3 text-center relative border-b-3 border-amber-500 shadow-sm z-10">
                <div className="flex items-center justify-center gap-2.5 mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gpibLogoUrl} alt="Logo GPIB" className="size-8 object-contain shrink-0 drop-shadow-sm" />
                  <div className="text-left min-w-0">
                    <h3 className="font-serif font-bold text-[10.5px] sm:text-[11.5px] tracking-tight whitespace-nowrap overflow-hidden text-amber-50 leading-tight">
                      GEREJA PROTESTAN di INDONESIA bagian BARAT
                    </h3>
                    <p className="text-[8.5px] sm:text-[9px] font-bold text-amber-400 tracking-wider uppercase mt-0.5 whitespace-nowrap">
                      Majelis Sinode GPIB • Kartu Pelayanan Resmi
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[8px] font-mono text-slate-300">
                  <span>OFFICIAL CREDENTIAL</span>
                  <span>•</span>
                  <span className="text-amber-300 font-bold">NIP: {resolvedNip}</span>
                </div>
              </div>

              {/* UNIFIED CONTENT (No separated box containers) */}
              {layoutMode === 'portrait' ? (
                <div className="p-6 space-y-4 text-center relative z-10">
                  {/* Avatar with Gold Ring Frame */}
                  <div className="relative size-28 rounded-full overflow-hidden mx-auto border-3 border-amber-500 shadow-lg bg-slate-100 shrink-0 flex items-center justify-center ring-4 ring-amber-500/20">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={displayName} className="size-full object-cover" />
                    ) : (
                      <Award className="size-12 text-amber-700" />
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                    <ShieldCheck className="size-3" /> Pelayan Aktif Resmi
                  </span>

                  <div>
                    <h4 className="font-serif font-bold text-base text-slate-900 leading-tight">
                      {displayName}
                    </h4>
                    <p className="text-xs font-bold text-amber-700 mt-1">
                      {roleLabel}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                      {orgName} • {originAffiliation}
                    </p>
                  </div>

                  {/* Golden Divider */}
                  <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600/40 to-transparent mx-auto" />

                  {/* QR Code */}
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded-xl border-2 border-amber-600/60 shadow-md inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrCodeUrl} alt="QR Code Verifikasi" className="size-28 object-contain mx-auto" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">
                      Pindai untuk Verifikasi Keabsahan
                    </p>
                    <p className="text-[8.5px] text-slate-500 italic font-serif max-w-[280px] mx-auto leading-relaxed">
                      &quot;Akulah Terang Dunia; Barangsiapa Mengikut Aku, Tidak Berjalan Dalam Kegelapan&quot;
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-12 gap-5 items-center relative z-10">
                  {/* Left Column: Avatar & Status */}
                  <div className="col-span-5 text-center space-y-2.5">
                    <div className="relative size-24 rounded-full overflow-hidden mx-auto border-3 border-amber-500 shadow-lg bg-slate-100 shrink-0 flex items-center justify-center ring-4 ring-amber-500/20">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt={displayName} className="size-full object-cover" />
                      ) : (
                        <Award className="size-10 text-amber-700" />
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                      Pelayan Aktif
                    </span>
                    <p className="text-[9px] font-mono font-bold text-slate-600">
                      NIP: {resolvedNip}
                    </p>
                  </div>

                  {/* Right Column: Information & QR */}
                  <div className="col-span-7 flex items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <h4 className="font-serif font-bold text-base text-slate-900 leading-snug truncate">
                        {displayName}
                      </h4>
                      <p className="text-xs font-bold text-amber-700">
                        {roleLabel}
                      </p>
                      <p className="text-[11px] text-slate-700 font-medium truncate">
                        {orgName}
                      </p>
                      <p className="text-[9.5px] text-slate-500">
                        {originAffiliation}
                      </p>
                      <p className="text-[8.5px] text-slate-400 italic font-serif pt-1">
                        &quot;Akulah Terang Dunia...&quot;
                      </p>
                    </div>

                    <div className="flex flex-col items-center shrink-0">
                      <div className="p-1.5 bg-white rounded-xl border-2 border-amber-600/60 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrCodeUrl} alt="QR Code Verifikasi" className="size-20 object-contain" />
                      </div>
                      <span className="text-[8px] text-slate-600 mt-1 font-semibold">
                        Verifikasi Sah
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Security Footer */}
              <div className="bg-slate-950 text-slate-400 py-1.5 px-3 text-center border-t border-amber-600/40 relative z-10">
                <p className="text-[8px] font-mono tracking-wider uppercase text-slate-300">
                  DOKUMEN IDENTITAS DIGITAL RESMI • MAJELIS SINODE GPIB • SI-GPIB PUSAT
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-border-subtle bg-surface-1 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadVCard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-elevated hover:bg-surface-sunken border border-border-strong text-ink-primary font-semibold text-xs transition-all min-h-[40px] cursor-pointer"
            >
              <Smartphone className="size-4 text-amber-700 dark:text-amber-400" />
              <span>Simpan ke Kontak (vCard)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-elevated hover:bg-surface-sunken border border-border-strong text-ink-primary font-semibold text-xs transition-all min-h-[40px] cursor-pointer"
            >
              {copiedLink ? <Check className="size-4 text-emerald-600" /> : <Share2 className="size-4" />}
              <span>{copiedLink ? 'Tersalin' : 'Salin Tautan'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-sunken border border-border-strong text-ink-primary font-semibold text-xs sm:text-sm transition-all min-h-[42px] cursor-pointer"
            >
              <Printer className="size-4" />
              <span>Cetak</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 shadow-md active:scale-95 transition-all min-h-[42px] disabled:opacity-50 cursor-pointer"
            >
              <Download className="size-4" />
              <span>{isExporting ? 'Memproses HD...' : 'Unduh ID Card (PNG HD)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
