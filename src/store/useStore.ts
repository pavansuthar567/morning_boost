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

export interface ProductBenefit {
  title: string;
  description: string;
}

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  qtyPerBottle: number;
  unit: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  ingredients?: string[];
  benefits?: string[];
  detailedBenefits?: ProductBenefit[];
  recipe?: RecipeItem[];
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
  user?: { name: string; phone: string; avatar?: string };
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
  isLiveMode: boolean;
  setIsLiveMode: (live: boolean) => void;

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
      isLiveMode: false,
      setIsLiveMode: (live) => set({ isLiveMode: live }),

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
        if (!get().isLiveMode) {
          set({ products: get().adminData.inventory, isBackendConnected: false });
          return;
        }

        try {
          const res = await fetch(`${API_URL}/products`);
          const data = await res.json();
          if (data.success && data.products?.length > 0) {
            set({ products: data.products, isBackendConnected: true });
          }
        } catch {
          set({ isBackendConnected: false, products: get().adminData.inventory });
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
        if (!get().isLiveMode) {
          const mockSub: Subscription = {
            _id: `sub_mock_${Date.now()}`,
            schedule: schedule.map((s: any) => ({
               dayOfWeek: s.dayOfWeek,
               product: s.productId,
               isPaused: false
            })),
            status: 'active',
            deliveryAddress: deliveryAddress,
            timeSlot: '7:00 - 8:00 AM'
          };
          set({ subscription: mockSub });
          return;
        }

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
        subscribers: [
          {
            _id: 'sub_1', name: 'Alex Johnson', email: 'alex.j@icloud.com', phone: '9876543210',
            role: 'user', isActive: true, initials: 'AJ', avatarBg: 'bg-orange-100', avatarColor: 'text-vibrant-orange',
            plan: 'Daily Vitality Pro', planBg: 'bg-primary/10', planColor: 'text-vibrant-orange',
            preferences: ['bg-orange-400', 'bg-green-400', 'bg-red-400'], nextRenewal: 'Nov 24, 2024'
          },
          {
            _id: 'sub_2', name: 'Sofia Miller', email: 'sofia@design.co', phone: '9123456780',
            role: 'user', isActive: true, initials: 'SM', avatarBg: 'bg-green-100', avatarColor: 'text-green-600',
            plan: 'Weekend Refresh', planBg: 'bg-secondary-container/50', planColor: 'text-on-secondary-container',
            preferences: ['bg-green-400', 'bg-yellow-400'], nextRenewal: 'Nov 28, 2024'
          },
        ],
        inventory: [
          {
            _id: 'prod_1', name: 'Green Vitality', price: 85, category: 'Immunity', isActive: true, stock: 142, stockLevel: 'ok',
            description: 'A powerful blend of alkalizing greens and roots, designed to flush toxins and rebuild cellular strength.',
            ingredients: ['Kale', 'Spinach', 'Green Apple', 'Lemon', 'Ginger'],
            benefits: ['🌿 Anti-Inflammatory', '🛡️ Cellular Defense', '🧬 Gut Health'],
            detailedBenefits: [
              { title: 'Anti-Inflammatory Power', description: 'Ginger and leafy greens work synergistically to reduce systemic inflammation and soothe digestion.' },
              { title: 'Cellular Defense', description: 'High in Vitamin C from lemon and green apple, fortifying your immune system against daily stressors.' },
              { title: 'Gut Health', description: 'Rich in soluble fiber which acts as a prebiotic, nourishing your microbiome for better nutrient absorption.' },
            ],
            recipe: [
              { ingredientId: 'ing_1', ingredientName: 'Kale', qtyPerBottle: 0.3, unit: 'kg' },
              { ingredientId: 'ing_2', ingredientName: 'Spinach', qtyPerBottle: 0.2, unit: 'kg' },
              { ingredientId: 'ing_3', ingredientName: 'Green Apple', qtyPerBottle: 0.25, unit: 'kg' },
              { ingredientId: 'ing_4', ingredientName: 'Lemon', qtyPerBottle: 1, unit: 'pcs' },
              { ingredientId: 'ing_5', ingredientName: 'Ginger', qtyPerBottle: 25, unit: 'gm' },
            ],
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1QuAZLQgXCBHxy0BcEKhRglzerfWWC-1vPn7NXZciyOqV_MZgInCEWjivoDmzw_XLtny0YeXfJoFb7zrHBi3BTX-8QVbJRBdjeAPbKJnhIZLPQXlrJ4kUlrFihd_qCx4lbucJ6uXSk0tXYwFuQb2-gr_4zjfE1XZ-0Bf5AoVu12NBnleBwT9AbcdsNO2bzPcNzX8rEN4tdP6e14o9wZrdNAnKYZPERcoTEOnO32z3afdKSme0XJXKoEMDo-gB7Byc5EnnQIwmZwc',
          },
          {
            _id: 'prod_2', name: 'Citrus Glow', price: 79, category: 'Energy', isActive: true, stock: 24, stockLevel: 'low',
            description: 'A vibrant, metabolism-boosting citrus blend packed with vitamin C and anti-inflammatory turmeric.',
            ingredients: ['Orange', 'Grapefruit', 'Turmeric', 'Cayenne'],
            benefits: ['✨ Skin Radiance', '⚡ Natural Energy', '💊 High Vitamin C'],
            detailedBenefits: [
              { title: 'Skin Radiance', description: 'Massive doses of Vitamin C promote collagen production, leading to glowing, elastic skin.' },
              { title: 'Natural Energy', description: 'Natural sugars from citrus combined with the metabolic kick of cayenne provide sustained, clean energy.' },
              { title: 'Immune Boost', description: 'Turmeric and grapefruit offer a dual-action defense mechanism against pathogens and free radicals.' },
            ],
            recipe: [
              { ingredientId: 'ing_6', ingredientName: 'Orange', qtyPerBottle: 0.5, unit: 'kg' },
              { ingredientId: 'ing_7', ingredientName: 'Grapefruit', qtyPerBottle: 0.25, unit: 'kg' },
              { ingredientId: 'ing_8', ingredientName: 'Turmeric', qtyPerBottle: 20, unit: 'gm' },
              { ingredientId: 'ing_9', ingredientName: 'Cayenne', qtyPerBottle: 5, unit: 'gm' },
            ],
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbA9CAicGuI3_qnblBkoS5JUaLGJiLMkMgWW-UhG8AGeY2G4HAMMHz2LmIpvAX8BD2ZC0GqHCeI0iY5ostmkp69mQheBa86_T9N-QhcOXWjJfkZblGf7Xk0L3yIPlpqysdbQIXRcR3g6GPrg7JlWwAHm-wR9AoJOCCirdtxNpCLmHdH20oQ6n2njZ0YxCLDAk1_zkwHS5VKKAzyxxFvxwAfoqCPI5jgkulkKw6ePnVabZrU_A5T1CQ9jRnJXF0Dq27zR1n7e3oPdU',
          },
          {
            _id: 'prod_3', name: 'Beet Rooted', price: 90, category: 'Detox', isActive: true, stock: 88, stockLevel: 'ok',
            description: 'An earthy, stamina-building root blend that improves blood flow and delivers rapid hydration.',
            ingredients: ['Beetroot', 'Blueberry', 'Apple', 'Mint'],
            benefits: ['🩸 Iron Rich', '🏃‍♂️ Stamina Boost', '💧 Cellular Hydration'],
            detailedBenefits: [
              { title: 'Iron Rich & Blood Flow', description: 'Beetroot is famous for increasing nitric oxide in the blood, relaxing blood vessels and improving circulation.' },
              { title: 'Stamina Boost', description: 'The unique natural nitrates provide a measurable increase in physical endurance and oxygen utilization.' },
              { title: 'Antioxidant Load', description: 'Blueberries add a massive dose of anthocyanins, fighting oxidative stress and cellular aging.' },
            ],
            recipe: [
              { ingredientId: 'ing_10', ingredientName: 'Beetroot', qtyPerBottle: 0.5, unit: 'kg' },
              { ingredientId: 'ing_11', ingredientName: 'Blueberry', qtyPerBottle: 100, unit: 'gm' },
              { ingredientId: 'ing_3', ingredientName: 'Apple', qtyPerBottle: 0.3, unit: 'kg' },
              { ingredientId: 'ing_12', ingredientName: 'Mint', qtyPerBottle: 1, unit: 'bunch' },
            ],
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIrfiBzFWaXV4otHis8tCw4zQvYiuhbSV-LBjN1kSlQTzUDlDFg4gW1vjSDrpxjNh_YAIgmwhL0skxCoTSyL5OFVN3as4AR_fFgJoWIHnBgC6WfJmRkgVGEnpBIfabjNRsPPVQ2qMrBM2dMcfJ_JsS2_kkT9FOQ_Kv8lAG6KcGMHgljGIoUuqyineCTxBz-1fX8JtkmvScLUQt9ha9RmprJbTCrMCZQpO8SvsRnT7dnU5Y_KAbefSPmtlhYqohE1lWjUmpnjvasf8',
          },
        ],
        allOrders: [
          {
            _id: 'ord_1', user: { name: 'Sarah Jenkins', phone: '9900112233', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZlOiPfUUaPcxaPfkqxhbbeQheAZii9NymCCZEc-4NcgsLxLjyeEeb0VitHyAV46hO03wr2mCf4s5ajqZ41qiIwmrdKwUmYoYqPufAFtyZX7Fej06FGgBHfqhJYXwkvZLusJqRw1jI7pL2WHqo0NZfBt5PexlAOgkpuoTuFMBsGSRqfQXBpz5qyG_c8Gj9DoxIp0Sn1H3GqFP9_Y-ZgxLsTaNA2HHHif5e6OreQSKD8LCtwq6gND00FsbjzVhT1FUcFseLId0pDGU' },
            items: [{ product: { name: '3x Green Vitality, 2x Citrus Glow' }, quantity: 5, price: 85 }],
            deliveryDate: new Date().toISOString(), status: 'delivered', paymentStatus: 'paid',
            totalAmount: 255, deliveryAddress: 'Downtown B-12'
          },
          {
            _id: 'ord_2', user: { name: 'Marcus Chen', phone: '9988776655', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_qAv5HZPACLIluzoUao6Qp-UUN9J-U5yr75uC2Lf_UFhuVSfPOx0m0MR5hEbOKZRNauwzgZjtccwCpmcqProRgrpM801CJwB5wUKOtrR14kmoa4Uv170agORUvWOMayx4k2C3wXzLxQUyNJd8t-mSOBtDNEEoZ7lOmxqOyM866nPfw8qJ13S3RfkXV_IuavjoObWuo--fRtGvJ5CF6irTTHFDSijVkxH73xhQEZAsfc09W9XXFTt3rqJ5eb1OJFuXREwWWuqXl1c' },
            items: [{ product: { name: '5x Morning Detox Pack' }, quantity: 5, price: 90 }],
            deliveryDate: new Date().toISOString(), status: 'out_for_delivery', paymentStatus: 'paid',
            totalAmount: 450, deliveryAddress: 'West Side A-04'
          },
          {
            _id: 'ord_3', user: { name: 'Elena Rodriguez', phone: '9876501234', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJF3WnR0KgzK2-c6uk_kWLWgsOEBzPhukZifn9PA-aHURcVQO0DMu1AeMFPb_sLClQBo9_wDqS7k5e21_Wk-q3I6seLKLg-UYD-SsF9myaRHUxPzIK0w7HaW5PSDelD0A0LFFtPjErXuA9ZrBNLLZRYvdFxnVUFpspGX4tf_tUf123YARyHlFmALLgrJfE122JUqf811wV7ASGHgV6vm7HDD5ojXNozfrM5ZL3gHyy4I7s7yC2v7BGedJujVC6u-KGqP8K14vzFWs' },
            items: [{ product: { name: 'Weekly Renewal Plan' }, quantity: 1, price: 500 }],
            deliveryDate: new Date().toISOString(), status: 'pending', paymentStatus: 'paid',
            totalAmount: 500, deliveryAddress: 'North Hills C-09'
          },
        ],
        procurement: [],
        recipes: [],
        stats: {
          activeRhythms: 18,
          todayDemand: 22,
          walletLiability: 4850,
          realizedRevenue: 12600,
          totalDeposits: 17450,
          pauseRate: 11,
          pausedUsers: 2,
          pressingList: [
            { name: 'Green Vitality', qty: 8, price: 85 },
            { name: 'Citrus Glow', qty: 6, price: 79 },
            { name: 'Beet Rooted', qty: 5, price: 90 },
            { name: 'Tropical Sunrise', qty: 3, price: 95 },
          ],
          deliverySnapshot: {
            totalDrops: 22,
            zones: [
              { name: 'Downtown', drops: 9 },
              { name: 'West Side', drops: 7 },
              { name: 'North Hills', drops: 6 },
            ]
          }
        },
      },

      fetchAdminData: async (type) => {
        const { token, isLiveMode } = get();
        if (!token || !isLiveMode) return;
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
            // Check again if live mode has changed while fetching
            if(!get().isLiveMode) return;

            set((state) => ({
              adminData: {
                ...state.adminData,
                // Only replace if the API actually returned an array/data, otherwise keep existing dummy data
                ...(type === 'subscribers' && data.subscribers?.length > 0 ? { subscribers: data.subscribers } : {}),
                ...(type === 'inventory' && data.ingredients?.length > 0 ? { inventory: data.ingredients } : {}),
                ...(type === 'orders' && data.orders?.length > 0 ? { allOrders: data.orders } : {}),
                ...(type === 'stats' && data.stats ? { stats: data.stats } : {}),
                ...(type === 'procurement' ? { procurement: data.ingredients || [] } : {}),
                ...(type === 'recipes' && data.recipes?.length > 0 ? { recipes: data.recipes } : {}),
              },
              isBackendConnected: true
            }));
          }
        } catch {
          // API failed — keep default dummy data, don't overwrite
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
        if (!get().isLiveMode) {
          return { id: `order_mock_${Date.now()}`, amount: amount * 100, currency: 'INR' };
        }
        return await walletService.createTopupOrder(amount);
      },

      verifyTopUp: async (paymentData) => {
        if (!get().isLiveMode) {
          // Mock successful verification
          return;
        }
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
