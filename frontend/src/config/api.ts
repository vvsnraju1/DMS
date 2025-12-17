export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
  // Auth
  login: '/auth/login',
  logout: '/auth/logout',
  me: '/auth/me',
  
  // Users
  users: '/users',
  userById: (id: number) => `/users/${id}`,
  activateUser: (id: number) => `/users/${id}/activate`,
  deactivateUser: (id: number) => `/users/${id}/deactivate`,
  resetPassword: (id: number) => `/users/${id}/reset-password`,
  
  // Audit Logs
  auditLogs: '/audit-logs',
  auditActions: '/audit-logs/actions',
  auditEntityTypes: '/audit-logs/entity-types',
  
  // Templates
  templates: '/templates',
  templateById: (id: number) => `/templates/${id}`,
  publishedTemplates: '/templates/published',
  templateVersions: (id: number) => `/templates/${id}/versions`,
  templateVersionById: (templateId: number, versionId: number) => `/templates/${templateId}/versions/${versionId}`,
  templateImage: (templateId: number, filename: string) => `/templates/${templateId}/images/${filename}`,
};


