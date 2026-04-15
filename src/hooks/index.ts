export { useDebounce } from './useDebounce';
export { usePushNotifications } from './usePushNotifications';
export { useOrders, useOrderById, ORDERS_QUERY_KEY } from './useOrders';
export { useFiltersData, FILTERS_QUERY_KEY } from './useFiltersData';
export { 
  useSubscriptionPlans, 
  useMySubscription, 
  useCreateOrder, 
  useVerifyPayment, 
  useCancelSubscription, 
  usePaymentHistory,
  SUBSCRIPTION_KEYS 
} from './useSubscription';
export { useRazorpay } from './useRazorpay';

// Legacy hooks — kept as stubs for pages that still import them
// These return empty/noop data. Pages will be cleaned up in Phase 2.
export { useTrades, useTradeById, TRADES_QUERY_KEY } from './useTrades';
export { useAlerts, useAlertById, useUpdateAlert, ALERTS_QUERY_KEY } from './useAlerts';
export { useStrategies, useStrategyById, useCreateStrategy, useUpdateStrategy, useDeleteStrategy, STRATEGIES_QUERY_KEY } from './useStrategies';
export { useOrdersFiltersFromUrl } from './useOrdersFiltersFromUrl';
export { useTradesFiltersFromUrl } from './useTradesFiltersFromUrl';
export { useAlertsFiltersFromUrl } from './useAlertsFiltersFromUrl';
export { useStrategiesFiltersFromUrl } from './useStrategiesFiltersFromUrl';
export { useAlertsStream } from './useAlertsStream';
export {
  useMyShareLinks,
  useSharedWithMe,
  useCreateShareLink,
  useCreateShareInvite,
  useUpdateShareLink,
  useDeleteShareLink,
  useShareViewSummary,
  useShareViewTrades,
  useShareViewOrders,
  useShareViewStrategies,
  useShareViewAlerts,
  useShareViewPnl,
  SHARE_KEYS,
} from './useShare';
