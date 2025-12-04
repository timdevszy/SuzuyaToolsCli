// Utility functions to encode a string into Code 128 (Set B) modules for visual rendering.
// This is used for on-screen previews only; actual printing still uses the ESC/POS barcode API.

// Pola modul resmi Code 128 untuk kode 0-106 (6 atau 7 digit, bar/space bergantian).
// Diambil dari spesifikasi Code 128 (ISO/IEC 15417).
const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312',
  '132212', '221213', '221312', '231212', '112232', '122132', '122231', '113222',
  '123122', '123221', '223211', '221132', '221231', '213212', '223112', '312131',
  '311222', '321122', '321221', '312212', '322112', '322211', '212123', '212321',
  '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121',
  '313121', '211331', '231131', '213113', '213311', '213131', '311123', '311321',
  '331121', '312113', '312311', '332111', '314111', '221411', '431111', '111224',
  '111422', '121124', '121421', '141122', '141221', '112214', '112412', '122114',
  '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112',
  '421211', '212141', '214121', '412121', '111143', '111341', '131141', '114113',
  '114311', '411113', '411311', '113141', '114131', '311141', '411131', '211412',
  '211214', '211232', '2331112',
];

const START_B = 104;
const STOP = 106;

/**
 * Encode string ke Code128 Set B dan kembalikan deretan modul (lebar unit) yang
 * merepresentasikan bar + spasi, dimulai dari bar hitam.
 * Mengembalikan [] jika input kosong atau berisi karakter di luar range Set B.
 */
export function encodeCode128BToModules(value: string): number[] {
  const safe = (value || '').trim();
  if (!safe) return [];

  const chars = safe.split('');
  const dataCodes: number[] = [];

  for (let i = 0; i < chars.length; i += 1) {
    const code = chars[i].charCodeAt(0);
    // Code Set B mendukung ASCII 32-126.
    if (code < 32 || code > 126) {
      return [];
    }
    dataCodes.push(code - 32);
  }

  const fullCodes: number[] = [];
  fullCodes.push(START_B);
  fullCodes.push(...dataCodes);

  // Checksum Code128: (start + sum(code_i * weight_i)) mod 103
  let checksum = START_B;
  for (let i = 0; i < dataCodes.length; i += 1) {
    checksum += dataCodes[i] * (i + 1);
  }
  checksum %= 103;
  fullCodes.push(checksum);
  fullCodes.push(STOP);

  const modules: number[] = [];
  fullCodes.forEach(symbolCode => {
    const pattern = CODE128_PATTERNS[symbolCode];
    if (!pattern) return;
    for (let i = 0; i < pattern.length; i += 1) {
      modules.push(Number(pattern[i]));
    }
  });

  return modules;
}
