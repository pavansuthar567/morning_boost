import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { juiceService } from '@/services/juiceService';
import { walletService } from '@/services/walletService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// ---------- Types ----------
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin' | 'delivery';
  addresses?: any[];
}

export interface WalletState {
  balance: number;
  bonusBalance: number;
  transactions: any[];
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  isActive: boolean;
}

export interface ScheduleDay {
  dayOfWeek: number;
  product: Product | string;
  isPaused: boolean;
}

export interface Subscription {
  _id: string;
  schedule: ScheduleDay[];
  deliveryAddress: string;
  timeSlot: string;
  status: 'active' | 'paused' | 'paused_balance' | 'cancelled';
}

export interface Order {
  _id: string;
  user?: { name: string; phone: string };
  items: { product: any; quantity: number; price: number }[];
  deliveryDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  deliveryAddress: string;
  driver?: any;
}

// ---------- Store ----------
interface AppStore {
  // Connection State
  isBackendConnected: boolean;
  setIsBackendConnected: (connected: boolean) => void;

  // Auth
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: { email?: string; phone?: string; password?: string; otp?: string }) => Promise<void>;
  loginWithPhone: (phone: string, otp: string) => Promise<void>;
  register: (data: { name: string; email?: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;

  // Wallet
  wallet: WalletState;
  fetchWallet: () => Promise<void>;

  // Products (catalog)
  products: Product[];
  fetchProducts: () => Promise<void>;

  // Subscriptions
  subscription: Subscription | null;
  subscriptions: any[];
  fetchSubscriptions: () => Promise<void>;
  createSubscription: (schedule: { dayOfWeek: number; productId: string }[], deliveryAddress: string) => Promise<void>;
  swapJuice: (subId: string, dayOfWeek: number, productId: string) => Promise<void>;
  pauseDay: (subId: string, dayOfWeek: number) => Promise<void>;
  resumeDay: (subId: string, dayOfWeek: number) => Promise<void>;
  pauseSubscription: (subId: string) => Promise<void>;
  resumeSubscription: (subId: string) => Promise<void>;
  cancelSubscription: (subId: string) => Promise<void>;

  // Orders
  orders: any[];
  fetchOrders: () => Promise<void>;

  // Admin Data
  adminData: {
    subscribers: any[];
    inventory: any[];
    allOrders: Order[];
    procurement: any[];
    recipes: any[];
    stats: any;
  };
  fetchAdminData: (type: 'subscribers' | 'inventory' | 'orders' | 'stats' | 'procurement' | 'recipes') => Promise<void>;

  // Driver
  driverOrders: Order[];
  fetchDriverOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;

  // Testimonials
  testimonials: {
    name: string;
    role: string;
    content: string;
    img?: string;
    initials?: string;
  }[];

  // Checkout & Wallet
  checkoutData: {
    schedule?: { dayOfWeek: number; productId: string; productName: string; price: number }[];
    weeklyTotal?: number;
    deliveryAddress?: string;
    amount: number;
    bonus: number;
    packName: string;
  } | null;
  setCheckoutData: (data: any) => void;
  createTopUpOrder: (amount: number) => Promise<any>;
  verifyTopUp: (paymentData: any) => Promise<void>;

  // Admin CRUD
  saveProduct: (id: string | null, data: any) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<void>;
  saveIngredient: (id: string | null, data: any) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  saveRecipe: (id: string | null, data: any) => Promise<void>;

  // Addresses
  addAddress: (data: any) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;

  isAuthenticated: boolean;
  // Dev
  bypassLogin: (role?: 'user' | 'admin') => void;
}

const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ---- Connection State ----
      isBackendConnected: false,
      setIsBackendConnected: (connected) => set({ isBackendConnected: connected }),

      // ---- Testimonials Data ----
      testimonials: [
        {
          name: "Sarah Jenkins",
          role: "Creative Director, NYC",
          content: "The energy boost is immediate and sustained. I've replaced my morning coffee entirely and never felt better. The delivery is like clockwork.",
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZDHrcCbUtPS2-ZuWxnYWycMXSLSwwsC6B7A1bSoc90qDKn2kFIMaFux_IlrWzHa-vNwGjcCk4sqVGjE38azonwKRsNelvosMDLA21XvQakjk3lUT0XlVrziU84v-o3aGSUMwWzNq3y55WlH6gexXG1UPuD_hn1B5F4LNArQWOoEWQmFlLlxNGb5yBX1MILF5Jm2DMS3GHVgUqyxhM5R8Mg4kaEPj_3PJNZcUNICP_XIzqdH-wa6LhQ82aXHB089gOdFwJAS3ENQw"
        },
        {
          name: "Marcus Thorne",
          role: "Professional Athlete",
          content: "Morning Fresh has completely simplified my detox routine. The quality of ingredients is clearly superior to anything I can find in stores.",
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-mCjNH0e2o0F5D7Q0Y9E6diamONdZG8GnEqMyf6hznzbOIphuq0hojFQ7OB-e_j1aJ3Dj0MgGQ_E4nPtcvOgozNtsLwK2Pedo9K26oeBeoloxAjNnUYELsYLokvqkNLoNynX9un8Bw-dTctY_enO2CZCIQxCNhDUY2zL4nu4WKzcqnzdVygLad4Mdms5W-i6gu5JHgo3CA8SHj6Ts_yIUz4BxvpBpi4NF0e_R515eh-GhxjjMFHtSk_CygEQOvHZ6q8tjbrLk8Z8"
        },
        {
          name: "Elena Rostova",
          role: "Venture Capitalist",
          content: "I travel often and adjusting my subscription plan on the fly is incredibly easy. The juices always arrive perfectly chilled and tasting amazing.",
          initials: "ER"
        },
        {
          name: "James Lin",
          role: "Software Engineer",
          content: "Finally a juice subscription that actually delivers on its promises. No leaking bottles, no late deliveries, just pure premium wellness.",
          initials: "JL"
        }
      ],

      // ---- Auth State ----
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (payload) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error);
          set({
            user: data.user,
            token: data.tokens.accessToken,
            isAuthenticated: true,
            isLoading: false,
            isBackendConnected: true,
            wallet: data.wallet || { balance: 0, bonusBalance: 0, transactions: [] },
          });
          // Store tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.tokens.accessToken);
            localStorage.setItem('refreshToken', data.tokens.refreshToken);
          }
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      loginWithPhone: async (phone, otp) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error);
          set({
            user: data.user,
            token: data.tokens.accessToken,
            isAuthenticated: true,
            isLoading: false,
            isBackendConnected: true,
            wallet: data.wallet || { balance: 0, bonusBalance: 0, transactions: [] },
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.tokens.accessToken);
            localStorage.setItem('refreshToken', data.tokens.refreshToken);
          }
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error);
          set({
            user: data.user,
            token: data.tokens.accessToken,
            isAuthenticated: true,
            isLoading: false,
            isBackendConnected: true,
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.tokens.accessToken);
            localStorage.setItem('refreshToken', data.tokens.refreshToken);
          }
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          wallet: { balance: 0, bonusBalance: 0, transactions: [] },
          orders: [],
          subscriptions: [],
          subscription: null,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            set({
              user: data.user,
              wallet: data.wallet || { balance: 0, bonusBalance: 0, transactions: [] },
              subscription: data.subscription || null,
              isBackendConnected: true
            });
          }
        } catch {
          set({ isBackendConnected: false });
        }
      },

      // ---- Wallet State ----
      wallet: { balance: 0, bonusBalance: 0, transactions: [] },

      fetchWallet: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/wallet`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) set({ wallet: data.wallet, isBackendConnected: true });
        } catch {
          set({ isBackendConnected: false });
        }
      },

      // ---- Products ----
      products: [],

      fetchProducts: async () => {
        try {
          const res = await fetch(`${API_URL}/products`);
          const data = await res.json();
          if (data.success && data.products?.length > 0) {
            set({ products: data.products, isBackendConnected: true });
          }
        } catch {
          set({ isBackendConnected: false });
        }
      },

      saveProduct: async (id, data) => {
        set({ isLoading: true });
        try {
          await juiceService.saveProduct(id, data);
          await get().fetchProducts();
          set({ isLoading: false });
          return true;
        } catch (e: any) {
          set({ isLoading: false });
          throw e;
        }
      },

      deleteProduct: async (id) => {
        set({ isLoading: true });
        try {
          await juiceService.deleteProduct(id);
          await get().fetchProducts();
          set({ isLoading: false });
        } catch (e: any) {
          set({ isLoading: false });
          throw e;
        }
      },

      saveIngredient: async (id, data) => {
        set({ isLoading: true });
        try {
          await juiceService.saveIngredient(id, data);
          await get().fetchAdminData('inventory');
          set({ isLoading: false });
        } catch (e: any) {
          set({ isLoading: false });
          throw e;
        }
      },

      deleteIngredient: async (id) => {
        set({ isLoading: true });
        try {
          await juiceService.deleteIngredient(id);
          await get().fetchAdminData('inventory');
          set({ isLoading: false });
        } catch (e: any) {
          set({ isLoading: false });
          throw e;
        }
      },

      saveRecipe: async (id, data) => {
        set({ isLoading: true });
        try {
          await juiceService.saveRecipe(id, data);
          await get().fetchAdminData('recipes');
          set({ isLoading: false });
        } catch (e: any) {
          set({ isLoading: false });
          throw e;
        }
      },

      // ---- Subscriptions ----
      subscription: null,
      subscriptions: [],

      fetchSubscriptions: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/subscriptions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            set({ subscriptions: data.subscriptions });
            // Set active subscription
            const active = data.subscriptions?.find((s: any) => ['active', 'paused', 'paused_balance'].includes(s.status));
            if (active) set({ subscription: active });
          }
        } catch (e) {
          console.error("Fetch subs failed", e);
        }
      },

      createSubscription: async (schedule, deliveryAddress) => {
        const { token } = get();
        if (!token) throw new Error('Not authenticated');
        set({ isLoading: true });
        try {
          const res = await fetch(`${API_URL}/subscriptions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ schedule, deliveryAddress }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error);
          set({ subscription: data.subscription, isLoading: false });
          await get().fetchSubscriptions();
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      swapJuice: async (subId, dayOfWeek, productId) => {
        const { token } = get();
        if (!token) return;
        const res = await fetch(`${API_URL}/subscriptions/${subId}/juice`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dayOfWeek, productId }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        set({ subscription: data.subscription });
      },

      pauseDay: async (subId, dayOfWeek) => {
        const { token } = get();
        if (!token) return;
        const res = await fetch(`${API_URL}/subscriptions/${subId}/pause`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'pause_day', dayOfWeek }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        set({ subscription: data.subscription });
      },

      resumeDay: async (subId, dayOfWeek) => {
        const { token } = get();
        if (!token) return;
        const res = await fetch(`${API_URL}/subscriptions/${subId}/pause`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'resume_day', dayOfWeek }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        set({ subscription: data.subscription });
      },

      pauseSubscription: async (subId) => {
        const { token } = get();
        if (!token) return;
        const res = await fetch(`${API_URL}/subscriptions/${subId}/pause`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'pause_all' }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        set({ subscription: data.subscription });
      },

      resumeSubscription: async (subId) => {
        const { token } = get();
        if (!token) return;
        const res = await fetch(`${API_URL}/subscriptions/${subId}/pause`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'resume_all' }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        set({ subscription: data.subscription });
      },

      cancelSubscription: async (subId) => {
        const { token } = get();
        if (!token) return;
        const res = await fetch(`${API_URL}/subscriptions/${subId}/pause`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'cancel' }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        set({ subscription: data.subscription });
      },

      // ---- Orders ----
      orders: [],

      fetchOrders: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) set({ orders: data.orders, isBackendConnected: true });
        } catch {
          set({ isBackendConnected: false });
        }
      },

      // ---- Admin Data ----
      adminData: {
        subscribers: [],
        inventory: [],
        allOrders: [],
        procurement: [],
        recipes: [],
        stats: null,
      },

      fetchAdminData: async (type) => {
        const { token } = get();
        if (!token) return;
        try {
          let endpoint = '';
          switch (type) {
            case 'subscribers': endpoint = '/auth/admin/users'; break;
            case 'inventory': endpoint = '/admin/ingredients'; break;
            case 'orders': endpoint = '/orders/admin/all'; break;
            case 'stats': endpoint = '/subscriptions/stats'; break;
            case 'procurement': endpoint = '/admin/procurement'; break;
            case 'recipes': endpoint = '/admin/recipes'; break;
          }

          const res = await fetch(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (data.success) {
            set((state) => ({
              adminData: {
                ...state.adminData,
                ...(type === 'subscribers' ? { subscribers: data.subscribers } : {}),
                ...(type === 'inventory' ? { inventory: data.ingredients } : {}),
                ...(type === 'orders' ? { allOrders: data.orders } : {}),
                ...(type === 'stats' ? { stats: data.stats } : {}),
                ...(type === 'procurement' ? { procurement: data.ingredients || [] } : {}),
                ...(type === 'recipes' ? { recipes: data.recipes } : {}),
              },
              isBackendConnected: true
            }));
          }
        } catch {
          set({ isBackendConnected: false });
        }
      },

      // ---- Driver Actions ----
      driverOrders: [],
      fetchDriverOrders: async () => {
        const { token, user } = get();
        if (!token || !user) return;
        try {
          const res = await fetch(`${API_URL}/orders/driver/runs`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) set({ driverOrders: data.orders });
        } catch (e) {
          console.error("Fetch driver orders failed", e);
        }
      },

      updateOrderStatus: async (orderId: string, status: string) => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status }),
          });
          const data = await res.json();
          if (data.success) {
            set((state) => ({
              driverOrders: state.driverOrders.map((o: Order) => o._id === orderId ? { ...o, status } : o),
              orders: state.orders.map((o: Order) => o._id === orderId ? { ...o, status } : o)
            }));
          }
        } catch (e) {
          console.error("Update status failed", e);
        }
      },

      // ---- Checkout & Wallet ----
      checkoutData: null,
      setCheckoutData: (data) => set({ checkoutData: data }),

      createTopUpOrder: async (amount) => {
        return await walletService.createTopupOrder(amount);
      },

      verifyTopUp: async (paymentData) => {
        const data = await walletService.verifyTopup(paymentData);
        if (!data.success) throw new Error(data.error);

        // Refresh wallet state after success
        await get().fetchWallet();
      },

      addAddress: async (data: any) => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/auth/address`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data),
          });
          const result = await res.json();
          if (result.success) {
            await get().fetchMe();
          } else {
            throw new Error(result.error);
          }
        } catch (e: any) {
          throw e;
        }
      },

      removeAddress: async (id: string) => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/auth/address/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`
            },
          });
          const result = await res.json();
          if (result.success) {
            await get().fetchMe();
          } else {
            throw new Error(result.error);
          }
        } catch (e: any) {
          throw e;
        }
      },

      bypassLogin: (role: 'user' | 'admin' = 'admin') => {
        const mockUser = {
          _id: 'mock_id_123',
          name: 'Dev Admin',
          phone: '9999999999',
          role: role,
          isActive: true,
          addresses: [{
            _id: 'addr_1',
            society: 'Dev Society',
            flatNo: '101',
            area: 'Localhost',
            pincode: '000000',
            isDefault: true
          }]
        };
        set({
          user: mockUser as any,
          token: 'mock_token_jwt',
          isAuthenticated: true
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', 'mock_token_jwt');
        }
      }
    }),
    {
      name: 'morning-juice-store',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useStore;
