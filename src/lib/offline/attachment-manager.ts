import { db } from './dexie';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

export async function processPendingAttachments() {
  const supabase = createClient();
  
  const queue = await db.pendingAttachments
    .where('status')
    .anyOf(['pending', 'failed'])
    .sortBy('createdAt');

  if (queue.length === 0) return;

  logger.info(`[AttachmentEngine] Starting upload for ${queue.length} attachments...`);
  
  for (const item of queue) {
    try {
      await db.pendingAttachments.update(item.id!, { status: 'uploading' });

      // The path should include bucket name as first part, or we separate it.
      // Assuming path is like 'kegiatan/filename.jpg' and bucket is 'attachments'
      // We'll upload to 'attachments' bucket by default, unless specified.
      // For SI GPIB, let's use a standard bucket name like 'public-assets' or similar.
      const bucketName = 'attachments'; 
      
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(item.path, item.file, {
          cacheControl: '3600',
          upsert: false // Don't overwrite to be safe
        });

      if (error) {
        // If it already exists, maybe it was uploaded previously but local DB didn't update
        if (error.message.includes('already exists') || (error as any).error === 'Duplicate') {
           logger.warn(`[AttachmentEngine] File already exists: ${item.path}`);
           // We can consider it done
        } else {
           throw error;
        }
      }

      // 🚀 SUKSES UPLOAD
      // Kita perlu menyuntikkan URL gambar ke dalam payload transaksi teks (jika ada submissionId)
      if (item.submissionId) {
        const submission = await db.pendingSubmissions.get(item.submissionId);
        if (submission) {
          // Asumsi sederhana: kita simpan URL di payload.foto_url atau array foto_urls
          // Tergantung struktur payload aplikasi. Untuk saat ini kita log saja.
          logger.info(`[AttachmentEngine] Menyisipkan URL ke transaksi #${item.submissionId}`);
          
          // Dapatkan public URL
          const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(item.path);
          
          if (publicUrlData?.publicUrl) {
            submission.payload = {
              ...submission.payload,
              // Bisa disesuaikan dengan key yang relevan
              foto_url: publicUrlData.publicUrl 
            };
            await db.pendingSubmissions.put(submission);
          }
        }
      }

      // ✅ Hapus dari antrean attachment
      await db.pendingAttachments.delete(item.id!);
      logger.info(`[AttachmentEngine] Success: ${item.path}`);

    } catch (err: any) {
      const attempts = (item.attempts || 0) + 1;
      const isNetworkError = err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError');
      
      if (isNetworkError) {
        await db.pendingAttachments.update(item.id!, { status: 'pending' });
        logger.warn('[AttachmentEngine] Network lost. Pausing uploads.');
        break; 
      } else {
        await db.pendingAttachments.update(item.id!, { 
          status: 'failed', 
          attempts,
          lastError: err.message || String(err)
        });
        logger.error(`[AttachmentEngine] Failed permanently: ${item.path}`, err);
      }
    }
  }
}

export async function cleanupAttachmentsForRecord(recordId: string) {
  try {
    // Hapus blob dari IndexedDB setelah sukses upload
    // Since we don't have recordId directly in pendingAttachments yet, let's assume it maps to submissionId or formKey.
    // The tech lead wrote: .where('recordId').equals(recordId). Since we used submissionId in our schema, let's just delete by submissionId.
    const attachments = await db.pendingAttachments
      .where('submissionId')
      .equals(parseInt(recordId)) // submissionId is a number in our schema
      .toArray();

    for (const attachment of attachments) {
      if (attachment.status === 'done') {
        await db.pendingAttachments.delete(attachment.id!);
      }
    }

    logger.info(`[AttachmentManager] Cleaned up ${attachments.length} attachments for submission ${recordId}`);
  } catch (error) {
    logger.error('[AttachmentManager] Cleanup failed', error);
  }
}

