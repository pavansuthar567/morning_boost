const REFRESH_TOKEN_KEY = 'niftyswift_refresh_token';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let persistRefreshToken = true;

const canUseStorage = () => typeof window !== 'undefined';

export const authTokens = {
  getAccessToken() {
    return accessToken;
  },
  setAccessToken(token: string | null) {
    accessToken = token;
  },
  getRefreshToken() {
    if (refreshToken) return refreshToken;
    if (!canUseStorage()) return null;
    refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    return refreshToken;
  },
  setRefreshToken(token: string | null, options?: { persist?: boolean }) {
    refreshToken = token;

    if (typeof options?.persist === 'boolean') {
      persistRefreshToken = options.persist;
    }

    if (!canUseStorage()) return;

    if (!persistRefreshToken) {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }

    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
  clear() {
    accessToken = null;
    refreshToken = null;
    persistRefreshToken = true;
    if (canUseStorage()) {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
};


