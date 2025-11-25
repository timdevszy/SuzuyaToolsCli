import { apiClient } from '../api/apiClient';
import { getOrCreateDeviceIdForUsername } from './deviceService';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  password: string;
  password_confirmation: string;
  jabatan: string;
  divisi: string;
  brands: string[];
  outlet_choice: Array<{ value: string; name: string }>;
}

export interface LoginResultUser {
  uuid: string;
  name: string;
  username: string;
  token: string;
  jabatan: string;
  divisi: string;
  brand: string;
  device_id: string;
  default_outlet: string;
  status: number;
  login_status: number;
  // plus field lain yang belum kita mapping detail
  [key: string]: any;
}

export interface LoginResponseDto {
  status: number;
  success: boolean;
  error: boolean;
  msg?: string;
  message?: string;
  results?: LoginResultUser[];
}

export async function login(payload: LoginPayload): Promise<LoginResultUser> {
  const device_id = await getOrCreateDeviceIdForUsername(payload.username);

  const res = await apiClient.post<LoginResponseDto>('/login/ssa', {
    username: payload.username,
    password: payload.password,
    device_id,
  });

  const data = res.data;

  if (!data.success || !data.results || data.results.length === 0) {
    const msg = data.message || data.msg || 'Login gagal';
    throw new Error(msg);
  }

  return data.results[0];
}

export async function register(payload: RegisterPayload): Promise<LoginResultUser> {
  const device_id = await getOrCreateDeviceIdForUsername(payload.username);

  const isSuplier = payload.jabatan
    ? payload.jabatan.toLowerCase() === 'suplier'.toLowerCase()
    : false;

  const brandsToSend = isSuplier
    ? (payload.brands && payload.brands.length > 0 ? payload.brands : [])
    : ['-'];

  const firstOutlet =
    (payload.outlet_choice && payload.outlet_choice[0]) ||
    ({ value: '-', name: '-' } as { value: string; name: string });

  const body = {
    name: payload.name,
    username: payload.username,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
    jabatan: payload.jabatan,
    divisi: payload.divisi,
    // Suplier: kirim brand pilihan user. Non-suplier: kirim placeholder '-'.
    // Backend melakukan json_decode di sisi server, jadi kirim sebagai string JSON untuk compatibility.
    brands: JSON.stringify(brandsToSend),
    outlet_choice: JSON.stringify(payload.outlet_choice ?? []),
    default_outlet: firstOutlet.value,
    device_id,
  };

  // eslint-disable-next-line no-console
  console.log('authService.register request body', body);

  try {
    const res = await apiClient.post<LoginResponseDto>('/register/ssa', body);

    // eslint-disable-next-line no-console
    console.log('authService.register raw response', res.status, res.data);

    const data = res.data;

    const rawMsg = data.message || data.msg || '';
    const lowerMsg = typeof rawMsg === 'string' ? rawMsg.toLowerCase() : '';

    // Jika backend menyatakan account already exist, perlakukan sebagai error
    if (lowerMsg.includes('account already exist')) {
      throw new Error(rawMsg || 'Account already exist');
    }

    if (!data.success) {
      const msg = rawMsg || 'Register gagal';
      throw new Error(msg);
    }

    if (data.results && data.results.length > 0) {
      return data.results[0];
    }

    const syntheticUser: LoginResultUser = {
      uuid: '',
      name: payload.name || payload.username,
      username: payload.username,
      token: '',
      jabatan: payload.jabatan,
      divisi: payload.divisi,
      brand: Array.isArray(brandsToSend) ? brandsToSend.join(',') : String(brandsToSend),
      device_id,
      default_outlet: firstOutlet.value,
      status: 0,
      login_status: 0,
    };

    return syntheticUser;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log('authService.register error', e?.response?.status, e?.response?.data || e);
    throw e;
  }
}
