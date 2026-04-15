'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertStreamEvent } from '@/types';
import { API_BASE_URL } from '@/lib/api';
import { authTokens } from '@/lib/authTokens';

const STREAM_URL = `${API_BASE_URL.replace(/\/$/, '')}/stream/alerts`;
const STORAGE_KEY = 'niftyswift_live_alerts';
const EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

type StreamStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface StoredAlerts {
  events: AlertStreamEvent[];
  timestamp: number;
}

interface UseAlertsStreamOptions {
  autoStart?: boolean;
  maxEvents?: number;
  onEvent?: (event: AlertStreamEvent) => void;
}

const loadFromStorage = (): AlertStreamEvent[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const stored: StoredAlerts = JSON.parse(raw);
    if (Date.now() - stored.timestamp > EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return stored.events;
  } catch {
    return [];
  }
};

const saveToStorage = (events: AlertStreamEvent[]) => {
  if (typeof window === 'undefined') return;
  try {
    const data: StoredAlerts = { events, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
};

export function useAlertsStream(options: UseAlertsStreamOptions = {}) {
  const { autoStart = true, maxEvents = 100, onEvent } = options;

  const [events, setEvents] = useState<AlertStreamEvent[]>(() => loadFromStorage());
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    cleanup();
    setStatus('connecting');
    setError(null);

    const token = authTokens.getAccessToken();
    const url = new URL(STREAM_URL);
    if (token) url.searchParams.set('token', token);

    const es = new EventSource(url.toString(), { withCredentials: true });
    sourceRef.current = es;

    es.onopen = () => setStatus('connected');

    es.addEventListener('alert', (event) => {
      try {
        const parsed = JSON.parse((event as MessageEvent).data) as AlertStreamEvent;
        setEvents((prev) => {
          const updated = [parsed, ...prev].slice(0, maxEvents);
          saveToStorage(updated);
          return updated;
        });
        onEvent?.(parsed);
      } catch (err) {
        console.error('Failed to parse alert event', err);
      }
    });

    es.onerror = () => {
      setStatus('error');
      setError('Connection lost. Retrying...');
      cleanup();
      reconnectTimer.current = setTimeout(connect, 3000);
    };
  }, [cleanup, maxEvents, onEvent]);

  useEffect(() => {
    if (autoStart) connect();
    return () => cleanup();
  }, [autoStart, connect, cleanup]);

  const disconnect = useCallback(() => {
    cleanup();
    setStatus('idle');
  }, [cleanup]);

  const clear = useCallback(() => {
    setEvents([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const addEvent = useCallback((event: AlertStreamEvent) => {
    setEvents((prev) => {
      const updated = [event, ...prev].slice(0, maxEvents);
      saveToStorage(updated);
      return updated;
    });
    onEvent?.(event);
  }, [maxEvents, onEvent]);

  return {
    events,
    status,
    error,
    connect,
    disconnect,
    clear,
    addEvent,
  };
}


