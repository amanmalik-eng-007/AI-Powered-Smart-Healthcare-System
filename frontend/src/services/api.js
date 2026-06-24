import axios from 'axios';

// Base API configuration is covered by Vite proxy during development.
// For production, we can define baseURL:
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ''
});

// Request interceptor to automatically attach JWT token
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

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (data) => api.post('/api/auth/register', data),
  getMe: () => api.get('/api/auth/me'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/api/auth/reset-password/${token}`, { password })
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getDoctors: () => api.get('/api/admin/doctors'),
  updateDoctorStatus: (id, status) => api.put(`/api/admin/doctors/${id}/status`, { status }),
  getPatients: () => api.get('/api/admin/patients'),
  getLogs: () => api.get('/api/admin/logs')
};

// Doctor API
export const doctorAPI = {
  getProfile: () => api.get('/api/doctor/profile'),
  updateProfile: (data) => api.put('/api/doctor/profile', data),
  getAppointments: () => api.get('/api/doctor/appointments')
};

// Patient API
export const patientAPI = {
  getProfile: () => api.get('/api/patient/profile'),
  updateProfile: (data) => api.put('/api/patient/profile', data),
  getDoctors: (params) => api.get('/api/patient/doctors', { params })
};

// Appointment API
export const appointmentAPI = {
  book: (data) => api.post('/api/appointments', data),
  getMy: () => api.get('/api/appointments/my-appointments'),
  reschedule: (id, date, timeSlot) => api.put(`/api/appointments/${id}/reschedule`, { date, timeSlot }),
  cancel: (id) => api.put(`/api/appointments/${id}/cancel`),
  updateStatus: (id, status) => api.put(`/api/appointments/${id}/status`, { status })
};

// Prescription API
export const prescriptionAPI = {
  create: (data) => api.post('/api/prescriptions', data),
  getByAppointment: (appointmentId) => api.get(`/api/prescriptions/appointment/${appointmentId}`),
  getMy: () => api.get('/api/prescriptions/my-prescriptions'),
  downloadPDF: (id) => `${window.location.origin}/api/prescriptions/${id}/pdf`
};

// Report API
export const reportAPI = {
  upload: (formData) => api.post('/api/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-tdata' }
  }),
  getMy: () => api.get('/api/reports/my-reports'),
  analyze: (id) => api.post(`/api/reports/${id}/analyze`)
};

// AI API
export const aiAPI = {
  symptomCheck: (symptoms) => api.post('/api/ai/symptom-check', { symptoms }),
  chat: (message) => api.post('/api/ai/chat', { message })
};

export default api;
