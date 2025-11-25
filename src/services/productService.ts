import { toolsApiClient } from '../api/toolsApiClient';

export interface ProductInfoParams {
  outlet: string;
  code: string; // internal code atau barcode
  brandOrFlag?: string; // '0' untuk internal, atau nama brand/suplier
}

export async function getProductInfo({
  outlet,
  code,
  brandOrFlag = "'0'",
}: ProductInfoParams) {
  // Endpoint: /productinfo/{outlet}/{code}/'{brandOrFlag}'
  const url = `/productinfo/${outlet}/${code}/${brandOrFlag}`;
  const res = await toolsApiClient.get(url);
  return res.data;
}

export async function getProductByInternal(outlet: string, code: string) {
  return getProductInfo({ outlet, code, brandOrFlag: "'0'" });
}

export async function getProductBySupplier(
  outlet: string,
  code: string,
  brand: string,
) {
  // Brand dibungkus tanda kutip sesuai contoh API: 'AQUA'
  const quotedBrand = `'${brand}'`;
  return getProductInfo({ outlet, code, brandOrFlag: quotedBrand });
}
