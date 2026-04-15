'use client';

import { useCallback, useEffect, useState } from 'react';
import { pushService, type PushSubscriptionPayload } from '@/services/pushService';
import { authTokens } from '@/lib/authTokens';

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = typeof window === 'undefined' ? '' : window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  const getRegistration = async () => {
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register('/sw.js');
    }
    // Ensure the SW is active/ready before subscribing
    const ready = await navigator.serviceWorker.ready;
    return ready || reg;
  };

  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;
    try {
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch {
      setIsSubscribed(false);
    }
  }, [isSupported]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const enable = async () => {
    setError(null);
    if (!isSupported) {
      setError('Push not supported in this browser.');
      return;
    }
    if (!VAPID_KEY) {
      setError('VAPID public key missing. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY.');
      return;
    }
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Notification permission denied.');
        setIsLoading(false);
        return;
      }

      const reg = await getRegistration();
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
        });
      }

      const token = authTokens.getAccessToken() || undefined;
      await pushService.subscribe(sub.toJSON() as PushSubscriptionPayload, token);
      setIsSubscribed(true);
    } catch (err) {
      setError((err as Error).message || 'Failed to enable push.');
    } finally {
      setIsLoading(false);
    }
  };

  const disable = async () => {
    setError(null);
    if (!isSupported) return;
    setIsLoading(true);
    try {
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const token = authTokens.getAccessToken() || undefined;
        await pushService.unsubscribe(sub.endpoint, token);
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (err) {
      setError((err as Error).message || 'Failed to disable push.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    enable,
    disable,
    checkSubscription,
  };
}


