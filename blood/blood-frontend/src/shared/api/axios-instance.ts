import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import type { QueryClient } from '@tanstack/react-query';

// ---- Local token cache (avoids hitting localStorage on every request) -------
let cachedToken: string | null = typeof window !== 'undefined'
  ? window.localStorage.getItem('token')
  : null;

export function setAuthToken(token: string | null) {
  cachedToken = token;
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem('token', token);
  } else {
    window.localStorage.removeItem('token');
  }
}

// In dev mode we proxy `/api` via Vite to the backend on :8080 (see vite.config.ts),
// so use a relative baseURL. The `VITE_API_URL` env var still lets the caller
// point at a different host (e.g. production) when needed.
export const AXIOS_INSTANCE = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : '',
  timeout: 30_000,  // 30s — protects against indefinite hangs on network failure
});

// Request interceptor reads from the in-memory cache (1 µs) instead of
// hitting `localStorage` (≈100 µs) for every request.
AXIOS_INSTANCE.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// 401 → silent refresh-token retry. Installed lazily so the QueryClient is
// available for cache invalidation.
// ---------------------------------------------------------------------------
type PendingQueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let queue: PendingQueueItem[] = [];
let isRefreshing = false;
let refreshInstalled = false;
let refreshQueryClient: QueryClient | null = null;

async function performRefresh(): Promise<string> {
  const stored = typeof window !== 'undefined'
    ? window.localStorage.getItem('refreshToken')
    : null;
  if (!stored) {
    throw new Error('No refresh token available');
  }

  const response = await AXIOS_INSTANCE.post<{
    data?: { accessToken?: string; refreshToken?: string };
  }>('/api/refresh', { refreshToken: stored });

  const payload = response.data?.data;
  const newToken = payload?.accessToken;
  if (!newToken) {
    throw new Error('Refresh response missing accessToken');
  }
  setAuthToken(newToken);
  if (payload?.refreshToken && typeof window !== 'undefined') {
    window.localStorage.setItem('refreshToken', payload.refreshToken);
  }
  // Tell React Query about the new identity.
  refreshQueryClient?.invalidateQueries({ queryKey: ['/api/me'] });
  return newToken;
}

function installResponseInterceptor() {
  if (refreshInstalled) return;
  refreshInstalled = true;

  AXIOS_INSTANCE.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      const original = error?.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;

      // Skip 401 handling for the refresh endpoint itself or already-retried calls.
      if (status !== 401 || !original || original._retried || original.url?.includes('/api/refresh')) {
        if (status === 401) {
          // Hard logout so the user lands back on the login page.
          setAuthToken(null);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('refreshToken');
            window.localStorage.removeItem('user');
            if (!window.location.pathname.startsWith('/login')) {
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }

      original._retried = true;

      // Coalesce concurrent 401s into a single refresh call.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token) => {
              original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${token}` };
              resolve(AXIOS_INSTANCE(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const token = await performRefresh();
        queue.splice(0).forEach((q) => q.resolve(token));
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${token}` };
        return AXIOS_INSTANCE(original);
      } catch (refreshErr) {
        queue.splice(0).forEach((q) => q.reject(refreshErr));
        setAuthToken(null);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('refreshToken');
          window.localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    },
  );
}

export function installAuthRefresh(queryClient: QueryClient) {
  refreshQueryClient = queryClient;
  installResponseInterceptor();
}

// ---------------------------------------------------------------------------
// Orval-friendly custom instance
// ---------------------------------------------------------------------------
type ExtendedAxiosRequestConfig = AxiosRequestConfig & {
  body?: unknown;
};

export const customInstance = <T>(
  config: ExtendedAxiosRequestConfig | string,
  options?: ExtendedAxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source();

  let requestConfig: ExtendedAxiosRequestConfig;

  if (typeof config === 'string') {
    requestConfig = { url: config, ...options };
  } else {
    requestConfig = { ...config, ...options };
  }

  // Orval uses 'body' but axios uses 'data'
  if (requestConfig.body !== undefined && requestConfig.data === undefined) {
    requestConfig.data = requestConfig.body;
    delete requestConfig.body;
  }

  const promise = AXIOS_INSTANCE({
    ...requestConfig,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore — augmenting promise with cancel for Orval.
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise as Promise<T>;
};