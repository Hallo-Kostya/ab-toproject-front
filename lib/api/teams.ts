import { Project } from "./projects";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';

export interface Team {
  id: string;
  name: string;
  group_link: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMemberSummary {
  id: string;
  full_name: string;
}

export interface TeamSummary {
  id: string;
  name: string;
  members_count: number;
  members?: TeamMemberSummary[];
}

export interface TeamSummaryResponse {
  teams: TeamSummary[];
  total: number;
  project_id?: string;
}

export interface CreateTeamData {
  name: string;
  group_link?: string | null;
}

export interface TeamStudent {
  id: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  role: string;
  study_group: string;
}

export interface AddStudentToTeamData {
  student_id: string;
  role: string;
  study_group: string;
}

export interface UpdateStudentData {
  role?: string;
  study_group?: string;
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

export const parseFullName = (fullName: string): { last_name: string; first_name: string; patronymic?: string } => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { last_name: '', first_name: '' };
  if (parts.length === 1) return { last_name: parts[0], first_name: '' };
  if (parts.length === 2) return { last_name: parts[0], first_name: parts[1] };
  return {
    last_name: parts[0],
    first_name: parts[1],
    patronymic: parts.slice(2).join(' ')
  };
};

export const createTeam = async (data: CreateTeamData): Promise<Team> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

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

export const getTeams = async (filters?: {
  project_id?: string;
  project_team_status?: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN' | 'PENDING';
}): Promise<TeamSummaryResponse> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const queryParams = new URLSearchParams();
  if (filters?.project_id) queryParams.append('project_id', filters.project_id);
  
  // Добавляем фильтр по статусу команд
  if (filters?.project_team_status) {
    queryParams.append('project_team_status', filters.project_team_status);
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/teams${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get teams');
  }

  return response.json();
};

export const getTeamById = async (teamId: string): Promise<Team> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get team');
  }

  return response.json();
};

export const deleteTeam = async (teamId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to delete team');
  }
};

export const addStudentToTeam = async (teamId: string, data: AddStudentToTeamData): Promise<TeamStudent> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

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

  return response.json();
};

export const updateStudentInTeam = async (
  teamId: string,
  studentId: string,
  data: UpdateStudentData
): Promise<TeamStudent> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/students/${studentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update student in team');
  }

  return response.json();
};

export const updateTeam = async (teamId: string, data: Partial<CreateTeamData>): Promise<Team> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

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
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/students/${studentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to remove student from team');
  }
};

export const getTeamProjects = async (teamId: string): Promise<Project[]> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/projects?team_id=${teamId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get team projects');
  }

  const  { projects }: { projects: Project[] } = await response.json();
  return projects;
};

export const getTeamProjectsWithDetails = async (teamId: string): Promise<Project[]> => {
  return await getTeamProjects(teamId);
};