'use client';

import React, { useState } from 'react';
import { UserCheck, X, Loader2 } from 'lucide-react';

interface ProposalTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitProposal: (
    idPerson: string,
    namaLengkap: string,
    idOrgAsal: string,
    namaOrgAsal: string,
    idOrgTujuan: string,
    namaOrgTujuan: string,
    catatan: string
  ) => Promise<void>;
}

export const ProposalTransferModal: React.FC<ProposalTransferModalProps> = ({
  isOpen,
  onClose,
  onSubmitProposal
}) => {
  const [idPerson] = useState('PERSON-PDT-001');
  const [namaLengkap, setNamaLengkap] = useState('Pdt. Abraham Lincoln, M.Th.');
  const [idOrgAsal] = useState('ORG-GPIB-JAKARTA');
  const [namaOrgAsal, setNamaOrgAsal] = useState('GPIB Paulus Jakarta');
  const [idOrgTujuan] = useState('ORG-GPIB-SURABAYA');
  const [namaOrgTujuan, setNamaOrgTujuan] = useState('GPIB Immanuel Surabaya');
  const [catatan, setCatatan] = useState('Mutasi Periodik Tugas Sinodal 2026');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitProposal(idPerson, namaLengkap, idOrgAsal, namaOrgAsal, idOrgTujuan, namaOrgTujuan, catatan);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Buat Usulan Mutasi Pelayan Baru</h3>
              <p className="text-xs text-slate-500">Mendaftarkan usulan mutasi lintas organisasi ke Sinode</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">ID & Nama Lengkap Pendeta/Pelayan</label>
            <input
              type="text"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Organisasi Asal (Releasing)</label>
              <input
                type="text"
                value={namaOrgAsal}
                onChange={(e) => setNamaOrgAsal(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Organisasi Tujuan (Receiving)</label>
              <input
                type="text"
                value={namaOrgTujuan}
                onChange={(e) => setNamaOrgTujuan(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Catatan Pertimbangan Usulan</label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              <span>Kirim Proposal Mutasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
