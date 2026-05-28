// /lib/api/projectApplications.ts
export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type Semester = 'AUTUMN' | 'SPRING';
export type ApplicationStatus =
  | 'INTERVIEW'
  | 'WAITING_FOR_ACK'
  | 'UNSEEN'
  | 'ACCEPTED'
  | 'DECLINED';
export type InterviewStatus = 'NEW' | 'WAITING' | 'RATING' | 'RATED' | 'CANCELED';
export type ArtifactType = 'FILE' | string;

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

export interface InterviewArtifact {
  id: string;
  name: string;
  description: string;
  type: ArtifactType;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  name: string;
  date: string;
  status: string;
  interview_status: InterviewStatus;
  artifacts: InterviewArtifact[];
  url: string | null;
  curators_rate: number | null;
  resume: string | null;
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
  vk_sender_id?: number;
  status?: ApplicationStatus;
  mean_project_score?: number;
  project_name?: string;
  year?: number;
  semester?: Semester;
}

export interface InterviewFilters {
  id?: string;
  project_application_id?: string;
  project_id?: string;
  vk_sender_id?: number;
  project_name?: string;
  year?: number;
  semester?: Semester;
  date?: string;
  curators_rate?: number;
  interview_status?: InterviewStatus[];
}

export interface InterviewUpdatePayload {
  date?: string;
  url?: string;
  curators_rate?: number;
  resume?: string;
  interview_status?: InterviewStatus;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';
const BASE_PATH = '/project_applications';

/**
 * Получение токена авторизации.
 * По умолчанию берётся из localStorage по ключу "token".
 * При необходимости замените источник (cookie, zustand store и т.д.).
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('access_token');
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (options?.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.detail?.[0]?.msg ||
      errorData?.detail ||
      `HTTP ${response.status}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  // Для некоторых PATCH-эндпоинтов бекенд может вернуть пустой ответ
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

function buildQueryString(filters?: Record<string, unknown>): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
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
  const qs = buildQueryString(filters as Record<string, unknown>);
  return request<ProjectApplication[]>(`${BASE_PATH}${qs}`);
};

export const getInterviews = async (
  filters?: InterviewFilters
): Promise<ProjectApplication[]> => {
  const qs = buildQueryString(filters as Record<string, unknown>);
  return request<ProjectApplication[]>(`${BASE_PATH}/interviews/${qs}`);
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

export const changeApplicationStatus = async (
  application_id: string,
  new_status: ApplicationStatus
): Promise<ProjectApplicationLimited> => {
  const qs = buildQueryString({ new_status });
  return request<ProjectApplicationLimited>(
    `${BASE_PATH}/${application_id}/change_status/${qs}`,
    { method: 'PATCH' }
  );
};

export const createInterviewForApplication = async (
  application_id: string,
  interview_date: string
): Promise<Interview> => {
  return request<Interview>(`${BASE_PATH}/${application_id}/interview/`, {
    method: 'POST',
    body: JSON.stringify({ interview_date }),
  });
};

export const updateInterview = async (
  interview_id: string,
  data: InterviewUpdatePayload
): Promise<Interview> => {
  return request<Interview>(`${BASE_PATH}/interviews/${interview_id}/`, {
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