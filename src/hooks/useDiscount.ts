import React, { useCallback, useContext, useState } from 'react';
import * as discountService from '../services/discountService';

export interface DiscountConfig {
  outlet: string;
  discountPercent: string; // keep as string for API compatibility
  description?: string;
}

export interface DiscountItem {
  id: string;
  code: string;
  data: any; // raw result from scanProduct, nanti bisa diketik lebih spesifik
}

function useDiscountInternal() {
  const [config, setConfig] = useState<DiscountConfig | null>(null);
  const [items, setItems] = useState<DiscountItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPrinterConfigured, setIsPrinterConfigured] = useState(false);
  const [isDiscountConfigured, setIsDiscountConfigured] = useState(false);

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
        setError('Config discount belum di-set. Silakan set config terlebih dahulu.');
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
        // Normalisasi bentuk respons: beberapa API mengembalikan { results: [detail] }
        const raw: any = result || {};
        const hasResults = Array.isArray(raw.results) ? raw.results.length > 0 : !!raw.internal;

        if (!hasResults) {
          const msg = 'Produk tidak ditemukan.';
          setError(msg);
          throw new Error(msg);
        }

        const id = `${code}-${Date.now()}`;
        setItems(prev => [{ id, code, data: result }, ...prev]);
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
    isPrinterConfigured,
    isDiscountConfigured,
    updateConfig,
    clearItems,
    removeItem,
    scanAndAdd,
    setIsPrinterConfigured,
    setIsDiscountConfigured,
  };
}

type DiscountContextValue = ReturnType<typeof useDiscountInternal>;

const DiscountContext = React.createContext<DiscountContextValue | null>(null);

export function DiscountProvider({ children }: { children: React.ReactNode }) {
  const value = useDiscountInternal();
  return React.createElement(DiscountContext.Provider, { value }, children);
}

export function useDiscount(): DiscountContextValue {
  const ctx = useContext(DiscountContext);
  if (!ctx) {
    throw new Error('useDiscount must be used within a DiscountProvider');
  }
  return ctx;
}
