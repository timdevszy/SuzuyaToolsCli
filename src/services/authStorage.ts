import EncryptedStorage from 'react-native-encrypted-storage';
import type { LoginResultUser } from './authService';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export async function saveSession(user: LoginResultUser) {
  try {
    await EncryptedStorage.setItem(TOKEN_KEY, user.token);
    await EncryptedStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('authStorage.saveSession error', e);
  }
}

export async function loadSession(): Promise<LoginResultUser | null> {
  try {
    const token = await EncryptedStorage.getItem(TOKEN_KEY);
    const rawUser = await EncryptedStorage.getItem(USER_KEY);

    if (!token || !rawUser) {
      return null;
    }

    try {
      const user = JSON.parse(rawUser) as LoginResultUser;
      return user;
    } catch {
      return null;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('authStorage.loadSession error', e);
    return null;
  }
}

export async function clearSession() {
  try {
    await EncryptedStorage.removeItem(TOKEN_KEY);
    await EncryptedStorage.removeItem(USER_KEY);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('authStorage.clearSession error', e);
  }
}
