'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { DailyPnl } from '@/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/30 rounded-lg">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-400">Loading chart...</span>
      </div>
    </div>
  ),
});

interface DailyPnlChartProps {
  dailyPnl: DailyPnl[];
  showNetPnl?: boolean;
}

type ChartView = 'cumulative' | 'daily' | 'both';

export default function DailyPnlChart({ dailyPnl, showNetPnl = false }: DailyPnlChartProps) {
  const [chartView, setChartView] = useState<ChartView>('cumulative');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sort by date and prepare data
  const chartData = useMemo(() => {
    const pnlArray = Array.isArray(dailyPnl) ? dailyPnl : [];
    const sorted = [...pnlArray].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const categories: string[] = [];
    const pnlValues: number[] = [];
    const cumulativeValues: number[] = [];
    let cumulative = 0;

    sorted.forEach(day => {
      const pnl = showNetPnl && day.netPnl !== undefined ? day.netPnl : day.pnl;
      const dateObj = new Date(day.date);
      categories.push(
        dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      );
      pnlValues.push(Math.round(pnl * 100) / 100);
      cumulative += pnl;
      cumulativeValues.push(Math.round(cumulative * 100) / 100);
    });

    return { categories, pnlValues, cumulativeValues };
  }, [dailyPnl, showNetPnl]);

  // Calculate stats
  const stats = useMemo(() => {
    const values = chartData.pnlValues;
    const total = values.reduce((a, b) => a + b, 0);
    const profitable = values.filter(v => v > 0).length;
    const losing = values.filter(v => v < 0).length;
    const avgWin = profitable > 0 
      ? values.filter(v => v > 0).reduce((a, b) => a + b, 0) / profitable 
      : 0;
    const avgLoss = losing > 0 
      ? Math.abs(values.filter(v => v < 0).reduce((a, b) => a + b, 0) / losing)
      : 0;
    const maxProfit = Math.max(...values, 0);
    const maxLoss = Math.min(...values, 0);
    return { total, profitable, losing, avgWin, avgLoss, maxProfit, maxLoss };
  }, [chartData.pnlValues]);

  const formatCurrency = (val: number, short = false): string => {
    if (val == null || isNaN(val)) return '₹0';
    const absVal = Math.abs(val);
    if (absVal >= 100000) return `${short ? '' : '₹'}${(val / 100000).toFixed(1)}L`;
    if (absVal >= 1000) return `${short ? '' : '₹'}${(val / 1000).toFixed(1)}K`;
    return `${short ? '' : '₹'}${val.toFixed(0)}`;
  };

  const chartHeight = isMobile ? 220 : 280;

  // Cumulative chart options
  const cumulativeOptions: ApexOptions = {
    chart: {
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      height: chartHeight,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
      sparkline: { enabled: false },
      animations: { enabled: true, speed: 400 },
    },
    colors: [stats.total >= 0 ? '#10B981' : '#EF4444'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      curve: 'smooth',
      width: isMobile ? 2 : 3,
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: 'rgba(156, 163, 175, 0.1)',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { 
        left: isMobile ? 5 : 15, 
        right: isMobile ? 5 : 15, 
        top: isMobile ? 5 : 10, 
        bottom: 0 
      },
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: 0,
        style: { fontSize: isMobile ? '8px' : '10px', colors: '#9CA3AF' },
        hideOverlappingLabels: true,
        showDuplicates: false,
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => formatCurrency(val, isMobile),
        style: { fontSize: isMobile ? '9px' : '11px', colors: '#9CA3AF' },
        offsetX: isMobile ? 0 : -5,
      },
      forceNiceScale: true,
      tickAmount: isMobile ? 4 : 6,
    },
    tooltip: {
      theme: 'dark',
      x: { show: true },
      y: {
        formatter: (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      },
      marker: { show: true },
    },
    markers: {
      size: 0,
      strokeWidth: 2,
      hover: { size: 6, sizeOffset: 3 },
    },
    annotations: {
      yaxis: [{
        y: 0,
        borderColor: '#6B7280',
        borderWidth: 1,
        strokeDashArray: 5,
        label: {
          borderColor: 'transparent',
          style: { background: 'transparent', color: '#9CA3AF', fontSize: '10px' },
          text: 'Break-even',
          position: 'left',
          offsetX: 10,
        },
      }],
    },
  };

  // Daily bar chart options
  const dailyOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'Inter, sans-serif',
      height: chartHeight,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
      animations: { enabled: true, speed: 400 },
    },
    plotOptions: {
      bar: {
        columnWidth: chartData.categories.length > 20 ? '85%' : '65%',
        borderRadius: isMobile ? 2 : 3,
        borderRadiusApplication: 'end',
        distributed: true,
        colors: {
          ranges: [
            { from: -999999999, to: -0.01, color: '#EF4444' },
            { from: 0, to: 0, color: '#9CA3AF' },
            { from: 0.01, to: 999999999, color: '#10B981' },
          ],
        },
      },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    grid: {
      borderColor: 'rgba(156, 163, 175, 0.1)',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { 
        left: isMobile ? 5 : 15, 
        right: isMobile ? 5 : 15, 
        top: isMobile ? 5 : 10, 
        bottom: 0 
      },
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: 0,
        style: { fontSize: isMobile ? '8px' : '10px', colors: '#9CA3AF' },
        hideOverlappingLabels: true,
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => formatCurrency(val, isMobile),
        style: { fontSize: isMobile ? '9px' : '11px', colors: '#9CA3AF' },
        offsetX: isMobile ? 0 : -5,
      },
      forceNiceScale: true,
      tickAmount: isMobile ? 4 : 6,
    },
    tooltip: {
      theme: 'dark',
      x: { show: true },
      y: {
        formatter: (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      },
    },
    annotations: {
      yaxis: [{
        y: 0,
        borderColor: '#6B7280',
        borderWidth: 1,
        strokeDashArray: 0,
      }],
    },
  };

  // Combined chart for "both" view
  const combinedOptions: ApexOptions = {
    ...cumulativeOptions,
    chart: {
      ...cumulativeOptions.chart,
      type: 'line',
      stacked: false,
    },
    stroke: {
      curve: 'smooth',
      width: [0, isMobile ? 2 : 3],
    },
    fill: {
      type: ['solid', 'gradient'],
      opacity: [0.85, 1],
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    colors: ['#6366F1', stats.total >= 0 ? '#10B981' : '#EF4444'],
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 2,
      },
    },
    yaxis: [
      {
        seriesName: 'Daily P&L',
        labels: {
          formatter: formatCurrency,
          style: { fontSize: '10px', colors: '#6366F1' },
        },
        title: { text: '' },
      },
      {
        seriesName: 'Cumulative',
        opposite: true,
        labels: {
          formatter: formatCurrency,
          style: { fontSize: '10px', colors: stats.total >= 0 ? '#10B981' : '#EF4444' },
        },
        title: { text: '' },
      },
    ],
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '11px',
      markers: { size: 5 },
      itemMargin: { horizontal: 10 },
    },
  };

  const cumulativeSeries = [{ name: 'Cumulative P&L', data: chartData.cumulativeValues }];
  const dailySeries = [{ name: 'Daily P&L', data: chartData.pnlValues }];
  const combinedSeries = [
    { name: 'Daily P&L', type: 'bar', data: chartData.pnlValues },
    { name: 'Cumulative', type: 'area', data: chartData.cumulativeValues },
  ];

  if (!Array.isArray(dailyPnl) || dailyPnl.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
          <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-sm">No P&L data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with Stats and Controls */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Stats */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">Total P&L</p>
              <p className={`text-lg font-bold ${stats.total >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.total >= 0 ? '+' : ''}{formatCurrency(stats.total)}
              </p>
            </div>
            <div className="hidden xs:block w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
            <div className="hidden xs:block">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">Win/Loss</p>
              <p className="text-sm font-semibold">
                <span className="text-green-600 dark:text-green-400">{stats.profitable}</span>
                <span className="text-gray-300 dark:text-gray-600 mx-0.5">/</span>
                <span className="text-red-600 dark:text-red-400">{stats.losing}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">days</span>
              </p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">Best Day</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">+{formatCurrency(stats.maxProfit)}</p>
            </div>
            <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
            <div className="hidden md:block">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">Worst Day</p>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrency(stats.maxLoss)}</p>
            </div>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setChartView('cumulative')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                chartView === 'cumulative'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              Trend
            </button>
            <button
              onClick={() => setChartView('daily')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                chartView === 'daily'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setChartView('both')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                chartView === 'both'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              Both
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-2 sm:p-4">
        <div style={{ minHeight: chartHeight }}>
          {chartView === 'cumulative' && (
            <ReactApexChart
              options={cumulativeOptions}
              series={cumulativeSeries}
              type="area"
              height={chartHeight}
              width="100%"
            />
          )}
          {chartView === 'daily' && (
            <ReactApexChart
              options={dailyOptions}
              series={dailySeries}
              type="bar"
              height={chartHeight}
              width="100%"
            />
          )}
          {chartView === 'both' && (
            <ReactApexChart
              options={combinedOptions}
              series={combinedSeries}
              type="line"
              height={chartHeight}
              width="100%"
            />
          )}
        </div>
      </div>

      {/* Footer Legend */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="flex items-center justify-center gap-6 text-[10px]">
          {chartView === 'daily' || chartView === 'both' ? (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-green-500"></div>
                <span className="text-gray-500 dark:text-gray-400">Profit Day</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-red-500"></div>
                <span className="text-gray-500 dark:text-gray-400">Loss Day</span>
              </div>
            </>
          ) : null}
          {chartView === 'cumulative' || chartView === 'both' ? (
            <div className="flex items-center gap-1.5">
              <div className={`w-4 h-0.5 rounded ${stats.total >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-500 dark:text-gray-400">Cumulative P&L</span>
            </div>
          ) : null}
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-px bg-gray-400 border-dashed"></div>
            <span className="text-gray-500 dark:text-gray-400">Break-even</span>
          </div>
        </div>
      </div>
    </div>
  );
}
