import EncryptedStorage from 'react-native-encrypted-storage';

const DEVICE_ID_KEY = 'device_id';
const DEVICE_ID_MAP_KEY = 'device_id_by_username';

// SEMENTARA: hardcode device_id untuk testing login dengan akun existing.
// Nanti setelah backend register/reset device sudah beres, fungsi ini bisa
// dikembalikan ke versi yang generate UUID baru dan menyimpannya di storage.
const FIXED_DEVICE_ID =
  '85cb2002b9fe42ca6328271c1512f03d57962c24a1e235466612ac230ed9fda8';

function generateUuidV4(): string {
  // Implementasi sederhana UUID v4 tanpa dependency eksternal
  // eslint-disable-next-line no-bitwise
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    const existing = await EncryptedStorage.getItem(DEVICE_ID_KEY);

    // Jika sudah ada device_id dan bukan fixed legacy, pakai yang ada
    if (existing && existing !== FIXED_DEVICE_ID) {
      return existing;
    }
  } catch {
    // Abaikan error read storage, lanjut generate baru
  }

  const newId = generateUuidV4();

  try {
    await EncryptedStorage.setItem(DEVICE_ID_KEY, newId);
  } catch {
    // Jika gagal menyimpan, tetap kembalikan newId agar register tetap bisa jalan
  }

  return newId;
}

type DeviceIdMap = {
  [username: string]: string;
};

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
    // abaikan error parse/storage, kembalikan map kosong
  }
  return {};
}

async function saveDeviceIdMap(map: DeviceIdMap): Promise<void> {
  try {
    await EncryptedStorage.setItem(DEVICE_ID_MAP_KEY, JSON.stringify(map));
  } catch {
    // abaikan error simpan, tidak boleh blokir flow auth
  }
}

export async function getOrCreateDeviceIdForUsername(
  username: string,
): Promise<string> {
  const safeUsername = username.trim().toLowerCase();

  // fallback: kalau username kosong, pakai device-level ID biasa
  if (!safeUsername) {
    return getOrCreateDeviceId();
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
