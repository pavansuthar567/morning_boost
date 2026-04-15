'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMySubscription } from '@/hooks';

const BANNER_STORAGE_KEY = 'niftyswift_banner_dismissed';

const getDaysRemaining = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const getUsagePercentage = (current: number, limit: number) => {
  if (limit === -1) return 0; // Unlimited
  return Math.round((current / limit) * 100);
};

const shouldShowBanner = (): boolean => {
  if (typeof window === 'undefined') return true;
  const dismissed = localStorage.getItem(BANNER_STORAGE_KEY);
  if (!dismissed) return true;

  // Show again if dismissed more than 24 hours ago
  const dismissedTime = parseInt(dismissed, 10);
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Date.now() - dismissedTime > oneDayMs;
};

export default function SubscriptionBanner() {
  const { data } = useMySubscription();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(shouldShowBanner());
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(BANNER_STORAGE_KEY, Date.now().toString());
  };

  if (!data || isDismissed || !isVisible) return null;

  const { subscription, usage, isExpired } = data;
  const warnings: { type: 'expiry' | 'limit'; message: string; severity: 'warning' | 'error' }[] = [];

  // Check expiry
  if (subscription) {
    const daysRemaining = getDaysRemaining(subscription.expiresAt);

    if (isExpired || daysRemaining === 0) {
      warnings.push({
        type: 'expiry',
        message: 'Your subscription has expired. Renew now to continue using premium features.',
        severity: 'error',
      });
    } else if (daysRemaining <= 3) {
      warnings.push({
        type: 'expiry',
        message: `Your subscription expires in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}. Renew now to avoid interruption.`,
        severity: 'error',
      });
    } else if (daysRemaining <= 7) {
      warnings.push({
        type: 'expiry',
        message: `Your subscription expires in ${daysRemaining} days.`,
        severity: 'warning',
      });
    }
  }

  // Check usage limits
  if (usage) {
    const alertUsage = getUsagePercentage(usage.alerts.current, usage.alerts.limit);
    const strategyUsage = getUsagePercentage(usage.strategies.current, usage.strategies.limit);

    if (alertUsage >= 100) {
      warnings.push({
        type: 'limit',
        message: `You&apos;ve reached your alerts limit (${usage.alerts.current}/${usage.alerts.limit}). Upgrade for more.`,
        severity: 'error',
      });
    } else if (alertUsage >= 80) {
      warnings.push({
        type: 'limit',
        message: `You&apos;re using ${alertUsage}% of your alerts limit (${usage.alerts.current}/${usage.alerts.limit}).`,
        severity: 'warning',
      });
    }

    if (strategyUsage >= 100) {
      warnings.push({
        type: 'limit',
        message: `You&apos;ve reached your strategies limit (${usage.strategies.current}/${usage.strategies.limit}). Upgrade for more.`,
        severity: 'error',
      });
    } else if (strategyUsage >= 80) {
      warnings.push({
        type: 'limit',
        message: `You&apos;re using ${strategyUsage}% of your strategies limit (${usage.strategies.current}/${usage.strategies.limit}).`,
        severity: 'warning',
      });
    }
  }

  // Show only the most important warning
  const warning = warnings.sort((a, b) => {
    if (a.severity === 'error' && b.severity !== 'error') return -1;
    if (a.severity !== 'error' && b.severity === 'error') return 1;
    return 0;
  })[0];

  if (!warning) return null;

  const isError = warning.severity === 'error';

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-2.5 text-sm ${isError
        ? 'bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400'
        : 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400'
        }`}
    >
      <div className="flex items-center gap-2">
        {isError ? (
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        <span dangerouslySetInnerHTML={{ __html: warning.message }} />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/pricing"
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${isError
            ? 'bg-error-600 text-white hover:bg-error-700 dark:bg-error-500 dark:hover:bg-error-600'
            : 'bg-warning-600 text-white hover:bg-warning-700 dark:bg-warning-500 dark:hover:bg-warning-600'
            }`}
        >
          {warning.type === 'expiry' ? 'Renew Now' : 'Upgrade'}
        </Link>
        <button
          onClick={handleDismiss}
          className={`p-1 rounded-full transition-colors ${isError
            ? 'hover:bg-error-200 dark:hover:bg-error-500/30'
            : 'hover:bg-warning-200 dark:hover:bg-warning-500/30'
            }`}
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

