import { useQuery } from '@tanstack/react-query';
import { tradesService } from '@/services';
import { TradesQueryParams } from '@/types';

export const TRADES_QUERY_KEY = 'virtual-trades';

/**
 * Hook to fetch all virtual trades
 */
export function useTrades(params?: TradesQueryParams, enabled = true) {
  return useQuery({
    queryKey: [TRADES_QUERY_KEY, params],
    queryFn: () => tradesService.getAll(params),
    enabled,
  });
}

/**
 * Hook to fetch single virtual trade by ID
 */
export function useTradeById(id: string | undefined) {
  return useQuery({
    queryKey: [TRADES_QUERY_KEY, id],
    queryFn: () => tradesService.getById(id!),
    enabled: !!id,
  });
}

export default useTrades;

