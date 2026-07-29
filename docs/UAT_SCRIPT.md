# 📗 Panduan Pengujian Penerimaan Pengguna (User Acceptance Testing - UAT)
## SI GPIB v2.2 — Mobile First PWA

---

## 📌 Ringkasan Dokumentasi
Dokumen ini disusun sebagai panduan resmi bagi penguji (*stakeholders*, pendeta, dan pengurus Majelis Sinode/Mupel/Jemaat) dalam mengeksekusi **User Acceptance Testing (UAT)** untuk **Sistem Informasi Pos Pelayanan Kesaksian (SI GPIB v2.2)**.

Pengujian ini memvalidasi **6 Critical User Journeys (CJ-1 s/d CJ-6)** sesuai PRD v2.2, mencakup pengujian **Mode Online & Offline Resilience** pada perangkat HP (*Mobile-First PWA*).

---

## 👥 Persona Penguji (4 Peran Utamanya)

| Persona | Peran / Jabatan | Wilayah Tugas | Contoh Penguji |
| :--- | :--- | :--- | :--- |
| **Persona 1: Super User** | Pengurus Departemen Pelkes Sinode | Seluruh Indonesia | Pdt. Victor (Sinode GPIB) |
| **Persona 2: Admin Mupel** | Sekretaris / Admin Musyawarah Pelayanan | Wilayah Mupel (mis. Kaltim-Kaltara) | Ibu Martha (Admin Mupel) |
| **Persona 3: KMJ** | Ketua Majelis Jemaat (Jemaat Induk) | Jemaat Induk & Pos Pelkes Binaan | Pdt. Frans (KMJ GPIB Immanuel Samarinda) |
| **Persona 4: PJ / Pelayan** | Pengurus Jemaat / Pelayan Pos Pelkes | Pos Pelkes Pelosok (mis. Long Hubung) | Pdt. Otniel (PJ Pos Pelkes Long Hubung) |

---

## 📋 SKENARIO UAT PER PERSONA

---

### 👤 PERSONA 1: SUPER USER (Departemen Pelkes Sinode)

#### Skenario 1.1: Pemantauan Dashboard Hierarki Pelkes Seluruh Indonesia (CJ-4 & Navigation)
- **Tujuan Test**: Memastikan Super User dapat melihat peta sebaran Pos Pelkes, status aktif/non-aktif, dan hierarki sinode hingga pos.
- **Langkah-Langkah (Step-by-Step)**:
  1. Buka aplikasi PWA SI GPIB (`/login`) di HP/Browser.
  2. Masuk menggunakan akun Super User Sinode.
  3. Tekan menu **Peta** pada Bottom Navigation.
  4. Amati pin lokasi Pos Pelkes di seluruh Indonesia (mis. Kaltim, NTT, Papua).
  5. Tekan menu **Struktur** pada Bottom Navigation.
  6. Filter berdasarkan Mupel "Kaltim-Kaltara" dan pilih Jemaat Induk "GPIB Immanuel Samarinda".
- **Kriteria Sukses (Expected Result)**:
  - Peta menampilkan *clustering marker* Pos Pelkes secara responsif.
  - Hierarki Mupel -> Jemaat Induk -> Pos Pelkes tampil lengkap dengan statistik jumlah jiwa dan status pelayanan.

#### Skenario 1.2: Audit Trail Log Pastoral & Laporan Sinode (CJ-2)
- **Tujuan Test**: Memastikan Super User dapat mengaudit seluruh Log Pastoral yang telah disetujui KMJ.
- **Langkah-Langkah (Step-by-Step)**:
  1. Buka menu **Pengaturan** -> **Audit Log System**.
  2. Pilih filter status "Disetujui KMJ".
  3. Buka salah satu Log Pastoral dari Pos Pelkes Long Hubung.
  4. Verifikasi watermark lokasi GPS & Timestamp pada foto dokumentasi.
- **Kriteria Sukses (Expected Result)**:
  - Foto dokumentasi memiliki stempel (*watermark*) GPS, tanggal/jam, dan nama Pos Pelkes yang valid.

---

### 👤 PERSONA 2: ADMIN MUPEL (Musyawarah Pelayanan)

