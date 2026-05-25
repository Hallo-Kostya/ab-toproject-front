const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';

import { Team } from "@/types/teams/team";
import { TeamSummary, TeamSummaryResponse } from "./teams";

export interface Project {
  teams_count: number;
  members_count: number;
  id: string;
  name: string;
  description: string;
  goal?: string | null;
  requirements?: string | null;
  eval_criteria?: string | null;
  semester: string;
  status: string;
  year: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
}

export interface CreateProjectData {
  name: string;
  description: string;
  goal: string;
  requirements: string;
  eval_criteria: string;
  year?: number;
  semester?: string;
  status?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string | null;
  goal?: string | null;
  requirements?: string | null;
  eval_criteria?: string | null;
  year?: number;
  semester?: string;
  status?: string;
}

export interface ProjectTeam {
  id: string;
  project_id: string;
  team_id: string;
  assigned_at: string;
  status: string;
  role_in_project: string;
}

export interface ProjectTeamWithTeam extends ProjectTeam {
  team: Team;
}

export interface AssignTeamData {
  team_id: string;
  role_in_project?: string;
  status?: string;
}

// --- API Functions ---

export const createProject = async (data: CreateProjectData): Promise<Project> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create project');
  }

  return response.json();
};

export const getProjects = async (filters?: {
  year?: number;
  semester?: string;
  team_id?: string;
  project_team_status?: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN' | 'PENDING';
}): Promise<ProjectsResponse> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const queryParams = new URLSearchParams();
  if (filters?.year) queryParams.append('year', filters.year.toString());
  if (filters?.semester) queryParams.append('semester', filters.semester);
  if (filters?.team_id) queryParams.append('team_id', filters.team_id);
  
  // Добавляем параметр статуса команд
  if (filters?.project_team_status) {
    queryParams.append('project_team_status', filters.project_team_status);
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/projects${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get projects');
  }

  return response.json();
};

export const getProjectById = async (projectId: string): Promise<Project> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get project');
  }

  return response.json();
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to delete project');
  }
};

export const updateProject = async (projectId: string, data: UpdateProjectData): Promise<Project> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  console.log('[Projects] updateProject payload:', JSON.stringify(data, null, 2));

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Projects] updateProject failed:', response.status, errorData);
    throw new Error(errorData.detail || 'Failed to update project');
  }

  return response.json();
};

export const getProjectTeams = async (
  projectId: string, 
  options?: { 
    project_team_status?: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN' | 'PENDING' 
  }
): Promise<TeamSummary[]> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  // Формируем query params
  const queryParams = new URLSearchParams({
    project_id: projectId
  });
  
  // Добавляем фильтр по статусу, если передан
  if (options?.project_team_status) {
    queryParams.append('project_team_status', options.project_team_status);
  }

  const response = await fetch(`${API_BASE_URL}/teams?${queryParams.toString()}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get project teams');
  }

  const data: TeamSummaryResponse = await response.json();
  return data.teams;
};

export const assignTeamToProject = async (projectId: string, data: AssignTeamData): Promise<ProjectTeam> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to assign team to project');
  }

  return response.json();
};

export const removeTeamFromProject = async (projectId: string, teamId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/teams/${teamId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to remove team from project');
  }
};

export const autoFillProjectWithAI = async (
  data: Partial<CreateProjectData>
): Promise<CreateProjectData> => {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(`${API_BASE_URL}/ai/auto-fill-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'AI auto-fill failed');
  }

  return response.json();
};