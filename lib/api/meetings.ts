const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api/v1';

export interface Meeting {
  id: string;
  name: string;
  resume: string;
  date: string;
  status: string;
  team_id: string;
  previous_meeting_id: string | null;
  next_meeting_id: string | null;
}

export interface CreateMeetingData {
  name: string;
  resume: string;
  date: string;
  team_id: string;
  status: string;
  previous_meeting_id: string | null;
}

export interface Task {
  id: string;
  description: string;
  is_completed: boolean;
}

export interface CreateTaskData {
  description: string;
}

export const createMeeting = async (data: CreateMeetingData): Promise<Meeting> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

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

export const getMeetingsByTeamId = async (teamId: string): Promise<Meeting[]> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const params = new URLSearchParams({ team_id: teamId });
  const response = await fetch(`${API_BASE_URL}/meetings?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get meetings');
  }

  return response.json();
};

export const getMeetingById = async (meetingId: string): Promise<Meeting> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get meeting');
  }

  return response.json();
};

export const updateMeeting = async (meetingId: string, data: Partial<CreateMeetingData>): Promise<Meeting> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  console.log('Updating meeting with data:', data); // Для отладки

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
    console.error('Update meeting error:', errorData);
    throw new Error(errorData.detail || 'Failed to update meeting');
  }

  return response.json();
};

export const deleteMeeting = async (meetingId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete meeting');
  }
};

// Задачи для встреч
export const createTask = async (meetingId: string, data: CreateTaskData): Promise<Task> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/tasks`, {
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

export const getTasksByMeetingId = async (meetingId: string): Promise<Task[]> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/tasks`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get tasks');
  }

  return response.json();
};

export const deleteTask = async (meetingId: string, taskId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete task');
  }
};