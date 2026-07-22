'use client';

import { useState } from 'react';
import { AlertCircle, Activity, Plus, X } from 'lucide-react';
import { KerawananForm } from '@/components/wilayah/KerawananForm';
import { PotensiForm } from '@/components/wilayah/PotensiForm';
import { KerawananItem, PotensiItem } from '@/hooks/use-wilayah';
import { useRouter } from 'next/navigation';

interface AnalisisWilayahTabContentProps {
  id_pos: string;
  initialKerawanan: any[];
  initialPotensi: any[];
  canWrite: boolean;
}

export function AnalisisWilayahTabContent({
  id_pos,
  initialKerawanan,
  initialPotensi,
  canWrite,
}: AnalisisWilayahTabContentProps) {
  const router = useRouter();
  const [showKerawananModal, setShowKerawananModal] = useState(false);
  const [showPotensiModal, setShowPotensiModal] = useState(false);
  const [selectedKerawananEdit, setSelectedKerawananEdit] = useState<KerawananItem | null>(null);
  const [selectedPotensiEdit, setSelectedPotensiEdit] = useState<PotensiItem | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kerawanan Wilayah Card */}
        <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-soft flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 pb-3 border-b border-border-subtle flex flex-row items-center justify-between flex-wrap gap-2">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-text-high">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              Kerawanan Wilayah
            </h3>
            {canWrite && (
              <button
                type="button"
                onClick={() => {
                  setSelectedKerawananEdit(null);
                  setShowKerawananModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[36px]"
              >
                <Plus size={14} />
                <span>Kelola Risiko</span>
              </button>
            )}
          </div>
          <div className="p-4 sm:p-5 flex-1">
            {initialKerawanan.length === 0 ? (
              <p className="text-xs text-text-muted italic py-6 text-center">Tidak ada risiko kerawanan yang terdaftar.</p>
            ) : (
              <div className="space-y-3">
                {initialKerawanan.map((k) => (
                  <div
                    key={k.id_risiko}
                    onClick={() => {
                      if (canWrite) {
                        setSelectedKerawananEdit(k);
                        setShowKerawananModal(true);
                      }
                    }}
                    className={`p-4 bg-surface-sunken rounded-2xl border border-border-subtle space-y-2 transition-all ${
                      canWrite ? 'cursor-pointer hover:border-brand-primary/40 hover:shadow-xs' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-[9px] font-black text-red-600 uppercase tracking-wider bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                        {k.kategori || 'Kerawanan'}
                      </span>
                      {k.frekuensi && (
                        <span className="text-[10px] font-bold text-text-muted italic">
                          Frekuensi: {k.frekuensi}
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-sm text-text-high leading-tight">{k.jenis_risiko}</h4>
                    {k.keterangan && (
                      <p className="text-xs text-text-muted leading-relaxed italic bg-surface-elevated/50 p-2 rounded border border-border-subtle/40">
                        "{k.keterangan}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Potensi Wilayah Card */}
        <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-soft flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 pb-3 border-b border-border-subtle flex flex-row items-center justify-between flex-wrap gap-2">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-text-high">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Potensi Wilayah
            </h3>
            {canWrite && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPotensiEdit(null);
                  setShowPotensiModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[36px]"
              >
                <Plus size={14} />
                <span>Kelola Potensi</span>
              </button>
            )}
          </div>
          <div className="p-4 sm:p-5 flex-1">
            {initialPotensi.length === 0 ? (
              <p className="text-xs text-text-muted italic py-6 text-center">Tidak ada potensi wilayah yang terdaftar.</p>
            ) : (
              <div className="space-y-3">
                {initialPotensi.map((po) => (
                  <div
                    key={po.id_potensi}
                    onClick={() => {
                      if (canWrite) {
                        setSelectedPotensiEdit(po);
                        setShowPotensiModal(true);
                      }
                    }}
                    className={`p-4 bg-surface-sunken rounded-2xl border border-border-subtle space-y-2 transition-all ${
                      canWrite ? 'cursor-pointer hover:border-brand-primary/40 hover:shadow-xs' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                        {po.kategori || 'Potensi'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-text-high leading-tight">{po.nama_potensi}</h4>
                    {po.deskripsi && <p className="text-xs text-text-muted leading-relaxed">{po.deskripsi}</p>}
                    {po.keterangan && (
                      <p className="text-xs text-text-muted italic bg-surface-elevated/50 p-2 rounded border border-border-subtle/40">
                        "{po.keterangan}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* In-Page Modal Form Kerawanan */}
      {showKerawananModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-elevated w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border border-border-subtle shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken/50 shrink-0">
              <h3 className="font-serif font-bold text-text-high text-lg">
                {selectedKerawananEdit ? 'Edit Data Kerawanan Wilayah' : 'Input Data Kerawanan Wilayah Baru'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowKerawananModal(false);
                  setSelectedKerawananEdit(null);
                }}
                className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl bg-surface-sunken hover:bg-surface-elevated text-text-muted flex items-center justify-center transition-colors shadow-xs"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <KerawananForm
                defaultPosId={id_pos}
                initialData={selectedKerawananEdit}
                onSuccess={() => {
                  setShowKerawananModal(false);
                  setSelectedKerawananEdit(null);
                  router.refresh();
                }}
                onCancel={() => {
                  setShowKerawananModal(false);
                  setSelectedKerawananEdit(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* In-Page Modal Form Potensi */}
      {showPotensiModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-elevated w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border border-border-subtle shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken/50 shrink-0">
              <h3 className="font-serif font-bold text-text-high text-lg">
                {selectedPotensiEdit ? 'Edit Data Potensi Wilayah' : 'Input Data Potensi Wilayah Baru'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowPotensiModal(false);
                  setSelectedPotensiEdit(null);
                }}
                className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl bg-surface-sunken hover:bg-surface-elevated text-text-muted flex items-center justify-center transition-colors shadow-xs"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <PotensiForm
                defaultPosId={id_pos}
                initialData={selectedPotensiEdit || undefined}
                onSuccess={() => {
                  setShowPotensiModal(false);
                  setSelectedPotensiEdit(null);
                  router.refresh();
                }}
                onCancel={() => {
                  setShowPotensiModal(false);
                  setSelectedPotensiEdit(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
