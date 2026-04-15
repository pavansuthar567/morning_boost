'use client';

import React, { useEffect } from 'react';
import { Strategy, Alert } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface StrategyFormProps {
  strategy: Partial<Strategy>;
  alerts: Alert[];
  isEditMode: boolean;
  isNewStrategy?: boolean; // true = creating new, false = editing existing
  slEnabled: boolean;
  tgtEnabled: boolean;
  onSlToggle: (enabled: boolean) => void;
  onTgtToggle: (enabled: boolean) => void;
  onChange: (field: string, value: unknown) => void;
  onNestedChange: (parent: string, field: string, value: unknown) => void;
}

export default function StrategyForm({
  strategy,
  alerts,
  isEditMode,
  isNewStrategy = true,
  slEnabled,
  tgtEnabled,
  onSlToggle,
  onTgtToggle,
  onChange,
  onNestedChange,
}: StrategyFormProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const inputClass = `w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
    isEditMode
      ? 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-white/5 dark:border-white/10 dark:text-white'
      : 'bg-gray-100 border-gray-200 cursor-not-allowed dark:bg-white/3 dark:border-white/5 dark:text-gray-400'
    }`;

  const labelClass = 'block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300';
  const optionClasses = 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';

  const getAlertId = (alert: Alert | string | undefined): string => {
    if (!alert) return '';
    if (typeof alert === 'string') return alert;
    return alert._id;
  };

  useEffect(() => {
    if (!slEnabled) return;
    if (!strategy.slType) {
      onChange('slType', 'STATIC');
    }
    if (strategy.slType === 'CANDLE' && !strategy.slBuffer?.type) {
      onNestedChange('slBuffer', 'type', 'points');
    }
  }, [slEnabled, strategy.slType, strategy.slBuffer?.type, onChange, onNestedChange]);

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="p-4 bg-white dark:bg-white/3 rounded-xl border border-gray-200 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Strategy Name</label>
            <input
              type="text"
              value={strategy.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              disabled={!isEditMode}
              className={inputClass}
              placeholder="Enter strategy name"
            />
          </div>

          {/* Alert */}
          <div>
            <label className={labelClass}>
              Alert {!isNewStrategy && <span className="text-xs text-gray-400">(cannot change)</span>}
            </label>
            <select
              value={getAlertId(strategy.alert)}
              onChange={(e) => onChange('alert', e.target.value)}
              disabled={!isEditMode || !isNewStrategy}
              className={inputClass}
            >
              <option className={optionClasses} value="">Select Alert</option>
              {alerts.map((alert) => (
                <option className={optionClasses} key={alert._id} value={alert._id}>
                  {alert.name} ({alert.symbol} - {alert.timeframe}m)
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={strategy.isEnabled ? 'true' : 'false'}
              onChange={(e) => onChange('isEnabled', e.target.value === 'true')}
              disabled={!isEditMode}
              className={inputClass}
            >
              <option className={optionClasses} value="true">Enabled</option>
              <option className={optionClasses} value="false">Disabled</option>
            </select>
          </div>

          {/* Live Trading Toggle - Admin Only */}
          {isAdmin && (
            <div>
              <label className={labelClass}>Live Trading</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onChange('liveEnabled', !strategy.liveEnabled)}
                  disabled={!isEditMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    strategy.liveEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  } ${!isEditMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${strategy.liveEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm ${strategy.liveEnabled ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  {strategy.liveEnabled ? 'Live' : 'Virtual'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Trading Settings - Show only when liveEnabled is true */}
      {isAdmin && strategy.liveEnabled && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-600 dark:text-amber-400">⚡</span>
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Live Trading Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Test Mode Toggle */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Mode</label>
                <div className="relative group">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    ON = Places BUY for exits (no margin required)<br/>
                    OFF = Real SELL orders (requires margin)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onChange('liveTestMode', !(strategy.liveTestMode ?? true))}
                  disabled={!isEditMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    (strategy.liveTestMode ?? true) ? 'bg-amber-500' : 'bg-green-500'
                  } ${!isEditMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(strategy.liveTestMode ?? true) ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm font-medium ${(strategy.liveTestMode ?? true) ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                  {(strategy.liveTestMode ?? true) ? 'Test Mode (BUY exits)' : 'Live Mode (Real SELL)'}
                </span>
              </div>
            </div>

            {/* Order Type Dropdown */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Type</label>
                <div className="relative group">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    LIMIT = Price with 0.5% buffer for better fills<br/>
                    MARKET = Instant fill at current market price
                  </div>
                </div>
              </div>
              <select
                value={strategy.liveOrderType || 'LIMIT'}
                onChange={(e) => onChange('liveOrderType', e.target.value)}
                disabled={!isEditMode}
                className={inputClass}
              >
                <option className={optionClasses} value="LIMIT">LIMIT (0.5% buffer)</option>
                <option className={optionClasses} value="MARKET">MARKET (instant)</option>
              </select>
            </div>
          </div>
          
          {/* Warning for non-test mode */}
          {!(strategy.liveTestMode ?? true) && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span><strong>Warning:</strong> Live Mode will place real SELL orders requiring margin. Ensure adequate funds in your broker account.</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instrument Settings */}
      <div className="p-4 bg-white dark:bg-white/3 rounded-xl border border-gray-200 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Instrument Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Instrument */}
          <div>
            <label className={labelClass}>Instrument</label>
            <select
              value={strategy.instrument || 'NIFTY50'}
              onChange={(e) => onChange('instrument', e.target.value)}
              disabled={!isEditMode}
              className={inputClass}
            >
              <option className={optionClasses} value="NIFTY50">NIFTY 50</option>
              <option className={optionClasses} value="BANKNIFTY">BANK NIFTY</option>
              <option className={optionClasses} value="FINNIFTY">FIN NIFTY</option>
              <option className={optionClasses} value="MIDCPNIFTY">MIDCAP NIFTY</option>
            </select>
          </div>

          {/* Instrument Type */}
          <div>
            <label className={labelClass}>Instrument Type</label>
            <select
              value={strategy.instrumentType || 'OPTIONS'}
              onChange={(e) => onChange('instrumentType', e.target.value)}
              disabled={!isEditMode}
              className={inputClass}
            >
              <option className={optionClasses} value="SPOT">Spot</option>
              <option className={optionClasses} value="FUTURES">Futures</option>
              <option className={optionClasses} value="OPTIONS">Options</option>
            </select>
          </div>

          {/* Trade Mode */}
          <div>
            <label className={labelClass}>Trade Mode</label>
            <select
              value={strategy.tradeMode || 'INTRADAY'}
              onChange={(e) => onChange('tradeMode', e.target.value)}
              disabled={!isEditMode}
              className={inputClass}
            >
              <option className={optionClasses} value="INTRADAY">Intraday</option>
              <option className={optionClasses} value="DELIVERY">Delivery</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className={labelClass}>Quantity (Lots)</label>
            <input
              type="number"
              min="1"
              value={strategy.quantity || 1}
              onChange={(e) => onChange('quantity', parseInt(e.target.value) || 1)}
              disabled={!isEditMode}
              className={inputClass}
            />
          </div>

          {strategy.instrumentType === 'OPTIONS' && (
            <>
              {/* Option Action */}
              <div>
                <label className={labelClass}>Option Action</label>
                <select
                  value={strategy.optionAction || 'BUY'}
                  onChange={(e) => onChange('optionAction', e.target.value)}
                  disabled={!isEditMode}
                  className={inputClass}
                >
                  <option className={optionClasses} value="BUY">Buy</option>
                  <option className={optionClasses} value="SELL">Sell</option>
                </select>
              </div>

              {/* Contract Type */}
              <div>
                <label className={labelClass}>Contract Type</label>
                <select
                  value={strategy.contractType || 'WEEKLY'}
                  onChange={(e) => onChange('contractType', e.target.value)}
                  disabled={!isEditMode}
                  className={inputClass}
                >
                  <option className={optionClasses} value="WEEKLY">Weekly</option>
                  <option className={optionClasses} value="NEXT_WEEKLY">Next Weekly</option>
                  <option className={optionClasses} value="MONTHLY">Monthly</option>
                </select>
              </div>

              {/* Option Type */}
              <div>
                <label className={labelClass}>Option Type</label>
                <select
                  value={strategy.optionType || 'ATM'}
                  onChange={(e) => onChange('optionType', e.target.value)}
                  disabled={!isEditMode}
                  className={inputClass}
                >
                  <option className={optionClasses} value="ATM">ATM</option>
                  <option className={optionClasses} value="ITM">ITM</option>
                  <option className={optionClasses} value="OTM">OTM</option>
                </select>
              </div>

              {/* Strike Distance */}
              <div>
                <label className={labelClass}>Strike Distance</label>
                <input
                  type="number"
                  min="0"
                  value={strategy.strikeDistance || 0}
                  onChange={(e) => onChange('strikeDistance', parseInt(e.target.value) || 0)}
                  disabled={!isEditMode}
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Risk Management */}
      <div className="p-4 bg-white dark:bg-white/3 rounded-xl border border-gray-200 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Risk Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Stop Loss */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stop Loss</label>
              <button
                type="button"
                onClick={() => onSlToggle(!slEnabled)}
                disabled={!isEditMode}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  slEnabled ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                } ${!isEditMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${slEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {slEnabled && (
              <div className="space-y-2">
                <select
                  value={strategy.slType || 'STATIC'}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    onChange('slType', nextType);
                    if (nextType === 'CANDLE' && !strategy.slBuffer?.type) {
                      onNestedChange('slBuffer', 'type', 'points');
                    }
                  }}
                  disabled={!isEditMode}
                  className={inputClass}
                >
                  <option value="STATIC">Static SL</option>
                  <option value="CANDLE">Candle SL</option>
                </select>

                {strategy.slType === 'CANDLE' ? (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Buffer for Candle SL
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={strategy.slBuffer?.value || ''}
                        onChange={(e) =>
                          onNestedChange('slBuffer', 'value', e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        disabled={!isEditMode}
                        className={inputClass}
                        placeholder="Buffer"
                      />
                      <select
                        value={strategy.slBuffer?.type || 'points'}
                        onChange={(e) => onNestedChange('slBuffer', 'type', e.target.value)}
                        disabled={!isEditMode}
                        className={`${inputClass} w-24`}
                      >
                        <option value="points">Points</option>
                        <option value="%">%</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      value={strategy.stopLoss?.value || ''}
                      onChange={(e) =>
                        onNestedChange('stopLoss', 'value', e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                      disabled={!isEditMode}
                      className={inputClass}
                      placeholder="Value"
                    />
                    <select
                      value={strategy.stopLoss?.type || 'points'}
                      onChange={(e) => onNestedChange('stopLoss', 'type', e.target.value)}
                      disabled={!isEditMode}
                      className={`${inputClass} w-24`}
                    >
                      <option value="points">Points</option>
                      <option value="%">%</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Target Profit */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Profit</label>
              <button
                type="button"
                onClick={() => onTgtToggle(!tgtEnabled)}
                disabled={!isEditMode}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  tgtEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                } ${!isEditMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${tgtEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {tgtEnabled && (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={strategy.targetProfit?.value || ''}
                  onChange={(e) =>
                    onNestedChange('targetProfit', 'value', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  disabled={!isEditMode}
                  className={inputClass}
                  placeholder="Value"
                />
                <select
                  value={strategy.targetProfit?.type || 'points'}
                  onChange={(e) => onNestedChange('targetProfit', 'type', e.target.value)}
                  disabled={!isEditMode}
                  className={`${inputClass} w-24`}
                >
                  <option value="points">Points</option>
                  <option value="%">%</option>
                </select>
              </div>
            )}
          </div>

          {/* Trailing SL */}
          <div>
            <label className={labelClass}>Trailing SL</label>
            <div className="flex gap-2 items-center">
              <select
                value={strategy.trailingSl?.enabled ? 'true' : 'false'}
                onChange={(e) => onNestedChange('trailingSl', 'enabled', e.target.value === 'true')}
                disabled={!isEditMode}
                className={`${inputClass} w-24`}
              >
                <option className={optionClasses} value="false">Off</option>
                <option className={optionClasses} value="true">On</option>
              </select>
              {strategy.trailingSl?.enabled && (
                <input
                  type="number"
                  min="0"
                  value={strategy.trailingSl?.value || ''}
                  onChange={(e) =>
                    onNestedChange('trailingSl', 'value', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  disabled={!isEditMode}
                  className={inputClass}
                  placeholder="Points"
                />
              )}
            </div>
          </div>

          {/* Daily Loss Limit */}
          <div>
            <label className={labelClass}>Daily Loss Limit (₹)</label>
            <input
              type="number"
              min="0"
              value={strategy.dailyLossLimit || ''}
              onChange={(e) => onChange('dailyLossLimit', e.target.value ? parseFloat(e.target.value) : undefined)}
              disabled={!isEditMode}
              className={inputClass}
              placeholder="Optional"
            />
          </div>

          {/* Daily Profit Limit */}
          <div>
            <label className={labelClass}>Daily Profit Limit (₹)</label>
            <input
              type="number"
              min="0"
              value={strategy.dailyProfitLimit || ''}
              onChange={(e) => onChange('dailyProfitLimit', e.target.value ? parseFloat(e.target.value) : undefined)}
              disabled={!isEditMode}
              className={inputClass}
              placeholder="Optional"
            />
          </div>

          {/* Max Open Trades */}
          <div>
            <label className={labelClass}>Max Open Trades</label>
            <input
              type="number"
              min="1"
              value={strategy.maxOpenTrades || 1}
              onChange={(e) => onChange('maxOpenTrades', parseInt(e.target.value) || 1)}
              disabled={!isEditMode}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Trading Hours */}
      <div className="p-4 bg-white dark:bg-white/3 rounded-xl border border-gray-200 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Trading Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time */}
          <div>
            <label className={labelClass}>Start Time</label>
            <input
              type="time"
              value={strategy.tradingStartTime || '09:20'}
              onChange={(e) => onChange('tradingStartTime', e.target.value)}
              disabled={!isEditMode}
              className={inputClass}
            />
          </div>

          {/* End Time */}
          <div>
            <label className={labelClass}>End Time</label>
            <input
              type="time"
              value={strategy.tradingEndTime || '15:00'}
              onChange={(e) => onChange('tradingEndTime', e.target.value)}
              disabled={!isEditMode}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

