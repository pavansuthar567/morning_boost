'use client';

import React from 'react';
import Link from 'next/link';
import { Strategy, Alert } from '@/types';
import { useUpdateStrategy } from '@/hooks';
import { useAuth } from '@/context/AuthContext';

interface StrategiesTableProps {
  strategies: Strategy[];
  isLoading: boolean;
}

export default function StrategiesTable({ strategies, isLoading }: StrategiesTableProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const updateStrategy = useUpdateStrategy();

  const handleToggleEnabled = (id: string, currentStatus: boolean) => {
    updateStrategy.mutate({ id, data: { isEnabled: !currentStatus } });
  };

  const handleToggleLive = (id: string, currentLiveEnabled: boolean) => {
    updateStrategy.mutate({
      id,
      data: { liveEnabled: !currentLiveEnabled },
    });
  };

  const renderAlert = (alert: Alert | string | null | undefined) => {
    if (!alert) return '-';
    if (typeof alert === 'string') return alert;
    return (
      <span className="inline-flex items-center gap-1.5">
        <span>{alert.name}</span>
        {alert.timeframe && (
          <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-white/[0.08] dark:text-gray-400 rounded">
            {alert.timeframe}m
          </span>
        )}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-white/[0.05] rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!strategies.length) {
    return (
      <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] p-8 text-center text-gray-500 dark:text-gray-400">
        No strategies found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/[0.05]">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Alert / TF
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                SL / Target
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mode
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
            {strategies.map((strategy) => (
              <tr
                key={strategy._id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium">
                  <Link
                    href={`/strategies/${strategy._id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
                  >
                    {strategy.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {renderAlert(strategy.alert)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {typeof strategy.alert === 'object' && strategy.alert?.symbol ? strategy.alert.symbol : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  <span className="inline-flex items-center gap-1">
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        strategy.instrumentType === 'OPTIONS'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : strategy.instrumentType === 'FUTURES'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}
                    >
                      {strategy.instrumentType}
                    </span>
                    {strategy.instrumentType === 'OPTIONS' && (
                      <span className="text-xs text-gray-500">
                        {strategy.optionAction} {strategy.optionType}
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {strategy.quantity} lot
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {strategy.slType === 'CANDLE' ? (
                    <div className="space-y-0.5">
                      <div className="text-blue-600">
                        Candle SL
                        {strategy.slBuffer?.value != null && (
                          <span className="text-gray-500 text-xs ml-1">
                            (+{strategy.slBuffer.value}
                            {strategy.slBuffer.type === '%' ? '%' : 'pts'})
                          </span>
                        )}
                      </div>
                      <div className="text-green-500">
                        {strategy.targetProfit?.value != null
                          ? `${strategy.targetProfit.value}${strategy.targetProfit.type === '%' ? '%' : 'pts'}`
                          : '-'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <span className="text-red-500">
                        {strategy.stopLoss?.value != null
                          ? `${strategy.stopLoss.value}${strategy.stopLoss.type === '%' ? '%' : 'pts'}`
                          : '-'}
                      </span>
                      {' / '}
                      <span className="text-green-500">
                        {strategy.targetProfit?.value != null
                          ? `${strategy.targetProfit.value}${strategy.targetProfit.type === '%' ? '%' : 'pts'}`
                          : '-'}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => isAdmin && handleToggleLive(strategy._id, strategy.liveEnabled)}
                    disabled={!isAdmin || updateStrategy.isPending}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                      strategy.liveEnabled
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    } ${isAdmin && !updateStrategy.isPending ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
                  >
                    {strategy.liveEnabled ? 'LIVE' : 'VIRTUAL'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleEnabled(strategy._id, strategy.isEnabled)}
                    disabled={updateStrategy.isPending}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      strategy.isEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    } ${updateStrategy.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        strategy.isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

