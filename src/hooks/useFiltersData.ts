import { useQuery } from '@tanstack/react-query';
import { filtersService, FiltersResponse } from '@/services/filtersService';

export const FILTERS_QUERY_KEY = 'filters-symbols-strategies';

export function useFiltersData() {
  return useQuery<FiltersResponse>({
    queryKey: [FILTERS_QUERY_KEY],
    queryFn: filtersService.getSymbolsStrategies,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

