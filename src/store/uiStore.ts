import { create } from 'zustand';
import {
  TradesQueryParams,
  OrdersQueryParams,
  AlertsQueryParams,
  StrategiesQueryParams,
} from '@/types';

interface UIState {
  // Trades filters
  tradesFilters: TradesQueryParams;
  setTradesFilters: (filters: TradesQueryParams) => void;
  resetTradesFilters: () => void;

  // Orders filters
  ordersFilters: OrdersQueryParams;
  setOrdersFilters: (filters: OrdersQueryParams) => void;
  resetOrdersFilters: () => void;

  // Alerts filters
  alertsFilters: AlertsQueryParams;
  setAlertsFilters: (filters: AlertsQueryParams) => void;
  resetAlertsFilters: () => void;

  // Strategies filters
  strategiesFilters: StrategiesQueryParams;
  setStrategiesFilters: (filters: StrategiesQueryParams) => void;
  resetStrategiesFilters: () => void;

  // Modal states
  isTradeDetailOpen: boolean;
  selectedTradeId: string | null;
  openTradeDetail: (id: string) => void;
  closeTradeDetail: () => void;

  isOrderDetailOpen: boolean;
  selectedOrderId: string | null;
  openOrderDetail: (id: string) => void;
  closeOrderDetail: () => void;
}

const defaultTradesFilters: TradesQueryParams = {
  page: 1,
  limit: 20,
};

const defaultOrdersFilters: OrdersQueryParams = {
  page: 1,
  limit: 20,
};

const defaultAlertsFilters: AlertsQueryParams = {
  page: 1,
  limit: 20,
};

const defaultStrategiesFilters: StrategiesQueryParams = {
  page: 1,
  limit: 20,
};

export const useUIStore = create<UIState>((set) => ({
  // Trades filters
  tradesFilters: defaultTradesFilters,
  setTradesFilters: (filters) =>
    set((state) => ({
      tradesFilters: { ...state.tradesFilters, ...filters },
    })),
  resetTradesFilters: () => set({ tradesFilters: defaultTradesFilters }),

  // Orders filters
  ordersFilters: defaultOrdersFilters,
  setOrdersFilters: (filters) =>
    set((state) => ({
      ordersFilters: { ...state.ordersFilters, ...filters },
    })),
  resetOrdersFilters: () => set({ ordersFilters: defaultOrdersFilters }),

  // Alerts filters
  alertsFilters: defaultAlertsFilters,
  setAlertsFilters: (filters) =>
    set((state) => ({
      alertsFilters: { ...state.alertsFilters, ...filters },
    })),
  resetAlertsFilters: () => set({ alertsFilters: defaultAlertsFilters }),

  // Strategies filters
  strategiesFilters: defaultStrategiesFilters,
  setStrategiesFilters: (filters) =>
    set((state) => ({
      strategiesFilters: { ...state.strategiesFilters, ...filters },
    })),
  resetStrategiesFilters: () => set({ strategiesFilters: defaultStrategiesFilters }),

  // Trade detail modal
  isTradeDetailOpen: false,
  selectedTradeId: null,
  openTradeDetail: (id) => set({ isTradeDetailOpen: true, selectedTradeId: id }),
  closeTradeDetail: () => set({ isTradeDetailOpen: false, selectedTradeId: null }),

  // Order detail modal
  isOrderDetailOpen: false,
  selectedOrderId: null,
  openOrderDetail: (id) => set({ isOrderDetailOpen: true, selectedOrderId: id }),
  closeOrderDetail: () => set({ isOrderDetailOpen: false, selectedOrderId: null }),
}));

export default useUIStore;

