'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useJemaatDetail, usePosByJemaat, useDeletePos, PosPelkesItem, useDeleteJemaat } from '@/hooks/use-hierarki';
import { BreadcrumbNav } from '@/components/hierarki/BreadcrumbNav';
import { KMJSelector } from '@/components/hierarki/KMJSelector';
import { JemaatFormModal } from '@/components/hierarki/JemaatFormModal';
import { PJSelector } from '@/components/hierarki/PJSelector';
import { StatusElevationModal } from '@/components/hierarki/StatusElevationModal';
import { SecureDeleteModal } from '@/components/ui/SecureDeleteModal';
import { useToast } from '@/components/ui/toast';
import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PosThumbnailMapWrapper from '@/components/maps/PosThumbnailMapWrapper';
import { ShareButton } from '@/components/mobile/ShareButton';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateDistanceKm } from '@/lib/utils/distance';
import {
  Church,
  UserCheck,
  HeartHandshake,
  MapPin,
  ChevronRight,
  Navigation,
  AlertCircle,
  Plus,
  Search,
  PhoneCall,
  UserPlus,
  Building,
  Sprout,
  TrendingUp,
  Edit3,
  Trash2,
  Home,
  User,
  Compass,
  ExternalLink,
  Map,
  Eye,
  X,
} from 'lucide-react';

interface JemaatDetailClientProps {
  id_mupel: string;
  id_induk: string;
}

