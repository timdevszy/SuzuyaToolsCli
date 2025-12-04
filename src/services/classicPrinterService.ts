// Catatan: sebelumnya kita sempat mencoba berbagai pendekatan (garis ASCII,
// underline, dan gambar PNG). Untuk Print Test 1 saat ini kita kembali ke
// versi paling sederhana: hanya mencetak teks sekali, tanpa gambar.

import EncryptedStorage from 'react-native-encrypted-storage';
import type { DiscountLabelData } from './printerService';

export interface ClassicPrinterDevice {
  name: string;
  address: string;
}

let currentPrinterAddress: string | null = null;
let currentPrinterName: string | null = null;

const LAST_PRINTER_KEY = 'classic_printer_last';

async function saveLastPrinterInfo(address: string, name?: string | null): Promise<void> {
  try {
    await EncryptedStorage.setItem(
      LAST_PRINTER_KEY,
      JSON.stringify({ address, name: name || null }),
    );
  } catch {
    // abaikan error simpan, tidak boleh mengganggu flow utama
  }
}

async function loadLastPrinterInfo(): Promise<{ address: string | null; name: string | null }> {
  try {
    const raw = await EncryptedStorage.getItem(LAST_PRINTER_KEY);
    if (!raw) {
      return { address: null, name: null };
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        address: typeof parsed.address === 'string' ? parsed.address : null,
        name: typeof parsed.name === 'string' ? parsed.name : null,
      };
    }
  } catch {
    // abaikan error baca / parse
  }
  return { address: null, name: null };
}

let BluetoothManager: any = null;
let BluetoothEscposPrinter: any = null;

function ensureNativeModuleLoaded(): boolean {
  if (BluetoothManager && BluetoothEscposPrinter) {
    return true;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@brooons/react-native-bluetooth-escpos-printer');
    // eslint-disable-next-line no-console
    console.log('[ClassicPrinter] Loaded module keys', Object.keys(mod), Object.keys(mod?.default || {}));

    const maybe = mod && (mod.BluetoothManager || mod.default?.BluetoothManager);
    const maybePrinter = mod && (mod.BluetoothEscposPrinter || mod.default?.BluetoothEscposPrinter);
    BluetoothManager = maybe;
    BluetoothEscposPrinter = maybePrinter;
    if (!BluetoothManager || !BluetoothEscposPrinter) {
      // eslint-disable-next-line no-console
      console.warn('[ClassicPrinter] Native module react-native-bluetooth-escpos-printer tidak tersedia');
      return false;
    }
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[ClassicPrinter] Gagal load module react-native-bluetooth-escpos-printer', e);
    return false;
  }
}

export async function ensureBluetoothEnabled(): Promise<void> {
  if (!ensureNativeModuleLoaded()) {
    return;
  }
  if (!BluetoothManager) {
    return;
  }

  // API di @brooons: checkBluetoothEnabled() dan enableBluetooth()
  // Di beberapa device, scanDevices melempar NOT_STARTED kalau enableBluetooth tidak pernah dipanggil.
  if (typeof BluetoothManager.enableBluetooth === 'function') {
    await BluetoothManager.enableBluetooth();
  } else if (typeof BluetoothManager.checkBluetoothEnabled === 'function') {
    // fallback: minimal cek status kalau enableBluetooth tidak ada
    await BluetoothManager.checkBluetoothEnabled();
  }
}

export async function scanClassicPrinters(): Promise<ClassicPrinterDevice[]> {
  if (!ensureNativeModuleLoaded()) {
    return [];
  }
  await ensureBluetoothEnabled();

  if (!BluetoothManager || typeof BluetoothManager.scanDevices !== 'function') {
    // eslint-disable-next-line no-console
    console.warn('[ClassicPrinter] BluetoothManager.scanDevices tidak tersedia');
    return [];
  }

  const result = await BluetoothManager.scanDevices();
  // result adalah JSON string: { paired: [...], found: [...] }
  const parsed = JSON.parse(result || '{}');
  const all: ClassicPrinterDevice[] = [];

  const paired = parsed.paired || [];
  const found = parsed.found || [];

  const pushList = (list: any[]) => {
    list.forEach((raw: any) => {
      try {
        const dev = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (dev && dev.address) {
          all.push({ name: dev.name || dev.device || dev.address, address: dev.address });
        }
      } catch {
        // ignore parse error
      }
    });
  };

  pushList(paired);
  pushList(found);

  return all;
}

export async function connectToClassicPrinter(address: string, name?: string): Promise<void> {
  if (!ensureNativeModuleLoaded()) {
    return;
  }
  await ensureBluetoothEnabled();
  if (!BluetoothManager || typeof BluetoothManager.connect !== 'function') {
    // eslint-disable-next-line no-console
    console.warn('[ClassicPrinter] BluetoothManager.connect tidak tersedia');
    return;
  }
  await BluetoothManager.connect(address);
  currentPrinterAddress = address;
  currentPrinterName = name || address;
  await saveLastPrinterInfo(currentPrinterAddress, currentPrinterName);
}

export function getCurrentPrinterAddress(): string | null {
  return currentPrinterAddress;
}

