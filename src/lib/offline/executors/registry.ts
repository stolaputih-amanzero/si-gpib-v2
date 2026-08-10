import { executePastoralLogInsert } from './pastoral.executor';

export type OfflineExecutor = (
  payload: any,
  contextId: string,
  userId: string
) => Promise<void>;

export const OFFLINE_EXECUTORS: Record<string, OfflineExecutor> = {
  'OC-PASTORAL-001': executePastoralLogInsert,
  // Future contracts will be registered here
};
