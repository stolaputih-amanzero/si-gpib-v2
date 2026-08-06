import { test, expect } from '@playwright/test';
import { readStore, setVisibility, isiFormMinimal } from './helpers';

test('VP-4: draft pulih setelah reload', async ({ page }) => {
  await page.goto('/dashboard/pastoral/baru');
  await isiFormMinimal(page);
  await setVisibility(page, 'hidden');
  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.getByPlaceholder(/ringkasan/i)).toHaveValue('Uji otomatis CJ-1');
  await expect(page.getByRole('button', { name: /Kunjungan Pastoral/ })).toBeVisible();
});

test('VP-5: visibilitychange menyimpan tanpa menunggu 30 detik', async ({ page }) => {
  await page.goto('/dashboard/pastoral/baru');
  await isiFormMinimal(page);
  const draftsBefore = await readStore(page, 'drafts');
  expect(draftsBefore.find((d: any) => d.formKey === 'pastoral-new')).toBeUndefined();
  await setVisibility(page, 'hidden');
  await expect.poll(async () => {
    const rows = await readStore(page, 'drafts');
    return rows.some((d: any) => d.formKey === 'pastoral-new');
  }, { timeout: 3_000 }).toBe(true);
});

test('VP-6: pilihan Pos aktif persist setelah reload', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: /Pilih Pos/i }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: /Eben Haezer/ }).click();
  await expect(page.locator('header')).toContainText(/Eben Haezer/);
  expect(await page.evaluate(() => localStorage.getItem('sigpib:active-pos'))).toBe('POS-00002');
  await page.reload();
  await expect(page.locator('header')).toContainText(/Eben Haezer/);
});

test('VP-7: submit offline masuk ke pendingSubmissions + banner muncul', async ({ page, context }) => {
  await page.goto('/dashboard/pastoral/baru');
  await isiFormMinimal(page);
  await context.setOffline(true);
  await page.getByRole('button', { name: /Simpan & Kirim Nanti|Kirim/ }).click();
  await expect(page.getByText(/offline|menunggu/i).first()).toBeVisible({ timeout: 5_000 });
  await expect.poll(async () => (await readStore(page, 'pendingSubmissions')).length, { timeout: 5_000 }).toBe(1);
  const [item] = await readStore<any>(page, 'pendingSubmissions');
  expect(item).toMatchObject({ targetIdentifier: 'create_log_pastoral', status: 'pending' });
});

test('VP-8: queue tersinkron otomatis saat online kembali', async ({ page, context }) => {
  await page.goto('/dashboard/pastoral/baru');
  await isiFormMinimal(page);
  await context.setOffline(true);
  await page.getByRole('button', { name: /Simpan & Kirim Nanti|Kirim/ }).click();
  await expect.poll(async () => (await readStore(page, 'pendingSubmissions')).length).toBe(1);
  const [item] = await readStore<any>(page, 'pendingSubmissions');

  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));

  await expect.poll(async () => (await readStore(page, 'pendingSubmissions')).length, { timeout: 30_000 }).toBe(0);
  await expect(page.getByText(/berhasil/i)).toBeVisible({ timeout: 10_000 });

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { count } = await admin.from('sys_transaction_logs')
      .select('id', { count: 'exact', head: true })
      .eq('request_id', item.requestId);
    expect(count).toBe(1);
  }
});
