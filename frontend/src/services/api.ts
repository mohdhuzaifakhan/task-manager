import api from '../lib/api';

// Auth
export const authAPI = {
  signup: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Projects
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post('/projects', data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMembers: (id: string, memberIds: string[]) =>
    api.post(`/projects/${id}/members`, { memberIds }),
  removeMember: (id: string, memberId: string) =>
    api.delete(`/projects/${id}/members/${memberId}`),
};

// Tasks
export const tasksAPI = {
  getAll: (params?: {
    projectId?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    search?: string;
    sortBy?: string;
  }) => api.get('/tasks', { params }),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Dashboard
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

// Activity
export const activityAPI = {
  getRecent: (startDate?: string, endDate?: string) => 
    api.get('/activity', { params: { startDate, endDate } }),
  getByProject: (projectId: string) => api.get(`/activity/project/${projectId}`),
};

// Users
export const usersAPI = {
  getAll: () => api.get('/users'),
};