export function getCurrentPrinterInfo(): { address: string | null; name: string | null } {
  return { address: currentPrinterAddress, name: currentPrinterName };
}

export async function getLastPrinterInfo(): Promise<{ address: string | null; name: string | null }> {
  if (currentPrinterAddress) {
    return { address: currentPrinterAddress, name: currentPrinterName };
  }
  return loadLastPrinterInfo();
}

export async function disconnectClassicPrinter(): Promise<void> {
  if (!ensureNativeModuleLoaded()) {
    return;
  }
  if (!BluetoothManager || typeof BluetoothManager.disconnect !== 'function') {
    // eslint-disable-next-line no-console
    console.warn('[ClassicPrinter] BluetoothManager.disconnect tidak tersedia');
    currentPrinterAddress = null;
    currentPrinterName = null;
    return;
  }

  if (!currentPrinterAddress) {
    // eslint-disable-next-line no-console
    console.log('[ClassicPrinter] Tidak ada printer yang sedang terhubung saat disconnect dipanggil');
    return;
  }

  try {
    await BluetoothManager.disconnect(currentPrinterAddress);
    // eslint-disable-next-line no-console
    console.log('[ClassicPrinter] Printer disconnected:', currentPrinterAddress);
  } finally {
    currentPrinterAddress = null;
    currentPrinterName = null;
  }
}

export async function printSimpleTestLabel(): Promise<void> {
  if (!ensureNativeModuleLoaded()) {
    // eslint-disable-next-line no-console
    console.warn('[ClassicPrinter] Module printer klasik belum siap, tidak bisa print');
    return;
  }
  if (!currentPrinterAddress) {
    // eslint-disable-next-line no-console
    console.warn('[ClassicPrinter] Tidak ada printer yang terhubung');
    return;
  }

  await BluetoothEscposPrinter.printerInit();
  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
  const textTop = 'TEST PRINT';

  // eslint-disable-next-line no-console
  console.log('[Printer] Test1 simple text', {
    top: textTop,
  });

  // Cetak satu baris teks sederhana untuk test (tanpa informasi harga)
  await BluetoothEscposPrinter.printText(`${textTop}\n\n`, {
    encoding: 'UTF-8',
    codepage: 0,
    widthtimes: 0,
    heigthtimes: 0,
    fonttype: 0,
  });

  await BluetoothEscposPrinter.printAndFeed(30);
}

export async function printDiscountLabelOnClassicPrinter(
  label: DiscountLabelData,
): Promise<void> {
  if (!ensureNativeModuleLoaded()) {
    // eslint-disable-next-line no-console
    console.warn('[ClassicPrinter] Module printer klasik belum siap, tidak bisa print label diskon');
    throw new Error('Printer klasik belum siap');
  }
  if (!currentPrinterAddress) {
    // eslint-disable-next-line no-console
    console.warn('[ClassicPrinter] Tidak ada printer yang terhubung untuk print label diskon');
    throw new Error('Tidak ada printer yang terhubung');
  }

  await BluetoothEscposPrinter.printerInit();
  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);

  const baseTextOpts = {
    encoding: 'UTF-8',
    codepage: 0,
    widthtimes: 0,
    heigthtimes: 0,
    fonttype: 0,
  } as const;

  const headlineOpts = {
    ...baseTextOpts,
    widthtimes: 1,
    heigthtimes: 1,
  } as const;

  const normalStr = label.normalPrice.toLocaleString('id-ID');
  const discountStr = label.discountPrice.toLocaleString('id-ID');

  const discountPercent =
    label.normalPrice > 0
      ? Math.round(((label.normalPrice - label.discountPrice) / label.normalPrice) * 100)
      : 0;

  const hasDiscountPercent = discountPercent > 0 && discountPercent < 100;
  const headline = hasDiscountPercent ? `HEMAT ${discountPercent}%` : 'HEMAT';

  await BluetoothEscposPrinter.printText(`${headline}\n`, headlineOpts);
  await BluetoothEscposPrinter.printText(`${label.productName}\n`, baseTextOpts);

  // Satu baris kosong kecil di antara nama produk dan Qty
  await BluetoothEscposPrinter.printText(`Qty : ${label.unitLabel}\n`, baseTextOpts);

  if (BluetoothEscposPrinter.printBarCode) {
    try {
      await BluetoothEscposPrinter.printBarCode(
        label.barcode,
        BluetoothEscposPrinter.BARCODETYPE.CODE128,
        2,
        80,
        BluetoothEscposPrinter.ALIGN.CENTER,
        2,
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[ClassicPrinter] Gagal mencetak barcode, lanjut dengan teks saja', e);
    }
  }

  await BluetoothEscposPrinter.printText(
    `Harga : Rp ${normalStr} Rp. ${discountStr}\n`,
    baseTextOpts,
  );

  // Feed cukup panjang supaya label berikutnya mulai di bawah baris Harga,
  // sehingga Harga selalu menjadi bagian paling bawah dari satu label,
  // tetapi tidak terlalu jauh agar posisi Harga tidak terlalu turun.
  await BluetoothEscposPrinter.printAndFeed(80);
}
