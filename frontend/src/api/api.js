import axios from 'axios';

const API = axios.create({
  baseURL: 'https://construction-safety-system.onrender.com',
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ───────────────────────────────────────────────
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// ── Job Roles ──────────────────────────────────────────
export const getJobRoles = () => API.get('/job-roles/');

// ── Training ───────────────────────────────────────────
export const getPrograms = () => API.get('/training/programs');
export const getProgram = (id) => API.get(`/training/programs/${id}`);
export const createProgram = (data) => API.post('/training/programs', data);
export const addVideo = (programId, data) =>
  API.post(`/training/programs/${programId}/videos`, data);
export const deleteProgram = (id) => API.delete(`/training/programs/${id}`);

// ── Progress ───────────────────────────────────────────
export const updateProgress = (videoId, data) =>
  API.post(`/progress/video/${videoId}`, data);
export const getTrainingStatus = (programId) =>
  API.get(`/progress/training/${programId}`);
export const getMyProgress = () => API.get('/progress/my-progress');

// ── Quiz ───────────────────────────────────────────────
export const getQuiz = (programId) => API.get(`/quiz/programs/${programId}`);
export const submitQuiz = (programId, data) =>
  API.post(`/quiz/programs/${programId}/submit`, data);
export const createQuiz = (programId, data) =>
  API.post(`/quiz/programs/${programId}`, data);
export const addQuestion = (quizId, data) =>
  API.post(`/quiz/${quizId}/questions`, data);
export const getMyAttempts = () => API.get('/quiz/my-attempts');

// ── Certificates ───────────────────────────────────────
export const generateCertificate = (programId) =>
  API.post(`/certificates/generate/${programId}`);
export const getMyCertificates = () => API.get('/certificates/my-certificates');
export const downloadCertificate = (programId) =>
  API.get(`/certificates/download/${programId}`, { responseType: 'blob' });

// ── Admin ──────────────────────────────────────────────
export const getWorkers = () => API.get('/admin/workers');
export const getWorkerCompliance = (id) =>
  API.get(`/admin/workers/${id}/compliance`);
export const updateEligibility = (id, data) =>
  API.patch(`/admin/workers/${id}/eligibility`, data);
export const deleteWorker = (id) => API.delete(`/admin/workers/${id}`);
export const getReports = () => API.get('/admin/reports');
export const getAllCertificates = () => API.get('/admin/certificates');