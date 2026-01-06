const API_BASE_URL = 'http://51.250.12.183:8001/api/v1/auth';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

interface ServerAuthResponse {
  curator_id: string;
  token: string;
  expires_at: string;
  is_revoked: boolean;
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

// Вспомогательная функция для преобразования ответа сервера
function processAuthResponse(serverResponse: ServerAuthResponse[]): AuthResponse {
  if (!Array.isArray(serverResponse) || serverResponse.length < 2) {
    throw new Error('Invalid server response format');
  }

  const access_token = serverResponse[0]?.token;
  const refresh_token = serverResponse[1]?.token;

  if (!access_token || !refresh_token) {
    throw new Error('Missing tokens in server response');
  }

  return {
    access_token,
    refresh_token
  };
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Registration failed');
  }

  return processAuthResponse(await response.json());
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

  return processAuthResponse(await response.json());
};

export const logout = async (refreshToken: string): Promise<void> => {
  try {
    const accessToken = localStorage.getItem('access_token');
    
    if (accessToken) {
      // refresh_token передается как query параметр
      const response = await fetch(`${API_BASE_URL}/logout?refresh_token=${encodeURIComponent(refreshToken)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        // Тело запроса может быть пустым или содержать дополнительные данные
        body: JSON.stringify({}) // или можно убрать body полностью
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Logout API failed:', errorData.detail || 'Unknown error');
      }
    }
  } catch (error) {
    console.error('Logout request failed:', error);
  } finally {
    // ВСЕГДА очищаем токены
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    console.log('Tokens cleared successfully');
  }
};

export const getCurrentUser = async (accessToken: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/me`, {
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

  return processAuthResponse(await response.json());
};