import { db } from './dexie';
import { logger } from '@/lib/utils/logger';

const MIGRATION_FLAG = 'sios-dexie-migration-v1';

export async function migrateLocalStorageToDexie() {
  if (typeof window === 'undefined') return;

  // Cek apakah sudah pernah migrasi
  if (localStorage.getItem(MIGRATION_FLAG)) {
    return;
  }

  logger.info('[Migration] Starting localStorage → Dexie migration');

  try {
    const draftsToMigrate: Array<{ formKey: string; data: unknown; timestamp: number }> = [];

    // Scan semua localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key?.startsWith('draft:')) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            const formKey = key; // keeping 'draft:' prefix since useFormDraft passes 'draft:log-pastoral'
            draftsToMigrate.push({
              formKey,
              data,
              timestamp: data.timestamp || Date.now(),
            });
          }
        } catch (err) {
          logger.warn(`[Migration] Failed to parse ${key}, skipping`, { error: String(err) });
        }
      }
    }

    // Batch insert ke Dexie
    if (draftsToMigrate.length > 0) {
      await db.drafts.bulkPut(draftsToMigrate);
      logger.info(`[Migration] Migrated ${draftsToMigrate.length} drafts to Dexie`);
    }

    // Set flag agar tidak migrasi lagi
    localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
    
  } catch (error) {
    logger.error('[Migration] Failed', error);
  }
}
