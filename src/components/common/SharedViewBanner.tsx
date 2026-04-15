'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SharedViewBannerProps {
  ownerName?: string;
  onExit?: () => void;
}

export default function SharedViewBanner({ ownerName, onExit }: SharedViewBannerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleExit = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('token');
    const qs = params.toString();
    const nextUrl = qs ? `?${qs}` : window.location.pathname;
    router.replace(nextUrl);
    if (onExit) onExit();
  };
  return (
    <div className="mb-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-purple-600 dark:text-purple-400">👁</span>
        <p className="text-sm text-purple-700 dark:text-purple-300">
          <span className="font-medium">Viewing shared data</span>
          {ownerName && <span> from {ownerName}</span>}
          <span className="text-purple-500 dark:text-purple-400 ml-1">(read-only)</span>
        </p>
      </div>
      <button
        onClick={handleExit}
        className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
      >
        Exit Shared View
      </button>
    </div>
  );
}
