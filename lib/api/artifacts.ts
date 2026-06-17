const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';
const S3_BASE_URL = process.env.NEXT_PUBLIC_S3_BASE_URL;
const S3_BUCKET_NAME = 'artifacts';

export interface Artifact {
  id: string;
  name: string;
  description?: string;
  file_url?: string;
  link_url?: string;
  s3_key?: string;
  file_type?: string;
  file_size?: number;
  checksum?: string;
  content_type?: string;
  project_id?: string | null;
  meeting_id?: string | null;
  interview_id?: string | null;
  created_at?: string;
  updated_at?: string;
  type?: 'FILE' | 'LINK';
}

export type ArtifactEntityType = 'PROJECT' | 'MEETING' | 'INTERVIEW' | 'TEAM';
export type FileIconType = 'pdf' | 'doc' | 'excel' | 'image' | 'file' | 'link';

// Функция получения полного URL для скачивания
export const getArtifactDownloadUrl = (artifact: Artifact): string | null => {
  // Если бэк уже вернул готовый URL — используем его
  if (artifact.file_url) return artifact.file_url;
  
  // Если есть s3_key - конструируем URL с указанием бакета
  if (artifact.s3_key && S3_BASE_URL && S3_BUCKET_NAME) {
    return `${S3_BASE_URL}/${S3_BUCKET_NAME}/${artifact.s3_key}`;
  }
  
  return null;
};

// Определяет тип иконки по имени файла или content-type
export const getFileIconType = (artifact: Partial<Artifact>): FileIconType => {
  if (artifact.type === 'LINK' || (artifact.link_url && !artifact.s3_key)) return 'link';
  
  const name = artifact.name?.toLowerCase() || '';
  const type = artifact.content_type?.toLowerCase() || '';

  if (name.endsWith('.pdf') || type.includes('pdf')) return 'pdf';
  if (['.doc', '.docx'].some(ext => name.endsWith(ext)) || type.includes('word') || type.includes('document')) return 'doc';
  if (['.xls', '.xlsx', '.csv'].some(ext => name.endsWith(ext)) || type.includes('excel') || type.includes('spreadsheet')) return 'excel';
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => name.endsWith(ext)) || type.includes('image')) return 'image';
  
  return 'file';
};

// Получить список артефактов с фильтрами
export const getArtifacts = async (filters?: {
  project_id?: string;
  meeting_id?: string;
  interview_id?: string;
}): Promise<Artifact[]> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const queryParams = new URLSearchParams();
  if (filters?.project_id) queryParams.append('project_id', filters.project_id);
  if (filters?.meeting_id) queryParams.append('meeting_id', filters.meeting_id);
  if (filters?.interview_id) queryParams.append('interview_id', filters.interview_id);

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/artifacts${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get artifacts');
  }

  return response.json();
};

// Загрузить файл-артефакт для проекта
export const uploadProjectArtifact = async (
  projectId: string,
  file: File
): Promise<Artifact> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/artifacts/project/${projectId}/artifacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload project artifact');
  }

  return response.json();
};

// Загрузить файл-артефакт для встречи
export const uploadMeetingArtifact = async (
  meetingId: string,
  file: File
): Promise<Artifact> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/artifacts/meeting/${meetingId}/artifacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload meeting artifact');
  }

  return response.json();
};

// Загрузить файл-артефакт для собеседования
export const uploadInterviewArtifact = async (
  interviewId: string,
  file: File
): Promise<Artifact> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/artifacts/interview/${interviewId}/artifacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload interview artifact');
  }

  return response.json();
};

// Открепить артефакт от сущности
export const detachArtifact = async (
  artifactId: string,
  entityType: ArtifactEntityType,
  entityId: string
): Promise<void> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  const queryParams = new URLSearchParams({
    entity_type: entityType,
    entity_id: entityId
  });

  const response = await fetch(
    `${API_BASE_URL}/artifacts/${artifactId}/links?${queryParams.toString()}`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Failed to detach artifact');
  }
};

// Полное удаление артефакта
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

// Форматирование размера файла
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} ГБ`;
};

// Универсальная функция скачивания файла (работает даже при CORS)
export const downloadArtifact = async (
  fileUrl: string, 
  fileName: string, 
  accessToken?: string
): Promise<void> => {
  const token = accessToken || localStorage.getItem('access_token');
  
  try {
    // Прямой fetch к хранилищу (требует, чтобы MinIO разрешал CORS и публичный доступ к объектам)
    const response = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        // MinIO не понимает Bearer-токены приложения
        // Если объекты приватные - нужен presigned URL от бэкенда
        // Пока пробуем без авторизации, если бакет публичный
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Fetch failed: ${response.status} ${response.statusText} ${errorText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.warn('Blob download failed, trying direct open:', error);
    
    // Фолбэк: открыть в новой вкладке (если файл публичный - пользователь скачает вручную)
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  }
};

// Функция добавления link-артефакта (требует поддержки на бэкенде)
export const addMeetingLinkArtifact = async (
  meetingId: string,
  linkUrl: string,
  name?: string
): Promise<Artifact> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  // Этот эндпоинт должен быть добавлен на бэкенде
  const response = await fetch(`${API_BASE_URL}/artifacts/meeting/${meetingId}/artifacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      link_url: linkUrl,
      name: name || linkUrl,
      type: 'LINK',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to add link artifact');
  }

  return response.json();
};