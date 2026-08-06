import { db } from './dexie';

export async function saveDraftWithPhoto<T>(
  formKey: string,
  data: T,
  photos: Blob[]
) {
  await db.drafts.put({
    formKey,
    data: { ...data, photoCount: photos.length },
    timestamp: Date.now(),
  });

  // Simpan foto terpisah di Dexie (tidak ada limit 5MB!)
  for (let i = 0; i < photos.length; i++) {
    await db.draftPhotos.put({
      formKey,
      photoIndex: i,
      blob: photos[i],
      timestamp: Date.now(),
    });
  }
}
