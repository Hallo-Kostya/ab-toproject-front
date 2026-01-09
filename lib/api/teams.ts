import { getProjectById, Project } from "./projects";

const API_BASE_URL = 'http://178.154.228.164:8001/api/v1';

export interface Team {
  id: string;
  name: string;
  group_link: string;
  number?: number;
}

export interface CreateTeamData {
  name: string;
  group_link: string;
}

export interface TeamStudent {
  id: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  role: string;
  study_group: string;
}

export interface AddStudentToTeamData {
  student_id: string;
  role: string;
  study_group: string;
}

export interface ProjectTeam {
  id: string;
  project_id: string;
  team_id: string;
  assigned_at: string;
  status: string;
  role_in_project: string;
}

export interface TeamProjectWithDetails {
  teamProject: ProjectTeam;
  project: Project;
}

export const createTeam = async (data: CreateTeamData): Promise<Team> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create team');
  }

  return response.json();
};

export const getTeamProjectsWithDetails = async (teamId: string): Promise<TeamProjectWithDetails[]> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  // Сначала получаем базовые данные о проектах команды
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/projects`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get team projects');
  }

  const teamProjects: ProjectTeam[] = await response.json();
  
  // Затем получаем полные данные для каждого проекта
  const projectPromises = teamProjects.map(async (teamProject) => {
    try {
      const project = await getProjectById(teamProject.project_id);
      return {
        teamProject,
        project
      };
    } catch (error) {
      console.error(`Failed to get project ${teamProject.project_id}:`, error);
      // Возвращаем минимальные данные если не удалось получить полные
      return {
        teamProject,
        project: {
          id: teamProject.project_id,
          name: 'Неизвестный проект',
          description: '',
          goal: '',
          requirements: '',
          eval_criteria: '',
          semester: 'AUTUMN',
          status: 'PLANNED',
          year: new Date().getFullYear()
        }
      };
    }
  });

  return Promise.all(projectPromises);
};

export const getTeams = async (): Promise<Team[]> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/teams`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get teams');
  }

  // Добавляем номера командам на основе их позиции в списке
  const teams = await response.json();
  return teams.map((team: Team, index: number) => ({
    ...team,
    number: index + 1
  }));
};

export const getTeamById = async (teamId: string): Promise<Team> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get team');
  }

  return response.json();
};

export const deleteTeam = async (teamId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete team');
  }
};

export const getTeamStudents = async (teamId: string): Promise<TeamStudent[]> => {
  // const accessToken = localStorage.getItem('access_token');
  
  // if (!accessToken) {
  //   throw new Error('No access token');
  // }

  // const response = await fetch(`${API_BASE_URL}/teams/${teamId}/students`, {
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`
  //   }
  // });

  // if (!response.ok) {
  //   const errorData = await response.json().catch(() => ({}));
  //   throw new Error(errorData.detail || 'Failed to get team students');
  // }

  // return response.json();
  return [];
};

export const addStudentToTeam = async (teamId: string, data: AddStudentToTeamData): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to add student to team');
  }
};

export const updateTeam = async (teamId: string, data: Partial<CreateTeamData>): Promise<Team> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update team');
  }

  return response.json();
};

export const removeStudentFromTeam = async (teamId: string, studentId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/students/${studentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to remove student from team');
  }
};

export const getTeamProjects = async (teamId: string): Promise<ProjectTeamWithProject[]> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/projects`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get team projects');
  }

  return response.json();
};