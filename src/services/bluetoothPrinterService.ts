import { BleManager, Device, Characteristic } from 'react-native-ble-plx';

// Service Bluetooth printer dengan integrasi react-native-ble-plx.
// Dibuat aman dengan lazy-init BleManager + try/catch supaya tidak crash
// kalau native module belum sepenuhnya ter-setup.

let bleManager: BleManager | null = null;
let currentPrinterId: string | null = null;
let isConnecting = false;

// TODO: ganti dengan UUID service & characteristic sesuai printer kamu
const PRINTER_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
const PRINTER_WRITE_CHAR_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

function getBleManager(): BleManager | null {
  if (bleManager) return bleManager;
  try {
    bleManager = new BleManager();
    return bleManager;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[BluetoothPrinter] BleManager init failed, BLE disabled for now', e);
    return null;
  }
}

export function setCurrentPrinter(deviceId: string | null) {
  currentPrinterId = deviceId;
}

export async function scanForPrinters(timeoutMs: number = 5000): Promise<void> {
  const manager = getBleManager();
  if (!manager) {
    // eslint-disable-next-line no-console
    console.warn('[BluetoothPrinter] BLE belum siap, tidak bisa scan');
    return;
  }

  // eslint-disable-next-line no-console
  console.log('[BluetoothPrinter] Mulai scan printer (BLE)...');

  const seen: Record<string, Device> = {};

  const subscription = manager.onStateChange(async state => {
    if (state === 'PoweredOn') {
      try {
        await manager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            // eslint-disable-next-line no-console
            console.warn('[BluetoothPrinter] Scan error', error);
            return;
          }
          if (!device || !device.id) return;
          if (seen[device.id]) return;
          seen[device.id] = device;
        });

        setTimeout(() => {
          manager.stopDeviceScan();
          const list = Object.values(seen).map(d => ({ id: d.id, name: d.name }));
          // eslint-disable-next-line no-console
          console.log('[BluetoothPrinter] Scan selesai, device ditemukan:', list);
        }, timeoutMs);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[BluetoothPrinter] Gagal start scan', e);
      }
      subscription.remove();
    }
  }, true);
}

async function getConnectedDevice(): Promise<Device | null> {
  if (!currentPrinterId) return null;
  const manager = getBleManager();
  if (!manager) return null;

  try {
    const devices = await manager.connectedDevices([PRINTER_SERVICE_UUID]);
    const found = devices.find((d: Device) => d.id === currentPrinterId) || null;
    return found;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[BluetoothPrinter] getConnectedDevice error', e);
    return null;
  }
}

async function connectIfNeeded(): Promise<Device | null> {
  if (!currentPrinterId) {
    // eslint-disable-next-line no-console
    console.warn('[BluetoothPrinter] currentPrinterId belum di-set');
    return null;
  }

  if (isConnecting) {
    return null;
  }

  const manager = getBleManager();
  if (!manager) return null;

  const already = await getConnectedDevice();
  if (already) return already;

  isConnecting = true;
  try {
    let device = await manager.connectToDevice(currentPrinterId, { autoConnect: true });
    device = await device.discoverAllServicesAndCharacteristics();
    return device;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[BluetoothPrinter] connectIfNeeded error', e);
    return null;
  } finally {
    isConnecting = false;
  }
}

export async function sendToPrinter(data: Uint8Array): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[BluetoothPrinter] sendToPrinter length', data.length);

  const device = await connectIfNeeded();
  if (!device) {
    // eslint-disable-next-line no-console
    console.warn('[BluetoothPrinter] Tidak ada device yang terhubung atau BLE belum siap');
    return;
  }

  try {
    // Konversi Uint8Array ke base64 (React Native BLE butuh string base64)
    let binary = '';
    for (let i = 0; i < data.length; i += 1) {
      binary += String.fromCharCode(data[i]);
    }
    const base64Data = (global as any).btoa
      ? (global as any).btoa(binary)
      : // @ts-ignore: btoa tersedia di lingkungan React Native
        btoa(binary);

    const characteristic: Characteristic | null = await device.writeCharacteristicWithResponseForService(
      PRINTER_SERVICE_UUID,
      PRINTER_WRITE_CHAR_UUID,
      base64Data,
    );

    // eslint-disable-next-line no-console
    console.log('[BluetoothPrinter] writeCharacteristic result', !!characteristic);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[BluetoothPrinter] Gagal kirim data ke printer', e);
  }
}
