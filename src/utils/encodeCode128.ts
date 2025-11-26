// Utility untuk meng-encode string menjadi pola Code 128 (set B/C) + checksum
// Fokus: dipakai untuk label diskon & printer (RPP02N / ESC/POS)
//
// Catatan: Tabel pattern diambil dari spesifikasi resmi Code 128
// (107 symbol: 103 data, 3 start, 1 stop). Di sini kita hanya encode,
// tidak menggambar atau mengirim ke printer.

export type Code128Set = 'A' | 'B' | 'C';

export interface Code128Encoded {
  startSet: Code128Set;
  codes: number[];      // termasuk start, data, checksum, stop
  patterns: string[];   // pattern "212222" per symbol, urutan sama dengan codes
}

// 107 pattern resmi Code 128.
// Index = value (0..106). Setara dengan tabel di referensi Code128.
// Setiap string berisi 6 angka (3 bar + 3 space), total 11 modul.
// Stop pattern menggunakan nilai 106 dengan 13 modul (diwakili di sini sebagai "2331112").
//
// Sumber pola: grandzebu / wikipedia Code128 (disalin manual).
// Untuk keperluan app ini cukup sebagai lookup pattern.

const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];

// Mapping karakter -> value untuk Code 128 Set B.
// Tabel ini hanya mencakup subset yang umum dipakai di aplikasi POS:
// spasi, digit, huruf besar/kecil, dan beberapa simbol dasar.
// Jika ada karakter di luar tabel ini, fungsi akan melempar error.

const CODE128_SET_B: Record<string, number> = {};

(function initSetB() {
  // 0..95: ASCII 32..127
  const chars =
    " !\"#$%&'()*+,-./" +
    '0123456789' +
    ':;<=>?@' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    '[\\]^_' +
    'abcdefghijklmnopqrstuvwxyz' +
    '{|}~';

  for (let i = 0; i < chars.length; i++) {
    CODE128_SET_B[chars[i]] = i;
  }
})();

function isNumeric(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

function decideStartSet(value: string, preferred: Code128Set = 'B'): Code128Set {
  // Sederhana: kalau semua digit dan panjang >= 4, pakai C, selain itu pakai preferred (default B)
  if (isNumeric(value) && value.length >= 4) {
    return 'C';
  }
  return preferred;
}

/**
 * Encode string menjadi Code 128 (set B atau C) lengkap dengan checksum dan STOP.
 *
 * - Untuk set C: value harus digit genap; kalau panjang ganjil, kita tambahkan '0' di depan.
 * - Untuk set B: karakter harus ada di tabel CODE128_SET_B.
 */
export function encodeCode128(value: string, preferredSet: Code128Set = 'B'): Code128Encoded {
  if (!value) {
    throw new Error('encodeCode128: value tidak boleh kosong');
  }

  const startSet = decideStartSet(value, preferredSet);
  const codes: number[] = [];
  const dataCodes: number[] = [];

  if (startSet === 'A') {
    codes.push(103);
  } else if (startSet === 'B') {
    codes.push(104);
  } else {
    codes.push(105); // set C
  }

  if (startSet === 'C') {
    let digits = value;
    if (digits.length % 2 !== 0) {
      // pad kiri supaya genap
      digits = '0' + digits;
    }
    for (let i = 0; i < digits.length; i += 2) {
      const pair = digits.substring(i, i + 2);
      const code = parseInt(pair, 10);
      if (Number.isNaN(code) || code < 0 || code > 99) {
        throw new Error(`encodeCode128: pair digit tidak valid: ${pair}`);
      }
      dataCodes.push(code);
    }
  } else {
    // Set B: karakter apa adanya
    for (const ch of value) {
      const code = CODE128_SET_B[ch];
      if (code === undefined) {
        throw new Error(`encodeCode128: karakter tidak didukung di Code128 set B: "${ch}"`);
      }
      dataCodes.push(code);
    }
  }

  // Tambahkan data codes ke daftar
  codes.push(...dataCodes);

  // Hitung checksum (mod 103)
  // startCode berbobot 1, data pertama bobot 1, kedua bobot 2, dst.
  let sum = codes[0];
  for (let i = 1; i < codes.length; i++) {
    sum += codes[i] * i;
  }
  const checksum = sum % 103;
  codes.push(checksum);

  // STOP
  codes.push(106);

  const patterns = codes.map(code => {
    const pattern = CODE128_PATTERNS[code];
    if (!pattern) {
      throw new Error(`encodeCode128: pattern tidak ditemukan untuk code ${code}`);
    }
    return pattern;
  });

  return { startSet, codes, patterns };
}
