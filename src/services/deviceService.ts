import EncryptedStorage from 'react-native-encrypted-storage';

// Key untuk menyimpan mapping username -> device_id di EncryptedStorage.
// Bentuk datanya adalah JSON object, contoh:
// {
//   "user_a": "uuid-v4-1",
//   "user_b": "uuid-v4-2"
// }
const DEVICE_ID_MAP_KEY = 'device_id_by_username';

// Generate UUID v4 sederhana tanpa dependency eksternal.
// Hanya menggunakan Math.random(), tidak mengambil data hardware / IMEI / dsb.
function generateUuidV4(): string {
  // eslint-disable-next-line no-bitwise
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Struktur map username -> device_id yang disimpan di storage.
type DeviceIdMap = {
  [username: string]: string;
};

// Membaca map device_id dari EncryptedStorage.
// Jika belum ada atau gagal parse, akan mengembalikan object kosong.
async function loadDeviceIdMap(): Promise<DeviceIdMap> {
  try {
    const raw = await EncryptedStorage.getItem(DEVICE_ID_MAP_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as DeviceIdMap;
    }
  } catch {
    // Abaikan error baca / parse storage, gunakan map kosong sebagai fallback.
  }
  return {};
}

// Menyimpan map username -> device_id ke EncryptedStorage.
// Error penyimpanan tidak boleh memblokir flow auth, jadi error diabaikan.
async function saveDeviceIdMap(map: DeviceIdMap): Promise<void> {
  try {
    await EncryptedStorage.setItem(DEVICE_ID_MAP_KEY, JSON.stringify(map));
  } catch {
    // Abaikan error simpan; di lain waktu map akan dibuat ulang jika perlu.
  }
}

// Mengambil atau membuat device_id khusus untuk satu username.
// - Username akan di-normalisasi ke lowercase dan di-trim.
// - Jika username sudah punya device_id di map, gunakan nilai yang sama (persisten).
// - Jika belum ada, generate UUID v4 baru, simpan ke map, lalu kembalikan.
// Catatan: device_id ini murni acak (berbasis Math.random), tidak
//          mengandung informasi hardware atau data pribadi lainnya.
export async function getOrCreateDeviceIdForUsername(
  username: string,
): Promise<string> {
  const safeUsername = username.trim().toLowerCase();

  // Jika username kosong, tetap generate UUID baru sekali pakai.
  if (!safeUsername) {
    return generateUuidV4();
  }

  const map = await loadDeviceIdMap();

  if (map[safeUsername]) {
    return map[safeUsername];
  }

  const newId = generateUuidV4();
  map[safeUsername] = newId;
  await saveDeviceIdMap(map);
  return newId;
}

export async function getOrCreateDeviceId(): Promise<string> {
  return getOrCreateDeviceIdForUsername('_global');
}
