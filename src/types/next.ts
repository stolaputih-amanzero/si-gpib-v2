// src/types/next.ts
// Type helper untuk Next.js 16 async params

export type AsyncParams<T> = Promise<T>;
export type PageProps<TParams = Record<string, string>> = {
  params: AsyncParams<TParams>;
  searchParams: AsyncParams<Record<string, string | string[] | undefined>>;
};
