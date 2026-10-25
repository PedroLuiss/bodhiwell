import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      const isAuthPath = originalRequest.url?.includes('/api/auth/token/refresh') || 
                         originalRequest.url?.includes('/api/auth/jwt-login');
      
      if (isAuthPath) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        isRefreshing = false;
        logout();
        return Promise.reject(error);
      }

      try {
        const refreshUrl = `${API_URL}/api/auth/token/refresh`.replace(/([^:])\/\//g, '$1/');
        const response = await axios.post(refreshUrl, { 
          refresh_token: refreshToken
        });

        if (response.status === 200 && response.data.token) {
          const newToken = response.data.token;
          localStorage.setItem('token', newToken);
          
          if (response.data.refresh_token) {
            localStorage.setItem('refresh_token', response.data.refresh_token);
          }

          window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: { token: newToken } }));

          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          processQueue(null, newToken);
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
       logout();
    }
    
    return Promise.reject(error);
  }
);

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  
  window.dispatchEvent(new Event('auth:logout'));

  if (window.location.pathname !== '/login' && 
      window.location.pathname !== '/' && 
      !window.location.pathname.startsWith('/home')) {
    window.location.href = '/login';
  }
}

export default axiosInstance;
