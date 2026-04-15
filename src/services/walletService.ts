import api from '@/lib/api';

export const walletService = {
  // Get wallet state for user
  getWallet: async (): Promise<any> => {
    const response: any = await api.get('/wallet');
    return response?.wallet;
  },

  // Create Razorpay Order
  createTopupOrder: async (amount: number): Promise<any> => {
    const response: any = await api.post('/wallet/topup', { amount });
    return response?.order;
  },

  // Verify Razorpay Payment
  verifyTopup: async (payload: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    amount: number;
    bonus?: number;
  }): Promise<any> => {
    const response: any = await api.post('/wallet/verify', payload);
    return response;
  }
};

export default walletService;
