import api from '@/lib/api';
import {
  ApiResponse,
  BillingCycle,
  CreateOrderResponse,
  Pagination,
  PaymentHistory,
  PlanDetails,
  Subscription,
  SubscriptionPlan,
  VerifyPaymentPayload,
} from '@/types';

const SUBSCRIPTION_BASE = '/subscription';

export const subscriptionService = {
  // Get all available plans (public)
  getPlans: async (): Promise<PlanDetails[]> => {
    const response = (await api.get(`${SUBSCRIPTION_BASE}/plans`)) as { plans: PlanDetails[] };
    return response.plans ?? [];
  },

  // Get current user's subscription
  getMySubscription: async (): Promise<Subscription | null> => {
    const response = (await api.get(`${SUBSCRIPTION_BASE}/me`)) as Subscription;
    return response ?? null;
  },

  // Create Razorpay order for subscription
  createOrder: async (plan: SubscriptionPlan, billingCycle: BillingCycle = 'monthly'): Promise<CreateOrderResponse> => {
    const response = (await api.post(`${SUBSCRIPTION_BASE}/create-order`, { plan, billingCycle })) as CreateOrderResponse;
    return response;
  },

  // Verify payment after Razorpay checkout
  verifyPayment: async (payload: VerifyPaymentPayload): Promise<Subscription> => {
    const response = (await api.post(`${SUBSCRIPTION_BASE}/verify-payment`, payload)) as ApiResponse<Subscription>;
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (): Promise<Subscription> => {
    const response = (await api.post(`${SUBSCRIPTION_BASE}/cancel`)) as ApiResponse<Subscription>;
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (params?: { page?: number; limit?: number }): Promise<{ data: PaymentHistory[]; pagination: Pagination }> => {
    const response = (await api.get(`${SUBSCRIPTION_BASE}/history`, { params })) as { history: PaymentHistory[] };
    return {
      data: response.history ?? [],
      pagination: { page: params?.page ?? 1, limit: params?.limit ?? 10, total: response.history?.length ?? 0, totalPages: 1 },
    };
  },
};

export default subscriptionService;

