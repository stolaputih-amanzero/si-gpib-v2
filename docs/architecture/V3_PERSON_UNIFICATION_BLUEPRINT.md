# V3.0 Person Unification Blueprint
**Gate 8 Phase 8.4: Database Unification & Canonical Person Model**

---

## 1. Latar Belakang & Objektif

Berdasarkan temuan *technical debt* pada *UX Entity Classification* (Gap: *Person Abstraction*), entitas SDM di SI GPIB saat ini terfragmentasi menjadi 4 tabel terpisah:
- `m_pendeta` (Data Induk Pendeta)
- `t_pelayan` (Pelayan Pos Pelkes)
- `t_relawan` (Relawan)
- `users` (Supabase Auth / User Account)

Fragmentasi ini menyebabkan kompleksitas tinggi pada eksekusi *Cross-Context Queries*, Redundansi logika *Role-Based Access Control* (RBAC), serta hambatan dalam membangun *Unified Person Directory*. 

**Objektif V3.0:** Mengonsolidasikan seluruh entitas manusia ke dalam satu tabel abstrak (kanonikal) `persons`, disertai pemetaan relasional untuk peran (*roles*) dan penugasan (*assignments*).

> [!WARNING]  
> Dokumen ini adalah **Cetak Biru Perencanaan Arsitektur**. Eksekusi fisik skema dan kode dalam dokumen ini HANYA boleh dilakukan pada awal siklus pengembangan versi *Major Release V3.0*.

---

## 2. Target Schema Design (The `persons` Table)

Desain struktur tabel induk dirancang untuk menampung seluruh atribut universal manusia, dipisahkan dari tabel yang menyimpan peran (jabatan operasional) atau penugasan struktural.

### 2.1. Tabel `persons` (Universal Person Entity)
```sql
CREATE TABLE persons (
    person_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    nik VARCHAR(16) UNIQUE,       -- Nullable untuk fleksibilitas masa transisi
    no_wa VARCHAR(20) UNIQUE,
    gender VARCHAR(10) CHECK (gender IN ('Laki-laki', 'Perempuan')),
    birth_date DATE,
    photo_url TEXT,
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Non-Aktif', 'Meninggal', 'Pindah')),
    user_account_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Tautan ke sistem otentikasi
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2. Tabel `person_roles` (Person Subtypes / Pivot)
Menandakan jenis peran yang dimiliki entitas manusia di lingkup institusi GPIB.
```sql
CREATE TABLE person_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID REFERENCES persons(person_id) ON DELETE CASCADE,
    role_type VARCHAR(50) NOT NULL CHECK (role_type IN ('Pendeta', 'Pelayan', 'Relawan', 'Super User', 'Admin Mupel')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(person_id, role_type) -- Seseorang hanya bisa memiliki satu baris per tipe role
);
```

### 2.3. Tabel `person_assignments` (Penugasan Struktural)
Menampung riwayat atau status aktif penempatan seseorang (misalnya: penugasan Pendeta ke Jemaat/Pos, Pelayan ke Pos Pelkes).
```sql
CREATE TABLE person_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID REFERENCES persons(person_id) ON DELETE CASCADE,
    role_id UUID REFERENCES person_roles(id) ON DELETE CASCADE,
    context_type VARCHAR(50) NOT NULL CHECK (context_type IN ('POS_PELKES', 'JEMAAT_INDUK', 'MUPEL', 'SINODAL')),
    context_id VARCHAR(50) NOT NULL, -- ID entitas target (misal: ID Pos, ID Mupel)
    start_date DATE NOT NULL,
    end_date DATE,                   -- Null = Masih Menjabat
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Selesai', 'Mutasi')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Data Migration Strategy (Zero Data Loss)

Migrasi tidak boleh menghapus data secara langsung sebelum sistem *Backward Compatibility* terpasang dan diverifikasi beroperasi.

### Urutan Eksekusi SQL Migration (DRAFT V3.0)

1. **Schema Instantiation**
   - Jalankan DDL untuk membuat `persons`, `person_roles`, dan `person_assignments`.

