'use client';

import React, { useMemo } from 'react';
import { useUIStore } from '@/store';
import { OrdersQueryParams } from '@/types';
import { useFiltersData } from '@/hooks/useFiltersData';

interface OrdersFiltersProps {
  ordersFilters?: OrdersQueryParams;
  setOrdersFilters?: (filters: Partial<OrdersQueryParams>) => void;
  resetOrdersFilters?: () => void;
}

const controlClasses =
  'px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white dark:placeholder:text-white/50';
const optionClasses = 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';

export default function OrdersFilters(props: OrdersFiltersProps) {
  const store = useUIStore();
  const { data: filtersData } = useFiltersData();

  // Use props if provided, otherwise fall back to store
  const ordersFilters = props.ordersFilters ?? store.ordersFilters;
  const setOrdersFilters = props.setOrdersFilters ?? store.setOrdersFilters;
  const resetOrdersFilters = props.resetOrdersFilters ?? store.resetOrdersFilters;

  // Get strategies for selected symbol
  const filteredStrategies = useMemo(() => {
    if (!filtersData?.symbols) return [];
    if (!ordersFilters.symbol) {
      // Return all strategies from all symbols
      return filtersData.symbols.flatMap(s => s.strategies);
    }
    const symbolData = filtersData.symbols.find(s => s.symbol === ordersFilters.symbol);
    return symbolData?.strategies || [];
  }, [filtersData?.symbols, ordersFilters.symbol]);

  const handleFilterChange = (key: string, value: string) => {
    setOrdersFilters({ [key]: value || undefined, page: 1 });
  };

  const handleSymbolChange = (symbol: string) => {
    // Clear strategy when symbol changes
    setOrdersFilters({ symbol: symbol || undefined, strategy: undefined, page: 1 });
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
            value={ordersFilters.symbol || ''}
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
            value={ordersFilters.strategy || ''}
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
            value={ordersFilters.timeframe || ''}
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
            value={ordersFilters.instrumentType || ''}
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
            value={ordersFilters.optionType || ''}
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
            value={ordersFilters.assetClass || ''}
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
            value={ordersFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={controlClasses}
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="PENDING">Pending</option>
            <option className={optionClasses} value="TRADED">Traded</option>
            <option className={optionClasses} value="CANCELLED">Cancelled</option>
            <option className={optionClasses} value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Transaction Type Filter */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Transaction Type
          </label>
          <select
            value={ordersFilters.transactionType || ''}
            onChange={(e) => handleFilterChange('transactionType', e.target.value)}
            className={controlClasses}
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="BUY">Buy</option>
            <option className={optionClasses} value="SELL">Sell</option>
          </select>
        </div>

        {/* Side Filter */}
        <div className="flex flex-col min-w-[150px]">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Side
          </label>
          <select
            value={ordersFilters.side || ''}
            onChange={(e) => handleFilterChange('side', e.target.value)}
            className={controlClasses}
          >
            <option className={optionClasses} value="">All</option>
            <option className={optionClasses} value="CE">CE (Call)</option>
            <option className={optionClasses} value="PE">PE (Put)</option>
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
              value={ordersFilters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className={`${controlClasses} w-full pr-8`}
            />
            {ordersFilters.startDate && (
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
              value={ordersFilters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className={`${controlClasses} w-full pr-8`}
            />
            {ordersFilters.endDate && (
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
          onClick={resetOrdersFilters}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.1]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

