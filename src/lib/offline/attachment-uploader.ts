import { db } from './dexie';
import { createClient } from '@/lib/supabase/client';

export type AttachmentProcessResult = 'success' | 'transient_error' | 'permanent_error';

export async function processAttachments(submissionId: number, maxAttempts: number): Promise<{
  status: AttachmentProcessResult;
  lastError?: string;
}> {
  const attachments = await db.pendingAttachments
    .where('submissionId').equals(submissionId)
    .and(a => a.status === 'pending' || a.status === 'failed')
    .toArray();

  if (attachments.length === 0) return { status: 'success' };

  const supabase = createClient();
  let finalStatus: AttachmentProcessResult = 'success';
  let firstError: string | undefined;

  for (const att of attachments) {
    if (att.status === 'done') continue;

    await db.pendingAttachments.update(att.id!, { status: 'uploading' });
    
    // Explicitly cast to 'any' for file if TypeScript complains, but Blob is usually fine
    const { error } = await supabase.storage
      .from('assets')
      .upload(att.path, att.file, { upsert: true, contentType: att.file.type });

    if (error) {
      const isPermanent = 
        error.message.includes('policy') ||
        error.message.includes('permission') ||
        error.message.includes('too large') ||
        error.message.includes('invalid');
      
      const attempts = att.attempts + 1;
      
      if (isPermanent || attempts >= maxAttempts) {
        await db.pendingAttachments.update(att.id!, {
          status: 'failed',
          attempts,
          lastError: error.message,
        });
        finalStatus = 'permanent_error';
        firstError = error.message;
        break; // Stop processing other attachments if one is permanently failed
      }
      
      // Transient
      await db.pendingAttachments.update(att.id!, {
        status: 'failed',
        attempts,
        lastError: error.message,
      });
      finalStatus = 'transient_error';
      if (!firstError) firstError = error.message;
    } else {
      await db.pendingAttachments.update(att.id!, { status: 'done' });
    }
  }
  
  return { status: finalStatus, lastError: firstError };
}
