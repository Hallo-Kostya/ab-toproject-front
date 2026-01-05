const API_BASE_URL = 'http://51.250.12.183:8001/api/v1/auth';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  email: string;
  tg_link: string;
  avatar_s3_path?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  tg_link?: string;
  avatar?: File;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  // Сначала регистрируем пользователя без аватара
  const userData = {
    email: data.email,
    password: data.password,
    first_name: data.first_name,
    last_name: data.last_name,
    patronymic: data.patronymic,
    tg_link: data.tg_link
  };

  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Registration failed');
  }

  const authResponse = await response.json();
  
  // Если есть аватар, загружаем его отдельно
  if (data.avatar) {
    const avatarFormData = new FormData();
    avatarFormData.append('avatar', data.avatar);
    
    await fetch(`${API_BASE_URL}/curator/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authResponse.access_token}`
      },
      body: avatarFormData
    });
  }

  return authResponse;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }

  return response.json();
};

export const logout = async (refreshToken: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Logout failed');
  }
  
  // После успешного выхода очищаем токены
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getCurrentUser = async (): Promise<User> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Try to refresh token
      await refreshToken();
      return getCurrentUser();
    }
    throw new Error('Failed to get user data');
  }

  return response.json();
};

export const refreshToken = async (): Promise<AuthResponse> => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await fetch(`${API_BASE_URL}/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Token refresh failed');
  }

  const tokens = await response.json();
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  
  return tokens;
};