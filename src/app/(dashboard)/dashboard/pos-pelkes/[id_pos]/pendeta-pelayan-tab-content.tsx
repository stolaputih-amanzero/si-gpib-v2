'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Users, Phone, ExternalLink, HeartHandshake, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PJSelector } from '@/components/hierarki/PJSelector';
import { PelayanForm } from '@/components/pelayan/PelayanForm';
import { RelawanForm } from '@/components/relawan/RelawanForm';
import { PelayanItem } from '@/hooks/use-pelayan';
import { RelawanItem } from '@/hooks/use-relawan';

interface PJDetail {
  id_pendeta: string;
  nama_lengkap: string;
  no_wa: string | null;
  status_tugas: string;
  tgl_mulai: string;
  foto_url?: string | null;
}

interface Pelayan {
  id_pelayan: string;
  nama: string;
  no_wa: string | null;
  jabatan: string | null;
  status: string;
  keterangan: string | null;
  foto_url?: string | null;
}

interface Relawan {
  id_relawan: string;
  nama: string;
  no_wa: string | null;
  tgl_lahir: string | null;
  gender: string | null;
  kategori: string | null;
  pelatihan: string | null;
  keterangan: string | null;
  foto_url?: string | null;
}

interface PendetaPelayanTabContentProps {
  id_pos: string;
  id_induk: string;
  nama_induk: string;
  pj: PJDetail | null;
  pelayan: Pelayan[];
  relawan: Relawan[];
  canWrite: boolean;
}

