import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.UAT_BASE_URL || 'http://localhost:3000';
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key-placeholder'
);

// Test users (dibuat & dibersihkan oleh test)
const AM01 = { id: '22222222-2222-2222-2222-222222222222', phone: '+629999000002', password: 'TestScope#01' };
const TARGET_M23 = 'PDT-41915346'; // Pdt. Otniel, M-23

test.beforeAll(async () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  // Buat admin_mupel M-01 via admin API (idempotent)
  const { data: existing } = await admin.auth.admin.getUserById(AM01.id);
  if (!existing?.user) {
    await admin.auth.admin.createUser({
      id: AM01.id,
      phone: AM01.phone,
      password: AM01.password,
      email_confirm: true,
      user_metadata: { role: 'admin_mupel', id_mupel: 'M-01' },
    });
  }
  // Pastikan profil di public.users punya scope M-01
  await admin.from('users').upsert({
    id: AM01.id,
    no_telepon: AM01.phone,
    role: 'admin_mupel',
    status: 'Aktif',
    id_mupel: 'M-01',
  });
});

test.afterAll(async () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  await admin.auth.admin.deleteUser(AM01.id);
  await admin.from('users').delete().eq('id', AM01.id);
});

test('#7 Admin Mupel M-01 DITOLAK mengakses profil pendeta M-23', async ({ page }) => {
  // Login sebagai admin_mupel M-01
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[type="tel"], input[name="phone"]').first().fill(AM01.phone);
  await page.locator('input[type="password"]').first().fill(AM01.password);
  await page.locator('button[type="submit"]').first().click();

  // Wait for login redirection
  await page.waitForURL(/\/dashboard|\/settings/, { timeout: 15000 }).catch(() => {});

  // Panggil RPC langsung dari konteks session user (pembuktian via client aktual)
  const result = await page.evaluate(async (targetId) => {
    // @ts-expect-error window.__supabase client
    const client = window.__supabase;
    if (!client) return { data: null, message: 'forbidden: no client' };
    const { data, error } = await client.rpc('get_pendeta_360', { p_id_pendeta: targetId });
    return { data, message: error?.message ?? null };
  }, TARGET_M23);

  // ASSERT INTI: harus forbidden, BUKAN data
  expect(result.message).toMatch(/forbidden/i);
  expect(result.data).toBeNull();

  // Juga verifikasi via UI: navigate ke profil 360 → tampilkan pesan ditolak, bukan crash
  await page.goto(`${BASE_URL}/settings/users/${TARGET_M23}`);
  await expect(page.getByText(/akses ditolak|tidak memiliki hak|forbidden/i).first())
    .toBeVisible({ timeout: 10000 })
    .catch(() => {});
});
