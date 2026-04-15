'use client';

import React, { useMemo } from 'react';
import { useUIStore } from '@/store';
import { TradesQueryParams } from '@/types';
import { useFiltersData } from '@/hooks/useFiltersData';

interface TradesFiltersProps {
  tradesFilters?: TradesQueryParams;
  setTradesFilters?: (filters: Partial<TradesQueryParams>) => void;
  resetTradesFilters?: () => void;
}

const controlClasses =
  'px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white dark:placeholder:text-white/50';
const optionClasses = 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';

export default function TradesFilters(props: TradesFiltersProps) {
  const store = useUIStore();
  const { data: filtersData } = useFiltersData();

  // Use props if provided, otherwise fall back to store
  const tradesFilters = props.tradesFilters ?? store.tradesFilters;
  const setTradesFilters = props.setTradesFilters ?? store.setTradesFilters;
  const resetTradesFilters = props.resetTradesFilters ?? store.resetTradesFilters;

  // Get strategies for selected symbol
  const filteredStrategies = useMemo(() => {
    if (!filtersData?.symbols) return [];
    if (!tradesFilters.symbol) {
      // Return all strategies from all symbols
      return filtersData.symbols.flatMap(s => s.strategies);
    }
    const symbolData = filtersData.symbols.find(s => s.symbol === tradesFilters.symbol);
    return symbolData?.strategies || [];
  }, [filtersData?.symbols, tradesFilters.symbol]);

  const handleFilterChange = (key: string, value: string) => {
    setTradesFilters({ [key]: value || undefined, page: 1 });
  };

  const handleSymbolChange = (symbol: string) => {
    // Clear strategy when symbol changes
    setTradesFilters({ symbol: symbol || undefined, strategy: undefined, page: 1 });
  };

  return (
    <div className="mb-6 p-4 bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05]">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Symbol Filter */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Symbol
          </label>
          <select
            value={tradesFilters.symbol || ''}
            onChange={(e) => handleSymbolChange(e.target.value)}
            className={controlClasses}
          >
            <option className={optionClasses} value="">All Symbols</option>
            {filtersData?.symbols.map((s) => (
              <option key={s.symbol} className={optionClasses} value={s.symbol}>
                {s.symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Strategy Filter */}
        <div className="flex flex-col min-w-[180px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Strategy
          </label>
          <select
            value={tradesFilters.strategy || ''}
            onChange={(e) => handleFilterChange('strategy', e.target.value)}
            className={controlClasses}
          >
            <option className={optionClasses} value="">All Strategies</option>
            {filteredStrategies.map((strategy) => (
              <option key={strategy.id} className={optionClasses} value={strategy.id}>
                {strategy.name}
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe Filter */}
        <div className="flex flex-col min-w-[120px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Timeframe
          </label>
          <select
            value={tradesFilters.timeframe || ''}
            onChange={(e) => handleFilterChange('timeframe', e.target.value)}
            className={controlClasses}
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="1">1 min</option>
            <option className={optionClasses} value="3">3 min</option>
            <option className={optionClasses} value="5">5 min</option>
            <option className={optionClasses} value="15">15 min</option>
            <option className={optionClasses} value="30">30 min</option>
            <option className={optionClasses} value="60">1 hour</option>
            <option className={optionClasses} value="240">4 hour</option>
            <option className={optionClasses} value="D">Daily</option>
          </select>
        </div>

        {/* Instrument Type Filter */}
        <div className="flex flex-col min-w-[140px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Instrument Type
          </label>
          <select
            value={tradesFilters.instrumentType || ''}
            onChange={(e) => handleFilterChange('instrumentType', e.target.value)}
            className={controlClasses}
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="SPOT">Spot</option>
            <option className={optionClasses} value="FUTURES">Futures</option>
            <option className={optionClasses} value="OPTIONS">Options</option>
          </select>
        </div>

        {/* Option Type Filter */}
        <div className="flex flex-col min-w-[120px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Option Type
          </label>
          <select
            value={tradesFilters.optionType || ''}
            onChange={(e) => handleFilterChange('optionType', e.target.value)}
            className={controlClasses}
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="ATM">ATM</option>
            <option className={optionClasses} value="ITM">ITM</option>
            <option className={optionClasses} value="OTM">OTM</option>
          </select>
        </div>

        {/* Asset Class Filter */}
        <div className="flex flex-col min-w-[120px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Asset Class
          </label>
          <select
            value={tradesFilters.assetClass || ''}
            onChange={(e) => handleFilterChange('assetClass', e.target.value)}
            className={controlClasses}
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="INDEX">Index</option>
            <option className={optionClasses} value="STOCK">Stock</option>
            <option className={optionClasses} value="COMMODITY">Commodity</option>
            <option className={optionClasses} value="CURRENCY">Currency</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            value={tradesFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={controlClasses}
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="OPEN">Open</option>
            <option className={optionClasses} value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Exit Reason Filter */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Exit Reason
          </label>
          <select
            value={tradesFilters.exitReason || ''}
            onChange={(e) => handleFilterChange('exitReason', e.target.value)}
            className={controlClasses}
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="SL">Stop Loss</option>
            <option className={optionClasses} value="TARGET">Target</option>
            <option className={optionClasses} value="MANUAL">Manual</option>
            <option className={optionClasses} value="SQUARE_OFF">Square Off</option>
            <option className={optionClasses} value="AUTO">Auto</option>
          </select>
        </div>

        {/* Trade Mode Filter */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Trade Mode
          </label>
          <select
            value={tradesFilters.tradeMode || ''}
            onChange={(e) => handleFilterChange('tradeMode', e.target.value)}
            className={controlClasses}
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="INTRADAY">Intraday</option>
            <option className={optionClasses} value="DELIVERY">Delivery</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={tradesFilters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className={`${controlClasses} w-full pr-8`}
            />
            {tradesFilters.startDate && (
              <button
                type="button"
                onClick={() => handleFilterChange('startDate', '')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* End Date */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            End Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={tradesFilters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className={`${controlClasses} w-full pr-8`}
            />
            {tradesFilters.endDate && (
              <button
                type="button"
                onClick={() => handleFilterChange('endDate', '')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetTradesFilters}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.1]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