export function PendetaPelayanTabContent({
  id_pos,
  id_induk,
  nama_induk,
  pj,
  pelayan,
  relawan,
  canWrite,
}: PendetaPelayanTabContentProps) {
  const router = useRouter();
  const [showPJModal, setShowPJModal] = useState(false);
  const [showPelayanModal, setShowPelayanModal] = useState(false);
  const [showRelawanModal, setShowRelawanModal] = useState(false);
  const [selectedPelayanEdit, setSelectedPelayanEdit] = useState<PelayanItem | null>(null);
  const [selectedRelawanEdit, setSelectedRelawanEdit] = useState<RelawanItem | null>(null);

  return (
    <div className="space-y-6">
      {/* 1. Card Pendeta Jemaat */}
      <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
        <div className="p-4 sm:p-5 pb-3 border-b border-border-subtle flex flex-row items-center justify-between flex-wrap gap-2">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-text-high">
            <User className="w-5 h-5 text-brand-primary" />
            Pendeta Jemaat
          </h3>
          {canWrite && (
            <button
              type="button"
              onClick={() => setShowPJModal(true)}
              className="min-h-[36px] px-3.5 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <HeartHandshake size={14} />
              <span>Kelola Penugasan Pendeta Jemaat</span>
            </button>
          )}
        </div>
        <div className="p-4 sm:p-5">
          {pj ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-surface-sunken border border-border-subtle rounded-2xl">
              <Link
                href={`/pendeta/${pj.id_pendeta}`}
                className="flex items-center gap-3.5 group hover:opacity-90 transition-opacity"
              >
                {pj.foto_url ? (
                  <img
                    src={pj.foto_url}
                    alt={pj.nama_lengkap}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-primary/20 shrink-0 group-hover:scale-105 transition-transform shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-black text-xl shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    {pj.nama_lengkap.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-base text-text-high leading-tight group-hover:text-brand-primary group-hover:underline flex items-center gap-1.5">
                    <span>{pj.nama_lengkap}</span>
                    <ExternalLink size={15} className="text-brand-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <span className="text-xs font-semibold text-text-muted mt-1 inline-block">
                    Aktif sejak: {new Date(pj.tgl_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </Link>
              {pj.no_wa && (
                <a
                  href={`https://wa.me/${pj.no_wa.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-xs w-full sm:w-auto justify-center"
                >
                  <Phone size={14} />
                  <span>Chat via WhatsApp ({pj.no_wa})</span>
                </a>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-surface-sunken/40 border border-dashed border-border-subtle rounded-2xl text-text-muted space-y-1">
              <User size={32} className="mx-auto text-text-muted/40" />
              <p className="text-sm font-bold">Belum ada PJ Ditugaskan</p>
              <p className="text-xs max-w-sm mx-auto px-4">
                Tidak ada Pendeta Jemaat khusus yang ditempatkan secara terdaftar. Tugas pastoral dilayani di bawah naungan KMJ Jemaat Induk.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Card Pelayan Jemaat */}
      <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
        <div className="p-4 sm:p-5 pb-3 border-b border-border-subtle flex flex-row items-center justify-between flex-wrap gap-2">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-text-high">
            <Users className="w-5 h-5 text-brand-primary" />
            Pelayan Jemaat
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-bold text-xs bg-surface-sunken">
              {pelayan.length} Aktif
            </Badge>
            {canWrite && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPelayanEdit(null);
                  setShowPelayanModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[36px]"
              >
                <Plus size={14} />
                <span>Tambah Pelayan</span>
              </button>
            )}
          </div>
        </div>
        <div className="p-4 sm:p-5">
          {pelayan.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pelayan.map((p) => (
                <div
                  key={p.id_pelayan}
                  onClick={() => {
                    if (canWrite) {
                      setSelectedPelayanEdit(p as any);
                      setShowPelayanModal(true);
                    }
                  }}
                  className={`p-4 border border-border-subtle rounded-2xl bg-surface-sunken space-y-3 transition-all ${
                    canWrite ? 'cursor-pointer hover:border-brand-primary/40 hover:shadow-xs' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {p.foto_url ? (
                        <img
                          src={p.foto_url}
                          alt={p.nama}
                          className="w-11 h-11 rounded-xl object-cover border border-border-subtle shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-base shrink-0">
                          {p.nama.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm text-text-high">{p.nama}</h4>
                        <p className="text-xs font-semibold text-brand-primary mt-0.5">{p.jabatan || 'Pelayan'}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold shrink-0">
                      {p.status}
                    </Badge>
                  </div>
                  {p.keterangan && (
                    <p className="text-xs text-text-muted line-clamp-2 italic bg-surface-elevated/50 p-2 rounded-xl border border-border-subtle/40">
                      "{p.keterangan}"
                    </p>
                  )}
                  {p.no_wa && (
                    <a
                      href={`https://wa.me/${p.no_wa.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="min-h-[32px] inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <Phone size={12} />
                      <span>Hubungi WA ({p.no_wa})</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-surface-sunken/40 border border-dashed border-border-subtle rounded-2xl text-text-muted space-y-1">
              <Users size={32} className="mx-auto text-text-muted/40" />
              <p className="text-sm font-bold">Tidak ada Data Pelayan</p>
              <p className="text-xs">Belum ada majelis jemaat atau penatua/diaken terdaftar untuk pos ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Card Relawan */}
      <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
        <div className="p-4 sm:p-5 pb-3 border-b border-border-subtle flex flex-row items-center justify-between flex-wrap gap-2">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-text-high">
            <Users className="w-5 h-5 text-brand-primary" />
            Relawan
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-bold text-xs bg-surface-sunken">
              {relawan.length} Terdaftar
            </Badge>
            {canWrite && (
              <button
                type="button"
                onClick={() => {
                  setSelectedRelawanEdit(null);
                  setShowRelawanModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[36px]"
              >
                <Plus size={14} />
                <span>Tambah Relawan</span>
              </button>
            )}
          </div>
        </div>
        <div className="p-4 sm:p-5">
          {relawan.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relawan.map((r) => (
                <div
                  key={r.id_relawan}
                  onClick={() => {
                    if (canWrite) {
                      setSelectedRelawanEdit(r as any);
                      setShowRelawanModal(true);
                    }
                  }}
                  className={`p-4 border border-border-subtle rounded-2xl bg-surface-sunken space-y-3 transition-all ${
                    canWrite ? 'cursor-pointer hover:border-brand-primary/40 hover:shadow-xs' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {r.foto_url ? (
                        <img
                          src={r.foto_url}
                          alt={r.nama}
                          className="w-11 h-11 rounded-xl object-cover border border-border-subtle shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base shrink-0">
                          {r.nama.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm text-text-high">{r.nama}</h4>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-[9px] font-black text-brand-primary uppercase tracking-wider bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10">
                            {r.kategori || 'Relawan'}
                          </span>
                          {r.gender && (
                            <span className="text-[9px] font-bold text-text-muted px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle">
                              {r.gender === 'L' ? 'Laki-laki' : r.gender === 'P' ? 'Perempuan' : r.gender}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {r.pelatihan && (
                    <div className="text-[11px] text-text-muted bg-surface-elevated p-2 rounded-xl border border-border-subtle/50">
                      <span className="font-bold text-text-high block text-[9px] uppercase tracking-wider mb-0.5">Pelatihan:</span>
                      {r.pelatihan}
                    </div>
                  )}

                  {r.keterangan && (
                    <p className="text-xs text-text-muted italic bg-surface-elevated/50 p-2 rounded-xl border border-border-subtle/40">
                      "{r.keterangan}"
                    </p>
                  )}

                  {r.no_wa && (
                    <a
                      href={`https://wa.me/${r.no_wa.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="min-h-[32px] inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <Phone size={12} />
                      <span>Hubungi WA ({r.no_wa})</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-surface-sunken/40 border border-dashed border-border-subtle rounded-2xl text-text-muted space-y-1">
              <Users size={32} className="mx-auto text-text-muted/40" />
              <p className="text-sm font-bold">Tidak ada Data Relawan</p>
              <p className="text-xs">Belum ada relawan atau volunteer terdaftar untuk pos ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* PJ Selector Modal */}
      {showPJModal && (
        <PJSelector
          id_induk={id_induk}
          nama_induk={nama_induk}
          onClose={() => setShowPJModal(false)}
          onSuccess={() => {
            setShowPJModal(false);
            router.refresh();
          }}
        />
      )}

      {/* Pelayan Form Modal */}
      {showPelayanModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-elevated w-full max-w-xl rounded-t-3xl sm:rounded-3xl border border-border-subtle shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken/50 shrink-0">
              <h3 className="font-serif font-bold text-text-high text-lg">
                {selectedPelayanEdit ? 'Edit Data Pelayan' : 'Input Data Pelayan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowPelayanModal(false);
                  setSelectedPelayanEdit(null);
                }}
                className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl bg-surface-sunken hover:bg-surface-elevated text-text-muted flex items-center justify-center transition-colors shadow-xs"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <PelayanForm
                id_pos={id_pos}
                initialData={selectedPelayanEdit}
                onSuccess={() => {
                  setShowPelayanModal(false);
                  setSelectedPelayanEdit(null);
                  router.refresh();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Relawan Form Modal */}
      {showRelawanModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-elevated w-full max-w-xl rounded-t-3xl sm:rounded-3xl border border-border-subtle shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken/50 shrink-0">
              <h3 className="font-serif font-bold text-text-high text-lg">
                {selectedRelawanEdit ? 'Edit Data Relawan' : 'Input Data Relawan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowRelawanModal(false);
                  setSelectedRelawanEdit(null);
                }}
                className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl bg-surface-sunken hover:bg-surface-elevated text-text-muted flex items-center justify-center transition-colors shadow-xs"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <RelawanForm
                id_pos={id_pos}
                initialData={selectedRelawanEdit}
                onSuccess={() => {
                  setShowRelawanModal(false);
                  setSelectedRelawanEdit(null);
                  router.refresh();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
