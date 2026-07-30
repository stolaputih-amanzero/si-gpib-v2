import { describe, it, expect } from 'vitest';
import { normalizePosName } from './normalize-pos-name';

describe('normalizePosName', () => {
  it('menghapus prefix "Pos Pelkes"', () => {
    expect(normalizePosName('Pos Pelkes Sambi')).toBe('Sambi');
    expect(normalizePosName('Pos Pelkes Eben Haezer Tripariq Makmur, Long Hubung'))
      .toBe('Eben Haezer Tripariq Makmur, Long Hubung');
  });

  it('menghapus prefix "Pospelkes" (tanpa spasi)', () => {
    expect(normalizePosName('Pospelkes Immanuel Tj Medang')).toBe('Immanuel Tj Medang');
    expect(normalizePosName('PosPelkes Air Hidup Setogor')).toBe('Air Hidup Setogor');
  });

  it('menghapus prefix typo "Pos Pelkese"', () => {
    expect(normalizePosName('Pos Pelkese Batu Tinggi, Celengan'))
      .toBe('Batu Tinggi, Celengan');
  });

  it('menghapus prefix "Bajem" dan "Bakal Jemaat"', () => {
    expect(normalizePosName('Bajem Tabanan')).toBe('Tabanan');
    expect(normalizePosName('Bakal Jemaat Sion Merlung')).toBe('Sion Merlung');
    expect(normalizePosName('Bajem "Maranatha" Batu Keling')).toBe('Maranatha Batu Keling');
  });

  it('menghapus prefix "GPIB Pos Pelkes"', () => {
    expect(normalizePosName('GPIB Pos Pelkes Gideon Sebuduh')).toBe('Gideon Sebuduh');
    expect(normalizePosName('GPIB Pos Pelkes Penabur Ngoyok')).toBe('Penabur Ngoyok');
  });

  it('menghapus tanda kutip', () => {
    expect(normalizePosName('"Kanaan" Barong Tongkok')).toBe('Kanaan Barong Tongkok');
    expect(normalizePosName('Pos Pelkes "Bethesda" Palaran')).toBe('Bethesda Palaran');
  });

  it('title case untuk nama full uppercase', () => {
    expect(normalizePosName('POS PELKES WAY HANDOP')).toBe('Way Handop');
    expect(normalizePosName('SUMBER KASIH TANJUNG AGUNG')).toBe('Sumber Kasih Tanjung Agung');
  });

  it('title case untuk nama full lowercase', () => {
    expect(normalizePosName('kembiri')).toBe('Kembiri');
  });

  it('mempertahankan singkatan baku dan angka', () => {
    expect(normalizePosName('Pos Pelkes Pancaran Kasih DK3')).toBe('Pancaran Kasih DK3');
    expect(normalizePosName('Pos Pelkes Perdamaian Km12 Bagan Musik Estate'))
      .toBe('Perdamaian Km12 Bagan Musik Estate');
    expect(normalizePosName('Pos Pelkes Soli Deo PT. LAP')).toBe('Soli Deo PT. LAP');
  });

  it('tidak merusak nama yang sudah bersih', () => {
    expect(normalizePosName('Parittiga')).toBe('Parittiga');
    expect(normalizePosName('Ekklesia Nanga Silat')).toBe('Ekklesia Nanga Silat');
    expect(normalizePosName('Alfa & Omega Nanga Tayap')).toBe('Alfa & Omega Nanga Tayap');
  });

  it('edge case: jika hasil normalisasi bersih menjadi kosong, fallback ke nama asli', () => {
    expect(normalizePosName('Pos Pelkes')).toBe('Pos Pelkes');
    expect(normalizePosName('Bajem')).toBe('Bajem');
  });

  it('menangani null/undefined/empty', () => {
    expect(normalizePosName(null)).toBe('');
    expect(normalizePosName(undefined)).toBe('');
    expect(normalizePosName('')).toBe('');
    expect(normalizePosName('   ')).toBe('');
  });
});
