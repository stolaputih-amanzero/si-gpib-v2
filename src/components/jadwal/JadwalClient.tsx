'use client';

import { useState } from 'react';
import { useJadwalList, JadwalItem } from '@/hooks/use-jadwal';
import { Calendar, Clock, MapPin, Search, Plus, BookOpen, Users, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

const DEFAULT_JADWAL: JadwalItem[] = [
  {
    id_ibadah: 'JAD-001',
    id_pos: 'POS-001',
    jenis: 'Ibadah Hari Minggu (IHB I)',
    hari: 'Minggu',
    jam: '06:00',
    zona_waktu: 'WITA',
    keterangan: 'Ibadah Minggu Pagi • Pelayanan Firman & Sakramen',
    pos: {
      nama_pos: 'GPIB Jemaat Immanuel',
      jemaat_induk: {
        nama_induk: 'GPIB Immanuel (Induk)',
        mupel: { nama_mupel: 'Mupel Sulteng' }
      }
    }
  },
  {
    id_ibadah: 'JAD-002',
    id_pos: 'POS-001',
    jenis: 'Ibadah Hari Minggu Utama (IHB II)',
    hari: 'Minggu',
    jam: '09:00',
    zona_waktu: 'WITA',
    keterangan: 'Ibadah Minggu Utama & Sekolah Minggu Pelkat PA',
    pos: {
      nama_pos: 'GPIB Jemaat Immanuel',
      jemaat_induk: {
        nama_induk: 'GPIB Immanuel (Induk)',
        mupel: { nama_mupel: 'Mupel Sulteng' }
      }
    }
  },
  {
    id_ibadah: 'JAD-003',
    id_pos: 'POS-002',
    jenis: 'Ibadah Pelkat Persekutuan Kaum Perempuan (PKP)',
    hari: 'Selasa',
    jam: '16:30',
    zona_waktu: 'WITA',
    keterangan: 'Persekutuan Kaum Perempuan Sektor Lahai Roi',
    pos: {
      nama_pos: 'Pos Pelkes Lahai Roi',
      jemaat_induk: {
        nama_induk: 'GPIB Immanuel',
        mupel: { nama_mupel: 'Mupel Sulteng' }
      }
    }
  },
  {
    id_ibadah: 'JAD-004',
    id_pos: 'POS-002',
    jenis: 'Ibadah Rumah Tangga / Sektor',
    hari: 'Rabu',
    jam: '18:00',
    zona_waktu: 'WITA',
    keterangan: 'Ibadah Keluarga Sektor Pelayanan Lahai Roi',
    pos: {
      nama_pos: 'Pos Pelkes Lahai Roi',
      jemaat_induk: {
        nama_induk: 'GPIB Immanuel',
        mupel: { nama_mupel: 'Mupel Sulteng' }
      }
    }
  },
  {
    id_ibadah: 'JAD-005',
    id_pos: 'POS-001',
    jenis: 'Ibadah Pelkat Gerakan Pemuda (GP)',
    hari: 'Sabtu',
    jam: '19:00',
    zona_waktu: 'WITA',
    keterangan: 'Persekutuan Pemuda Pemudi GPIB',
    pos: {
      nama_pos: 'GPIB Jemaat Immanuel',
      jemaat_induk: {
        nama_induk: 'GPIB Immanuel (Induk)',
        mupel: { nama_mupel: 'Mupel Sulteng' }
      }
    }
  }
];

const DAYS = ['Semua', 'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function JadwalClient() {
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState('Semua');

  const { data: rawJadwal, isLoading } = useJadwalList(undefined, search);

  const jadwalList = (rawJadwal && rawJadwal.length > 0) ? rawJadwal : DEFAULT_JADWAL;

  const filteredJadwal = jadwalList.filter(j => {
    if (selectedDay !== 'Semua' && j.hari !== selectedDay) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        j.jenis.toLowerCase().includes(s) ||
        j.hari.toLowerCase().includes(s) ||
        (j.pos?.nama_pos && j.pos.nama_pos.toLowerCase().includes(s)) ||
        (j.keterangan && j.keterangan.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const mingguCount = jadwalList.filter(j => j.hari === 'Minggu').length;
  const pelkatCount = jadwalList.filter(j => j.jenis.toLowerCase().includes('pelkat')).length;
  const sektorCount = jadwalList.filter(j => j.jenis.toLowerCase().includes('rumah tangga') || j.jenis.toLowerCase().includes('sektor')).length;

  return (
    <div className="flex flex-col min-h-screen bg-surface-base pb-32">
      {/* Header */}
      <header className="bg-surface-elevated border-b border-border-subtle pt-12 pb-6 px-4 sticky top-0 z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-high leading-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-primary" />
              <span>Jadwal Ibadah & Pelayanan</span>
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Manajemen Jadwal Ibadah Minggu, Pelkat, dan Ibadah Rumah Tangga / Sektor
            </p>
          </div>

          <button className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-brand-primary/90 active:scale-95 transition-all">
            <Plus size={16} />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* KPI Summaries */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-1">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Total Jadwal
            </div>
            <p className="text-2xl font-bold text-text-high font-sans tabular-nums">{jadwalList.length}</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-1">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-500" />
              Ibadah Minggu
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-sans tabular-nums">{mingguCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-1">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-500" />
              Pelkat
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-sans tabular-nums">{pelkatCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-1">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-amber-500" />
              Sektor / RT
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-sans tabular-nums">{sektorCount}</p>
          </div>
        </div>

        {/* Search & Day Tabs Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              type="text"
              placeholder="Cari jadwal ibadah, pos, atau keterangan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-surface-elevated border-border-subtle text-text-high rounded-xl"
            />
          </div>

          {/* Day Selector Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-surface-elevated text-text-muted hover:bg-surface-sunken border border-border-subtle'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle animate-pulse">
              <p className="text-sm font-medium text-text-muted">Memuat jadwal ibadah...</p>
            </div>
          ) : filteredJadwal.length === 0 ? (
            <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-dashed border-border-subtle space-y-2">
              <Calendar className="w-10 h-10 text-text-muted mx-auto" />
              <h3 className="font-bold text-text-high text-sm">Tidak ada jadwal ditemukan</h3>
              <p className="text-xs text-text-muted">Coba ubah kata kunci pencarian atau filter hari.</p>
            </div>
          ) : (
            filteredJadwal.map(j => {
              const isMinggu = j.hari === 'Minggu';
              const isPelkat = j.jenis.toLowerCase().includes('pelkat');
              return (
                <div
                  key={j.id_ibadah}
                  className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs hover:border-brand-primary/40 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider ${
                        isMinggu
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          : isPelkat
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {j.hari}
                      </span>
                      <h3 className="font-bold text-text-high text-sm sm:text-base">{j.jenis}</h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full w-max">
                      <Clock size={14} />
                      <span>{j.jam} {j.zona_waktu || 'WITA'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-text-muted shrink-0" />
                      <span className="font-semibold text-text-high">{j.pos?.nama_pos || 'Pos Pelkes'}</span>
                      {j.pos?.jemaat_induk?.nama_induk && (
                        <span>• {j.pos.jemaat_induk.nama_induk}</span>
                      )}
                    </div>

                    {j.keterangan && (
                      <p className="text-text-muted italic">{j.keterangan}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
