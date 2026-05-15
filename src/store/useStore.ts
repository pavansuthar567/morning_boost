import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { juiceService } from '@/services/juiceService';
import { walletService } from '@/services/walletService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// ---------- Global 401 Interceptor ----------
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (response.status === 401) {
      // Clear storage and Zustand state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      useStore.getState().logout();
      // Only redirect if not already on login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return response;
  };
}

// ---------- Types ----------
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin' | 'delivery';
  avatar?: string;
  addresses?: any[];
}

export interface WalletState {
  balance: number;
  bonusBalance: number;
  transactions: any[];
}

export interface Supplier {
  _id: string;
  name: string;
  contactName?: string;
  phone?: string;
  isActive: boolean;
}

export interface RawMaterial {
  _id: string;
  name: string;
  unit: string;
  marketPrice: number;
  qtyAvailable: number;
  minStockLevel: number;
  supplier?: { _id: string; name: string } | string;
  isActive: boolean;
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
  recipeInstructions?: string[];
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
  dietaryPreferences?: string[];
  dietaryNote?: string;
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
  updateSubscription: (subId: string, schedule: { dayOfWeek: number; productId: string }[]) => Promise<void>;
  swapJuice: (subId: string, dayOfWeek: number, productId: string) => Promise<void>;
  pauseDay: (subId: string, dayOfWeek: number) => Promise<void>;
  resumeDay: (subId: string, dayOfWeek: number) => Promise<void>;
  pauseSubscription: (subId: string) => Promise<void>;
  resumeSubscription: (subId: string) => Promise<void>;
  cancelSubscription: (subId: string) => Promise<void>;

  // Orders
  orders: any[];
  fetchOrders: () => Promise<void>;

  // Surveys
  surveys: any[];
  fetchSurveys: () => Promise<void>;
  submitSurvey: (data: any) => Promise<void>;

  // Admin Data
  adminData: {
    subscribers: any[];
    inventory: any[];
    allOrders: Order[];
    procurement: any[];
    recipes: any[];
    rawMaterials: RawMaterial[];
    suppliers: Supplier[];
    stats: any;
  };
  fetchAdminData: (type: 'subscribers' | 'inventory' | 'orders' | 'stats' | 'procurement' | 'recipes' | 'overview') => Promise<void>;

  // Driver
  driverRun: any | null;
  fetchDriverRun: () => Promise<void>;
  markDropDelivered: (runId: string, subscriberId: string, overrideReason?: string) => Promise<void>;
  markDropPickedUp: (subscriberId: string) => void;
  startDeliveryRun: (runId: string) => Promise<void>;

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
    topUpAmount?: number;
    amount: number;
    bonus: number;
    packName: string;
  } | null;
  setCheckoutData: (data: any) => void;
  createTopUpOrder: (amount: number) => Promise<any>;
  verifyTopUp: (paymentData: any) => Promise<void>;

  // Admin CRUD
  adminSettings: any;
  fetchAdminSettings: () => Promise<void>;
  updateAdminSettings: (data: any) => Promise<void>;

  saveProduct: (id: string | null, data: any) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<void>;
  saveIngredient: (id: string | null, data: any) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  saveRecipe: (id: string | null, data: any) => Promise<void>;

  // Addresses
  addAddress: (data: any) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  updateDietaryPreferences: (preferences: string[]) => Promise<void>;

  isAuthenticated: boolean;
  // Dev
  bypassLogin: (role?: 'user' | 'admin' | 'delivery') => void;

  // Configuration & Constants
  config: {
    juiceOptions: string[];
    dietOptions: string[];
    areas: string[];
    societiesByArea: Record<string, string[]>;
  };

  // Demo Data (Mock)
  mockSubscribers: any[];
  mockRuns: any[];
  mockProcurement: any[];
  mockInventory: any[];
  mockPurchases: any[];
  mockDeliveryRuns: any[];
  mockSurveys: any[];
}

