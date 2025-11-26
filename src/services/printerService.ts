// Service untuk abstraksi printer (RPP02N / ESC/POS) khusus kebutuhan label diskon.
// Di sini kita belum mengirim command ke perangkat, hanya menyiapkan struktur
// data dan fungsi yang mudah dihubungkan dengan implementasi printer nyata.

import { encodeCode128 } from '../utils/encodeCode128';

export interface PrinterSettings {
  // Apakah harga normal harus dicoret (wajib true di kasus diskon)
  strikeThroughPrice: boolean;
  // Offset vertikal garis coret relatif ke baseline teks harga normal (satuan: dot/pixel relatif)
  strikeOffsetY: number;

  // Ukuran font / layout dasar
  fontSizeNormal: number;
  fontSizePrice: number;
  lineSpacing: number;

  // Lebar area cetak (dalam dot atau mm, tergantung implementasi nanti)
  labelWidth: number;
}

export const defaultPrinterSettings: PrinterSettings = {
  strikeThroughPrice: true,
  strikeOffsetY: 0, // bisa kamu tuning dari UI
  fontSizeNormal: 12,
  fontSizePrice: 14,
  lineSpacing: 4,
  labelWidth: 384, // kira-kira lebar 58mm printer thermal (8 dot/mm * 48mm~)
};

// Struktur data minimum yang perlu untuk cetak label diskon.
// Kita sengaja buat generic agar bisa diisi dari Discount item mana pun.
export interface DiscountLabelData {
  productName: string;
  internalCode: string;
  barcode: string;
  unitLabel: string; // contoh: "1 PCS"
  normalPrice: number; // harga sebelum diskon
  discountPrice: number; // harga setelah diskon
}

export interface PreparedDiscountPrintJob {
  settings: PrinterSettings;
  label: DiscountLabelData;
  barcodeEncoding: ReturnType<typeof encodeCode128>;
}

/**
 * Siapkan data yang siap dikirim ke printer untuk satu label diskon.
 *
 * Tahap selanjutnya (yang bisa kamu hubungkan sendiri dengan lib ESC/POS) adalah
 * mengubah PreparedDiscountPrintJob menjadi bytes command untuk RPP02N.
 */
export function prepareDiscountPrintJob(
  label: DiscountLabelData,
  settings: PrinterSettings = defaultPrinterSettings,
): PreparedDiscountPrintJob {
  const barcodeEncoding = encodeCode128(label.barcode, 'C');

  // Untuk debugging sekarang kita hanya log struktur yang akan dipakai.
  // Nanti di integrasi sebenarnya, fungsi ini bisa dipakai sebagai input
  // ke layer paling bawah yang membangkitkan ESC/POS command.
  //
  // Contoh pseudo:
  //   const bytes = buildEscPosCommandsFromJob(job);
  //   sendToPrinter(bytes);

  return {
    settings,
    label,
    barcodeEncoding,
  };
}

/**
 * Contoh fungsi placeholder untuk cetak satu label diskon.
 * Saat ini hanya console.log; nanti bisa kamu ganti jadi kirim ke printer.
 */
export async function printDiscountLabel(
  label: DiscountLabelData,
  settings: PrinterSettings = defaultPrinterSettings,
): Promise<void> {
  const job = prepareDiscountPrintJob(label, settings);

  console.log('[Printer] Prepared discount label job', {
    settings: job.settings,
    label: job.label,
    codes: job.barcodeEncoding.codes,
    patterns: job.barcodeEncoding.patterns,
  });

  // TODO: Integrasi dengan library ESC/POS / Bluetooth yang kamu pakai.
  // Di titik ini kamu bisa implementasi garis coret harga normal:
  // - print teks harga normal
  // - gambar garis horizontal di posisi (baselineY + strikeOffsetY)
  // berdasarkan setting.job.settings.strikeThroughPrice & strikeOffsetY.
}
