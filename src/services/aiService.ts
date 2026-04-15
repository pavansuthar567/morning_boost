import api from '@/lib/api';
import { ApiResponse, Strategy, Alert } from '@/types';

interface GenerateStrategyPayload {
  message: string;
  alertId: string;
}

interface RefineStrategyPayload {
  message: string;
  alertId: string;
  currentStrategy: Partial<Strategy>;
}

interface AIStrategyResponse {
  strategy: Partial<Strategy>;
  alert: Alert;
  provider: string;
}

export const aiService = {
  /**
   * Generate a new strategy using AI
   */
  generateStrategy: async (payload: GenerateStrategyPayload): Promise<ApiResponse<AIStrategyResponse>> => {
    const response = await api.post('/ai/generate-strategy', payload);
    return response as unknown as ApiResponse<AIStrategyResponse>;
  },

  /**
   * Refine/modify existing strategy using AI
   */
  refineStrategy: async (payload: RefineStrategyPayload): Promise<ApiResponse<AIStrategyResponse>> => {
    const response = await api.post('/ai/refine-strategy', payload);
    return response as unknown as ApiResponse<AIStrategyResponse>;
  },
};

export default aiService;