const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ---- Connection State ----
      isBackendConnected: false,
      setIsBackendConnected: (connected) => set({ isBackendConnected: connected }),
      isLiveMode: true,
      setIsLiveMode: (live) => set({ isLiveMode: live }),

      // ---- Config & Constants ----
      config: {
        juiceOptions: ['Green Vitality', 'Citrus Glow', 'Beet Rooted', 'Liquid Gold', 'Ruby Cleanse', 'Alkaline Green'],
        dietOptions: ['Vegan', 'No Ginger', 'No Sugar', 'Keto', 'Gluten-Free', 'No Dairy'],
        areas: ['Dindoli', 'Bhatar', 'Vesu', 'Althan'],
        societiesByArea: {
          'Dindoli': [
            'Shree ram bungalows', 'Prayosha star', 'Ambika Park Society', 'Tirupati Society',
            'Krishna Kunj Society', 'Sai Shiv Shakti Society', 'Prayosha Gold',
            'Rajdeep Row House Society', 'Radhika Homes', 'Lake City', 'Royal Star Township',
            'Mahadev Nagar', 'Ambika Heaven', 'Green Valley', 'Gruham Palace', 'Vraj Vihar Residency'
          ],
          'Bhatar': [
            'Turning Point Appartment', 'Sargam Shopping Area Residences', 'Mangal Park Society',
            'Ashirwad Palace', 'Uday Deep Tower', 'Madhuram Apartment'
          ],
          'Vesu': [
            'Happy Elegance', 'Happy Excellencia', 'Jolly Residency',
            'Green Valley', 'Sangini Evoq', 'Someshwara Enclave'
          ],
          'Althan': [
            'Raghuvir Saffron', 'Swastik Park Society', 'Aashirwad Residency', 'Spring Valley', 'Fortuna',
            'Rameshwaram Greens'
          ]
        }
      },

      // ---- Demo Data ----
      mockSubscribers: [
        {
          id: 'SUB-001', name: 'Sarah Jenkins', phone: '9900112233', email: 'sarah@gmail.com', balance: 1250, status: 'active', schedule: [{ day: 'Mon', juice: 'Green Vitality' }, { day: 'Tue', juice: 'Citrus Glow' }, { day: 'Wed', juice: 'Green Vitality' }, { day: 'Thu', juice: 'Citrus Glow' }, { day: 'Fri', juice: 'Green Vitality' }, { day: 'Sat', juice: 'Citrus Glow' }, { day: 'Sun', juice: 'Beet Rooted' }], joinedAt: 'Mar 15, 2026', ltv: 12000, address: 'Sun City Row House, B-12, Dindoli', dietaryPreferences: ['No Ginger'], dietaryNote: 'Mild allergy to raw ginger', transactions: [
            { type: 'deduction', amount: 150, description: 'Daily Juice Delivery', date: new Date(Date.now() - 86400000 * 1).toISOString(), eventType: 'wallet', scheduledJuice: 'Citrus Glow', deliveredJuice: 'Green Vitality' },
            { type: 'deduction', amount: 150, description: 'Daily Juice Delivery', date: new Date(Date.now() - 86400000 * 2).toISOString(), eventType: 'wallet', scheduledJuice: 'Green Vitality', deliveredJuice: 'Green Vitality' },
            { type: 'topup', amount: 2000, description: 'Added via UPI', date: new Date(Date.now() - 86400000 * 3).toISOString(), eventType: 'wallet' },
            { type: 'status_paused', description: 'Subscription status changed from active to paused', date: new Date(Date.now() - 86400000 * 4).toISOString(), eventType: 'activity' }
          ], initials: 'SJ', avatarBg: 'bg-orange-100', avatarColor: 'text-vibrant-orange'
        },
        { id: 'SUB-002', name: 'Marcus Chen', phone: '9988776655', email: 'marcus@work.co', balance: 450, status: 'active', schedule: [{ day: 'Mon', juice: 'Beet Rooted' }, { day: 'Tue', juice: 'Beet Rooted' }, { day: 'Wed', juice: 'Beet Rooted' }, { day: 'Thu', juice: 'Beet Rooted' }, { day: 'Fri', juice: 'Beet Rooted' }, { day: 'Sat', juice: 'Beet Rooted' }, { day: 'Sun', juice: 'Beet Rooted' }], joinedAt: 'Mar 22, 2026', ltv: 3500, address: 'Madhav Villa, A-04, Dindoli', dietaryPreferences: [], dietaryNote: '', transactions: [{ type: 'deduction', amount: 150, description: 'Daily Juice Delivery', date: new Date(Date.now() - 86400000 * 1).toISOString(), eventType: 'wallet', scheduledJuice: 'Beet Rooted', deliveredJuice: 'Beet Rooted' }], initials: 'MC', avatarBg: 'bg-green-100', avatarColor: 'text-green-600' },
        { id: 'SUB-003', name: 'Elena Rodriguez', phone: '9876501234', email: 'elena@design.io', balance: 0, status: 'paused', schedule: [{ day: 'Mon', juice: 'Green Vitality' }, { day: 'Tue', juice: 'Green Vitality' }, { day: 'Wed', juice: 'Green Vitality' }, { day: 'Thu', juice: 'Green Vitality' }, { day: 'Fri', juice: 'Green Vitality' }, { day: 'Sat', juice: 'Green Vitality' }, { day: 'Sun', juice: 'Green Vitality' }], joinedAt: 'Feb 10, 2026', ltv: 8500, address: 'Millenium Park, C-09, Dindoli', dietaryPreferences: ['Vegan'], dietaryNote: 'Strictly plant-based', transactions: [{ type: 'bonus', amount: 50, description: 'Empty Bottle Return', date: new Date(Date.now() - 86400000 * 5).toISOString(), eventType: 'wallet' }, { type: 'profile_updated', description: 'Admin updated subscriber profile and dietary preferences', date: new Date(Date.now() - 86400000 * 6).toISOString(), eventType: 'activity' }], initials: 'ER', avatarBg: 'bg-blue-100', avatarColor: 'text-blue-600' },
        { id: 'SUB-004', name: 'Sofia Miller', phone: '9123456780', email: 'sofia@design.co', balance: 3400, status: 'active', schedule: [{ day: 'Mon', juice: 'Citrus Glow' }, { day: 'Tue', juice: 'Beet Rooted' }, { day: 'Wed', juice: 'Citrus Glow' }, { day: 'Thu', juice: 'Beet Rooted' }, { day: 'Fri', juice: 'Citrus Glow' }, { day: 'Sat', juice: 'Beet Rooted' }, { day: 'Sun', juice: 'Green Vitality' }], joinedAt: 'Jan 5, 2026', ltv: 18000, address: 'Sun City Row House, D-11, Dindoli', dietaryPreferences: [], dietaryNote: '', transactions: [], initials: 'SM', avatarBg: 'bg-orange-100', avatarColor: 'text-vibrant-orange' },
        { id: 'SUB-005', name: 'James Lin', phone: '9871234560', email: 'jlin@software.co', balance: 85, status: 'paused_balance', schedule: [{ day: 'Mon', juice: 'Green Vitality' }, { day: 'Tue', juice: 'Green Vitality' }, { day: 'Wed', juice: 'Green Vitality' }, { day: 'Thu', juice: 'Green Vitality' }, { day: 'Fri', juice: 'Green Vitality' }, { day: 'Sat', juice: 'Green Vitality' }, { day: 'Sun', juice: 'Green Vitality' }], joinedAt: 'Apr 1, 2026', ltv: 1200, address: 'Millenium Park, E-22, Dindoli', dietaryPreferences: ['No Sugar'], dietaryNote: '', transactions: [{ type: 'deduction', amount: 150, description: 'Daily Juice Delivery', date: new Date(Date.now() - 86400000 * 2).toISOString(), eventType: 'wallet', scheduledJuice: 'Green Vitality', deliveredJuice: 'Green Vitality' }], initials: 'JL', avatarBg: 'bg-green-100', avatarColor: 'text-green-600' },
      ],
      mockRuns: [
        { id: 'RUN-001', driver: 'Rajesh Kumar', phone: '9876543210', zone: 'Sun City Row House', drops: [{ customer: 'Sarah Jenkins', address: 'B-12', juice: 'Green Vitality', status: 'delivered', time: '7:12 AM' }, { customer: 'Sofia Miller', address: 'D-11', juice: 'Citrus Glow', status: 'delivered', time: '7:24 AM' }], status: 'completed', startedAt: '6:45 AM' },
        { id: 'RUN-002', driver: 'Sunil Yadav', phone: '9988776655', zone: 'Madhav Villa', drops: [{ customer: 'Marcus Chen', address: 'A-04', juice: 'Beet Rooted', status: 'delivered', time: '7:05 AM' }], status: 'completed', startedAt: '6:50 AM' },
        { id: 'RUN-003', driver: 'Vikram Singh', phone: '9871234560', zone: 'Millenium Park', drops: [{ customer: 'Elena Rodriguez', address: 'C-09', juice: 'Green Vitality', status: 'pending', time: '—' }], status: 'pending', startedAt: '—' }
      ],
      mockProcurement: [
        { ingredient: 'Kale', unit: 'kg', qtyNeeded: 2.4, pricePerUnit: 60, forProduct: 'Green Vitality', bottles: 8, currentStock: 1.5 },
        { ingredient: 'Spinach', unit: 'kg', qtyNeeded: 1.6, pricePerUnit: 40, forProduct: 'Green Vitality', bottles: 8, currentStock: 0.5 },
        { ingredient: 'Green Apple', unit: 'kg', qtyNeeded: 2.0, pricePerUnit: 120, forProduct: 'Green Vitality', bottles: 8, currentStock: 0 },
        { ingredient: 'Lemon', unit: 'pcs', qtyNeeded: 8, pricePerUnit: 5, forProduct: 'Green Vitality', bottles: 8, currentStock: 2 },
        { ingredient: 'Ginger', unit: 'gm', qtyNeeded: 200, pricePerUnit: 0.3, forProduct: 'Green Vitality', bottles: 8, currentStock: 50 },
        { ingredient: 'Orange', unit: 'kg', qtyNeeded: 3.0, pricePerUnit: 80, forProduct: 'Citrus Glow', bottles: 6, currentStock: 1.0 },
        { ingredient: 'Grapefruit', unit: 'kg', qtyNeeded: 1.5, pricePerUnit: 150, forProduct: 'Citrus Glow', bottles: 6, currentStock: 0.5 },
        { ingredient: 'Turmeric', unit: 'gm', qtyNeeded: 120, pricePerUnit: 0.4, forProduct: 'Citrus Glow', bottles: 6, currentStock: 500 },
        { ingredient: 'Beetroot', unit: 'kg', qtyNeeded: 2.5, pricePerUnit: 40, forProduct: 'Beet Rooted', bottles: 5, currentStock: 5.0 },
        { ingredient: 'Blueberry', unit: 'gm', qtyNeeded: 500, pricePerUnit: 1.2, forProduct: 'Beet Rooted', bottles: 5, currentStock: 100 },
        { ingredient: 'Apple', unit: 'kg', qtyNeeded: 1.5, pricePerUnit: 120, forProduct: 'Beet Rooted', bottles: 5, currentStock: 0 },
        { ingredient: 'Mint', unit: 'bunch', qtyNeeded: 5, pricePerUnit: 10, forProduct: 'Beet Rooted', bottles: 5, currentStock: 2 }
      ],
      mockInventory: [
        { id: 'INV-001', item: 'Fresh Spinach', category: 'Vegetables', currentStock: '12 kg', minLevel: '15 kg', status: 'low' },
        { id: 'INV-002', item: 'Organic Apples', category: 'Fruits', currentStock: '85 kg', minLevel: '40 kg', status: 'optimal' },
        { id: 'INV-003', item: 'Glass Bottles (500ml)', category: 'Packaging', currentStock: '450 units', minLevel: '200 units', status: 'optimal' },
        { id: 'INV-004', item: 'Raw Ginger', category: 'Vegetables', currentStock: '2 kg', minLevel: '5 kg', status: 'critical' }
      ],
      mockPurchases: [
        { _id: 'mock_1', invoiceNumber: 'INV-001', supplier: 'Local Greens Co.', date: new Date().toISOString(), totalAmount: 450, paymentStatus: 'paid', documentUrl: '/dummy', items: [{ ingredientId: { name: 'Kale', unit: 'kg' }, quantity: 5, pricePaid: 300 }] }
      ],
      mockDeliveryRuns: [
        {
          _id: 'DR-001',
          date: new Date().toISOString(),
          status: 'pending',
          drops: [
            { subscriberId: 'SUB-001', subscriberName: 'Sarah Jenkins', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sarah+Jenkins', phone: '9900112233', society: 'Sun City Row House', flatNo: 'B-12', area: 'Dindoli', scheduledJuice: 'Green Vitality', deliveredJuice: null, status: 'pending', deliveredAt: null, notes: 'Mild allergy to raw ginger. Use less ginger.', dropToken: 'GV-0001', dropIndex: 1, manualOverrideReason: null },
            { subscriberId: 'SUB-006', subscriberName: 'Aarav Sharma', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aarav+Sharma', phone: '9900112244', society: 'Sun City Row House', flatNo: 'A-03', area: 'Dindoli', scheduledJuice: 'Green Vitality', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'GV-0002', dropIndex: 2, manualOverrideReason: null },
            { subscriberId: 'SUB-007', subscriberName: 'Neha Gupta', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Neha+Gupta', phone: '9900112255', society: 'Madhav Villa', flatNo: 'B-08', area: 'Dindoli', scheduledJuice: 'Green Vitality', deliveredJuice: null, status: 'pending', deliveredAt: null, notes: 'No apple. Substitute with cucumber.', dropToken: 'GV-0003', dropIndex: 3, manualOverrideReason: null },
            { subscriberId: 'SUB-008', subscriberName: 'Rohit Verma', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Rohit+Verma', phone: '9900112266', society: 'Madhav Villa', flatNo: 'C-05', area: 'Dindoli', scheduledJuice: 'Green Vitality', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'GV-0004', dropIndex: 4, manualOverrideReason: null },
            { subscriberId: 'SUB-009', subscriberName: 'Ananya Iyer', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Ananya+Iyer', phone: '9900112277', society: 'Sun City Row House', flatNo: 'D-02', area: 'Dindoli', scheduledJuice: 'Green Vitality', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'GV-0005', dropIndex: 5, manualOverrideReason: null },
            { subscriberId: 'SUB-010', subscriberName: 'Kavya Nair', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Kavya+Nair', phone: '9900112288', society: 'Sun City Row House', flatNo: 'A-09', area: 'Dindoli', scheduledJuice: 'Green Vitality', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'GV-0006', dropIndex: 6, manualOverrideReason: null },
            { subscriberId: 'SUB-011', subscriberName: 'Vikram Joshi', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Vikram+Joshi', phone: '9900112299', society: 'Madhav Villa', flatNo: 'B-11', area: 'Dindoli', scheduledJuice: 'Green Vitality', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'GV-0007', dropIndex: 7, manualOverrideReason: null },
            { subscriberId: 'SUB-012', subscriberName: 'Meera Reddy', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Meera+Reddy', phone: '9900112300', society: 'Sun City Row House', flatNo: 'C-07', area: 'Dindoli', scheduledJuice: 'Green Vitality', deliveredJuice: null, status: 'pending', deliveredAt: null, notes: 'Extra lemon please.', dropToken: 'GV-0008', dropIndex: 8, manualOverrideReason: null },
            { subscriberId: 'SUB-004', subscriberName: 'Sofia Miller', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sofia+Miller', phone: '9123456780', society: 'Sun City Row House', flatNo: 'D-11', area: 'Dindoli', scheduledJuice: 'Citrus Glow', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'CG-0001', dropIndex: 9, manualOverrideReason: null },
            { subscriberId: 'SUB-013', subscriberName: 'Arjun Mehta', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Arjun+Mehta', phone: '9900112311', society: 'Madhav Villa', flatNo: 'A-06', area: 'Dindoli', scheduledJuice: 'Citrus Glow', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'CG-0002', dropIndex: 10, manualOverrideReason: null },
            { subscriberId: 'SUB-014', subscriberName: 'Divya Kapoor', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Divya+Kapoor', phone: '9900112322', society: 'Sun City Row House', flatNo: 'B-15', area: 'Dindoli', scheduledJuice: 'Citrus Glow', deliveredJuice: null, status: 'pending', deliveredAt: null, notes: 'Skip cayenne pepper. Stomach sensitive.', dropToken: 'CG-0003', dropIndex: 11, manualOverrideReason: null },
            { subscriberId: 'SUB-015', subscriberName: 'Ravi Patel', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Ravi+Patel', phone: '9900112333', society: 'Madhav Villa', flatNo: 'D-03', area: 'Dindoli', scheduledJuice: 'Citrus Glow', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'CG-0004', dropIndex: 12, manualOverrideReason: null },
            { subscriberId: 'SUB-016', subscriberName: 'Ishita Das', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Ishita+Das', phone: '9900112344', society: 'Sun City Row House', flatNo: 'C-10', area: 'Dindoli', scheduledJuice: 'Citrus Glow', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'CG-0005', dropIndex: 13, manualOverrideReason: null },
            { subscriberId: 'SUB-017', subscriberName: 'Siddharth Rao', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Siddharth+Rao', phone: '9900112355', society: 'Madhav Villa', flatNo: 'A-14', area: 'Dindoli', scheduledJuice: 'Citrus Glow', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'CG-0006', dropIndex: 14, manualOverrideReason: null },
            { subscriberId: 'SUB-002', subscriberName: 'Marcus Chen', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Marcus+Chen', phone: '9988776655', society: 'Madhav Villa', flatNo: 'A-04', area: 'Dindoli', scheduledJuice: 'Beet Rooted', deliveredJuice: null, status: 'pending', deliveredAt: null, notes: 'Leave at the door.', dropToken: 'BR-0001', dropIndex: 15, manualOverrideReason: null },
            { subscriberId: 'SUB-018', subscriberName: 'Tanvi Singh', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Tanvi+Singh', phone: '9900112366', society: 'Sun City Row House', flatNo: 'B-06', area: 'Dindoli', scheduledJuice: 'Beet Rooted', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'BR-0002', dropIndex: 16, manualOverrideReason: null },
            { subscriberId: 'SUB-019', subscriberName: 'Karan Malhotra', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Karan+Malhotra', phone: '9900112377', society: 'Madhav Villa', flatNo: 'D-09', area: 'Dindoli', scheduledJuice: 'Beet Rooted', deliveredJuice: null, status: 'pending', deliveredAt: null, notes: 'Allergic to mint. Skip mint completely.', dropToken: 'BR-0003', dropIndex: 17, manualOverrideReason: null },
            { subscriberId: 'SUB-020', subscriberName: 'Pooja Saxena', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Pooja+Saxena', phone: '9900112388', society: 'Sun City Row House', flatNo: 'A-12', area: 'Dindoli', scheduledJuice: 'Beet Rooted', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'BR-0004', dropIndex: 18, manualOverrideReason: null },
            { subscriberId: 'SUB-021', subscriberName: 'Aditya Kumar', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aditya+Kumar', phone: '9900112399', society: 'Sun City Row House', flatNo: 'C-14', area: 'Dindoli', scheduledJuice: 'Beet Rooted', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'BR-0005', dropIndex: 19, manualOverrideReason: null },
            { subscriberId: 'SUB-022', subscriberName: 'Sneha Tiwari', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sneha+Tiwari', phone: '9900112400', society: 'Madhav Villa', flatNo: 'B-03', area: 'Dindoli', scheduledJuice: 'Tropical Sunrise', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'TS-0001', dropIndex: 20, manualOverrideReason: null },
            { subscriberId: 'SUB-023', subscriberName: 'Manish Agarwal', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Manish+Agarwal', phone: '9900112411', society: 'Sun City Row House', flatNo: 'D-07', area: 'Dindoli', scheduledJuice: 'Tropical Sunrise', deliveredJuice: null, status: 'pending', deliveredAt: null, dropToken: 'TS-0002', dropIndex: 21, manualOverrideReason: null },
            { subscriberId: 'SUB-024', subscriberName: 'Ritika Bhatt', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Ritika+Bhatt', phone: '9900112422', society: 'Madhav Villa', flatNo: 'A-10', area: 'Dindoli', scheduledJuice: 'Tropical Sunrise', deliveredJuice: null, status: 'pending', deliveredAt: null, notes: 'Double turmeric. She takes it for joint pain.', dropToken: 'TS-0003', dropIndex: 22, manualOverrideReason: null },
            { subscriberId: 'SUB-005', subscriberName: 'Priya Patel', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Priya+Patel', phone: '9876543210', society: 'Madhav Villa', flatNo: 'C-01', area: 'Dindoli', scheduledJuice: 'Green Vitality', deliveredJuice: null, status: 'skipped', deliveredAt: null, notes: 'Insufficient Balance. Skipped.', dropToken: 'GV-0009', dropIndex: 23, manualOverrideReason: null },
          ],
          createdBy: 'admin'
        }
      ],

      mockSurveys: [
        { _id: 'sur_1', name: 'Rahul Sharma', phone: '9898989898', area: 'Dindoli', society: 'Prayosha star', interestedProducts: ['Green Vitality', 'Citrus Glow'], frequency: 'Every day', createdAt: new Date().toISOString() },
        { _id: 'sur_2', name: 'Neha Gupta', phone: '9123456789', area: 'Dindoli', society: 'Lake City', interestedProducts: ['Beet Rooted'], frequency: '1-3 days a week', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { _id: 'sur_3', name: 'Amit Patel', phone: '9988776655', area: 'Bhatar', society: 'Bhatar Society', interestedProducts: ['Green Vitality', 'Beet Rooted'], frequency: '4-6 days a week', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
        { _id: 'sur_4', name: 'Priya Desai', phone: '9900112233', area: 'Vesu', society: 'Vesu Enclave', interestedProducts: ['Citrus Glow'], frequency: 'Every day', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
      ],

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
        if (!get().isLiveMode) {
          const adminProds = get().adminData.inventory;
          const prod1 = adminProds[0]; // Green Vitality
          const prod2 = adminProds[1]; // Citrus Glow

          // Provide rich mock data for user dashboard in demo mode
          const mockUser = {
            _id: 'user_mock_1',
            name: 'Alex Johnson',
            email: 'alex.j@icloud.com',
            phone: '9876543210',
            role: 'user',
            avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Alex',
            addresses: [{
              _id: 'addr_1',
              society: 'Sunrise Towers',
              flatNo: 'A-402',
              area: 'Downtown',
              pincode: '400001',
              isDefault: true
            }]
          };

          const mockWallet = {
            balance: 1500,
            bonusBalance: 300,
            transactions: [
              { _id: 'tx_1', type: 'topup', amount: 3000, description: 'Wallet top-up of ₹3000', date: new Date(Date.now() - 5 * 86400000).toISOString() },
              { _id: 'tx_2', type: 'bonus', amount: 300, description: 'Bonus credit of ₹300', date: new Date(Date.now() - 5 * 86400000).toISOString() },
              { _id: 'tx_3', type: 'deduction', amount: prod1.price, description: `Delivery Deduction for ${prod1.name}`, date: new Date(Date.now() - 2 * 86400000).toISOString() },
              { _id: 'tx_4', type: 'deduction', amount: prod2.price, description: `Delivery Deduction for ${prod2.name}`, date: new Date(Date.now() - 1 * 86400000).toISOString() },
            ]
          };

          const mockSubscription = {
            _id: 'sub_mock_1',
            status: 'active',
            schedule: [0, 1, 2, 3, 4, 5, 6].map(day => ({
              dayOfWeek: day,
              product: day % 2 === 0 ? prod1 : prod2,
              isPaused: day === 0 // Sunday paused
            })),
            dietaryPreferences: ['Vegan', 'No Added Sugar'],
            dietaryNote: 'Slight allergy to raw ginger'
          };

          set({ user: mockUser as any, wallet: mockWallet as any, subscription: mockSubscription as any, isBackendConnected: false });
          return;
        }
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
        if (!get().isLiveMode) {
          // Handled by fetchMe in mock mode
          return;
        }
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
        if (!get().isLiveMode) {
          // Handled by fetchMe in mock mode
          return;
        }
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

      updateSubscription: async (subId, schedule) => {
        if (!get().isLiveMode) {
          const sub = get().subscription;
          if (sub && sub._id === subId) {
            const updatedSchedule = schedule.map((s: any) => ({
              dayOfWeek: s.dayOfWeek,
              product: s.productId,
              isPaused: false
            }));
            set({ subscription: { ...sub, schedule: updatedSchedule } });
          }
          return;
        }

        const { token } = get();
        if (!token) throw new Error('Not authenticated');
        set({ isLoading: true });
        try {
          // This will invoke a full schedule update on the backend
          const res = await fetch(`${API_URL}/subscriptions/${subId}/schedule`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ schedule }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error);
          set({ subscription: data.subscription, isLoading: false });
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
        if (!get().isLiveMode) {
          const adminProds = get().adminData.inventory;
          const prod1 = adminProds[0]; // Green Vitality
          const prod2 = adminProds[1]; // Citrus Glow

          const mockOrders = [
            { _id: 'ord_1', deliveryDate: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'delivered', totalAmount: prod1.price, items: [{ product: prod1 }] },
            { _id: 'ord_2', deliveryDate: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'delivered', totalAmount: prod2.price, items: [{ product: prod2 }] },
            { _id: 'ord_3', deliveryDate: new Date().toISOString(), status: 'out_for_delivery', totalAmount: prod1.price, items: [{ product: prod1 }] },
            { _id: 'ord_4', deliveryDate: new Date(Date.now() + 1 * 86400000).toISOString(), status: 'scheduled', totalAmount: prod2.price, items: [{ product: prod2 }] },
            { _id: 'ord_5', deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString(), status: 'scheduled', totalAmount: prod1.price, items: [{ product: prod1 }] },
          ];
          set({ orders: mockOrders as any, isBackendConnected: false });
          return;
        }
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

      // ---- Surveys ----
      surveys: [],

      fetchSurveys: async () => {
        if (!get().isLiveMode) {
          set({ surveys: get().mockSurveys });
          return;
        }
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/survey`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            set({ surveys: data.surveys });
          }
        } catch (e) {
          console.error("Fetch surveys failed", e);
        }
      },

      submitSurvey: async (payload) => {
        if (!get().isLiveMode) {
          const newSurvey = {
            _id: `mock_sur_${Date.now()}`,
            ...payload,
            createdAt: new Date().toISOString()
          };
          set(state => ({ mockSurveys: [newSurvey, ...state.mockSurveys] }));
          return;
        }
        const res = await fetch(`${API_URL}/survey`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
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
            _id: 'prod_1', name: 'Green Vitality', price: 120, category: 'Juice', healthGoal: 'Immunity', isActive: true, stock: 150, stockLevel: 'ok',
            description: 'A powerful blend of alkalizing greens and hydrating cucumber, designed to flush toxins and rebuild cellular strength.',
            ingredients: ['Spinach', 'Celery', 'Cucumber', 'Green Apple', 'Lemon', 'Ginger'],
            benefits: ['🌿 Anti-Inflammatory', '💧 Deep Hydration', '🧬 Gut Health'],
            detailedBenefits: [
              { title: 'Anti-Inflammatory Power', description: 'Ginger and celery work synergistically to reduce systemic inflammation and soothe digestion.' },
              { title: 'Deep Hydration', description: 'High water content from cucumber flushes out cellular toxins and rehydrates your body naturally.' },
              { title: 'Gut Health', description: 'Rich in soluble fiber from green apples which acts as a prebiotic, nourishing your microbiome.' },
            ],
            recipe: [
              { ingredientId: 'ing_cucumber', ingredientName: 'Cucumber', qtyPerBottle: 0.15, unit: 'kg' },
              { ingredientId: 'ing_apple_green', ingredientName: 'Green Apple', qtyPerBottle: 0.15, unit: 'kg' },
              { ingredientId: 'ing_celery', ingredientName: 'Celery', qtyPerBottle: 0.10, unit: 'kg' },
              { ingredientId: 'ing_spinach', ingredientName: 'Spinach', qtyPerBottle: 0.05, unit: 'kg' },
              { ingredientId: 'ing_lemon', ingredientName: 'Lemon', qtyPerBottle: 0.5, unit: 'pcs' },
              { ingredientId: 'ing_ginger', ingredientName: 'Ginger', qtyPerBottle: 10, unit: 'gm' },
            ],
            recipeInstructions: [
              'Wash cucumber, celery, and spinach thoroughly in cold ozone water.',
              'Pass cucumber and celery through the cold press first for liquid base.',
              'Add green apples, followed by spinach leaves.',
              'Finish by pressing lemon (peeled) and ginger root.',
              'Double strain to remove micro-fibers for a smooth texture.'
            ],
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1QuAZLQgXCBHxy0BcEKhRglzerfWWC-1vPn7NXZciyOqV_MZgInCEWjivoDmzw_XLtny0YeXfJoFb7zrHBi3BTX-8QVbJRBdjeAPbKJnhIZLPQXlrJ4kUlrFihd_qCx4lbucJ6uXSk0tXYwFuQb2-gr_4zjfE1XZ-0Bf5AoVu12NBnleBwT9AbcdsNO2bzPcNzX8rEN4tdP6e14o9wZrdNAnKYZPERcoTEOnO32z3afdKSme0XJXKoEMDo-gB7Byc5EnnQIwmZwc',
          },
          {
            _id: 'prod_2', name: 'Citrus Glow', price: 110, category: 'Juice', healthGoal: 'Energy', isActive: true, stock: 120, stockLevel: 'ok',
            description: 'A vibrant, metabolism-boosting citrus blend packed with vitamin C and anti-inflammatory turmeric activated by black pepper.',
            ingredients: ['Orange', 'Carrot', 'Pineapple', 'Turmeric Root', 'Black Pepper'],
            benefits: ['✨ Skin Radiance', '⚡ Natural Energy', '🛡️ Immunity Boost'],
            detailedBenefits: [
              { title: 'Skin Radiance', description: 'Massive doses of Vitamin C from oranges and pineapple promote collagen production, leading to glowing skin.' },
              { title: 'Natural Energy', description: 'Beta-carotene from carrots provides sustained, clean energy without the sugar crash.' },
              { title: 'Activated Immunity', description: 'Fresh turmeric root paired with a pinch of black pepper increases curcumin absorption by 2000%.' },
            ],
            recipe: [
              { ingredientId: 'ing_orange', ingredientName: 'Orange', qtyPerBottle: 0.20, unit: 'kg' },
              { ingredientId: 'ing_carrot', ingredientName: 'Carrot', qtyPerBottle: 0.15, unit: 'kg' },
              { ingredientId: 'ing_pineapple', ingredientName: 'Pineapple', qtyPerBottle: 0.1, unit: 'pcs' },
              { ingredientId: 'ing_turmeric', ingredientName: 'Turmeric Root', qtyPerBottle: 15, unit: 'gm' },
              { ingredientId: 'ing_black_pepper', ingredientName: 'Black Pepper', qtyPerBottle: 1, unit: 'gm' },
            ],
            recipeInstructions: [
              'Peel oranges and pineapple completely. Scrub carrots well.',
              'Cold press carrots first, followed by the pineapple chunks.',
              'Juice the oranges and fresh turmeric root.',
              'Add a tiny pinch of finely ground black pepper directly into the mixing vat.',
              'Stir gently and bottle immediately to prevent Vitamin C oxidation.'
            ],
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbA9CAicGuI3_qnblBkoS5JUaLGJiLMkMgWW-UhG8AGeY2G4HAMMHz2LmIpvAX8BD2ZC0GqHCeI0iY5ostmkp69mQheBa86_T9N-QhcOXWjJfkZblGf7Xk0L3yIPlpqysdbQIXRcR3g6GPrg7JlWwAHm-wR9AoJOCCirdtxNpCLmHdH20oQ6n2njZ0YxCLDAk1_zkwHS5VKKAzyxxFvxwAfoqCPI5jgkulkKw6ePnVabZrU_A5T1CQ9jRnJXF0Dq27zR1n7e3oPdU',
          },
          {
            _id: 'prod_3', name: 'Beet Rooted', price: 130, category: 'Juice', healthGoal: 'Detox', isActive: true, stock: 80, stockLevel: 'low',
            description: 'An earthy, stamina-building root blend that improves blood flow, paired with hydrating watermelon and sweet pomegranate.',
            ingredients: ['Beetroot', 'Pomegranate', 'Watermelon', 'Red Apple', 'Mint Leaves'],
            benefits: ['🩸 Iron Rich', '🏃‍♂️ Stamina Boost', '❤️ Heart Health'],
            detailedBenefits: [
              { title: 'Iron Rich & Blood Flow', description: 'Beetroot is famous for increasing nitric oxide in the blood, relaxing blood vessels and improving circulation.' },
              { title: 'Stamina Boost', description: 'The unique natural nitrates provide a measurable increase in physical endurance and oxygen utilization.' },
              { title: 'Heart Health', description: 'Pomegranate arils are loaded with punicalagins, extremely potent antioxidants that protect the heart.' },
            ],
            recipe: [
              { ingredientId: 'ing_watermelon', ingredientName: 'Watermelon', qtyPerBottle: 0.20, unit: 'kg' },
              { ingredientId: 'ing_beetroot', ingredientName: 'Beetroot', qtyPerBottle: 0.15, unit: 'kg' },
              { ingredientId: 'ing_apple_red', ingredientName: 'Red Apple', qtyPerBottle: 0.10, unit: 'kg' },
              { ingredientId: 'ing_pomegranate', ingredientName: 'Pomegranate', qtyPerBottle: 0.05, unit: 'kg' },
              { ingredientId: 'ing_mint', ingredientName: 'Mint Leaves', qtyPerBottle: 0.5, unit: 'bunch' },
            ],
            recipeInstructions: [
              'Extract arils from pomegranate. Scrub beetroots rigorously.',
              'Cold press the watermelon first to create a highly hydrating base liquid.',
              'Process the red apples and beetroots through the heavy press.',
              'Crush the pomegranate arils alongside the fresh mint for infused flavor.',
              'Mix thoroughly. Ensure deep ruby red hue without separation.'
            ],
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIrfiBzFWaXV4otHis8tCw4zQvYiuhbSV-LBjN1kSlQTzUDlDFg4gW1vjSDrpxjNh_YAIgmwhL0skxCoTSyL5OFVN3as4AR_fFgJoWIHnBgC6WfJmRkgVGEnpBIfabjNRsPPVQ2qMrBM2dMcfJ_JsS2_kkT9FOQ_Kv8lAG6KcGMHgljGIoUuqyineCTxBz-1fX8JtkmvScLUQt9ha9RmprJbTCrMCZQpO8SvsRnT7dnU5Y_KAbefSPmtlhYqohE1lWjUmpnjvasf8',
          },
          {
            _id: 'prod_4', name: 'Liquid Gold', price: 115, category: 'Juice', healthGoal: 'Immunity', isActive: true, stock: 45, stockLevel: 'ok',
            description: 'A tropical, anti-inflammatory blend that soothes the stomach and boosts immunity.',
            ingredients: ['Pineapple', 'Yellow Apple', 'Ginger', 'Lemon', 'Mint Leaves'],
            benefits: ['🍍 Digestion Aid', '🛡️ Immunity Boost', '✨ Anti-Inflammatory'],
            detailedBenefits: [
              { title: 'Digestion Aid', description: 'Pineapple contains bromelain, a powerful enzyme that helps break down proteins and soothe the gut.' },
              { title: 'Immunity Boost', description: 'Loaded with Vitamin C from lemon and yellow apples to ward off infections.' },
            ],
            recipe: [
              { ingredientId: 'ing_pineapple', ingredientName: 'Pineapple', qtyPerBottle: 0.15, unit: 'pcs' },
              { ingredientId: 'ing_apple_yellow', ingredientName: 'Yellow Apple', qtyPerBottle: 0.20, unit: 'kg' },
              { ingredientId: 'ing_ginger', ingredientName: 'Ginger', qtyPerBottle: 15, unit: 'gm' },
              { ingredientId: 'ing_lemon', ingredientName: 'Lemon', qtyPerBottle: 0.5, unit: 'pcs' },
              { ingredientId: 'ing_mint', ingredientName: 'Mint Leaves', qtyPerBottle: 0.2, unit: 'bunch' },
            ],
            recipeInstructions: [
              'Peel the pineapple and cut into small chunks.',
              'Cold press the yellow apples and pineapple first.',
              'Add the ginger root and peeled lemon.',
              'Lightly crush mint leaves and stir into the final yield.'
            ],
            image: '/products/liquid_gold_glass.png',
          },
          {
            _id: 'prod_5', name: 'Ruby Cleanse', price: 140, category: 'Juice', healthGoal: 'Detox', isActive: true, stock: 30, stockLevel: 'low',
            description: 'A deep red antioxidant powerhouse that cleanses the blood and supports liver function.',
            ingredients: ['Pomegranate', 'Beetroot', 'Carrot', 'Red Grape'],
            benefits: ['🍷 Powerful Antioxidants', '🩸 Blood Purifier', '👀 Vision Health'],
            detailedBenefits: [
              { title: 'Powerful Antioxidants', description: 'Red grapes and pomegranate provide massive amounts of resveratrol and punicalagins.' },
              { title: 'Vision Health', description: 'High in beta-carotene from carrots, essential for maintaining healthy eyes.' },
            ],
            recipe: [
              { ingredientId: 'ing_pomegranate', ingredientName: 'Pomegranate', qtyPerBottle: 0.1, unit: 'kg' },
              { ingredientId: 'ing_beetroot', ingredientName: 'Beetroot', qtyPerBottle: 0.1, unit: 'kg' },
              { ingredientId: 'ing_carrot', ingredientName: 'Carrot', qtyPerBottle: 0.2, unit: 'kg' },
              { ingredientId: 'ing_grape_red', ingredientName: 'Red Grape', qtyPerBottle: 0.15, unit: 'kg' },
            ],
            recipeInstructions: [
              'Extract pomegranate arils. Wash grapes and carrots thoroughly.',
              'Process grapes first, followed by the pomegranate arils.',
              'Cold press the carrots and beetroot to yield the dense red base.',
              'Mix well and double strain for a silky smooth finish.'
            ],
            image: '/products/ruby_cleanse_glass.png',
          },
          {
            _id: 'prod_6', name: 'Alkaline Green', price: 125, category: 'Juice', healthGoal: 'Daily Core', isActive: true, stock: 95, stockLevel: 'ok',
            description: 'The ultimate daily core green juice. Highly alkalizing, extremely low in natural sugars.',
            ingredients: ['Kale', 'Cucumber', 'Celery', 'Parsley', 'Lemon', 'Green Apple'],
            benefits: ['🥬 Highly Alkalizing', '⚖️ Low Sugar', '🦴 Bone Health'],
            detailedBenefits: [
              { title: 'Highly Alkalizing', description: 'Floods the body with chlorophyll, restoring a healthy alkaline pH balance.' },
              { title: 'Bone Health', description: 'Kale is packed with Vitamin K, crucial for bone density and calcium absorption.' },
            ],
            recipe: [
              { ingredientId: 'ing_kale', ingredientName: 'Kale', qtyPerBottle: 0.1, unit: 'kg' },
              { ingredientId: 'ing_cucumber', ingredientName: 'Cucumber', qtyPerBottle: 0.15, unit: 'kg' },
              { ingredientId: 'ing_celery', ingredientName: 'Celery', qtyPerBottle: 0.15, unit: 'kg' },
              { ingredientId: 'ing_parsley', ingredientName: 'Parsley', qtyPerBottle: 0.5, unit: 'bunch' },
              { ingredientId: 'ing_lemon', ingredientName: 'Lemon', qtyPerBottle: 1, unit: 'pcs' },
              { ingredientId: 'ing_apple_green', ingredientName: 'Green Apple', qtyPerBottle: 0.05, unit: 'kg' },
            ],
            recipeInstructions: [
              'Wash all greens rigorously in ozone water.',
              'Cold press cucumber and celery for maximum liquid yield.',
              'Slowly press kale, parsley, and green apple.',
              'Finish with a whole peeled lemon to cut the earthiness.'
            ],
            image: '/products/alkaline_green_glass.png',
          },
        ],
        allOrders: [
          {
            _id: 'ord_1', user: { name: 'Sarah Jenkins', phone: '9900112233', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sarah+Jenkins' },
            items: [{ product: { name: '3x Green Vitality, 2x Citrus Glow' }, quantity: 5, price: 85 }],
            deliveryDate: new Date().toISOString(), status: 'delivered', paymentStatus: 'paid',
            totalAmount: 255, deliveryAddress: 'Downtown B-12'
          },
          {
            _id: 'ord_2', user: { name: 'Marcus Chen', phone: '9988776655', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Marcus+Chen' },
            items: [{ product: { name: '5x Morning Detox Pack' }, quantity: 5, price: 90 }],
            deliveryDate: new Date().toISOString(), status: 'out_for_delivery', paymentStatus: 'paid',
            totalAmount: 450, deliveryAddress: 'West Side A-04'
          },
          {
            _id: 'ord_3', user: { name: 'Elena Rodriguez', phone: '9876501234', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Elena+Rodriguez' },
            items: [{ product: { name: 'Weekly Renewal Plan' }, quantity: 1, price: 500 }],
            deliveryDate: new Date().toISOString(), status: 'pending', paymentStatus: 'paid',
            totalAmount: 500, deliveryAddress: 'North Hills C-09'
          },
        ],
        procurement: [],
        recipes: [],
        suppliers: [
          { _id: 'sup_1', name: 'Local Greens Co.', contactName: 'John Farmer', phone: '123-456-7890', isActive: true, materials: ['ing_1', 'ing_2', 'ing_3', 'ing_5', 'ing_10', 'ing_12'] },
          { _id: 'sup_2', name: 'Orchard Farms', contactName: 'Alice Orchard', phone: '098-765-4321', isActive: true, materials: ['ing_3', 'ing_4', 'ing_6', 'ing_7', 'ing_10'] },
          { _id: 'sup_3', name: 'Spice Importers', contactName: 'Bob Spice', phone: '555-666-7777', isActive: true, materials: ['ing_5', 'ing_8', 'ing_9'] },
          { _id: 'sup_4', name: 'Berry Best Farm', contactName: 'Cathy Berry', phone: '111-222-3333', isActive: true, materials: ['ing_11'] },
        ],
        rawMaterials: [
          { _id: 'ing_spinach', name: 'Spinach', unit: 'kg', marketPrice: 40, qtyAvailable: 5.0, minStockLevel: 2.0, supplier: { _id: 'sup_1', name: 'Local Greens Co.' }, isActive: true },
          { _id: 'ing_apple_green', name: 'Green Apple', unit: 'kg', marketPrice: 150, qtyAvailable: 10.0, minStockLevel: 5.0, supplier: { _id: 'sup_2', name: 'Orchard Farms' }, isActive: true },
          { _id: 'ing_celery', name: 'Celery', unit: 'kg', marketPrice: 120, qtyAvailable: 4.0, minStockLevel: 2.0, supplier: { _id: 'sup_1', name: 'Local Greens Co.' }, isActive: true },
          { _id: 'ing_cucumber', name: 'Cucumber', unit: 'kg', marketPrice: 30, qtyAvailable: 15.0, minStockLevel: 5.0, supplier: { _id: 'sup_1', name: 'Local Greens Co.' }, isActive: true },
          { _id: 'ing_lemon', name: 'Lemon', unit: 'pcs', marketPrice: 5, qtyAvailable: 100, minStockLevel: 30, supplier: { _id: 'sup_2', name: 'Orchard Farms' }, isActive: true },
          { _id: 'ing_ginger', name: 'Ginger', unit: 'gm', marketPrice: 0.2, qtyAvailable: 1000, minStockLevel: 300, supplier: { _id: 'sup_3', name: 'Spice Importers' }, isActive: true },
          { _id: 'ing_orange', name: 'Orange', unit: 'kg', marketPrice: 80, qtyAvailable: 12.0, minStockLevel: 5.0, supplier: { _id: 'sup_2', name: 'Orchard Farms' }, isActive: true },
          { _id: 'ing_carrot', name: 'Carrot', unit: 'kg', marketPrice: 40, qtyAvailable: 20.0, minStockLevel: 10.0, supplier: { _id: 'sup_1', name: 'Local Greens Co.' }, isActive: true },
          { _id: 'ing_pineapple', name: 'Pineapple', unit: 'pcs', marketPrice: 60, qtyAvailable: 20, minStockLevel: 10, supplier: { _id: 'sup_2', name: 'Orchard Farms' }, isActive: true },
          { _id: 'ing_turmeric', name: 'Turmeric Root', unit: 'gm', marketPrice: 0.3, qtyAvailable: 500, minStockLevel: 200, supplier: { _id: 'sup_3', name: 'Spice Importers' }, isActive: true },
          { _id: 'ing_black_pepper', name: 'Black Pepper', unit: 'gm', marketPrice: 1.0, qtyAvailable: 200, minStockLevel: 50, supplier: { _id: 'sup_3', name: 'Spice Importers' }, isActive: true },
          { _id: 'ing_beetroot', name: 'Beetroot', unit: 'kg', marketPrice: 50, qtyAvailable: 15.0, minStockLevel: 5.0, supplier: { _id: 'sup_1', name: 'Local Greens Co.' }, isActive: true },
          { _id: 'ing_pomegranate', name: 'Pomegranate', unit: 'kg', marketPrice: 180, qtyAvailable: 8.0, minStockLevel: 3.0, supplier: { _id: 'sup_2', name: 'Orchard Farms' }, isActive: true },
          { _id: 'ing_apple_red', name: 'Red Apple', unit: 'kg', marketPrice: 140, qtyAvailable: 10.0, minStockLevel: 4.0, supplier: { _id: 'sup_2', name: 'Orchard Farms' }, isActive: true },
          { _id: 'ing_mint', name: 'Mint Leaves', unit: 'bunch', marketPrice: 10, qtyAvailable: 30, minStockLevel: 10, supplier: { _id: 'sup_1', name: 'Local Greens Co.' }, isActive: true },
          { _id: 'ing_watermelon', name: 'Watermelon', unit: 'kg', marketPrice: 25, qtyAvailable: 30.0, minStockLevel: 10.0, supplier: { _id: 'sup_2', name: 'Orchard Farms' }, isActive: true },
          { _id: 'ing_apple_yellow', name: 'Yellow Apple', unit: 'kg', marketPrice: 130, qtyAvailable: 5.0, minStockLevel: 3.0, supplier: { _id: 'sup_2', name: 'Orchard Farms' }, isActive: true },
          { _id: 'ing_grape_red', name: 'Red Grape', unit: 'kg', marketPrice: 90, qtyAvailable: 10.0, minStockLevel: 2.0, supplier: { _id: 'sup_2', name: 'Orchard Farms' }, isActive: true },
          { _id: 'ing_kale', name: 'Kale', unit: 'kg', marketPrice: 60, qtyAvailable: 6.0, minStockLevel: 2.0, supplier: { _id: 'sup_1', name: 'Local Greens Co.' }, isActive: true },
          { _id: 'ing_parsley', name: 'Parsley', unit: 'bunch', marketPrice: 15, qtyAvailable: 20, minStockLevel: 5, supplier: { _id: 'sup_1', name: 'Local Greens Co.' }, isActive: true }
        ],
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
              { name: 'Dindoli', total: 9, delivered: 6 },
              { name: 'Vesu', total: 7, delivered: 7 },
              { name: 'Adajan', total: 6, delivered: 2 },
            ]
          },
          growth: {
            newSignups: 5,
            churnRisk: 1,
          },
          activityFeed: [
            { type: 'topup', text: 'Sarah Jenkins topped up ₹1500', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sarah+Jenkins', time: new Date(Date.now() - 10 * 60000).toISOString() },
            { type: 'delivery', text: 'Delivered to Marcus Chen at Madhav Villa', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Marcus+Chen', time: new Date(Date.now() - 25 * 60000).toISOString() },
            { type: 'delivery', text: 'Delivered to Sofia Miller at Sun City', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sofia+Miller', time: new Date(Date.now() - 40 * 60000).toISOString() },
            { type: 'topup', text: 'Elena Rodriguez topped up ₹800', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Elena+Rodriguez', time: new Date(Date.now() - 55 * 60000).toISOString() },
            { type: 'delivery', text: 'Delivered to Priya Patel at Madhav Villa', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Priya+Patel', time: new Date(Date.now() - 70 * 60000).toISOString() },
          ],
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
            case 'overview': endpoint = '/admin/overview'; break;
          }

          const res = await fetch(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (data.success) {
            // Check again if live mode has changed while fetching
            if (!get().isLiveMode) return;

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
                ...(type === 'overview' && data.stats ? { stats: data.stats } : {}),
              },
              isBackendConnected: true
            }));
          }
        } catch {
          // API failed — keep default dummy data, don't overwrite
        }
      },

      // ---- Driver Actions ----
      driverRun: null,

      fetchDriverRun: async () => {
        const { token, isLiveMode, mockDeliveryRuns } = get();
        if (!isLiveMode) {
          // Demo mode: use the first mock delivery run as today's run
          set({ driverRun: mockDeliveryRuns[0] || null });
          return;
        }
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/driver/runs`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) set({ driverRun: data.run || null });
        } catch (e) {
          console.error("Fetch driver run failed", e);
        }
      },

      markDropDelivered: async (runId: string, subscriberId: string, overrideReason?: string) => {
        const { token, isLiveMode } = get();
        if (!isLiveMode) {
          // Demo mode: optimistically update the mock run, store reason too
          set((state) => ({
            driverRun: state.driverRun ? {
              ...state.driverRun,
              drops: state.driverRun.drops.map((d: any) =>
                d.subscriberId === subscriberId
                  ? {
                    ...d,
                    status: 'delivered',
                    deliveredAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    manualOverrideReason: overrideReason || null,
                  }
                  : d
              )
            } : null
          }));
          return;
        }
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/driver/drops/${subscriberId}/deliver`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ runId, overrideReason: overrideReason || null }),
          });
          const data = await res.json();
          if (data.success) {
            // Optimistically update the drop status
            set((state) => ({
              driverRun: state.driverRun ? {
                ...state.driverRun,
                drops: state.driverRun.drops.map((d: any) =>
                  String(d.subscriberId) === String(subscriberId)
                    ? {
                      ...d,
                      status: 'delivered',
                      deliveredAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                      manualOverrideReason: overrideReason || null,
                    }
                    : d
                )
              } : null
            }));
          }
        } catch (e) {
          console.error("Mark delivered failed", e);
        }
      },

      markDropPickedUp: (subscriberId: string) => {
        // Always optimistic — pick-up is a local gesture, synced on startDeliveryRun
        set((state) => ({
          driverRun: state.driverRun ? {
            ...state.driverRun,
            drops: state.driverRun.drops.map((d: any) =>
              String(d.subscriberId) === String(subscriberId)
                ? { ...d, status: 'picked_up' }
                : d
            )
          } : null
        }));
      },

      startDeliveryRun: async (runId: string) => {
        const { token, isLiveMode } = get();
        // Batch-update all picked_up → out_for_delivery
        set((state) => ({
          driverRun: state.driverRun ? {
            ...state.driverRun,
            status: 'out_for_delivery',
            drops: state.driverRun.drops.map((d: any) =>
              d.status === 'picked_up' ? { ...d, status: 'out_for_delivery' } : d
            )
          } : null
        }));
        if (!isLiveMode || !token) return;
        try {
          await fetch(`${API_URL}/driver/runs/${runId}/start`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          });
        } catch (e) {
          console.error("Start run failed", e);
        }
      },

      // ---- Admin Settings ----
      adminSettings: null,
      fetchAdminSettings: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/admin/settings`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            set({ adminSettings: data.settings });
            if (typeof data.settings.mockDataMode === 'boolean') {
              set({ isLiveMode: !data.settings.mockDataMode });
            }
          }
        } catch (e) {
          console.error("Fetch settings failed", e);
        }
      },
      updateAdminSettings: async (payload: any) => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/admin/settings`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data.success) {
            set({ adminSettings: data.settings });
            if (typeof data.settings.mockDataMode === 'boolean') {
              set({ isLiveMode: !data.settings.mockDataMode });
            }
          } else {
            throw new Error(data.error);
          }
        } catch (e) {
          console.error("Update settings failed", e);
          throw e;
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

      updateDietaryPreferences: async (preferences: string[]) => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_URL}/auth/dietary`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ dietaryPreferences: preferences }),
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

      bypassLogin: (role: 'user' | 'admin' | 'delivery' = 'admin') => {
        const names = { admin: 'Dev Admin', user: 'Dev User', delivery: 'Rajesh Kumar (Driver)' };
        const mockUser = {
          _id: `mock_id_${role}`,
          name: names[role],
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
      name: 'morning-boost-store',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated, isLiveMode: state.isLiveMode }),
    }
  )
);

export default useStore;
