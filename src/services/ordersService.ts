import api from '@/lib/api';
import { ApiResponse, VirtualOrder, OrdersQueryParams, OrdersSummary } from '@/types';

const ENDPOINT = '/virtual-orders';

export const ordersService = {
  /**
   * Get all virtual orders with optional filters
   */
  getAll: async (
    params?: OrdersQueryParams
  ): Promise<ApiResponse<VirtualOrder[], OrdersSummary>> => {
    const response = await api.get(ENDPOINT, { params });
    return response as unknown as ApiResponse<VirtualOrder[], OrdersSummary>;
  },

  /**
   * Get single virtual order by ID
   */
  getById: async (id: string): Promise<ApiResponse<VirtualOrder>> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response as unknown as ApiResponse<VirtualOrder>;
  },
};

export default ordersService;

