'use client';

import { useState, useCallback } from 'react';
import { useCreateOrder, useVerifyPayment } from './useSubscription';
import { SubscriptionPlan, BillingCycle } from '@/types';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface UseRazorpayReturn {
  initiatePayment: (plan: SubscriptionPlan, billingCycle?: BillingCycle) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function useRazorpay(onSuccess?: () => void, onError?: (error: string) => void): UseRazorpayReturn {
  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = useCallback(async (plan: SubscriptionPlan, billingCycle: BillingCycle = 'monthly') => {
    setIsLoading(true);
    setError(null);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Please check your internet connection.');
      }

      // Create order with billing cycle
      const orderData = await createOrderMutation.mutateAsync({ plan, billingCycle });

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency,
        name: 'Niftyswift',
        description: `NiftySwift software subscription - ${plan} (${billingCycle})`,
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            await verifyPaymentMutation.mutateAsync({
              subscriptionId: orderData.subscriptionId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setIsLoading(false);
            onSuccess?.();
          } catch (verifyError) {
            const errorMessage = verifyError instanceof Error ? verifyError.message : 'Payment verification failed';
            setError(errorMessage);
            setIsLoading(false);
            onError?.(errorMessage);
          }
        },
        prefill: {
          name: orderData.user.name,
          email: orderData.user.email,
        },
        theme: {
          color: '#465fff',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate payment';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
    }
  }, [createOrderMutation, verifyPaymentMutation, onSuccess, onError]);

  return {
    initiatePayment,
    isLoading: isLoading || createOrderMutation.isPending || verifyPaymentMutation.isPending,
    error,
  };
}

