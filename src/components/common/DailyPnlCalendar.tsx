'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { DailyPnl, DailyPnlSummary } from '@/types';

interface DailyPnlCalendarProps {
  dailyPnl: DailyPnl[];
  summary?: DailyPnlSummary;
  onDateClick?: (date: string) => void;
  selectedDate?: string;
  showNetPnl?: boolean;
}

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DailyPnlCalendar({ dailyPnl, summary, onDateClick, selectedDate, showNetPnl = false }: DailyPnlCalendarProps) {
  const [baseDate, setBaseDate] = useState(new Date());
  const [mobilePopup, setMobilePopup] = useState<DailyPnl | null>(null);

  // Create a map of date -> DailyPnl for quick lookup
  const pnlMap = useMemo(() => {
    const map = new Map<string, DailyPnl>();
    const pnlArray = Array.isArray(dailyPnl) ? dailyPnl : [];
    pnlArray.forEach(day => {
      const dateKey = day.date.split('T')[0];
      map.set(dateKey, day);
    });
    return map;
  }, [dailyPnl]);

  // Helper to get the correct pnl value based on toggle
  const getPnlValue = useCallback((day: DailyPnl) => showNetPnl && day.netPnl !== undefined ? day.netPnl : day.pnl, [showNetPnl]);

  // Calculate max absolute P&L for color intensity scaling
  const maxAbsPnl = useMemo(() => {
    if (dailyPnl.length === 0) return 1000;
    return Math.max(...dailyPnl.map(d => Math.abs(getPnlValue(d) || 0)), 100);
  }, [dailyPnl, getPnlValue]);

  // Get best/worst - use summary if available, else calculate from dailyPnl
  const { bestPnl, worstPnl } = useMemo((): { bestPnl: number | null; worstPnl: number | null } => {
    // Try summary first (use net versions if showNetPnl)
    const bestDayData = showNetPnl ? (summary?.bestDayNet ?? summary?.bestDay) : summary?.bestDay;
    const worstDayData = showNetPnl ? (summary?.worstDayNet ?? summary?.worstDay) : summary?.worstDay;
    let bestPnl: number | null = bestDayData?.pnl ?? null;
    let worstPnl: number | null = worstDayData?.pnl ?? null;

    // Fallback: calculate from dailyPnl
    if (bestPnl == null || worstPnl == null) {
      dailyPnl.forEach(day => {
        const pnlVal = getPnlValue(day);
        if (pnlVal != null && !isNaN(pnlVal)) {
          if (bestPnl == null || pnlVal > bestPnl) bestPnl = pnlVal;
          if (worstPnl == null || pnlVal < worstPnl) worstPnl = pnlVal;
        }
      });
    }

    return { bestPnl, worstPnl };
  }, [summary, dailyPnl, getPnlValue, showNetPnl]);

  // Generate month data for a specific month
  const getMonthData = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let j = startPadding - 1; j >= 0; j--) {
      days.push({ date: new Date(year, month, -j), isCurrentMonth: false });
    }

    for (let j = 1; j <= totalDays; j++) {
      days.push({ date: new Date(year, month, j), isCurrentMonth: true });
    }

    while (days.length % 7 !== 0) {
      const nextDay = days.length - startPadding - totalDays + 1;
      days.push({ date: new Date(year, month + 1, nextDay), isCurrentMonth: false });
    }

    return { year, month, days };
  };

  // Generate months for tablet (3) and desktop (4) views
  const monthsData3 = useMemo(() => {
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      months.push(getMonthData(targetDate.getFullYear(), targetDate.getMonth()));
    }
    return months;
  }, [baseDate]);

  const monthsData4 = useMemo(() => {
    const months = [];
    for (let i = 3; i >= 0; i--) {
      const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      months.push(getMonthData(targetDate.getFullYear(), targetDate.getMonth()));
    }
    return months;
  }, [baseDate]);

  // Single month for mobile
  const currentMonthData = useMemo(() => {
    return getMonthData(baseDate.getFullYear(), baseDate.getMonth());
  }, [baseDate]);

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPnlColor = (pnl: number): string => {
    if (pnl == null || isNaN(pnl)) return 'bg-gray-100 dark:bg-gray-800';
    const intensity = Math.min(Math.abs(pnl) / maxAbsPnl, 1);

    if (pnl > 0) {
      if (intensity > 0.6) return 'bg-green-600 dark:bg-green-500';
      if (intensity > 0.3) return 'bg-green-500 dark:bg-green-600';
      return 'bg-green-400 dark:bg-green-700';
    } else if (pnl < 0) {
      if (intensity > 0.6) return 'bg-red-600 dark:bg-red-500';
      if (intensity > 0.3) return 'bg-red-500 dark:bg-red-600';
      return 'bg-red-400 dark:bg-red-700';
    }
    return 'bg-gray-100 dark:bg-gray-800';
  };

  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount == null || isNaN(amount)) return '0';
    const absAmount = Math.abs(amount);
    if (absAmount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (absAmount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toFixed(0);
  };

  const navigateMonth = (delta: number) => {
    setBaseDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const goToToday = () => setBaseDate(new Date());

  const todayKey = formatDateKey(new Date());

  const renderMonthGrid = (monthData: { year: number; month: number; days: { date: Date; isCurrentMonth: boolean }[] }, compact = false) => (
    <div>
      {/* Month Header for desktop multi-month view */}
      {compact && (
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 text-center">
          {MONTHS_SHORT[monthData.month]} {monthData.year}
        </h4>
      )}

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS_SHORT.map((day, i) => (
          <div key={i} className={`text-center font-medium text-gray-400 dark:text-gray-500 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {monthData.days.map(({ date, isCurrentMonth }, idx) => {
          const dateKey = formatDateKey(date);
          const dayPnl = pnlMap.get(dateKey);
          const isToday = todayKey === dateKey;
          const isSelected = selectedDate === dateKey;
          const tradeCount = dayPnl?.tradeCount ?? dayPnl?.trades ?? 0;
          const hasTrades = dayPnl && tradeCount > 0;

          return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!hasTrades) return;
                    // Touch devices: show popup, Mouse devices: apply filter
                    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                    if (isTouchDevice) {
                      setMobilePopup(dayPnl);
                    } else {
                      onDateClick?.(dateKey);
                    }
                  }}
                  disabled={!hasTrades}
              className={`
                ${compact ? 'h-7 text-[10px]' : 'aspect-square text-[11px]'} 
                rounded font-medium transition-all flex items-center justify-center
                ${!isCurrentMonth ? 'opacity-20' : ''}
                ${isToday ? 'ring-1 ring-brand-500 ring-offset-1 dark:ring-offset-gray-900' : ''}
                ${isSelected ? 'ring-2 ring-blue-500' : ''}
                ${hasTrades
                  ? `${getPnlColor(getPnlValue(dayPnl))} text-white cursor-pointer hover:opacity-80`
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-default'
                }
              `}
              title={hasTrades ? `₹${(getPnlValue(dayPnl) || 0).toFixed(2)} | ${tradeCount} trades` : undefined}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Summary Stats */}
      {summary && (
        <>
          {/* Mobile: Compact rows */}
          <div className="flex md:hidden flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">P&L: </span>
              <span className={`font-bold ${((showNetPnl ? summary.totalNetPnl : summary.totalPnl) || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {((showNetPnl ? summary.totalNetPnl : summary.totalPnl) || 0) >= 0 ? '+' : ''}₹{formatCurrency((showNetPnl ? summary.totalNetPnl : summary.totalPnl) ?? 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">W/L: </span>
              <span className="font-bold text-green-600">{summary.winningDays || 0}</span>
              <span className="text-gray-400">/</span>
              <span className="font-bold text-red-600">{summary.losingDays || 0}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Best: </span>
              <span className="font-bold text-green-600">
                {bestPnl != null ? `+₹${formatCurrency(bestPnl)}` : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Worst: </span>
              <span className="font-bold text-red-600">
                {worstPnl != null ? `-₹${formatCurrency(Math.abs(worstPnl))}` : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Max DD: </span>
              <span className="font-bold text-orange-600">
                ₹{formatCurrency(showNetPnl 
                  ? (summary.maxDrawdownTradeNet ?? summary.maxDrawdownTrade ?? 0)
                  : (summary.maxDrawdownTrade ?? summary.maxDrawdown ?? 0))}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Cur DD: </span>
              <span className="font-bold text-orange-500">
                ₹{formatCurrency(showNetPnl
                  ? (summary.currentDrawdownTradeNet ?? summary.currentDrawdownTrade ?? 0)
                  : (summary.currentDrawdownTrade ?? summary.currentDrawdown ?? 0))}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Min Cap: </span>
              <span className="font-bold text-blue-600">
                ₹{formatCurrency(showNetPnl
                  ? (summary.minCapitalRequiredNet ?? summary.minCapitalRequired ?? 0)
                  : (summary.minCapitalRequired ?? 0))}
              </span>
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid grid-cols-7 gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total P&L</p>
              <p className={`text-lg font-bold ${((showNetPnl ? summary.totalNetPnl : summary.totalPnl) || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {((showNetPnl ? summary.totalNetPnl : summary.totalPnl) || 0) >= 0 ? '+' : ''}₹{formatCurrency((showNetPnl ? summary.totalNetPnl : summary.totalPnl) ?? 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Win / Loss</p>
              <p className="text-lg font-bold">
                <span className="text-green-600 dark:text-green-400">{summary.winningDays || 0}</span>
                <span className="text-gray-300 dark:text-gray-600 mx-1">/</span>
                <span className="text-red-600 dark:text-red-400">{summary.losingDays || 0}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Best Day</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {bestPnl != null ? `+₹${formatCurrency(bestPnl)}` : '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Worst Day</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {worstPnl != null ? `-₹${formatCurrency(Math.abs(worstPnl))}` : '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Max DD</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                ₹{formatCurrency(showNetPnl
                  ? (summary.maxDrawdownTradeNet ?? summary.maxDrawdownTrade ?? 0)
                  : (summary.maxDrawdownTrade ?? summary.maxDrawdown ?? 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Current DD</p>
              <p className="text-lg font-bold text-orange-500 dark:text-orange-300">
                ₹{formatCurrency(showNetPnl
                  ? (summary.currentDrawdownTradeNet ?? summary.currentDrawdownTrade ?? 0)
                  : (summary.currentDrawdownTrade ?? summary.currentDrawdown ?? 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Min Capital</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ₹{formatCurrency(showNetPnl
                  ? (summary.minCapitalRequiredNet ?? summary.minCapitalRequired ?? 0)
                  : (summary.minCapitalRequired ?? 0))}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Navigation Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          {/* Mobile: show current month name */}
          <span className="md:hidden text-sm font-medium text-gray-700 dark:text-gray-300">
            {MONTHS_SHORT[baseDate.getMonth()]} {baseDate.getFullYear()}
          </span>
          {/* Tablet: show 3 month range */}
          <span className="hidden md:inline lg:hidden text-sm font-medium text-gray-700 dark:text-gray-300">
            {MONTHS_SHORT[monthsData3[0].month]} – {MONTHS_SHORT[monthsData3[2].month]} {monthsData3[2].year}
          </span>
          {/* Desktop: show 4 month range */}
          <span className="hidden lg:inline text-sm font-medium text-gray-700 dark:text-gray-300">
            {MONTHS_SHORT[monthsData4[0].month]} – {MONTHS_SHORT[monthsData4[3].month]} {monthsData4[3].year}
          </span>
          <button
            onClick={goToToday}
            className="text-[10px] px-2 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20"
          >
            Today
          </button>
        </div>
        <button
          onClick={() => navigateMonth(1)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-3">
        {/* Mobile: Single Month */}
        <div className="md:hidden">
          {renderMonthGrid(currentMonthData, false)}
        </div>

        {/* Tablet: 3 Months */}
        <div className="hidden md:flex lg:hidden justify-between">
          {monthsData3.map((monthData, idx) => (
            <React.Fragment key={`${monthData.year}-${monthData.month}`}>
              <div className="flex-1">{renderMonthGrid(monthData, true)}</div>
              {idx < monthsData3.length - 1 && (
                <div className="flex items-center px-3">
                  <div className="w-px h-3/4 bg-gray-200 dark:bg-gray-700" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Desktop: 4 Months */}
        <div className="hidden lg:flex">
          {monthsData4.map((monthData, idx) => (
            <React.Fragment key={`${monthData.year}-${monthData.month}`}>
              <div className="flex-1 min-w-0">{renderMonthGrid(monthData, true)}</div>
              {idx < monthsData4.length - 1 && (
                <div className="shrink-0 flex items-center px-3">
                  <div className="w-px h-3/4 bg-gray-200 dark:bg-gray-700" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Touch Device Popup */}
      {mobilePopup && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-brand-50 dark:bg-brand-500/10 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Date: </span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {new Date(mobilePopup.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">P&L: </span>
                <span className={`font-bold ${getPnlValue(mobilePopup) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getPnlValue(mobilePopup) >= 0 ? '+' : ''}₹{formatCurrency(getPnlValue(mobilePopup))}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Trades: </span>
                <span className="font-medium text-gray-800 dark:text-white">{mobilePopup.tradeCount ?? mobilePopup.trades ?? 0}</span>
                <span className="text-gray-400 text-xs ml-1">
                  (<span className="text-green-600">{mobilePopup.winCount}W</span>/<span className="text-red-600">{mobilePopup.lossCount}L</span>)
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobilePopup(null)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-green-500"></div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Profit</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500"></div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Loss</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">No trades</span>
        </div>
      </div>
    </div>
  );
}
