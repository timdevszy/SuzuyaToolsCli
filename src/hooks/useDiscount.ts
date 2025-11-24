import { useCallback, useState } from 'react';
import * as discountService from '../services/discountService';

export interface DiscountConfig {
  outlet: string;
  discountPercent: string; // keep as string for API compatibility
}

export interface DiscountItem {
  id: string;
  code: string;
  data: any; // raw result from scanProduct, nanti bisa diketik lebih spesifik
}

export function useDiscount() {
  const [config, setConfig] = useState<DiscountConfig | null>(null);
  const [items, setItems] = useState<DiscountItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConfig = useCallback((cfg: DiscountConfig) => {
    setConfig(cfg);
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
  }, []);

  const scanAndAdd = useCallback(
    async (code: string) => {
      if (!config) {
        throw new Error('Config discount belum di-set');
      }
      setIsLoading(true);
      setError(null);
      try {
        const result = await discountService.scanProduct({
          code,
          outlet: config.outlet,
          discount: config.discountPercent,
        });
        const id = `${code}-${Date.now()}`;
        setItems(prev => [...prev, { id, code, data: result }]);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Gagal scan produk';
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [config],
  );

  return {
    config,
    items,
    isLoading,
    error,
    updateConfig,
    clearItems,
    removeItem,
    scanAndAdd,
  };
}
