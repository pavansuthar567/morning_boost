import api from '@/lib/api';
import { ApiResponse, Alert, AlertsQueryParams } from '@/types';

const ENDPOINT = '/alerts';

export const alertsService = {
  /**
   * Get all alerts with optional filters
   */
  getAll: async (params?: AlertsQueryParams): Promise<ApiResponse<Alert[]>> => {
    const response = await api.get(ENDPOINT, { params });
    return response as unknown as ApiResponse<Alert[]>;
  },

  /**
   * Get single alert by ID
   */
  getById: async (id: string): Promise<ApiResponse<Alert>> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response as unknown as ApiResponse<Alert>;
  },

  /**
   * Update alert (enable/disable)
   */
  update: async (id: string, data: { isEnabled: boolean }): Promise<ApiResponse<Alert>> => {
    const response = await api.put(`${ENDPOINT}/${id}`, data);
    return response as unknown as ApiResponse<Alert>;
  },
};

export default alertsService;

