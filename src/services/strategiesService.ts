import api from '@/lib/api';
import { ApiResponse, Strategy, StrategiesQueryParams, StrategiesSummary } from '@/types';

const ENDPOINT = '/strategies';

export const strategiesService = {
  /**
   * Get all strategies with optional filters
   */
  getAll: async (params?: StrategiesQueryParams): Promise<ApiResponse<Strategy[], StrategiesSummary>> => {
    const response = await api.get(ENDPOINT, { params });
    return response as unknown as ApiResponse<Strategy[], StrategiesSummary>;
  },

  /**
   * Get single strategy by ID
   */
  getById: async (id: string): Promise<ApiResponse<Strategy>> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response as unknown as ApiResponse<Strategy>;
  },

  /**
   * Create a new strategy
   */
  create: async (data: Partial<Strategy>): Promise<ApiResponse<Strategy>> => {
    const response = await api.post(ENDPOINT, data);
    return response as unknown as ApiResponse<Strategy>;
  },

  /**
   * Update strategy
   */
  update: async (id: string, data: Partial<Strategy>): Promise<ApiResponse<Strategy>> => {
    const response = await api.put(`${ENDPOINT}/${id}`, data);
    return response as unknown as ApiResponse<Strategy>;
  },

  /**
   * Delete strategy
   */
  delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response as unknown as ApiResponse<{ id: string }>;
  },
};

export default strategiesService;

