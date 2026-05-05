const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';

// TODO: Пока без видоизменений
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

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Registration failed');
  }

  return response.json();
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const payload = {
    email: data.email,
    password: data.password
  };

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed');
  }

  return response.json();
};

export const logout = async (refreshToken: string): Promise<void> => {
  try {
    const accessToken = localStorage.getItem('access_token');
    
    if (accessToken) {
      const response = await fetch(
        `${API_BASE_URL}/auth/logout?refresh_token=${encodeURIComponent(refreshToken)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({})
        }
      );

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Logout API failed:', errorData.detail || 'Unknown error');
      }
    }
  } catch (error) {
    console.error('Logout request failed:', error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    console.log('Tokens cleared successfully');
  }
};

export const getCurrentUser = async (accessToken: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get user data');
  }

  return response.json();
};

export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Token refresh failed with status ${response.status}`);
  }

  return response.json();
};

export const uploadAvatar = async (file: File): Promise<User> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload avatar');
  }

  return response.json();
};