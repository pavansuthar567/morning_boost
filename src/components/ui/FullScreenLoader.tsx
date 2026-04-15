"use client";

interface FullScreenLoaderProps {
  message?: string;
}

export default function FullScreenLoader({ message = 'Loading...' }: FullScreenLoaderProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-300">
      <span className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700"></span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}


