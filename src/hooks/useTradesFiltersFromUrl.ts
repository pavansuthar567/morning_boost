'use client';

import { useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/store';
import { TradesQueryParams } from '@/types';

// Keys that should be parsed as numbers
const numericKeys = ['page', 'limit'];

// All filter keys
const filterKeys = [
  'status',
  'strategy',
  'strategyName',
  'symbol',
  'timeframe',
  'exitReason',
  'tradeMode',
  'instrumentType',
  'optionType',
  'assetClass',
  'dhanInstrumentType',
  'startDate',
  'endDate',
  'page',
  'limit',
] as const;

export function useTradesFiltersFromUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { tradesFilters, setTradesFilters, resetTradesFilters } = useUIStore();

  // Parse URL params to filters on mount
  useEffect(() => {
    const filtersFromUrl: Partial<TradesQueryParams> = {};
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
      // Set filters from URL (merge with defaults)
      setTradesFilters({
        page: 1,
        limit: 20,
        ...filtersFromUrl,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update URL when filters change
  const updateUrlWithFilters = useCallback(
    (filters: TradesQueryParams) => {
      const params = new URLSearchParams(searchParams.toString());

      filterKeys.forEach((key) => {
        const value = filters[key as keyof TradesQueryParams];
        if (value !== undefined && value !== null && value !== '') {
          // Skip default values for cleaner URLs
          if (key === 'page' && value === 1) return;
          if (key === 'limit' && value === 20) return;
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      // Use replace to avoid adding to browser history on every filter change
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Custom setFilters that also updates URL
  const setFiltersWithUrl = useCallback(
    (filters: Partial<TradesQueryParams>) => {
      setTradesFilters(filters);
      // Get the updated state after setting
      const newFilters = { ...tradesFilters, ...filters };
      updateUrlWithFilters(newFilters);
    },
    [tradesFilters, setTradesFilters, updateUrlWithFilters]
  );

  // Custom reset that also clears URL
  const resetFiltersWithUrl = useCallback(() => {
    resetTradesFilters();
    const params = new URLSearchParams(searchParams.toString());
    filterKeys.forEach((key) => params.delete(key));
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [pathname, resetTradesFilters, router, searchParams]);

  return {
    tradesFilters,
    setTradesFilters: setFiltersWithUrl,
    resetTradesFilters: resetFiltersWithUrl,
  };
}

