'use client';

import { useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/store';
import { StrategiesQueryParams } from '@/types';

const numericKeys = ['page', 'limit', 'timeframe'];

const filterKeys = ['alert', 'timeframe', 'isEnabled', 'liveEnabled', 'page', 'limit'] as const;

export function useStrategiesFiltersFromUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { strategiesFilters, setStrategiesFilters, resetStrategiesFilters } = useUIStore();

  // Parse URL params to filters on mount
  useEffect(() => {
    const filtersFromUrl: Partial<StrategiesQueryParams> = {};
    let hasUrlFilters = false;

    filterKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null && value !== '') {
        hasUrlFilters = true;
        if (numericKeys.includes(key)) {
          const numValue = parseInt(value, 10);
          if (!isNaN(numValue)) {
            (filtersFromUrl as Record<string, unknown>)[key] = numValue;
          }
        } else {
          (filtersFromUrl as Record<string, unknown>)[key] = value;
        }
      }
    });

    if (hasUrlFilters) {
      setStrategiesFilters({
        page: 1,
        limit: 20,
        ...filtersFromUrl,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUrlWithFilters = useCallback(
    (filters: StrategiesQueryParams) => {
      const params = new URLSearchParams();

      filterKeys.forEach((key) => {
        const value = filters[key as keyof StrategiesQueryParams];
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'page' && value === 1) return;
          if (key === 'limit' && value === 20) return;
          params.set(key, String(value));
        }
      });

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  const setFiltersWithUrl = useCallback(
    (filters: Partial<StrategiesQueryParams>) => {
      setStrategiesFilters(filters);
      const newFilters = { ...strategiesFilters, ...filters };
      updateUrlWithFilters(newFilters);
    },
    [strategiesFilters, setStrategiesFilters, updateUrlWithFilters]
  );

  const resetFiltersWithUrl = useCallback(() => {
    resetStrategiesFilters();
    router.replace(pathname, { scroll: false });
  }, [pathname, resetStrategiesFilters, router]);

  return {
    strategiesFilters,
    setStrategiesFilters: setFiltersWithUrl,
    resetStrategiesFilters: resetFiltersWithUrl,
  };
}

