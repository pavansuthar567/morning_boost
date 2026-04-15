import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shareService } from '@/services/shareService';
import {
  CreateShareLinkPayload,
  CreateShareInvitePayload,
  UpdateSharePayload,
  TradesQueryParams,
  OrdersQueryParams,
} from '@/types';

export const SHARE_KEYS = {
  myLinks: ['share', 'my-links'] as const,
  sharedWithMe: ['share', 'shared-with-me'] as const,
  viewSummary: (token: string) => ['share', 'view', token] as const,
  viewTrades: (token: string, params?: object) => ['share', 'view', token, 'trades', params] as const,
  viewOrders: (token: string, params?: object) => ['share', 'view', token, 'orders', params] as const,
  viewStrategies: (token: string) => ['share', 'view', token, 'strategies'] as const,
  viewAlerts: (token: string) => ['share', 'view', token, 'alerts'] as const,
  viewPnl: (token: string, days?: number) => ['share', 'view', token, 'pnl', days] as const,
};

// ============ OWNER HOOKS ============

export function useMyShareLinks() {
  return useQuery({
    queryKey: SHARE_KEYS.myLinks,
    queryFn: shareService.getMyLinks,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}

export function useSharedWithMe() {
  return useQuery({
    queryKey: SHARE_KEYS.sharedWithMe,
    queryFn: shareService.getSharedWithMe,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateShareLinkPayload) => shareService.createLink(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHARE_KEYS.myLinks });
    },
  });
}

export function useCreateShareInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateShareInvitePayload) => shareService.createInvite(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHARE_KEYS.myLinks });
    },
  });
}

export function useUpdateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSharePayload }) =>
      shareService.updateLink(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHARE_KEYS.myLinks });
    },
  });
}

export function useDeleteShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shareService.deleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHARE_KEYS.myLinks });
    },
  });
}

// ============ VIEWER HOOKS ============

export function useShareViewSummary(token: string, enabled = true) {
  return useQuery({
    queryKey: SHARE_KEYS.viewSummary(token),
    queryFn: () => shareService.viewSummary(token),
    enabled: !!token && enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useShareViewTrades(
  token: string,
  params?: TradesQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: SHARE_KEYS.viewTrades(token, params),
    queryFn: () => shareService.viewTrades(token, params),
    enabled: !!token && enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function useShareViewOrders(
  token: string,
  params?: OrdersQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: SHARE_KEYS.viewOrders(token, params),
    queryFn: () => shareService.viewOrders(token, params),
    enabled: !!token && enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function useShareViewStrategies(token: string, enabled = true) {
  return useQuery({
    queryKey: SHARE_KEYS.viewStrategies(token),
    queryFn: () => shareService.viewStrategies(token),
    enabled: !!token && enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useShareViewAlerts(token: string, enabled = true) {
  return useQuery({
    queryKey: SHARE_KEYS.viewAlerts(token),
    queryFn: () => shareService.viewAlerts(token),
    enabled: !!token && enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useShareViewPnl(token: string, days?: number, enabled = true) {
  return useQuery({
    queryKey: SHARE_KEYS.viewPnl(token, days),
    queryFn: () => shareService.viewPnl(token, days),
    enabled: !!token && enabled,
    staleTime: 1000 * 60 * 5,
  });
}
