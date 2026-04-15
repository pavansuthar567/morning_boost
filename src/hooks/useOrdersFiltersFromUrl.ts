'use client';

import { useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/store';
import { OrdersQueryParams } from '@/types';

// Keys that should be parsed as numbers
const numericKeys = ['page', 'limit'];

// All filter keys (excluding page/limit for URL cleanliness)
const filterKeys = [
  'strategy',
  'strategyName',
  'symbol',
  'timeframe',
  'status',
  'transactionType',
  'side',
  'instrumentType',
  'optionType',
  'assetClass',
  'dhanInstrumentType',
  'startDate',
  'endDate',
  'page',
  'limit',
] as const;

export function useOrdersFiltersFromUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { ordersFilters, setOrdersFilters, resetOrdersFilters } = useUIStore();

  // Parse URL params to filters on mount
  useEffect(() => {
    const filtersFromUrl: Partial<OrdersQueryParams> = {};
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
      setOrdersFilters({
        page: 1,
        limit: 20,
        ...filtersFromUrl,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update URL when filters change
  const updateUrlWithFilters = useCallback(
    (filters: OrdersQueryParams) => {
      const params = new URLSearchParams(searchParams.toString());

      filterKeys.forEach((key) => {
        const value = filters[key as keyof OrdersQueryParams];
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
    (filters: Partial<OrdersQueryParams>) => {
      setOrdersFilters(filters);
      // Get the updated state after setting
      const newFilters = { ...ordersFilters, ...filters };
      updateUrlWithFilters(newFilters);
    },
    [ordersFilters, setOrdersFilters, updateUrlWithFilters]
  );

  // Custom reset that also clears URL
  const resetFiltersWithUrl = useCallback(() => {
    resetOrdersFilters();
    const params = new URLSearchParams(searchParams.toString());
    filterKeys.forEach((key) => params.delete(key));
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [pathname, resetOrdersFilters, router, searchParams]);

  return {
    ordersFilters,
    setOrdersFilters: setFiltersWithUrl,
    resetOrdersFilters: resetFiltersWithUrl,
  };
}