export function JemaatDetailClient({ id_mupel, id_induk }: JemaatDetailClientProps) {
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUser();
  const isSuperUser = isSuperUserRole(currentUser?.role);
  const [searchPos, setSearchPos] = useState('');
  const [showKmjModal, setShowKmjModal] = useState(false);
  const [showPjModal, setShowPjModal] = useState(false);
  const [showJemaatModal, setShowJemaatModal] = useState(false);
  const [showDeleteJemaatModal, setShowDeleteJemaatModal] = useState(false);
  const [showJemaatLightbox, setShowJemaatLightbox] = useState(false);

  // Pos Elevation Modal State
  const [showElevateModal, setShowElevateModal] = useState(false);
  const [elevatePosItem, setElevatePosItem] = useState<{ id_pos: string; nama_pos: string; kategori?: string | null; id_induk: string } | null>(null);

  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const deleteJemaatMutation = useDeleteJemaat();

  const handleConfirmDeleteJemaat = async () => {
    try {
      await deleteJemaatMutation.mutateAsync(id_induk);
      toast.success('Berhasil Dihapus', `Jemaat Induk "${jemaat?.nama_induk}" telah dihapus.`);
      setShowDeleteJemaatModal(false);
      router.push(`/hierarki/${encodeURIComponent(id_mupel)}`);
    } catch (err: any) {
      toast.error('Gagal Menghapus', err?.message || 'Gagal menghapus Jemaat Induk.');
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: jemaat, isLoading: isLoadingJemaat } = useJemaatDetail(id_induk);
  const { data: posList, isLoading: isLoadingPos } = usePosByJemaat(id_induk, searchPos);
  const deletePosMutation = useDeletePos();

  const bajemList = (posList || []).filter(
    (p) => p.kategori === 'Bajem' || p.nama_pos.toLowerCase().startsWith('bajem')
  );
  const posPelkesOnly = (posList || []).filter(
    (p) => p.kategori !== 'Bajem' && !p.nama_pos.toLowerCase().startsWith('bajem')
  );

  const handleOpenAddPos = () => {
    const currentPath = `/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}`;
    router.push(`/dashboard/pos-pelkes/baru?id_induk=${encodeURIComponent(id_induk)}&id_mupel=${encodeURIComponent(id_mupel)}&from=${encodeURIComponent(currentPath)}`);
  };

  const handleOpenEditPos = (e: React.MouseEvent, pos: PosPelkesItem) => {
    e.preventDefault();
    e.stopPropagation();
    const currentPath = `/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}`;
    router.push(`/dashboard/pos-pelkes/${encodeURIComponent(pos.id_pos)}/edit?from=${encodeURIComponent(currentPath)}`);
  };

  const handleOpenElevate = (e: React.MouseEvent, pos: PosPelkesItem) => {
    e.preventDefault();
    e.stopPropagation();
    setElevatePosItem({
      id_pos: pos.id_pos,
      nama_pos: pos.nama_pos,
      kategori: pos.kategori,
      id_induk: pos.id_induk,
    });
    setShowElevateModal(true);
  };

  const handleDeletePos = async (e: React.MouseEvent, pos: PosPelkesItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Apakah Anda yakin ingin menghapus Pos Pelkes/Bajem "${pos.nama_pos}"?`)) {
      try {
        await deletePosMutation.mutateAsync(pos.id_pos);
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus Pos Pelkes.');
      }
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6 pb-12">
        <BreadcrumbNav
          items={[
            { label: id_mupel, href: `/hierarki/${encodeURIComponent(id_mupel)}` },
            { label: id_induk, isCurrent: true },
          ]}
        />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Breadcrumb Nav */}
      <BreadcrumbNav
        items={[
          { label: jemaat?.mupel?.nama_mupel || id_mupel, href: `/hierarki/${encodeURIComponent(id_mupel)}` },
          { label: jemaat?.nama_induk || id_induk, isCurrent: true },
        ]}
      />

      {/* 2. Hero Header Banner Jemaat Induk */}
      {isLoadingJemaat ? (
        <Skeleton className="h-48 sm:h-64 w-full rounded-3xl" />
      ) : (
        <div className="relative rounded-3xl overflow-hidden border border-border-subtle bg-surface-elevated shadow-medium group">
          {/* Top Visual Showcase / Photo Cover */}
          {jemaat?.foto_url ? (
            <div className="relative h-48 sm:h-64 md:h-72 w-full bg-slate-950 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={jemaat.foto_url}
                alt={`Foto Gedung ${jemaat.nama_induk}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-slate-950/40 to-slate-950/20" />

              {/* Floating Top Badges */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/20 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Church size={13} className="text-purple-400" />
                  <span>Jemaat Induk</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-black/50 backdrop-blur-md text-white/90 border border-white/10 text-[11px] font-bold">
                  Mupel: {jemaat?.mupel?.nama_mupel || id_mupel} ({id_mupel})
                </span>
              </div>

              {/* Top Right Floating Action: Fullscreen Lightbox Button */}
              <button
                type="button"
                onClick={() => setShowJemaatLightbox(true)}
                className="absolute top-4 right-4 z-20 min-h-[40px] px-3 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Lihat Foto Layar Penuh"
              >
                <Eye size={16} />
                <span className="hidden sm:inline">Layar Penuh</span>
              </button>
            </div>
          ) : (
            <div className="relative h-32 sm:h-44 w-full bg-gradient-to-br from-brand-primary via-indigo-900 to-purple-950 p-5 overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
                <Church className="w-64 h-64 text-white" />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Church size={13} className="text-purple-300" />
                  <span>Jemaat Induk Mandiri</span>
                </span>
              </div>
            </div>
          )}

          {/* Info Details & Actions Bar (Integrated with Photo) */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              {/* Church Avatar & Title Block */}
              <div className="flex items-start gap-4">
                <div className={cn(
                  "relative z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-elevated border-4 border-surface-elevated shadow-lg flex items-center justify-center text-brand-primary shrink-0 ring-1 ring-border-subtle",
                  jemaat?.foto_url ? "-mt-12 sm:-mt-14" : ""
                )}>
                  <Church className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-md border border-purple-200/60">
                      {id_induk}
                    </span>
                    <span className="text-xs font-semibold text-text-muted">
                      {jemaat?.mupel?.nama_mupel || id_mupel}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-text-high tracking-tight leading-tight uppercase">
                    {jemaat?.nama_induk}
                  </h1>
                  {jemaat?.alamat && (
                    <p className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                      <MapPin size={14} className="text-emerald-600 shrink-0" />
                      <span>{jemaat.alamat}</span>
                    </p>
                  )}
                  {jemaat?.keterangan && (
                    <p className="text-xs italic text-text-muted">
                      {jemaat.keterangan}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <ShareButton
                  title={`Jemaat Induk GPIB: ${jemaat?.nama_induk}`}
                  text={`Jemaat Induk: ${jemaat?.nama_induk}\nMupel: ${jemaat?.mupel?.nama_mupel}\nKMJ: ${jemaat?.kmj?.nama_lengkap || 'Belum ada'}\nAlamat: ${jemaat?.alamat || '-'}`}
                  variant="ghost"
                  iconOnly
                />

                <button
                  type="button"
                  onClick={() => setShowJemaatModal(true)}
                  className="min-h-[40px] px-4 py-2 rounded-xl border border-brand-primary/20 bg-brand-primary/5 hover:bg-brand-primary/10 text-xs font-extrabold text-brand-primary flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  <Edit3 size={15} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteJemaatModal(true)}
                  disabled={deleteJemaatMutation.isPending}
                  className="min-h-[40px] px-4 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-extrabold text-red-600 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 size={15} />
                  <span>Hapus</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddPos}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-extrabold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Pos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="profil" className="w-full">
        {/* Scrollable Tabs Trigger Container */}
        <div className="border-b border-border-subtle mb-6 bg-surface-elevated rounded-xl p-1 shadow-soft">
          <TabsList className="flex items-center justify-start overflow-x-auto w-full h-11 bg-transparent p-0 gap-1 scrollbar-none">
            <TabsTrigger 
              value="profil" 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg"
            >
              <Home size={14} />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pos-pelkes" 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg"
            >
              <Building size={14} />
              <span>Pos Pelkes & Bajem</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pendeta" 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg"
            >
              <User size={14} />
              <span>Ketua Majelis (KMJ)</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: PROFIL */}
        <TabsContent value="profil" className="space-y-4 focus-visible:outline-none">
          {/* Stat Cards Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft space-y-1 text-center">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Sektor</span>
              <p className="text-xl font-black text-text-high tabular-nums">{jemaat?.jumlah_sektor ?? 0}</p>
            </div>

            <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft space-y-1 text-center">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total KK</span>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{jemaat?.jumlah_kk ?? 0}</p>
            </div>

            <div className="bg-surface-elevated p-3.5 rounded-2xl border border-border-subtle shadow-soft space-y-1 text-center">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Jiwa</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{jemaat?.jumlah_jiwa ?? 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lokasi & Wilayah */}
            <Card className="md:col-span-2 border-border-subtle shadow-soft">
              <CardHeader className="pb-3 border-b border-border-subtle">
                <CardTitle className="flex items-center gap-2 text-base font-extrabold text-text-high">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                  Informasi Lokasi & Wilayah
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Alamat Jemaat</span>
                  <p className="text-sm font-medium text-text-high leading-relaxed">{jemaat?.alamat || 'Alamat belum diisi'}</p>
                </div>

                <div className="pt-2 border-t border-border-subtle">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Mupel</span>
                  <p className="text-sm font-semibold text-text-high">{jemaat?.mupel?.nama_mupel || id_mupel}</p>
                </div>

                {jemaat?.latitude && jemaat?.longitude ? (
                  <div className="space-y-4 pt-3 border-t border-border-subtle">
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Peta Lokasi</span>
                      <div className="h-48 w-full rounded-xl overflow-hidden border border-border-subtle">
                        <PosThumbnailMapWrapper 
                          latitude={jemaat.latitude} 
                          longitude={jemaat.longitude} 
                          nama_pos={jemaat.nama_induk} 
                          alamat={jemaat.alamat} 
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-sunken/50 p-3.5 rounded-xl border border-border-subtle/50">
                      <div className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-brand-primary shrink-0" />
                        <div className="text-xs font-semibold text-text-high space-y-0.5">
                          <div>Lintang (Lat): {jemaat.latitude}</div>
                          <div>Bujur (Lng): {jemaat.longitude}</div>
                        </div>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${jemaat.latitude},${jemaat.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[36px] px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Map size={14} />
                        <span>Petunjuk Rute Map</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    <span>Koordinat GPS belum disetel untuk gereja induk ini.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Keterangan */}
            <Card className="border-border-subtle shadow-soft h-full flex flex-col">
              <CardHeader className="pb-3 border-b border-border-subtle">
                <CardTitle className="text-base font-extrabold text-text-high">Keterangan / Catatan</CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col justify-start">
                {jemaat?.keterangan ? (
                  <p className="text-xs text-text-muted whitespace-pre-wrap leading-relaxed italic">
                    "{jemaat.keterangan}"
                  </p>
                ) : (
                  <p className="text-xs text-text-muted italic my-auto text-center py-6">
                    Tidak ada keterangan tambahan yang diisi.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: POS PELKES & BAJEM */}
        <TabsContent value="pos-pelkes" className="space-y-6 focus-visible:outline-none">
          {/* Search Bar for Pos / Bajem */}
          <div className="relative bg-surface-elevated p-3 rounded-2xl border border-border-subtle shadow-soft">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari Pos Pelkes atau Bajem..."
              value={searchPos}
              onChange={(e) => setSearchPos(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-border-subtle bg-surface-base text-xs sm:text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Section Bakal Jemaat (Bajem) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-black text-text-high">
                  Bakal Jemaat / Bajem ({bajemList.length})
                </h2>
              </div>
            </div>

            {bajemList.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-muted flex items-center gap-2">
                <Sprout size={16} className="text-purple-500 opacity-60" />
                <span>Belum ada Bajem terdaftar di bawah Jemaat Induk ini.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bajemList.map((bajem) => {
                  const distKm = calculateDistanceKm(jemaat?.latitude, jemaat?.longitude, bajem.latitude, bajem.longitude);

                  return (
                    <div
                      key={bajem.id_pos}
                      className="bg-surface-elevated p-4 rounded-2xl border border-purple-200 dark:border-purple-900/40 shadow-soft hover:border-purple-400 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                              {bajem.id_pos} • Bajem
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              {bajem.jumlah_kk || 0} KK • {bajem.jumlah_jiwa || 0} Jiwa
                            </span>
                            {distKm !== null && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 flex items-center gap-1" title="Jarak dari Jemaat Induk">
                                <Navigation size={10} className="text-blue-600 dark:text-blue-400" />
                                <span>{distKm} km dari Induk</span>
                              </span>
                            )}
                          </div>

                          <h3 className="font-extrabold text-base text-text-high">{bajem.nama_pos}</h3>
                          {bajem.alamat && <p className="text-xs text-text-muted line-clamp-1">{bajem.alamat}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isSuperUser && (
                            <button
                              type="button"
                              onClick={(e) => handleOpenElevate(e, bajem)}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-purple-700 transition-colors shadow-xs min-h-[36px]"
                              title="Tingkatkan Status ke Jemaat Induk"
                            >
                              <TrendingUp size={14} />
                              <span className="hidden sm:inline">Elevasi</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleOpenEditPos(e, bajem)}
                            className="p-2 rounded-xl text-text-muted hover:text-brand-primary hover:bg-surface-sunken transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Edit Bajem"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeletePos(e, bajem)}
                            className="p-2 rounded-xl text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Hapus Bajem"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                        <span>PJ: {bajem.pj?.nama_lengkap || 'Belum ada'}</span>
                        <Link
                          href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}/${encodeURIComponent(bajem.id_pos)}`}
                          className="font-bold text-purple-600 hover:underline flex items-center gap-1"
                        >
                          <span>Detail</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section Pos Pelkes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-black text-text-high">
                  Pos Pelayanan & Kesaksian / Pos Pelkes ({posPelkesOnly.length})
                </h2>
              </div>
            </div>

            {isLoadingPos ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
              </div>
            ) : posPelkesOnly.length === 0 ? (
              <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-text-muted space-y-2">
                <MapPin className="w-8 h-8 mx-auto opacity-50 text-emerald-500" />
                <p className="text-sm font-semibold">Belum ada Pos Pelkes di bawah Jemaat Induk ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posPelkesOnly.map((pos) => {
                  const hasPosGps = Boolean(pos.latitude && pos.longitude);
                  const distKm = calculateDistanceKm(jemaat?.latitude, jemaat?.longitude, pos.latitude, pos.longitude);

                  return (
                    <div
                      key={pos.id_pos}
                      className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft hover:border-emerald-500/40 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-surface-sunken border border-border-subtle text-text-muted">
                              {pos.id_pos}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              {pos.jumlah_kk || 0} KK • {pos.jumlah_jiwa || 0} Jiwa
                            </span>
                            {distKm !== null && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 flex items-center gap-1" title="Jarak dari Jemaat Induk">
                                <Navigation size={10} className="text-blue-600 dark:text-blue-400" />
                                <span>{distKm} km dari Induk</span>
                              </span>
                            )}
                          </div>

                          <h3 className="font-extrabold text-base text-text-high">{pos.nama_pos}</h3>
                          {pos.alamat && <p className="text-xs text-text-muted line-clamp-1">{pos.alamat}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isSuperUser && (
                            <button
                              type="button"
                              onClick={(e) => handleOpenElevate(e, pos)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 text-xs font-bold flex items-center gap-1 hover:bg-amber-500/20 transition-colors min-h-[36px]"
                              title="Tingkatkan Status ke Bajem"
                            >
                              <TrendingUp size={14} />
                              <span className="hidden sm:inline">Elevasi</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleOpenEditPos(e, pos)}
                            className="p-2 rounded-xl text-text-muted hover:text-brand-primary hover:bg-surface-sunken transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Edit Pos"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeletePos(e, pos)}
                            className="p-2 rounded-xl text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Hapus Pos"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                        <span className="font-semibold text-text-high flex items-center gap-1">
                          <HeartHandshake size={14} className="text-emerald-600" />
                          {pos.pj ? `PJ: ${pos.pj.nama_lengkap}` : '⚠️ Belum ada PJ'}
                        </span>

                        <div className="flex items-center gap-2">
                          {!hasPosGps && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium italic">
                              ⚠️ No GPS
                            </span>
                          )}

                          <Link
                            href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}/${encodeURIComponent(pos.id_pos)}`}
                            className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <span>Detail</span>
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 3: KETUA MAJELIS JEMAAT (KMJ) */}
        <TabsContent value="pendeta" className="space-y-4 focus-visible:outline-none">
          {/* KMJ Assignment Section */}
          <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-black text-text-high">Ketua Majelis Jemaat (KMJ)</h2>
              </div>

              <button
                type="button"
                onClick={() => setShowKmjModal(true)}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-xs font-bold text-brand-primary flex items-center gap-1.5 transition-colors"
              >
                <UserPlus size={16} />
                <span>{jemaat?.kmj ? 'Ganti KMJ' : 'Tetapkan KMJ'}</span>
              </button>
            </div>

            {jemaat?.kmj ? (
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">KMJ Aktif</span>
                  <h3 className="font-extrabold text-base text-text-high">{jemaat.kmj.nama_lengkap}</h3>
                  {jemaat.kmj.no_wa && (
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <PhoneCall size={12} className="text-emerald-600" />
                      WA: {jemaat.kmj.no_wa}
                    </p>
                  )}
                </div>

                <Link
                  href={`/pendeta/${encodeURIComponent(jemaat.kmj.id_pendeta || '')}`}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-subtle hover:bg-indigo-50 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                >
                  <span>Profil KMJ</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-600 shrink-0" />
                  <span>Belum ada KMJ (Ketua Majelis Jemaat) yang ditugaskan di Jemaat Induk ini.</span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 8. MODALS & FORMS */}
      {showKmjModal && (
        <KMJSelector
          id_induk={id_induk}
          nama_induk={jemaat?.nama_induk || id_induk}
          currentKmjId={jemaat?.kmj?.id_pendeta}
          onSuccess={() => setShowKmjModal(false)}
          onClose={() => setShowKmjModal(false)}
        />
      )}

      {showPjModal && (
        <PJSelector
          id_induk={id_induk}
          nama_induk={jemaat?.nama_induk || id_induk}
          onSuccess={() => setShowPjModal(false)}
          onClose={() => setShowPjModal(false)}
        />
      )}

      {/* Status Elevation Modal */}
      {showElevateModal && elevatePosItem && (
        <StatusElevationModal
          isOpen={showElevateModal}
          onClose={() => setShowElevateModal(false)}
          posItem={elevatePosItem}
        />
      )}

      {/* Jemaat Form Modal */}
      {showJemaatModal && (
        <JemaatFormModal
          isOpen={showJemaatModal}
          onClose={() => setShowJemaatModal(false)}
          id_mupel={id_mupel}
          editData={jemaat}
        />
      )}

      {/* Secure Delete Modal for Jemaat Induk */}
      <SecureDeleteModal
        isOpen={showDeleteJemaatModal}
        onClose={() => setShowDeleteJemaatModal(false)}
        onConfirm={handleConfirmDeleteJemaat}
        title="Konfirmasi Hapus Jemaat Induk"
        targetName={jemaat?.nama_induk || id_induk}
        targetId={id_induk}
        itemType="Jemaat Induk"
        isDeleting={deleteJemaatMutation.isPending}
      />

      {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      {showJemaatLightbox && jemaat?.foto_url && (
        <div 
          onClick={() => setShowJemaatLightbox(false)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <span className="text-white text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
              Foto Gedung Jemaat Induk {jemaat.nama_induk}
            </span>
            <button
              type="button"
              onClick={() => setShowJemaatLightbox(false)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={jemaat.foto_url} 
              alt="Foto Layar Penuh Jemaat Induk" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>

          <p className="text-white/70 text-xs mt-3 font-medium">Klik di mana saja untuk menutup tampilan layar penuh</p>
        </div>
      )}
    </div>
  );
}
