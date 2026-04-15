import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { strategiesService } from '@/services';
import { StrategiesQueryParams, Strategy } from '@/types';

export const STRATEGIES_QUERY_KEY = 'strategies';

/**
 * Hook to fetch all strategies
 */
export function useStrategies(params?: StrategiesQueryParams, enabled = true) {
  return useQuery({
    queryKey: [STRATEGIES_QUERY_KEY, params],
    queryFn: () => strategiesService.getAll(params),
    enabled,
  });
}

/**
 * Hook to fetch single strategy by ID
 */
export function useStrategyById(id: string | undefined) {
  return useQuery({
    queryKey: [STRATEGIES_QUERY_KEY, id],
    queryFn: () => strategiesService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create strategy
 */
export function useCreateStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Strategy>) => strategiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STRATEGIES_QUERY_KEY] });
    },
  });
}

/**
 * Hook to update strategy
 */
export function useUpdateStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Strategy> }) =>
      strategiesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STRATEGIES_QUERY_KEY] });
    },
  });
}

/**
 * Hook to delete strategy
 */
export function useDeleteStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => strategiesService.delete(id),
    onSuccess: (_data, id) => {
      // Remove the specific strategy query to prevent 404 refetch
      queryClient.removeQueries({ queryKey: [STRATEGIES_QUERY_KEY, id] });
      // Invalidate list queries so they refetch
      queryClient.invalidateQueries({ 
        queryKey: [STRATEGIES_QUERY_KEY],
        refetchType: 'none' // Don't refetch inactive queries
      });
    },
  });
}

export default useStrategies;

