// Charges Types
export interface Charges {
  stt: number;
  exchangeTxn: number;
  sebi: number;
  stampDuty: number;
  gst: number;
  brokerage: number;
  total: number;
}

// Virtual Trade Types
export type UserRole = 'user' | 'admin';

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface VirtualTrade {
  _id: string;
  strategy: Strategy;
  entryOrder: VirtualOrder;
  exitOrder?: VirtualOrder;
  status: 'OPEN' | 'CLOSED';
  pnl: number;
  netPnl?: number;
  charges?: Charges;
  entryTime: string;
  exitTime?: string;
  direction: 'LONG' | 'SHORT';
  exitReason?: 'SL' | 'TARGET' | 'SQUARE_OFF' | 'MANUAL' | 'AUTO';
}

export interface TradesSummary {
  totalTrades: number;
  openTrades: number;
  closedTrades?: number;
  totalPnL: number;
  winRate: number;
}

// Daily P&L Types
export interface DailyPnl {
  date: string; // ISO date string (YYYY-MM-DD)
  pnl: number;
  netPnl?: number;
  charges?: number;
  tradeCount?: number;
  trades?: number; // BE might send 'trades' instead of 'tradeCount'
  winCount?: number;
  lossCount?: number;
}

export interface DailyPnlSummary {
  totalPnl: number;
  totalNetPnl?: number;
  totalCharges?: number;
  totalTrades: number;
  winningDays: number;
  losingDays: number;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number } | null;
  bestDayNet?: { date: string; pnl: number } | null;
  worstDayNet?: { date: string; pnl: number } | null;
  // Day-wise drawdown
  maxDrawdown?: number;
  currentDrawdown?: number;
  maxDrawdownNet?: number;
  currentDrawdownNet?: number;
  // Trade-wise drawdown (for trades/orders pages)
  maxDrawdownTrade?: number;
  currentDrawdownTrade?: number;
  maxDrawdownTradeNet?: number;
  currentDrawdownTradeNet?: number;
  // Minimum capital required
  minCapitalRequired?: number;
  minCapitalRequiredNet?: number;
  maxTradeValue?: number;
}

export interface OrdersSummary {
  totalOrders: number;
  buyOrders: number;
  sellOrders: number;
  totalPnL: number;
}

// Virtual Order Types
export interface VirtualOrder {
  _id: string;
  strategy: Strategy | string;
  orderId: string;
  correlationId: string;
  transactionType: 'BUY' | 'SELL';
  exchangeSegment: string;
  tradeMode: string;
  orderType: string;
  securityId: string;
  strike?: number; // Only for OPTIONS
  side?: 'CE' | 'PE'; // Only for OPTIONS
  expiryDate?: string; // Only for OPTIONS
  qty: number;
  price: number;
  spotPriceAtEntry?: number;
  target?: number;
  sl?: number;
  trailingJump?: number;
  status: 'PENDING' | 'TRADED' | 'CANCELLED' | 'REJECTED';
  pnl: number;
  netPnl?: number;
  charges?: Charges;
  entryTime: string;
  exitTime?: string;
  isIlliquid?: boolean;
}

// Strategy Types
export interface Strategy {
  _id: string;
  name: string;
  alert: Alert | string;
  isEnabled: boolean;
  liveEnabled: boolean;
  liveTestMode: boolean;
  liveOrderType: 'MARKET' | 'LIMIT';
  instrument: string;
  instrumentType: 'SPOT' | 'FUTURES' | 'OPTIONS';
  tradeMode: 'INTRADAY' | 'DELIVERY';
  optionAction: 'BUY' | 'SELL';
  contractType: 'WEEKLY' | 'MONTHLY';
  optionType: 'ATM' | 'ITM' | 'OTM';
  strikeDistance: number;
  quantity: number;
  stopLoss?: {
    type: 'points' | '%';
    value: number;
  };
  slType?: 'STATIC' | 'CANDLE';
  slBuffer?: {
    type: 'points' | '%';
    value: number;
  };
  targetProfit?: {
    type: 'points' | '%';
    value: number;
  };
  trailingSl?: {
    enabled: boolean;
    value?: number;
  };
  dailyLossLimit: number;
  dailyProfitLimit: number;
  tradingStartTime: string;
  tradingEndTime: string;
  maxOpenTrades: number;
  createdAt: string;
}

// Alert Types
export interface Alert {
  _id: string;
  name: string;
  symbol: string;
  exchange: string;
  timeframe: number;
  isEnabled: boolean;
  createdAt: string;
}

// Live Alert Stream
export interface AlertStreamEvent {
  type: 'alert';
  indicatorName: string;
  symbol: string;
  action: string;
  side: string;
  timeframe: number;
  entryPrice: number;
  sl?: number;
  strike?: number;
  ts: number;
}

