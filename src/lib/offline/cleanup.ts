import { db } from './dexie';
import { logger } from '@/lib/utils/logger';

export async function cleanupOldDrafts() {
  try {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Asumsi: drafts table has timestamp
    const deletedCount = await db.drafts
      .where('timestamp')
      .below(sevenDaysAgo)
      .delete();
      
    if (deletedCount > 0) {
      logger.info(`[Cleanup] Removed ${deletedCount} old drafts`);
    }
  } catch (error) {
    logger.error('[Cleanup] Failed to cleanup old drafts', error);
  }
}

export async function cleanupDeadLetters() {
  try {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const deletedCount = await db.deadLetters
      .where('movedToDLQAt')
      .below(thirtyDaysAgo)
      .delete();

    if (deletedCount > 0) {
      logger.info(`[Cleanup] Removed ${deletedCount} dead letters older than 30 days`);
    }
  } catch (error) {
    logger.error('[Cleanup] Failed to cleanup dead letters', error);
  }
}
