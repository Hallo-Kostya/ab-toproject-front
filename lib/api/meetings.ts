const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';


export interface Meeting {
  id: string;
  name: string;
  resume: string;
  date: string;
  status: string;
  team_id: string;
  previous_meeting_id: string | null;
  next_meeting_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MeetingsResponse {
  items: Meeting[];
  total: number;
}

export interface CreateMeetingData {
  name: string;
  resume: string;
  date: string;
  team_id: string;
  status: string;
  previous_meeting_id?: string | null;
}

export interface UpdateMeetingData {
  name?: string;
  resume?: string;
  date?: string;
  status?: string;
  previous_meeting_id?: string | null;
  next_meeting_id?: string | null;
}

export interface TaskResponse {
  meeting_id: string;
  task_id: string;
  description: string;
  is_completed: boolean;
}


export const createMeeting = async (data: CreateMeetingData): Promise<Meeting> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/meetings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create meeting');
  }

  return response.json();
};

export const getMeetings = async (filters?: {
  team_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<Meeting[]> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const queryParams = new URLSearchParams();
  if (filters?.team_id) queryParams.append('team_id', filters.team_id);
  if (filters?.start_date) queryParams.append('start_date', filters.start_date);
  if (filters?.end_date) queryParams.append('end_date', filters.end_date);

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/meetings${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get meetings');
  }

  const data: MeetingsResponse = await response.json();
  return data.items;
};

export const getMeetingById = async (meetingId: string): Promise<Meeting> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to get meeting ${meetingId}`);
  }

  return response.json();
};

export const updateMeeting = async (meetingId: string, data: UpdateMeetingData): Promise<Meeting> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update meeting');
  }

  return response.json();
};

export const deleteMeeting = async (meetingId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to delete meeting');
  }
};

export const addTaskToMeeting = async (
  meetingId: string,
  taskData: { description: string }
): Promise<TaskResponse> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to add task to meeting');
  }

  return response.json();
};

export const removeTaskFromMeeting = async (
  meetingId: string,
  taskId: string
): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to remove task from meeting');
  }
};