import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BASE_DJANGO_URL || 'http://127.0.0.1:8000';
console.log('depuis axios conf base url', API_BASE_URL)

// Récupération du token CSRF depuis les cookies
const getCSRFToken = () => {
  const match = document.cookie.match(/(?:^|; )csrftoken=([^|;]*)/);
  return match ? match[1] : null;
};

// Récupération d'un nouveau token CSRF
const fetchCSRFToken = async () => {
  try {
    await axios.get(`${API_BASE_URL}/user/csrf/`, { withCredentials: true });
    return getCSRFToken();
  } catch (error) {
    console.error('Erreur CSRF:', error);
    return null;
  }
};

// Récupération des tokens d'authentification
const getAuthTokens = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    return stored ? JSON.parse(stored)?.state?.tokens : null;
  } catch (error) {
    console.error('Erreur auth storage:', error);
    return null;
  }
};

// Instance Axios configurée
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
});

// Intercepteur de requêtes
apiClient.interceptors.request.use(async (config) => {
  // Ajout du CSRF token pour les méthodes modifiantes
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    let csrfToken = getCSRFToken();
    if (!csrfToken) csrfToken = await fetchCSRFToken();
    if (csrfToken) config.headers['X-CSRFToken'] = csrfToken;
  }

  // Ajout du token d'authentification
  const tokens = getAuthTokens();
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  
  return config;
});

// Intercepteur de réponses
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Gestion CSRF
    if (error.response?.status === 403 && error.response?.data?.detail?.includes('CSRF')) {
      const newCsrfToken = await fetchCSRFToken();
      if (newCsrfToken) {
        originalRequest.headers['X-CSRFToken'] = newCsrfToken;
        return apiClient(originalRequest);
      }
    }

    // Refresh token sur erreur 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const tokens = getAuthTokens();
        const response = await axios.post(`${API_BASE_URL}/user/token/refresh/`, {
          refresh: tokens?.refresh,
        }, { withCredentials: true });

        const { access, refresh } = response.data;
        
        // Mise à jour du storage
        const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        stored.state.tokens = { ...stored.state.tokens, access, refresh };
        localStorage.setItem('auth-storage', JSON.stringify(stored));

        // Nouvelle tentative
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;