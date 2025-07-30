import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = __DEV__ ? 'http://localhost:5000/api' : 'https://your-production-api.com/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const symptomsAPI = {
  // Submit symptoms for assessment
  submitSymptoms: async (symptomsData) => {
    const response = await apiClient.post('/symptoms/assess', symptomsData);
    return response.data;
  },

  // Get user's assessment history
  getHistory: async (userId) => {
    const response = await apiClient.get(`/symptoms/history/${userId}`);
    return response.data;
  },

  // Get specific assessment
  getAssessment: async (assessmentId) => {
    const response = await apiClient.get(`/symptoms/assessment/${assessmentId}`);
    return response.data;
  },
};

export const userAPI = {
  // Create or get user
  createUser: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Get user profile
  getUser: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },
};

export default apiClient;
