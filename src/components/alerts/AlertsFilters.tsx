'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/store';
import { AlertsQueryParams } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

interface AlertsFiltersProps {
  alertsFilters?: AlertsQueryParams;
  setAlertsFilters?: (filters: Partial<AlertsQueryParams>) => void;
  resetAlertsFilters?: () => void;
}

const optionClasses = 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';
const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_DELAY = 400;

export default function AlertsFilters(props: AlertsFiltersProps) {
  const store = useUIStore();

  const alertsFilters = props.alertsFilters ?? store.alertsFilters;
  const setAlertsFilters = props.setAlertsFilters ?? store.setAlertsFilters;
  const resetAlertsFilters = props.resetAlertsFilters ?? store.resetAlertsFilters;

  const [symbolInput, setSymbolInput] = useState(alertsFilters.symbol || '');

  // Sync local state when filters reset
  useEffect(() => {
    setSymbolInput(alertsFilters.symbol || '');
  }, [alertsFilters.symbol]);

  const applyTextFilter = useCallback((key: string, value: string) => {
    if (value === '' || value.length >= MIN_SEARCH_LENGTH) {
      setAlertsFilters({ [key]: value || undefined, page: 1 });
    }
  }, [setAlertsFilters]);

  const debouncedApplyFilter = useDebounce(applyTextFilter, DEBOUNCE_DELAY);

  const handleTextChange = (key: string, value: string) => {
    if (key === 'symbol') setSymbolInput(value);
    debouncedApplyFilter(key, value);
  };

  const handleFilterChange = (key: string, value: string) => {
    setAlertsFilters({ [key]: value || undefined, page: 1 });
  };

  return (
    <div className="mb-6 p-4 bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05]">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Symbol Filter */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Symbol
          </label>
          <input
            type="text"
            placeholder="e.g. NIFTY"
            value={symbolInput}
            onChange={(e) => handleTextChange('symbol', e.target.value.toUpperCase())}
            className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white dark:placeholder:text-white/50"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            value={alertsFilters.isEnabled || ''}
            onChange={(e) => handleFilterChange('isEnabled', e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white"
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="true">Enabled</option>
            <option className={optionClasses} value="false">Disabled</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetAlertsFilters}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.1]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

