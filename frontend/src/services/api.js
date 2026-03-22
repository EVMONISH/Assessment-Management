import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
};

// Assignment API
export const assignmentAPI = {
    create: (data) => api.post('/assignments', data),
    getAll: () => api.get('/assignments'),
    delete: (id) => api.delete(`/assignments/${id}`),
};

// Exam API
export const examAPI = {
    create: (data) => api.post('/exams', data),
    getAll: () => api.get('/exams'),
    delete: (id) => api.delete(`/exams/${id}`),
};

// Marks API
export const marksAPI = {
    add: (data) => api.post('/marks', data),
    getAll: () => api.get('/marks'),
    getStudentMarks: () => api.get('/marks/student'),
};

export default api;