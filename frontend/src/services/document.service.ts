import api from './api';
import { Document, CreateDocumentRequest, UpdateDocumentRequest } from '../types/document';

/**
 * Document Service - Handles all document metadata CRUD operations
 */

export interface DocumentListResponse {
  items: Document[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface DocumentSearchParams {
  skip?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  show_all_statuses?: boolean;
}

const documentService = {
  /**
   * Create a new document (metadata only)
   */
  async create(data: CreateDocumentRequest): Promise<Document> {
    const response = await api.post<Document>('/documents/', data);
    return response.data;
  },

  /**
   * Get paginated list of documents
   */
  async list(params?: DocumentSearchParams): Promise<DocumentListResponse> {
    const response = await api.get<DocumentListResponse>('/documents/', { params });
    return response.data;
  },

  /**
   * Get document details by ID (includes versions)
   */
  async getById(id: number): Promise<Document> {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
  },

  /**
   * Update document metadata
   */
  async update(id: number, data: UpdateDocumentRequest): Promise<Document> {
    const response = await api.patch<Document>(`/documents/${id}`, data);
    return response.data;
  },

  /**
   * Delete document (soft delete)
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  /**
   * Search documents (client-side for now, can be backend later)
   */
  async search(query: string): Promise<Document[]> {
    const response = await this.list({ search: query });
    return response.items;
  },

  /**
   * Get documents by department
   */
  async getByDepartment(department: string): Promise<Document[]> {
    const response = await this.list({ department });
    return response.items;
  },

  /**
   * Get documents by status
   */
  async getByStatus(status: string): Promise<Document[]> {
    const response = await this.list({ status });
    return response.items;
  },
};

export default documentService;

