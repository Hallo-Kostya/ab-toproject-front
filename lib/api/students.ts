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

export interface StudentInTeam {
  student_id: string;
  role: string;
  study_group: string;
}

export interface TeamStudent {
  id: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  email?: string;
  tg_link?: string;
  role: string;
  study_group: string;
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

export const getStudents = async (): Promise<Student[]> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/students`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get students');
  }

  return response.json();
};

export const getStudentById = async (studentId: string): Promise<Student> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  if (!studentId || typeof studentId !== 'string') {
    throw new Error('Invalid student ID');
  }

  const response = await fetch(`${API_BASE_URL}/students/${encodeURIComponent(studentId)}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to get student with ID: ${studentId}`);
  }

  return response.json();
};

export const getFullTeamStudents = async (teamId: string): Promise<TeamStudent[]> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/teams/${encodeURIComponent(teamId)}/students`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to get team students');
    }

    const teamStudents: StudentInTeam[] = await response.json();
    
    const studentPromises = teamStudents.map(async (teamStudent) => {
      try {
        const studentData = await getStudentById(teamStudent.student_id);
        return {
          id: studentData.id,
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          patronymic: studentData.patronymic,
          email: studentData.email,
          tg_link: studentData.tg_link,
          role: teamStudent.role,
          study_group: teamStudent.study_group
        };
      } catch (error) {
        console.error(`Failed to get student ${teamStudent.student_id}:`, error);
        return {
          id: teamStudent.student_id,
          first_name: 'Неизвестный',
          last_name: 'Студент',
          patronymic: '',
          role: teamStudent.role,
          study_group: teamStudent.study_group
        };
      }
    });

    return Promise.all(studentPromises);
  } catch (error) {
    console.error('Failed to get full team students:', error);
    throw error;
  }
};