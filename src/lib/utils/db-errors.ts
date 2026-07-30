// Type guard — tanpa `any`
interface SupabaseLikeError {
  code?: string;
  message?: string;
  details?: string;
}

function isDbError(err: unknown): err is SupabaseLikeError {
  return typeof err === 'object' && err !== null && 'code' in err;
}

export type ErrorSeverity = 'info' | 'warning' | 'error';

export interface DbErrorInfo {
  code: string;
  title: string;
  userMessage: string;
  severity: ErrorSeverity;
  isRetryable: boolean;
}

const MESSAGES: Record<string, Omit<DbErrorInfo, 'code'>> = {
  '23503': {
    // foreign_key_violation — sejarah yang bertahan
    title: 'Tidak Dapat Dihapus',
    userMessage:
      'Pendeta ini masih memiliki riwayat pelayanan yang harus dipertahankan — ' +
      'mutasi, penugasan, atau log pastoral. Riwayat tersebut tidak dapat dihapus ' +
      'demi menjaga sejarah gereja. Nonaktifkan saja statusnya jika perlu.',
    severity: 'warning',
    isRetryable: false,
  },
  '23505': {
    // unique_violation
    title: 'Data Sudah Ada',
    userMessage: 'Data yang Anda masukkan sudah terdaftar. Periksa kembali dan gunakan nilai yang berbeda.',
    severity: 'warning',
    isRetryable: false,
  },
  '23502': {
    // not_null_violation
    title: 'Data Belum Lengkap',
    userMessage: 'Ada kolom wajib yang belum diisi. Lengkapi semua field yang ditandai.',
    severity: 'warning',
    isRetryable: false,
  },
  '42501': {
    // insufficient_privilege
    title: 'Akses Ditolak',
    userMessage: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
    severity: 'error',
    isRetryable: false,
  },
};

const DEFAULT_INFO: Omit<DbErrorInfo, 'code'> = {
  title: 'Terjadi Kesalahan',
  userMessage: 'Terjadi kesalahan saat memproses data. Silakan coba lagi atau hubungi administrator.',
  severity: 'error',
  isRetryable: true,
};

export function translateDbError(err: unknown): DbErrorInfo {
  if (!isDbError(err)) return { code: 'UNKNOWN', ...DEFAULT_INFO };

  // RPC raise_exception ('forbidden' dari get_pendeta_360)
  if (err.code === 'P0001' && /forbidden/i.test(err.message ?? '')) {
    return {
      code: 'P0001',
      title: 'Akses Ditolak',
      userMessage: 'Anda tidak memiliki hak akses ke data ini.',
      severity: 'error',
      isRetryable: false,
    };
  }

  const mapped = err.code ? MESSAGES[err.code] : undefined;
  return { code: err.code ?? 'UNKNOWN', ...(mapped ?? DEFAULT_INFO) };
}

export function isForeignKeyViolation(err: unknown): boolean {
  return isDbError(err) && err.code === '23503';
}
