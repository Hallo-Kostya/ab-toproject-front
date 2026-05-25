const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';

export type SearchResultType = 'project' | 'team';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  name: string;
  description: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export interface StudentSearchResult {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  study_group?: string;
}

export const searchEntities = async (
  query: string,
  options?: { limit?: number }
): Promise<SearchResult[]> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q: query.trim(),
    limit: options?.limit?.toString() || '20'
  });

  const response = await fetch(`${API_BASE_URL}/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Search failed');
  }

  return response.json();
};

export const searchStudents = async (
  query: string,
  options?: { limit?: number }
): Promise<StudentSearchResult[]> => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token');

  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q: query.trim(),
    limit: options?.limit?.toString() || '20'
  });

  const response = await fetch(`${API_BASE_URL}/search/students?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Student search failed');
  }

  return response.json();
};