#### Skenario 2.1: Verifikasi Data Pos Pelkes & Mutasi Pendeta Mupel (CJ-4)
- **Tujuan Test**: Memastikan Admin Mupel dapat memverifikasi pengajuan mutasi pendeta di wilayah Mupelnya.
- **Langkah-Langkah (Step-by-Step)**:
  1. Login sebagai Admin Mupel Kaltim-Kaltara.
  2. Buka menu **Pos & Bajem** di Bottom Navigation.
  3. Pilih sub-menu **Pengajuan Mutasi Pendeta**.
  4. Cari nama pendeta yang diajukan mutasi (mis. Pdt. Otniel dari Pos Long Hubung ke Pos Mahakam).
  5. Periksa dokumen berita acara pengajuan mutasi.
  6. Tekan tombol **Verifikasi Mupel**.
- **Kriteria Sukses (Expected Result)**:
  - Status pengajuan mutasi berubah dari `Pending Mupel` menjadi `Diverifikasi Mupel`.
  - Notifikasi konfirmasi muncul di layar dengan toast hijau (*toast-success*).

---

### 👤 PERSONA 3: KMJ (Ketua Majelis Jemaat Induk)

#### Skenario 3.1: Review & Approval Log Pastoral Pos Pelkes (CJ-2)
- **Tujuan Test**: Memastikan KMJ dapat meninjau dan menyetujui (*approve*) laporan kegiatan pelayanan dari Pelayan Pos.
- **Langkah-Langkah (Step-by-Step)**:
  1. Login sebagai KMJ (Pdt. Frans - GPIB Immanuel Samarinda).
  2. Pada Dashboard Utama, periksa widget **Laporan Menunggu Approval**.
  3. Tekan salah satu item log: "Pelayanan Sakramen Baptis di Pos Long Hubung".
  4. Periksa rincian: Tanggal, Waktu, Jumlah Jiwa (25 Jiwa), dan Foto Dokumentasi.
  5. Masukkan catatan KMJ: *"Diterima & Didukung untuk tindak lanjut konseling."*
  6. Tekan tombol **Setujui Log Pastoral**.
- **Kriteria Sukses (Expected Result)**:
  - Status log berubah menjadi `Disetujui KMJ`.
  - Badge hijau (*Approved*) tampil di daftar laporan.

#### Skenario 3.2: Approval Pengajuan Bantuan Dana Pos Pelkes (CJ-3)
- **Tujuan Test**: Memastikan KMJ dapat menyetujui pengajuan anggaran/bantuan fasilitas Pos Pelkes.
- **Langkah-Langkah (Step-by-Step)**:
  1. Buka menu **Aksi Cepat** -> **Pengajuan Bantuan Dana**.
  2. Pilih pengajuan "Perbaikan Atap Pos Pelkes Long Hubung - Rp 15.000.000".
  3. Tekan tombol **Disetujui KMJ** dan masukkan PIN Keamanan/Biometrik.
- **Kriteria Sukses (Expected Result)**:
  - Pengajuan terverifikasi dengan stempel persetujuan digital KMJ.

---

### 👤 PERSONA 4: PJ / PELAYAN POS PELKES (Pdt. Otniel - Long Hubung)

#### Skenario 4.1: Input Log Pastoral dengan Dokumentasi Foto Stamped (CJ-1)
- **Tujuan Test**: Memastikan Pelayan Pos dapat mencatat kegiatan pastoral dengan foto berstempel GPS otomatis.
- **Langkah-Langkah (Step-by-Step)**:
  1. Login sebagai Pdt. Otniel di HP (Mobile View).
  2. Tekan tombol **+ Input Log Pastoral** di Dashboard.
  3. Isi Tanggal, Jam (mis. 20:00 WITA), dan Jumlah Jiwa (15 Jiwa).
  4. Pada kolom **Kegiatan**, ketik: *"Kunjungan Pastoral Jemaat Sakit di Pos Long Hubung"*.
  5. Tekan tombol **Buka Kamera (GPS & Timestamp)**.
  6. Ambil foto dokumentasi -> Amati stempel otomatis di pojok foto.
  7. Tekan **Simpan Log Pastoral**.
