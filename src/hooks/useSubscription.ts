import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/services/subscriptionService';
import { SubscriptionPlan, VerifyPaymentPayload } from '@/types';

export const SUBSCRIPTION_KEYS = {
  plans: ['subscription', 'plans'] as const,
  mySubscription: ['subscription', 'me'] as const,
  paymentHistory: (params?: { page?: number; limit?: number }) => ['subscription', 'history', params] as const,
};

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.plans,
    queryFn: subscriptionService.getPlans,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.mySubscription,
    queryFn: subscriptionService.getMySubscription,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ plan, billingCycle }: { plan: SubscriptionPlan; billingCycle?: 'monthly' | 'annual' }) => 
      subscriptionService.createOrder(plan, billingCycle),
    onSuccess: () => {
      // Order created, payment flow will handle the rest
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: VerifyPaymentPayload) => subscriptionService.verifyPayment(payload),
    onSuccess: () => {
      // Invalidate subscription queries to refresh data
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.mySubscription });
      queryClient.invalidateQueries({ queryKey: ['subscription', 'history'] });
    },
    onError: (error) => {
      console.error('Failed to verify payment:', error);
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subscriptionService.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.mySubscription });
    },
    onError: (error) => {
      console.error('Failed to cancel subscription:', error);
    },
  });
}

export function usePaymentHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.paymentHistory(params),
    queryFn: () => subscriptionService.getPaymentHistory(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

