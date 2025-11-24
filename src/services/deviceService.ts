import EncryptedStorage from 'react-native-encrypted-storage';

const DEVICE_ID_KEY = 'device_id';

// SEMENTARA: hardcode device_id untuk testing login dengan akun existing.
// Nanti setelah backend register/reset device sudah beres, fungsi ini bisa
// dikembalikan ke versi yang generate UUID baru dan menyimpannya di storage.
const FIXED_DEVICE_ID =
  '85cb2002b9fe42ca6328271c1512f03d57962c24a1e235466612ac230ed9fda8';

export async function getOrCreateDeviceId(): Promise<string> {
  await EncryptedStorage.setItem(DEVICE_ID_KEY, FIXED_DEVICE_ID);
  return FIXED_DEVICE_ID;
}
