import api from '@/lib/api';
import {
  ShareLink,
  SharedWithMe,
  ShareViewSummary,
  CreateShareLinkPayload,
  CreateShareInvitePayload,
  UpdateSharePayload,
  VirtualTrade,
  VirtualOrder,
  Strategy,
  Alert,
  DailyPnl,
  DailyPnlSummary,
  Pagination,
  TradesQueryParams,
  OrdersQueryParams,
  SharePermission,
} from '@/types';

const SHARE_BASE = '/share';

export interface ShareViewTradesResponse {
  trades: VirtualTrade[];
  pagination: Pagination;
  summary?: {
    totalTrades: number;
    openTrades?: number;
    totalPnL: number;
    totalNetPnL?: number;
    winRate: number;
  };
  ownerName?: string;
  ownerAvatar?: string;
  permissions?: SharePermission[];
  shareName?: string;
  dailyPnl?: DailyPnl[];
  dailyPnlSummary?: DailyPnlSummary;
}

export interface ShareViewOrdersResponse {
  orders: VirtualOrder[];
  pagination: Pagination;
}

export interface ShareViewPnlResponse {
  dailyPnl: DailyPnl[];
  summary: DailyPnlSummary;
}

export const shareService = {
  // ============ OWNER ENDPOINTS ============

  // Create a public share link
  createLink: async (payload: CreateShareLinkPayload): Promise<ShareLink> => {
    const response = await api.post(`${SHARE_BASE}/link`, payload);
    return response.data;
  },

  // Create an invite (by email)
  createInvite: async (payload: CreateShareInvitePayload): Promise<ShareLink> => {
    const response = await api.post(`${SHARE_BASE}/invite`, payload);
    return response.data;
  },

  // Get all my shares (links + invites)
  getMyLinks: async (): Promise<ShareLink[]> => {
    const response = await api.get(`${SHARE_BASE}/my-links`);
    return response.data || [];
  },

  // Get shares shared with me
  getSharedWithMe: async (): Promise<SharedWithMe[]> => {
    const response = await api.get(`${SHARE_BASE}/shared-with-me`);
    return response.data || [];
  },

  // Update a share
  updateLink: async (id: string, payload: UpdateSharePayload): Promise<ShareLink> => {
    const response = await api.put(`${SHARE_BASE}/link/${id}`, payload);
    return response.data;
  },

  // Delete a share
  deleteLink: async (id: string): Promise<void> => {
    await api.delete(`${SHARE_BASE}/link/${id}`);
  },

  // ============ VIEWER ENDPOINTS ============

  // View share summary (public for links, auth for invites)
  viewSummary: async (token: string): Promise<ShareViewSummary> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.get(`${SHARE_BASE}/view/${token}`);
    // BE returns: { status, data: { ownerName, ... } }
    return response.data || response;
  },

  // View full trades
  viewTrades: async (
    token: string,
    params?: TradesQueryParams
  ): Promise<ShareViewTradesResponse> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.get(`${SHARE_BASE}/view/${token}/trades`, { params });
    // BE returns: { status, message, data: [...trades], meta: { pagination, summary, dailyPnl? } }
    const meta = response.meta || {};
    const dailyPnlRaw = meta.dailyPnl;
    const dailyPnl = Array.isArray(dailyPnlRaw) ? dailyPnlRaw : dailyPnlRaw?.dailyData || [];
    const dailySummaryRaw = meta.dailyPnlSummary || (!Array.isArray(dailyPnlRaw) ? dailyPnlRaw : undefined);
    const dailyPnlSummary = dailySummaryRaw ? {
      totalPnl: dailySummaryRaw.totalPnl || 0,
      totalNetPnl: dailySummaryRaw.totalNetPnl || 0,
      totalCharges: dailySummaryRaw.totalCharges,
      totalTrades: dailySummaryRaw.totalTrades || 0,
      winningDays: dailySummaryRaw.winningTrades || dailySummaryRaw.winningDays || 0,
      losingDays: dailySummaryRaw.losingTrades || dailySummaryRaw.losingDays || 0,
      bestDay: dailySummaryRaw.bestDay ?? null,
      worstDay: dailySummaryRaw.worstDay ?? null,
      bestDayNet: dailySummaryRaw.bestDayNet ?? null,
      worstDayNet: dailySummaryRaw.worstDayNet ?? null,
      maxDrawdown: dailySummaryRaw.maxDrawdown,
      currentDrawdown: dailySummaryRaw.currentDrawdown,
      maxDrawdownNet: dailySummaryRaw.maxDrawdownNet,
      currentDrawdownNet: dailySummaryRaw.currentDrawdownNet,
      maxDrawdownTrade: dailySummaryRaw.maxDrawdownTrade,
      currentDrawdownTrade: dailySummaryRaw.currentDrawdownTrade,
      maxDrawdownTradeNet: dailySummaryRaw.maxDrawdownTradeNet,
      currentDrawdownTradeNet: dailySummaryRaw.currentDrawdownTradeNet,
      minCapitalRequired: dailySummaryRaw.minCapitalRequired,
      minCapitalRequiredNet: dailySummaryRaw.minCapitalRequiredNet,
      maxTradeValue: dailySummaryRaw.maxTradeValue,
    } : undefined;

    return {
      trades: response.data || [],
      pagination: meta.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      summary: meta.summary,
      ownerName: meta.ownerName,
      ownerAvatar: meta.ownerAvatar,
      permissions: meta.permissions,
      shareName: meta.shareName,
      dailyPnl,
      dailyPnlSummary,
    };
  },

  // View full orders
  viewOrders: async (
    token: string,
    params?: OrdersQueryParams
  ): Promise<ShareViewOrdersResponse> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.get(`${SHARE_BASE}/view/${token}/orders`, { params });
    // BE returns: { status, message, data: [...orders], meta: { pagination, summary } }
    return {
      orders: response.data || [],
      pagination: response.meta?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  // View strategies
  viewStrategies: async (token: string): Promise<Strategy[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.get(`${SHARE_BASE}/view/${token}/strategies`);
    // BE returns: { status, data: [...] } or { status, message, data: [...] }
    return response.data || response || [];
  },

  // View alerts
  viewAlerts: async (token: string): Promise<Alert[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.get(`${SHARE_BASE}/view/${token}/alerts`);
    // BE returns: { status, data: [...] } or { status, message, data: [...] }
    return response.data || response || [];
  },

  // View P&L analytics
  viewPnl: async (token: string, days?: number): Promise<ShareViewPnlResponse> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.get(`${SHARE_BASE}/view/${token}/pnl`, { 
      params: days ? { days } : undefined 
    });
    // BE returns: { status, data: { summary, dailyPnl: { dailyData: [...] } } }
    const data = response.data || response;
    const dailyPnlData = data?.dailyPnl || {};
    const summaryData = data?.summary || {};
    
    return {
      dailyPnl: dailyPnlData.dailyData || [],
      summary: {
        totalPnl: dailyPnlData.totalPnl ?? summaryData.totalPnl ?? 0,
        totalNetPnl: dailyPnlData.totalNetPnl ?? summaryData.totalNetPnl ?? 0,
        totalTrades: dailyPnlData.totalTrades ?? summaryData.totalTrades ?? 0,
        winningDays: dailyPnlData.winningTrades ?? 0,
        losingDays: dailyPnlData.losingTrades ?? 0,
        bestDay: null,
        worstDay: null,
      },
    };
  },
};

export default shareService;