- **Kriteria Sukses (Expected Result)**:
  - Foto tersimpan lengkap dengan koordinat GPS, tanggal/jam, dan watermark nama Pos.
  - Toast hijau "Berhasil Disimpan" muncul dan data masuk ke antrean approval KMJ.

---

### 📡 SKENARIO KHUSUS: UJI COBA MODE OFFLINE RESILIENCE (CJ-6 & US-9.1 s/d US-9.5)
> **Lokasi Pengujian**: Pos Pelkes Long Hubung (Kawasan Sinyal Weak / Zero Signal)

#### UAT-OFF-01: Form Draft Auto-Save Saat Sinyal Hilang (US-9.1)
- **Tujuan Test**: Memastikan data yang diisi saat tidak ada sinyal tidak akan hilang walau HP mati / aplikasi tertutup.
- **Langkah-Langkah**:
  1. Buka halaman `/dashboard/pastoral/baru`.
  2. Matikan Paket Data & Wi-Fi di HP (*Airplane Mode* / Sinyal Hilang).
  3. Amati Banner **Mode Offline** berwarna kuning di atas layar (`network-banner-offline`).
  4. Isi sebagian form:
     - Kegiatan: *"Konseling Keluarga Bpk. Yohanes di Hutan Long Hubung"*
     - Jumlah Jiwa: `5`
  5. **Tutup browser / Restart HP** (Simulasi HP mati listrik).
  6. Buka kembali browser HP dan buka alamat aplikasi.
- **Kriteria Sukses**:
  - Teks kegiatan *"Konseling Keluarga Bpk. Yohanes..."* dan jumlah jiwa `5` **otomatis terisi kembali** dari `localStorage` draft.
  - Ada indikator *"Draft Tersimpan Lokal"*.

#### UAT-OFF-02: Auto-Retry Mutation Queue Saat Jaringan Pulih (CJ-6 & US-9.3)
- **Tujuan Test**: Memastikan formulir yang dikirim saat offline tersimpan di antrean lokal dan otomatis terkirim saat sinyal kembali.
- **Langkah-Langkah**:
  1. Dalam posisi **Offline** (Airplane Mode ON), lengkapi form dan tekan tombol **Simpan Log Pastoral**.
  2. Amati Toast Kuning: *"Mode Offline — Data tersimpan aman di HP & akan dikirim otomatis saat sinyal kembali."*
  3. Nyalakan kembali Paket Data / Wi-Fi (**Online**).
  4. Buka kembali aplikasi atau biarkan aplikasi aktif di layar.
- **Kriteria Sukses**:
  - Aplikasi secara otomatis mengirimkan data antrean ke server Supabase (*auto-retry*).
  - Toast Hijau *"Berhasil Disimpan & Terkirim"* muncul tanpa perlu pengguna mengetik ulang data.

#### UAT-OFF-03: Akses Data Master Read-Only Saat Offline (US-9.2)
- **Tujuan Test**: Memastikan pendeta tetap bisa melihat data struktur Mupel/Pos saat tidak ada sinyal.
- **Langkah-Langkah**:
  1. Saat Online, buka halaman **Struktur / Hierarki**.
  2. Matikan internet (Offline).
  3. Navigasikan daftar Mupel & Pos Pelkes.
- **Kriteria Sukses**:
  - Daftar Mupel & Pos Pelkes tetap dapat dibaca tanpa error *White Screen of Death*.

---

## 📊 Form Sign-Off UAT

| Peran Penguji | Nama Lengkap | Hasil Pengujian (Pass/Fail) | Catatan / Masukan | Tanda Tangan |
| :--- | :--- | :--- | :--- | :--- |
| **Super User (Sinode)** | Pdt. Victor | [ ] PASS  [ ] FAIL | | |
| **Admin Mupel** | Ibu Martha | [ ] PASS  [ ] FAIL | | |
| **KMJ Jemaat Induk** | Pdt. Frans | [ ] PASS  [ ] FAIL | | |
| **Pelayan Pos (PJ)** | Pdt. Otniel | [ ] PASS  [ ] FAIL | | |

---
*Dokumen ini diterbitkan oleh Tim Pengembang SI GPIB v2.2 untuk Pelaksanaan UAT Lapangan.*
