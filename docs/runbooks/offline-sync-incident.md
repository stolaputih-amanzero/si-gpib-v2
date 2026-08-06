# 🚨 Offline Sync Incident Response

Panduan operasional (Runbook) untuk tim IT Sinode dalam menangani insiden sistem sinkronisasi offline SI GPIB.

## Severity Levels

| Level | Kondisi | Response Time |
|---|---|---|
| **P1** | >50 users stuck, DLQ >100 items | < 30 menit |
| **P2** | 10-50 users stuck, DLQ 20-100 items | < 2 jam |
| **P3** | <10 users stuck, DLQ <20 items | < 8 jam |

## Escalation Path

1. **L1: IT Support Sinode** — Cek Queue Inspector, retry manual
2. **L2: Dev Team** — Cek Sentry, analisa error pattern
3. **L3: Tech Lead** — Hotfix / rollback jika perlu

---

## 🛠️ Runbook: Queue Stuck Massal

1. Login sebagai `super_user`.
2. Buka Dasbor Telemetri: `/dashboard/developer/telemetry`.
3. Periksa lonjakan metrik *Failure Rate* atau *Dead Letters*.
4. Pindah ke Queue Inspector: `/dashboard/developer/queue`.
5. Filter berdasarkan status = `failed`.
6. Cek `lastError` — identifikasi pattern:
   - `Failed to fetch` / `NetworkError`: Isu jaringan. Tunggu koneksi pulih, sistem akan *auto-retry* via Exponential Backoff (hingga 7 kali).
   - `401 Unauthorized`: JWT Token expired saat offline panjang. **Tindakan**: Broadcast ke user untuk re-login.
   - `409 Conflict` / `CONFLICT_DETECTED`: Terjadi bentrok *Optimistic Check*. **Tindakan**: Review manual di UI (Segera hadir).
   - `500 Internal Server Error`: Ada isu Supabase/PostgreSQL. **Tindakan**: Buka Sentry untuk melihat *stack trace*, eskalasi ke L2/L3.

---

## 💀 Runbook: Dead Letter Review

Jika item gagal disinkronkan setelah 7 kali percobaan, item akan dipindahkan ke **Dead-Letter Queue (DLQ)** (`deadLetters` table di IndexedDB klien).

1. Buka `/dashboard/developer/queue` (Pastikan klien terhubung).
2. Periksa tab/tabel **Dead Letters**.
3. Review setiap item:
   - *Payload valid namun gagal karena bug sesaat?* → Lakukan **Retry manual** (Pindah kembali ke antrean `pendingSubmissions`).
   - *Payload invalid (business rule violation / reject)?* → Hapus dari DLQ, informasikan PJ Jemaat/Mupel untuk input ulang.
   - *Ditolak oleh policy otomatis (ex: Bantuan Keuangan)?* → Tinjau secara online dan putuskan.
4. Dokumentasikan *root cause* di Log Insiden IT Sinode.

---

## 🛟 Disaster Recovery: Data Offline Hilang

Skenario ini terjadi jika PJ menginput data secara luring berhari-hari, namun data lenyap sebelum sempat online.

1. Terima laporan user terkait kehilangan data.
2. Minta user / *IT Support* lokal untuk membuka browser di *device* yang bersangkutan.
3. Buka **DevTools (F12)** → tab **Application** → **IndexedDB** → `sios-offline-db`.
4. Jika `sios-offline-db` kosong atau terhapus:
   - Tanyakan apakah user baru saja menggunakan fitur "Clear Browsing Data" / "Hapus Cache"?
   - Tanyakan apakah *storage* HP penuh sehingga browser melakukan *auto-eviction*?
5. **Recovery Options**:
   - Jika tersedia sistem *local file backup* (fitur ekspor JSON), minta user *Import* berkas tersebut.
   - Jika tidak ada sama sekali: Sayangnya user harus **input ulang secara manual**.
6. **Preventif**: Edukasi *end-user* secara berkala: *"Jangan pernah menghapus data cache/browser jika ada ikon sinkronisasi belum selesai!"*
