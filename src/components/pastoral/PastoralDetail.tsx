'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PastoralDetailProps {
  log: {
    kegiatan: string;
    tgl: string;
    jml_jiwa: number | null;
    catatan: string | null;
    keterangan?: string | null;
    foto_url: string | null;
    m_pos_pelkes: { id_pos: string; nama_pos: string };
    m_pendeta: { nama_lengkap: string };
  } | null;
  onClose: () => void;
}

export function PastoralDetail({ log, onClose }: PastoralDetailProps) {
  const router = useRouter();

  if (!log) return null;

  const handleViewPos = () => {
    router.push(`/dashboard/pos-pelkes/${log.m_pos_pelkes.id_pos}`);
  };

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{log.kegiatan}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Foto */}
          {log.foto_url && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={log.foto_url}
                alt={log.kegiatan}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Tanggal</p>
                <p className="font-medium">
                  {format(new Date(log.tgl), 'd MMMM yyyy', { locale: id })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Jumlah Jiwa</p>
                <p className="font-medium">{log.jml_jiwa || 0} jiwa</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Pendeta</p>
                <p className="font-medium">{log.m_pendeta?.nama_lengkap}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Pos Pelkes</p>
                <p className="font-medium">{log.m_pos_pelkes?.nama_pos}</p>
              </div>
            </div>
          </div>

          {/* Catatan */}
          {log.catatan && (
            <div>
              <h3 className="font-semibold mb-2">Catatan</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{log.catatan}</p>
            </div>
          )}

          {/* Keterangan */}
          {log.keterangan && (
            <div>
              <h3 className="font-semibold mb-2">Keterangan</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{log.keterangan}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Tutup
            </Button>
            <Button onClick={handleViewPos} className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              Lihat Pos Pelkes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
