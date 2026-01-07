const API_BASE_URL = 'http://51.250.12.183:8001/api/v1';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  email: string;
  tg_link: string;
}

export interface CreateStudentData {
  first_name: string;
  last_name: string;
  patronymic: string;
  email: string;
  tg_link: string;
}

export const createStudent = async (data: CreateStudentData): Promise<Student> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create student');
  }

  return response.json();
};