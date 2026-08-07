'use client';

import { PosDetail } from '@/lib/domains/portal/portal.types';
import { MapPin, Users, Calendar, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming we have this

interface PosDetailCardProps {
  pos: PosDetail;
}

export function PosDetailCard({ pos }: PosDetailCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80 mb-2">
              {pos.kategori || 'Pos Pelkes'}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{pos.nama_pos}</h1>
            <p className="flex items-start text-sm text-gray-500 mt-2">
              <MapPin className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0 text-gray-400" />
              {pos.alamat || 'Alamat belum tersedia'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Demografi & Info */}
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              Demografi Umat
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{pos.jumlah_kk}</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Kepala Keluarga</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{pos.jumlah_jiwa}</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Total Jiwa</div>
              </div>
            </div>
          </section>
        </div>

        {/* Jadwal Ibadah */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            Jadwal Ibadah
          </h3>
          <div className="space-y-3">
            {pos.jadwal_ibadah.length > 0 ? (
              pos.jadwal_ibadah.map((jadwal) => (
                <div key={jadwal.id_ibadah} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <div className="font-medium text-gray-900">{jadwal.jenis}</div>
                    <div className="text-xs text-gray-500">{jadwal.keterangan || 'Rutin'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-blue-600">{jadwal.hari}</div>
                    <div className="text-xs text-gray-500">{jadwal.jam}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">Belum ada jadwal terdaftar</p>
            )}
          </div>
        </section>

        {/* Pelayan */}
        <section className="md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
            <UserCheck className="w-4 h-4 mr-2 text-blue-500" />
            Tim Pelayan Aktif
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pos.pelayan.length > 0 ? (
              pos.pelayan.map((p) => (
                <div key={p.id_pelayan} className="flex items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold mr-3 flex-shrink-0">
                    {p.nama.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.nama}</div>
                    <div className="text-xs text-gray-500 truncate">{p.jabatan || 'Pelayan'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="sm:col-span-2 lg:col-span-3 text-sm text-gray-500 italic p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                Belum ada pelayan aktif yang terdaftar
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex justify-end">
        <Link href="/peta-sebaran">
          <Button variant="outline" type="button">
            Kembali ke Peta
          </Button>
        </Link>
      </div>
    </div>
  );
}
