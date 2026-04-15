'use client';

import React, { useMemo } from 'react';
import { useUIStore } from '@/store';
import { StrategiesQueryParams } from '@/types';
import { useAlerts } from '@/hooks';

interface StrategiesFiltersProps {
  strategiesFilters?: StrategiesQueryParams;
  setStrategiesFilters?: (filters: Partial<StrategiesQueryParams>) => void;
  resetStrategiesFilters?: () => void;
}

const selectClasses =
  'px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white';
const optionClasses = 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';

const TIMEFRAME_OPTIONS = [1, 3, 5, 15, 30, 60, 240];

export default function StrategiesFilters(props: StrategiesFiltersProps) {
  const store = useUIStore();
  const { data: alertsData } = useAlerts({ limit: 100 });

  const strategiesFilters = props.strategiesFilters ?? store.strategiesFilters;
  const setStrategiesFilters = props.setStrategiesFilters ?? store.setStrategiesFilters;
  const resetStrategiesFilters = props.resetStrategiesFilters ?? store.resetStrategiesFilters;

  const alerts = useMemo(() => alertsData?.data || [], [alertsData?.data]);

  // Get active filters for chips display
  const activeFilters = useMemo(() => {
    const filters: { key: keyof StrategiesQueryParams; label: string; value: string }[] = [];

    if (strategiesFilters.alert) {
      const alertInfo = alerts.find((a) => a._id === strategiesFilters.alert);
      filters.push({
        key: 'alert',
        label: 'Alert',
        value: alertInfo?.name || strategiesFilters.alert,
      });
    }

    if (strategiesFilters.timeframe) {
      filters.push({
        key: 'timeframe',
        label: 'Timeframe',
        value: `${strategiesFilters.timeframe}m`,
      });
    }

    if (strategiesFilters.liveEnabled) {
      filters.push({
        key: 'liveEnabled',
        label: 'Mode',
        value: strategiesFilters.liveEnabled === 'true' ? 'Live' : 'Virtual',
      });
    }

    if (strategiesFilters.isEnabled) {
      filters.push({
        key: 'isEnabled',
        label: 'Status',
        value: strategiesFilters.isEnabled === 'true' ? 'Enabled' : 'Disabled',
      });
    }

    return filters;
  }, [strategiesFilters, alerts]);

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setStrategiesFilters({ [key]: value || undefined, page: 1 });
  };

  const handleClearFilter = (key: keyof StrategiesQueryParams) => {
    setStrategiesFilters({ [key]: undefined, page: 1 });
  };

  return (
    <div className="mb-6 p-4 bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05]">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Alert Filter */}
        <div className="flex flex-col min-w-[200px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Alert
          </label>
          <select
            value={strategiesFilters.alert || ''}
            onChange={(e) => handleFilterChange('alert', e.target.value)}
            className={selectClasses}
          >
            <option className={optionClasses} value="">All Alerts</option>
            {alerts.map((alert) => (
              <option key={alert._id} className={optionClasses} value={alert._id}>
                {alert.name} ({alert.timeframe}m) - {alert.symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe Filter */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Timeframe
          </label>
          <select
            value={strategiesFilters.timeframe || ''}
            onChange={(e) => handleFilterChange('timeframe', e.target.value ? parseInt(e.target.value, 10) : undefined)}
            className={selectClasses}
          >
            <option className={optionClasses} value="">All</option>
            {TIMEFRAME_OPTIONS.map((tf) => (
              <option key={tf} className={optionClasses} value={tf}>
                {tf}m
              </option>
            ))}
          </select>
        </div>

        {/* Live/Virtual Filter */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Mode
          </label>
          <select
            value={strategiesFilters.liveEnabled || ''}
            onChange={(e) => handleFilterChange('liveEnabled', e.target.value)}
            className={selectClasses}
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="false">Virtual</option>
            <option className={optionClasses} value="true">Live</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            value={strategiesFilters.isEnabled || ''}
            onChange={(e) => handleFilterChange('isEnabled', e.target.value)}
            className={selectClasses}
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="true">Enabled</option>
            <option className={optionClasses} value="false">Disabled</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetStrategiesFilters}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.1]"
        >
          Reset
        </button>
      </div>

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-400"
            >
              <span className="font-medium">{filter.label}:</span>
              <span>{filter.value}</span>
              <button
                onClick={() => handleClearFilter(filter.key)}
                className="ml-1 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition-colors"
                aria-label={`Clear ${filter.label} filter`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
