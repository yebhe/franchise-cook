import axios from 'axios';

// Configuration de base
const API_BASE_URL = process.env.BASE_DJANGO_URL || 'http://localhost:8000';

// Fonction pour lire le token CSRF depuis les cookies
const getCSRFToken = () => {
  const match = document.cookie.match(/(?:^|; )csrftoken=([^;]*)/);
  return match ? match[1] : null;
};

// Fonction pour récupérer le token CSRF depuis le serveur
const fetchCSRFToken = async () => {
  try {
    await axios.get(`${API_BASE_URL}/user/csrf/`, {
      withCredentials: true,
    });
    return getCSRFToken();
  } catch (error) {
    console.error('Erreur récupération CSRF token:', error);
    return null;
  }
};

// Création de l'instance Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// 🔐 Fonction pour lire les tokens depuis le localStorage
const getAuthStorage = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Erreur récupération auth-storage:', error);
    return null;
  }
};

// 🔑 Intercepteur pour ajouter les tokens dans chaque requête sortante
apiClient.interceptors.request.use(async (config) => {
  // Ajouter le token CSRF automatiquement pour toutes les requêtes POST/PUT/PATCH/DELETE
  if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
    let csrfToken = getCSRFToken();
    if (!csrfToken) {
      csrfToken = await fetchCSRFToken();
    }
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }

  // Ajouter le token d'authentification
  const parsed = getAuthStorage();
  const accessToken = parsed?.state?.tokens?.access;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});

// 🔁 Intercepteur pour gérer le rafraîchissement automatique du token
apiClient.interceptors.response.use(
  (response) => response, // réponse OK
  async (error) => {
    const originalRequest = error.config;
    
    // Gestion des erreurs CSRF (403)
    if (error.response?.status === 403 && error.response?.data?.detail?.includes('CSRF')) {
      console.warn('CSRF token expiré, récupération d\'un nouveau token...');
      const newCsrfToken = await fetchCSRFToken();
      if (newCsrfToken) {
        originalRequest.headers['X-CSRFToken'] = newCsrfToken;
        return apiClient(originalRequest);
      }
    }
    
    // Si le token a expiré (401) et qu'on n'a pas déjà tenté un refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const parsed = getAuthStorage();
        const refreshToken = parsed?.state?.tokens?.refresh;
        
        if (!refreshToken) {
          console.warn('Aucun refresh token disponible');
          // Rediriger vers la page de connexion ou déclencher logout
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Appel à l'API pour rafraîchir le token
        const response = await axios.post(`${API_BASE_URL}/user/token/refresh/`, {
          refresh: refreshToken,
        }, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': getCSRFToken(),
          }
        });
        
        const { access: newAccessToken, refresh: newRefreshToken } = response.data;
        
        // Mise à jour du localStorage
        parsed.state.tokens.access = newAccessToken;
        if (newRefreshToken) {
          parsed.state.tokens.refresh = newRefreshToken;
        }
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
        
        // Mise à jour de l'en-tête Authorization
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Rejoue la requête originale
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.error('Échec du refresh token:', refreshError);
        
        // Nettoyer le localStorage et rediriger vers login
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;