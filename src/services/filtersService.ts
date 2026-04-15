import api from '@/lib/api';

export interface FilterStrategy {
  id: string;
  name: string;
  alertId: string;
  liveEnabled: boolean;
  isEnabled: boolean;
}

export interface FilterSymbol {
  symbol: string;
  exchange: string;
  timeframe: number;
  strategies: FilterStrategy[];
}

export interface FiltersResponse {
  symbols: FilterSymbol[];
}

const ENDPOINT = '/filters/symbols-strategies';

export const filtersService = {
  /**
   * Get symbols and strategies for filter dropdowns
   */
  getSymbolsStrategies: async (): Promise<FiltersResponse> => {
    const response = await api.get(ENDPOINT);
    return response.data as FiltersResponse;
  },
};

export default filtersService;

