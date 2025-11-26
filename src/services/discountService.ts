import { toolsApiClient } from '../api/toolsApiClient';
import { getOrCreateDeviceId } from './deviceService';

export interface ScanProductPayload {
  code: string;
  outlet: string;
  discount: string; // backend expects string in sample
}

export interface ScanProductResult {
  // Bentuk detail tergantung API; untuk sekarang pakai any
  [key: string]: any;
}

export async function scanProduct(
  payload: ScanProductPayload,
): Promise<ScanProductResult> {
  const res = await toolsApiClient.post('/scanproduct', payload);
  return res.data;
}

export async function getProductByInternal(outlet: string, internal: string) {
  const res = await toolsApiClient.get(
    `/productinfo/${outlet}/${internal}/'0'`,
  );
  return res.data;
}

export interface CreateDiscountPayload {
  internal: string;
  name_product: string;
  code_barcode_lama: string;
  code_barcode_baru: string;
  retail_price: number;
  harga_awal: number;
  discount: number;
  qty: number;
  uomsales: string;
  harga_discount: number;
  description: string;
  outlet: number;
}

export async function createDiscount(payload: CreateDiscountPayload) {
  const device_id = await getOrCreateDeviceId();

  const res = await toolsApiClient.post('/newdiscount', {
    ...payload,
    device_id,
  });

  return res.data;
}

export async function getOutlets() {
  const res = await toolsApiClient.get('/outlet');
  return res.data?.results ?? res.data;
}

export async function getBrands() {
  const res = await toolsApiClient.get('/brands');
  return res.data?.results ?? res.data;
}

export async function getJabatan() {
  const res = await toolsApiClient.get('/jabatan');
  return res.data?.results ?? res.data;
}
