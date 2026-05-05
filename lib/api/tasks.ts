const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';


export interface Task {
  id: string;
  description: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTaskData {
  description: string;
}

export interface UpdateTaskData {
  description?: string | null;
  is_completed?: boolean | null;
}


export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create task');
  }

  return response.json();
};

export const getTasks = async (filters?: {
  meeting_id?: string;
}): Promise<Task[]> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const queryParams = new URLSearchParams();
  if (filters?.meeting_id) queryParams.append('meeting_id', filters.meeting_id);

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/tasks${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get tasks');
  }

  return response.json();
};

export const getTaskById = async (taskId: string): Promise<Task> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to get task ${taskId}`);
  }

  return response.json();
};

export const updateTask = async (taskId: string, data: UpdateTaskData): Promise<Task> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const body: Record<string, any> = {};
  if (data.description !== undefined) body.description = data.description;
  if (data.is_completed !== undefined) body.is_completed = data.is_completed;

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update task');
  }

  return response.json();
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to delete task');
  }
};

export const moveTaskToNextMeeting = async (taskId: string): Promise<Task> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/move-to-next-meeting`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 400 && errorData.detail?.includes('предстоящих встреч')) {
      throw new Error('Нет предстоящих встреч, на которые можно перенести задачу');
    }
    throw new Error(errorData.detail || 'Failed to move task to next meeting');
  }

  return response.json();
};