2. **Extract & Transform (ETL Phase 1 - Pendeta)**
   ```sql
   -- Insert into persons dari m_pendeta
   -- Logika deduplikasi (ON CONFLICT) jika NIK/No WA bertabrakan harus diterapkan menggunakan Temporary Table / Staging
   INSERT INTO persons (person_id, full_name, nik, no_wa, status)
   SELECT gen_random_uuid(), nama_lengkap, nik, no_wa, 'Aktif' FROM m_pendeta;
   
   -- Populate person_roles untuk Pendeta
   -- Populate person_assignments berdasarkan t_penugasan_pendeta
   ```

3. **Extract & Transform (ETL Phase 2 - Pelayan & Relawan)**
   - Proses penggabungan `t_pelayan` dan `t_relawan` membutuhkan pencocokan NIK. Jika entitas Pelayan ternyata sudah ada sebagai Pendeta (meski jarang), maka sistem hanya melakukan *Upsert* ke tabel `persons`, lalu menambahkan baris baru di `person_roles`.

4. **Foreign Key Realignment**
   - Ubah kolom di tabel log transaksional (`t_log_pastoral`, `t_bantuan_ajuan`, dll) yang awalnya me-*reference* `id_pendeta` atau `id_pelayan` (VARCHAR/Legacy ID), untuk menambahkan kolom baru `new_person_id (UUID)`.
   - Lakukan migrasi data pemetaan relasional, lalu hapus kolom *legacy ID*.

---

## 4. The Backward Compatibility Strategy (Database Views)

Strategi ini **paling krusial** agar rilis V3.0 tidak merusak ratusan fungsionalitas UI, *Server Actions*, dan *RLS Policies* di V2.2 saat migrasi dijalankan.

Kita akan menggunakan **PostgreSQL Views** untuk menciptakan "Ilusi Skema Lama" di atas tabel `persons` yang baru.

### Contoh: `m_pendeta` Legacy View
```sql
-- Ganti tabel asli menjadi view
-- (Tabel asli m_pendeta di-rename menjadi m_pendeta_legacy atau di-drop bertahap)
CREATE OR REPLACE VIEW m_pendeta AS
SELECT 
    p.person_id::VARCHAR AS id_pendeta, -- Menjaga tipe data kompatibel sebisa mungkin, atau mapping ID lama jika diperlukan
    p.full_name AS nama_lengkap,
    p.nik,
    p.no_wa,
    p.photo_url AS foto_url
    -- Kolom legacy lainnya bisa di-join dari tabel auxiliary jika spesifik Pendeta
FROM persons p
JOIN person_roles pr ON p.person_id = pr.person_id
WHERE pr.role_type = 'Pendeta';
```

> [!TIP]  
> Dengan pendekatan **Views**, *query selector* di Frontend dan *Server Actions* (misal: `supabase.from('m_pendeta').select('*')`) akan terus berfungsi dengan normal selama masa perombakan kode menuju konvensi baru `supabase.from('persons')`.

---

## 5. Impact Analysis (Codebase & RLS)

### 5.1. Contract Registry (`src/lib/authorization`)
- **Adaptasi `target_entity`**: Konstanta *Entity Type* di `enforceContract` (misal: `TargetEntity = 'Pendeta'` atau `'Pelayan'`) secara bertahap perlu disatukan menjadi `'Person'`.
- Kontrak seperti `OC-PERSON-001` (Create Pendeta) dan `OC-PERSON-010` (Create Relawan) dapat digabungkan menjadi single handler dengan pembeda di properti `role_type` *payload*.

### 5.2. RLS Policies Rewrite
Beberapa RLS Policy krusial yang perlu ditulis ulang (langsung pada tabel `persons` atau `person_assignments`):
1. *Users can update their own profile* (berbasis pencocokan `auth.uid()` dengan `persons.user_account_id`).
2. *Admin Mupel can view persons assigned to their territory* (berbasis JOIN `person_assignments` ke `m_pos_pelkes` ke `m_mupel`).

### 5.3. Server Actions Impact (`src/app/actions`)
- `pendeta.ts`, `pelayan.ts`, dan `relawan.ts` merupakan target *refactoring* mayor. Mereka berpotensi dilebur menjadi satu file tunggal: `src/app/actions/persons.ts`.
- Fungsi-fungsi *Fetch* untuk *Dropdown* SDM di UI harus menggunakan `view` sementara, sebelum secara perlahan diubah untuk menarik data langsung dari tabel `persons`.
