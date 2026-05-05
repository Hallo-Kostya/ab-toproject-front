const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';


export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  email?: string;
  tg_link?: string;
  role?: string | null;
  study_group?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentDetailedResponse {
  students: Student[];
  total: number;
  team_id?: string;
  project_id?: string;
}

export interface CreateStudentData {
  first_name: string;
  last_name: string;
  patronymic?: string | null;
  email?: string | null;
  tg_link?: string | null;
}

export interface UpdateStudentData {
  first_name?: string;
  last_name?: string;
  patronymic?: string;
  email?: string;
  tg_link?: string;
}

export interface TeamStudent extends Student {
  role: string;
  study_group: string;
}


export const createStudent = async (data: CreateStudentData): Promise<Student> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

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

export const getStudents = async (filters?: {
  team_id?: string;
  project_id?: string;
}): Promise<Student[]> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const queryParams = new URLSearchParams();
  if (filters?.team_id) queryParams.append('team_id', filters.team_id);
  if (filters?.project_id) queryParams.append('project_id', filters.project_id);

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/students${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get students');
  }

  const data: StudentDetailedResponse = await response.json();
  return data.students;  // ✅ Извлекаем массив из обёртки
};

export const getStudentById = async (studentId: string): Promise<Student> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  if (!studentId || typeof studentId !== 'string') {
    throw new Error('Invalid student ID');
  }

  const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to get student with ID: ${studentId}`);
  }

  return response.json();
};

export const updateStudent = async (
  studentId: string,
  data: UpdateStudentData
): Promise<Student> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update student');
  }

  return response.json();
};

export const deleteStudent = async (studentId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to delete student');
  }
};

export const getTeamStudents = async (teamId: string): Promise<Student[]> => {
  return await getStudents({ team_id: teamId });
};