// API Response Types
export interface ApiResponse<T, S = undefined> {
  status: 'ok' | 'error';
  message: string;
  data: T;
  pagination?: Pagination;
  summary?: S;
  dailyPnl?: DailyPnl[];
  dailyPnlSummary?: DailyPnlSummary;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Query Params
export interface TradesQueryParams {
  alert?: string;
  strategy?: string;
  status?: string;
  strategyName?: string;
  symbol?: string;
  timeframe?: string;
  exitReason?: string;
  tradeMode?: string;
  instrumentType?: string;
  optionType?: string;
  assetClass?: string;
  dhanInstrumentType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  includeDailyPnl?: boolean;
}

export interface OrdersQueryParams {
  alert?: string;
  strategy?: string;
  strategyName?: string;
  symbol?: string;
  timeframe?: string;
  status?: string;
  transactionType?: string;
  side?: string;
  instrumentType?: string;
  optionType?: string;
  assetClass?: string;
  dhanInstrumentType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  includeDailyPnl?: boolean;
}

export interface AlertsQueryParams {
  isEnabled?: string;
  symbol?: string;
  page?: number;
  limit?: number;
}

export interface StrategiesQueryParams {
  alert?: string;
  timeframe?: number;
  isEnabled?: string;
  liveEnabled?: string;
  page?: number;
  limit?: number;
}

export interface StrategiesSummary {
  totalStrategies: number;
  enabledStrategies: number;
  disabledStrategies: number;
  liveStrategies: number;
  virtualStrategies: number;
}

// Subscription Types
export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number;
  monthlyPrice?: number;
  annualPrice?: number;
  limits: {
    alerts: number;
    strategies: number;
    historyDays: number;
    liveTrading: boolean;
  };
}

export type BillingCycle = 'monthly' | 'annual';

export interface SubscriptionDetails {
  plan: SubscriptionPlan;
  status: string;
  startedAt: string;
  expiresAt: string;
}

export interface SubscriptionUsage {
  current: number;
  limit: number;
}

export interface Subscription {
  subscription: SubscriptionDetails | null;
  plan: SubscriptionPlan;
  isExpired: boolean;
  usage: {
    alerts: SubscriptionUsage;
    strategies: SubscriptionUsage;
  };
  features: {
    liveTrading: boolean;
    historyDays: number;
  };
}

export interface PaymentHistory {
  _id: string;
  user: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  paymentStatus: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  orderId: string;
  subscriptionId: string;
  keyId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  plan: SubscriptionPlan;
  billingCycle?: BillingCycle;
  durationMonths?: number;
  user: {
    email: string;
    name: string;
  };
}

export interface VerifyPaymentPayload {
  subscriptionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

// Share Feature Types
export type SharePermission = 'view_trades' | 'view_strategies' | 'view_alerts';
export type ShareExpiry = 0 | 7 | 15 | 30 | 60 | 90 | 365;
export type ShareType = 'link' | 'invite';

export type SharePageType = 'trades' | 'orders' | 'strategies' | 'alerts' | 'all';

export interface ShareFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  strategyId?: string;
  symbol?: string;
  [key: string]: string | undefined;
}

export interface ShareLink {
  id: string;
  token: string;
  shareUrl?: string;
  name: string;
  type: ShareType;
  pageType: SharePageType;
  filters?: ShareFilters | null;
  invitedEmail?: string;
  invitedUserName?: string;
  permissions?: SharePermission[]; // Only for invites
  expiresAt: string | null;
  isActive: boolean;
  viewCount?: number;
  lastViewedAt?: string;
  createdAt: string;
}

export interface SharedWithMe {
  id: string;
  token: string;
  ownerName: string;
  ownerEmail: string;
  ownerAvatar?: string;
  name: string;
  pageType: SharePageType;
  filters?: ShareFilters | null;
  permissions?: SharePermission[];
  expiresAt: string | null;
  createdAt: string;
}

export interface ShareViewSummary {
  ownerName: string;
  ownerAvatar?: string;
  shareName: string;
  pageType: SharePageType;
  filters?: ShareFilters | null;
  permissions?: SharePermission[];
  pnlSummary?: {
    totalTrades: number;
    totalPnl: number;
    totalNetPnl: number;
    winRate: number;
  };
  recentTrades?: VirtualTrade[];
  dailyPnl?: DailyPnl[];
}

export interface CreateShareLinkPayload {
  name?: string;
  pageType: SharePageType;
  filters?: ShareFilters | null;
  expiresIn: ShareExpiry;
}

export interface CreateShareInvitePayload {
  email: string;
  name?: string;
  pageType: SharePageType;
  filters?: ShareFilters | null;
  permissions: SharePermission[];
  expiresIn?: ShareExpiry;
}

export interface UpdateSharePayload {
  name?: string;
  pageType?: SharePageType;
  filters?: ShareFilters | null;
  permissions?: SharePermission[];
  isActive?: boolean;
  expiresIn?: ShareExpiry;
}

