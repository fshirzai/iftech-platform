/** Same-origin Next.js proxy forwards these requests to the Express API. */
export const API = '/backend';
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = 'ApiError'; }
}
export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const endpoint = `${API}/api/v1${path.startsWith('/') ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...options,
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new ApiError('Cannot reach the IFTECH API gateway. Check API_PROXY_TARGET / NEXT_PUBLIC_API_URL and the backend deployment.', 0);
  }
  const payload: Record<string, unknown> = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof payload.error === 'string' ? payload.error
      : typeof payload.message === 'string' ? payload.message
      : `Request failed (${response.status})`;
    throw new ApiError(detail, response.status);
  }
  return payload as T;
}
export const titleCase = (s: string) => s.replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
