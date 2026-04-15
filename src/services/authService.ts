import axios from 'axios';
import api, { API_BASE_URL } from '@/lib/api';
import { AuthResponse, AuthTokens, AuthUser } from '@/types';

const AUTH_BASE = '/auth';

type BackendApiResponse<T> = {
  status: string;
  message?: string;
  data: T;
};

type BackendAuthPayload = {
  user: Partial<AuthUser> & { id?: string; _id?: string };
  tokens: AuthTokens;
};

const normalizeUser = (user: BackendAuthPayload['user']): AuthUser => ({
  _id: user._id ?? user.id ?? '',
  email: user.email ?? '',
  firstName: user.firstName ?? '',
  lastName: user.lastName ?? '',
  role: user.role ?? 'user',
  avatar: user.avatar,
  isEmailVerified: user.isEmailVerified ?? false,
  createdAt: user.createdAt ?? '',
});

const transformAuthResponse = (payload: BackendApiResponse<BackendAuthPayload>): AuthResponse => ({
  user: normalizeUser(payload.data.user),
  accessToken: payload.data.tokens.accessToken,
  refreshToken: payload.data.tokens.refreshToken,
});

export const authService = {
  register: async (payload: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = (await api.post(`${AUTH_BASE}/register`, payload)) as BackendApiResponse<BackendAuthPayload>;
    return transformAuthResponse(response);
  },

  login: async (payload: { email: string; password: string }) => {
    const response = (await api.post(`${AUTH_BASE}/login`, payload)) as BackendApiResponse<BackendAuthPayload>;
    return transformAuthResponse(response);
  },

  getProfile: async () => {
    const response = (await api.get(`${AUTH_BASE}/me`)) as BackendApiResponse<{ user: BackendAuthPayload['user'] }>;
    return { user: normalizeUser(response.data.user) };
  },

  logout: () => api.post(`${AUTH_BASE}/logout`),

  refresh: async (refreshToken: string) => {
    const response = await axios.post<BackendApiResponse<{ tokens: AuthTokens }>>(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });
    const tokens = response.data?.data?.tokens;
    if (!tokens?.accessToken || !tokens?.refreshToken) {
      throw new Error('Invalid refresh response');
    }
    return tokens;
  },
};

export default authService;

