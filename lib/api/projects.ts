const API_BASE_URL = 'http://178.154.228.164:8001/api/v1';
import { Team } from "@/types/teams/team";

export interface Project {
  id: string;
  name: string;
  description: string;
  goal: string;
  requirements: string;
  eval_criteria: string;
  semester: string;
  status: string;
  year: number;
}

export interface CreateProjectData {
  name: string;
  description: string;
  goal: string;
  requirements: string;
  eval_criteria: string;
  year: number;
  semester: string;
  status: string;
}

export interface ProjectTeam {
  id: string;
  project_id: string;
  team_id: string;
  assigned_at: string;
  status: string;
  role_in_project: string;
  // team?: {
  //   id: string;
  //   name: string;
  //   group_link: string;
  // };
}

export interface ProjectTeamWithTeam extends ProjectTeam {
  team: Team; // Теперь мы будем добавлять это поле на фронтенде
}

export interface AssignTeamData {
  team_id: string;
  status: string;
}

export const createProject = async (data: CreateProjectData): Promise<Project> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

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

export const getProjects = async (): Promise<Project[]> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/projects`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get projects');
  }

  return response.json();
};

export const getProjectById = async (projectId: string): Promise<Project> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get project');
  }

  return response.json();
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete project');
  }
};

export const updateProject = async (projectId: string, data: Partial<CreateProjectData>): Promise<Project> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

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
    throw new Error(errorData.detail || 'Failed to update project');
  }

  return response.json();
};

export const getProjectTeams = async (projectId: string): Promise<ProjectTeam[]> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/teams`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get project teams');
  }

  return response.json();
};

export const assignTeamToProject = async (projectId: string, data: AssignTeamData): Promise<ProjectTeam> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

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
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/teams/${teamId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to remove team from project');
  }
};