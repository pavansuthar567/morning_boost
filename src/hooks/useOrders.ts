import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services';
import { OrdersQueryParams } from '@/types';

export const ORDERS_QUERY_KEY = 'virtual-orders';

/**
 * Hook to fetch all virtual orders
 */
export function useOrders(params?: OrdersQueryParams, enabled = true) {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, params],
    queryFn: () => ordersService.getAll(params),
    enabled,
  });
}

/**
 * Hook to fetch single virtual order by ID
 */
export function useOrderById(id: string | undefined) {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, id],
    queryFn: () => ordersService.getById(id!),
    enabled: !!id,
  });
}

export default useOrders;

