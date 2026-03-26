/**
 * Axios instance with interceptors.
 * - Adds JWT access token to all requests
 * - Auto-refreshes token on 401 responses
 * - Retries original request after refresh
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true, // Send cookies (refresh token)
  headers: { 'Content-Type': 'application/json' },
});

/** Store the access token in memory (not localStorage for security) */
let accessToken = null;

/** Track if we're currently refreshing to avoid race conditions */
let isRefreshing = false;
let failedQueue = [];

/**
 * Process the queue of failed requests after token refresh.
 */
function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

/**
 * Set the current access token (called after login/register/refresh).
 * @param {string|null} token
 */
export function setAccessToken(token) {
  accessToken = token;
}

/**
 * Get the current access token.
 * @returns {string|null}
 */
export function getAccessToken() {
  return accessToken;
}

// ──────────────────────────────────────────────────
// REQUEST INTERCEPTOR — add Authorization header
// ──────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ──────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — handle 401 + auto-refresh
// ──────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If it's a 401 and not already a retry and not the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue this request — it'll be retried after refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        
        // Only redirect to login if the original request was NOT /auth/me
        // /auth/me is used for initial load check, we don't want to redirect them 
        // if they just visit the landing page unauthenticated
        if (!originalRequest.url?.includes('/auth/me')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
