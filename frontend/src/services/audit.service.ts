import api from './api';
import { API_ENDPOINTS } from '@/config/api';
import { AuditLogListResponse, AuditLogFilters } from '@/types';

export const auditService = {
  // Get audit logs with filters
  async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogListResponse> {
    const response = await api.get<AuditLogListResponse>(API_ENDPOINTS.auditLogs, {
      params: filters,
    });
    return response.data;
  },

  // Get available action types
  async getActions(): Promise<string[]> {
    const response = await api.get<{ actions: string[] }>(API_ENDPOINTS.auditActions);
    return response.data.actions;
  },

  // Get available entity types
  async getEntityTypes(): Promise<string[]> {
    const response = await api.get<{ entity_types: string[] }>(
      API_ENDPOINTS.auditEntityTypes
    );
    return response.data.entity_types;
  },
};


