'use client';

import { useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/store';
import { AlertsQueryParams } from '@/types';

const numericKeys = ['page', 'limit'];

const filterKeys = ['isEnabled', 'symbol', 'page', 'limit'] as const;

export function useAlertsFiltersFromUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { alertsFilters, setAlertsFilters, resetAlertsFilters } = useUIStore();

  // Parse URL params to filters on mount
  useEffect(() => {
    const filtersFromUrl: Partial<AlertsQueryParams> = {};
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
      setAlertsFilters({
        page: 1,
        limit: 20,
        ...filtersFromUrl,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUrlWithFilters = useCallback(
    (filters: AlertsQueryParams) => {
      const params = new URLSearchParams();

      filterKeys.forEach((key) => {
        const value = filters[key as keyof AlertsQueryParams];
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
    (filters: Partial<AlertsQueryParams>) => {
      setAlertsFilters(filters);
      const newFilters = { ...alertsFilters, ...filters };
      updateUrlWithFilters(newFilters);
    },
    [alertsFilters, setAlertsFilters, updateUrlWithFilters]
  );

  const resetFiltersWithUrl = useCallback(() => {
    resetAlertsFilters();
    router.replace(pathname, { scroll: false });
  }, [pathname, resetAlertsFilters, router]);

  return {
    alertsFilters,
    setAlertsFilters: setFiltersWithUrl,
    resetAlertsFilters: resetFiltersWithUrl,
  };
}

