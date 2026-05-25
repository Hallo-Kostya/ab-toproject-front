export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type Semester = 'AUTUMN' | 'SPRING';
export type ApplicationStatus = 'SEEN' | 'UNSEEN' | 'ACCEPTED' | 'DECLINED';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED';

export interface Project {
  id: string;
  name: string;
  description: string;
  goal: string;
  requirements: string;
  eval_criteria: string;
  year: number;
  semester: Semester;
  status: ProjectStatus;
}

export interface TeamMember {
  id?: string;
  fullname: string;
  role: string;
  study_group: string;
}

export interface Interview {
  id: string;
  name: string;
  date: string;
  status: InterviewStatus;
  resume: string;
}

export interface ProjectApplication {
  id: string;
  mean_project_score: number;
  project_id: string;
  project?: Project;
  team_name: string;
  status: ApplicationStatus;
  description: string;
  members: TeamMember[];
  interview?: Interview | null;
  vk_sender_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectApplicationLimited {
  id: string;
  mean_project_score: number;
  project_id: string;
  team_name: string;
  status: ApplicationStatus;
  members: TeamMember[];
  description: string;
  interview_id?: string | null;
  vk_sender_id: number;
}

export interface ProjectApplicationCreate {
  project_id: string;
  vk_sender_id: number;
  team_name: string;
  team_members: Omit<TeamMember, 'id'>[];
  description: string;
  mean_project_score?: number;
  status?: ApplicationStatus;
}

export interface ProjectApplicationUpdate {
  team_members?: TeamMember[];
  team_name?: string;
  status?: ApplicationStatus;
}

export interface ProjectApplicationFilters {
  id?: string;
  project_id?: string;
  team_id?: string;
  vk_sender_id?: number;
  status?: ApplicationStatus;
  last_project_score?: number;
  meeting_id?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';
const BASE_PATH = '/project_applications';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail?.[0]?.msg || `HTTP ${response.status}`);
  }

  return response.json();
}

export const getAvailableProjects = async (vk_sender_id: number): Promise<Project[]> => {
  return request<Project[]>(`${BASE_PATH}/${vk_sender_id}/available_projects`);
};

export const createProjectApplication = async (
  data: ProjectApplicationCreate
): Promise<ProjectApplicationLimited> => {
  return request<ProjectApplicationLimited>(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getProjectApplications = async (
  filters?: ProjectApplicationFilters
): Promise<ProjectApplication[]> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  const queryString = params.toString();
  return request<ProjectApplication[]>(`${BASE_PATH}${queryString ? `?${queryString}` : ''}`);
};

export const updateProjectApplication = async (
  application_id: string,
  data: ProjectApplicationUpdate
): Promise<ProjectApplicationLimited> => {
  return request<ProjectApplicationLimited>(`${BASE_PATH}/${application_id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteProjectApplication = async (
  application_id: string
): Promise<{ success: string }> => {
  return request<{ success: string }>(`${BASE_PATH}/${application_id}/`, {
    method: 'DELETE',
  });
};