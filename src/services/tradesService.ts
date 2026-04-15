import api from '@/lib/api';
import { ApiResponse, VirtualTrade, TradesQueryParams, TradesSummary } from '@/types';

const ENDPOINT = '/virtual-trades';

export const tradesService = {
  /**
   * Get all virtual trades with optional filters
   */
  getAll: async (
    params?: TradesQueryParams
  ): Promise<ApiResponse<VirtualTrade[], TradesSummary>> => {
    const response = await api.get(ENDPOINT, { params });
    return response as unknown as ApiResponse<VirtualTrade[], TradesSummary>;
  },

  /**
   * Get single virtual trade by ID
   */
  getById: async (id: string): Promise<ApiResponse<VirtualTrade>> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response as unknown as ApiResponse<VirtualTrade>;
  },
};

export default tradesService;

