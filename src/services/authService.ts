import { apiClient } from '../api/apiClient';
import { getOrCreateDeviceId } from './deviceService';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
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
  const device_id = await getOrCreateDeviceId();

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
  const device_id = await getOrCreateDeviceId();

  const res = await apiClient.post<LoginResponseDto>('/register/ssa', {
    username: payload.username,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
    jabatan: payload.jabatan,
    divisi: payload.divisi,
    // Ikuti format API yang kamu berikan: kirim sebagai array biasa
    brands: payload.brands ?? [],
    outlet_choice: payload.outlet_choice ?? [],
    device_id,
  });

  const data = res.data;

  if (!data.success || !data.results || data.results.length === 0) {
    const msg = data.message || data.msg || 'Register gagal';
    throw new Error(msg);
  }

  return data.results[0];
}
