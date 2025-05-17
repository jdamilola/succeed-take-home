import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Base API client with common configuration for all requests
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow cookies to be sent with requests
});

/**
 * Add an auth token to the request
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

/**
 * Handle API errors consistently
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    // Redirect to login if unauthorized
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear auth token and redirect
      setAuthToken(null);
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    
    return Promise.reject({ 
      message, 
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

/**
 * Type-safe API wrapper with key endpoints
 */
export const api = {
  auth: {
    login: (credentials: { email: string; password: string; schoolDomain?: string }) => 
      apiClient.post('/auth/login', credentials),
    me: () => apiClient.get('/auth/profile'),
  },
  schools: {
    getAll: () => apiClient.get('/schools'),
  },
  competitions: {
    getAll: () => apiClient.get(`/competitions`),
    getById: (id: string) => apiClient.get(`/competitions/${id}`),
    create: (competitionData: {
      name: string;
      description?: string;
      rules?: string;
      visibility?: string;
      startDate?: Date;
      endDate?: Date;
      schoolId: string;
    }) => apiClient.post('/competitions', competitionData),
  },
  participants: {
    join: (competitionId: string) => 
      apiClient.post('/participants', { competitionId }),
    leave: (competitionId: string) => 
      apiClient.delete(`/participants/${competitionId}`),
    getByCompetition: (competitionId: string) => 
      apiClient.get(`/participants/competitions/${competitionId}`),
    getByUser: () => apiClient.get(`/participants/user`),
  },
};
