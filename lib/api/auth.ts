const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';

export const USE_COOKIES = false;

export interface TokenData {
  curator_id: string;
  token: string;
  expires_at: string;
  is_revoked: boolean;
}

export interface AuthResponseRaw {
  access_token: TokenData;
  refresh_token: TokenData;
  token_type?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  access_expires_at?: number;
  refresh_expires_at?: number;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  email: string;
  tg_link: string | null;
  avatar_s3_path?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  tg_link?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// JWT Utils
const decodeJWT = (token: string): { exp?: number; [key: string]: any } | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const getTokenExpiration = (token: string): number | null => {
  const payload = decodeJWT(token);
  return payload?.exp ? payload.exp * 1000 : null;
};

export const isTokenExpired = (token: string, bufferMs: number = 0): boolean => {
  const exp = getTokenExpiration(token);
  if (!exp) return true;
  return Date.now() + bufferMs >= exp;
};

// Нормализация ответа бека
export const normalizeAuthResponse = (raw: AuthResponseRaw): AuthResponse => {
  const parseExpiresAt = (isoString: string): number | undefined => {
    const ts = Date.parse(isoString);
    return isNaN(ts) ? undefined : ts;
  };

  return {
    access_token: raw.access_token.token,
    refresh_token: raw.refresh_token.token,
    access_expires_at: parseExpiresAt(raw.access_token.expires_at),
    refresh_expires_at: parseExpiresAt(raw.refresh_token.expires_at),
  };
};

// Fetch Options Helper
const getFetchOptions = (method: string, body?: any, includeAuth: boolean = true): RequestInit => {
  const options: RequestInit = {
    method,
    credentials: USE_COOKIES ? 'include' : 'same-origin',
  };

  const headers: Record<string, string> = {};

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (!USE_COOKIES && includeAuth) {
    const token = getStoredAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (Object.keys(headers).length > 0) {
    options.headers = headers;
  }

  if (body && !(body instanceof FormData)) {
    options.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    options.body = body;
  }

  return options;
};

// API Functions

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, getFetchOptions('POST', data, false));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Registration failed');
  }

  const raw: AuthResponseRaw = await response.json();
  return normalizeAuthResponse(raw);
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, getFetchOptions('POST', data, false));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed');
  }

  const raw: AuthResponseRaw = await response.json();
  return normalizeAuthResponse(raw);
};

export const logout = async (): Promise<void> => {
  if (USE_COOKIES) {
    await fetch(`${API_BASE_URL}/auth/logout`, getFetchOptions('POST', undefined, true));
  } else {
    const refreshToken = getStoredRefreshToken();
    const accessToken = getStoredAccessToken();
    
    if (refreshToken && accessToken) {
      try {
        await fetch(
          `${API_BASE_URL}/auth/logout?refresh_token=${encodeURIComponent(refreshToken)}`,
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }
  }
  clearAuthStorage();
};

export const getCurrentUser = async (): Promise<User> => {
  const accessToken = getStoredAccessToken();
  
  if (!accessToken) {
    console.error('[Auth] getCurrentUser: No access token in localStorage');
    console.log('[Auth] localStorage keys:', Object.keys(localStorage));
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Auth] /me failed:', response.status, errorData);
    throw new Error(errorData.detail || 'Failed to get user data');
  }

  return response.json();
};

export const refreshToken = async (): Promise<AuthResponse> => {
  if (USE_COOKIES) {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, getFetchOptions('POST', undefined, true));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Token refresh failed with status ${response.status}`);
    }
    
    const raw: AuthResponseRaw = await response.json();
    return normalizeAuthResponse(raw);
  } else {
    const storedRefreshToken = getStoredRefreshToken();
    if (!storedRefreshToken) throw new Error('No refresh token');

    const response = await fetch(
      `${API_BASE_URL}/auth/refresh?refresh_token=${encodeURIComponent(storedRefreshToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Token refresh failed with status ${response.status}`);
    }

    const raw: AuthResponseRaw = await response.json();
    return normalizeAuthResponse(raw);
  }
};

export const uploadAvatar = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/auth/me/avatar`, {
    ...getFetchOptions('POST', undefined, true),
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload avatar');
  }

  return response.json();
};

// Storage Helpers
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_EXPIRES_KEY = 'access_expires_at';
const REFRESH_EXPIRES_KEY = 'refresh_expires_at';
const USER_DATA_KEY = 'user_data';

export const saveAuthTokens = (tokens: AuthResponse) => {
  if (USE_COOKIES) return;
  
  const { access_token, refresh_token, access_expires_at, refresh_expires_at } = tokens;
  
  if (!access_token || typeof access_token !== 'string') {
    console.error('[Auth] Invalid access_token');
    return;
  }
  if (!refresh_token || typeof refresh_token !== 'string') {
    console.error('[Auth] Invalid refresh_token');
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  
  if (access_expires_at) localStorage.setItem(ACCESS_EXPIRES_KEY, access_expires_at.toString());
  if (refresh_expires_at) localStorage.setItem(REFRESH_EXPIRES_KEY, refresh_expires_at.toString());
};

export const clearAuthStorage = () => {
  if (USE_COOKIES) return;
  
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_EXPIRES_KEY);
  localStorage.removeItem(REFRESH_EXPIRES_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

export const getStoredAccessToken = (): string | null => {
  if (USE_COOKIES) return null;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return token ? token.trim() : null;
};

export const getStoredRefreshToken = (): string | null => {
  if (USE_COOKIES) return null;
  const token = localStorage.getItem(REFRESH_TOKEN_KEY);
  return token ? token.trim() : null;
};

export const getStoredAccessExpiresAt = (): number | null => {
  if (USE_COOKIES) return null;
  const val = localStorage.getItem(ACCESS_EXPIRES_KEY);
  return val ? parseInt(val, 10) : null;
};

export const getCachedUserData = (): User | null => {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

export const cacheUserData = (user: User) => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};