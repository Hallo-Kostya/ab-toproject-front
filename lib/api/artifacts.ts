const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';


export interface Artifact {
  id: string;
  name: string;
  description?: string;
  file_url?: string;
  link_url?: string;
  file_type?: string;
  file_size?: number;
  project_id?: string | null;
  meeting_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLinkArtifactData {
  name: string;
  link_url: string;
  description?: string;
  project_id?: string;
  meeting_id?: string;
}

export interface UpdateArtifactData {
  name?: string;
  description?: string;
}


export const createLinkArtifact = async (data: CreateLinkArtifactData): Promise<Artifact> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/artifacts/link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create link artifact');
  }

  return response.json();
};

export const uploadFileArtifact = async (file: File, metadata?: {
  name?: string;
  description?: string;
  project_id?: string;
  meeting_id?: string;
}): Promise<Artifact> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const formData = new FormData();
  formData.append('file', file);
  if (metadata?.name) formData.append('name', metadata.name);
  if (metadata?.description) formData.append('description', metadata.description);
  if (metadata?.project_id) formData.append('project_id', metadata.project_id);
  if (metadata?.meeting_id) formData.append('meeting_id', metadata.meeting_id);

  const response = await fetch(`${API_BASE_URL}/artifacts/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload file artifact');
  }

  return response.json();
};

export const getArtifact = async (artifactId: string): Promise<Artifact> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/artifacts/${artifactId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to get artifact ${artifactId}`);
  }

  return response.json();
};

export const updateArtifact = async (artifactId: string, data: UpdateArtifactData): Promise<Artifact> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/artifacts/${artifactId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update artifact');
  }

  return response.json();
};

export const deleteArtifact = async (artifactId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/artifacts/${artifactId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to delete artifact');
  }
};


export const attachArtifactToProject = async (artifactId: string, projectId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/artifacts/${artifactId}/projects/${projectId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to attach artifact to project');
  }
};

export const detachArtifactFromProject = async (artifactId: string, projectId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/artifacts/${artifactId}/projects/${projectId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to detach artifact from project');
  }
};

export const attachArtifactToMeeting = async (artifactId: string, meetingId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/artifacts/${artifactId}/meetings/${meetingId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to attach artifact to meeting');
  }
};

export const detachArtifactFromMeeting = async (artifactId: string, meetingId: string): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_BASE_URL}/artifacts/${artifactId}/meetings/${meetingId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to detach artifact from meeting');
  }
};