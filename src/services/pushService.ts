import api from '@/lib/api';

export interface PushSubscriptionPayload {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const pushService = {
  subscribe: async (subscription: PushSubscriptionPayload, token?: string) => {
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    await api.post(`/push/subscribe${query}`, { subscription });
  },
  unsubscribe: async (endpoint: string, token?: string) => {
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    await api.delete(`/push/unsubscribe${query}`, { data: { endpoint } });
  },
};


