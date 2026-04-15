import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsService } from '@/services';
import { AlertsQueryParams } from '@/types';

export const ALERTS_QUERY_KEY = 'alerts';

/**
 * Hook to fetch all alerts
 */
export function useAlerts(params?: AlertsQueryParams, enabled = true) {
  return useQuery({
    queryKey: [ALERTS_QUERY_KEY, params],
    queryFn: () => alertsService.getAll(params),
    enabled,
  });
}

/**
 * Hook to fetch single alert by ID
 */
export function useAlertById(id: string | undefined) {
  return useQuery({
    queryKey: [ALERTS_QUERY_KEY, id],
    queryFn: () => alertsService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to update alert (enable/disable)
 */
export function useUpdateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { isEnabled: boolean } }) =>
      alertsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALERTS_QUERY_KEY] });
    },
  });
}

export default useAlerts;

