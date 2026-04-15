'use client';

import React, { useState, useEffect } from 'react';
import { Alert, Strategy } from '@/types';
import { aiService } from '@/services';

interface AIStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  currentStrategy?: Partial<Strategy>;
  onStrategyGenerated: (strategy: Partial<Strategy>) => void;
}

export default function AIStrategyModal({
  isOpen,
  onClose,
  alerts,
  currentStrategy,
  onStrategyGenerated,
}: AIStrategyModalProps) {
  const [selectedAlertId, setSelectedAlertId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRefineMode = !!currentStrategy?.name;

  // Sync alertId when modal opens with currentStrategy (refine mode)
  useEffect(() => {
    if (currentStrategy?.alert) {
      const alertId = typeof currentStrategy.alert === 'string'
        ? currentStrategy.alert
        : currentStrategy.alert._id;
      setSelectedAlertId(alertId);
    } else {
      setSelectedAlertId('');
    }
  }, [currentStrategy]);

  const controlClasses =
    'w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/60 disabled:opacity-50 disabled:cursor-not-allowed';
  const optionClasses = 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';

  const handleGenerate = async () => {
    if (!selectedAlertId || !message.trim()) {
      setError('Please select an alert and enter your requirements');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (isRefineMode && currentStrategy) {
        response = await aiService.refineStrategy({
          message: message.trim(),
          alertId: selectedAlertId,
          currentStrategy,
        });
      } else {
        response = await aiService.generateStrategy({
          message: message.trim(),
          alertId: selectedAlertId,
        });
      }

      if (response.status === 'ok' && response.data?.strategy) {
        onStrategyGenerated(response.data.strategy);
        onClose();
        setMessage('');
      } else {
        setError('Failed to generate strategy');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate strategy. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100000 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {isRefineMode ? '✨ Refine Strategy with AI' : '✨ Generate Strategy with AI'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Alert Selection */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Alert
            </label>
            <select
              value={selectedAlertId}
              onChange={(e) => setSelectedAlertId(e.target.value)}
              disabled={isRefineMode}
              className={controlClasses}
            >
              <option className={optionClasses} value="">Choose an alert...</option>
              {alerts.map((alert) => (
                <option className={optionClasses} key={alert._id} value={alert._id}>
                  {alert.name} ({alert.symbol} - {alert.timeframe}m)
                </option>
              ))}
            </select>
          </div>

          {/* Message Input */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              {isRefineMode ? 'What would you like to change?' : 'Describe your strategy'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={`${controlClasses} resize-none`}
              placeholder={
                isRefineMode
                  ? 'e.g., "Increase stop loss to 30 points and change target to 50 points"'
                  : 'e.g., "Create an options buying strategy with 20 point SL and 40 point target for NIFTY weekly ATM options"'
              }
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Example prompts */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-1">Example prompts:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Options buying with 25pt SL, 50pt target</li>
              <li>Conservative strategy, small quantity, wide SL</li>
              <li>Scalping strategy with tight SL and quick exits</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !selectedAlertId || !message.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {isRefineMode ? 'Refine' : 'Generate'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

