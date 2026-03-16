/**
 * Client HTTP centralisé pour toutes les requêtes vers le backend GestEMC
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function getToken(): string | null {
  return localStorage.getItem('auth-token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('2si-auth-user');
    window.location.href = '/login';
    throw new Error('Session expirée, veuillez vous reconnecter.');
  }

  if (response.status === 204) return null as T;

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || `Erreur ${response.status}`);
  }

  return body as T;
}

export const apiClient = {
  get: <T>(url: string, params?: Record<string, string | number | undefined>) => {
    const filtered = Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== '')
    ) as Record<string, string>;
    const query = Object.keys(filtered).length
      ? '?' + new URLSearchParams(filtered).toString()
      : '';
    return request<T>(`${url}${query}`);
  },

  post: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),

  postForm: async <T>(url: string, formData: FormData): Promise<T> => {
    const token = getToken();
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Erreur ${response.status}`);
    }
    return response.json() as Promise<T>;
  },

  downloadBlob: async (url: string, filename: string): Promise<void> => {
    const token = getToken();
    const response = await fetch(`${API_BASE}${url}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  },
};
