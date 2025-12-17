import api from './api';
import { DocumentVersion, CreateVersionRequest } from '../types/document';

/**
 * Document Version Service - Handles version management and content operations
 */

export interface VersionSaveRequest {
  content_html: string;
  lock_token?: string;
  is_autosave?: boolean;
  change_summary?: string;
}

export interface VersionSaveResponse {
  version: DocumentVersion;
  content_hash: string;
  saved_at: string;
}

const versionService = {
  /**
   * Create a new version (Draft)
   */
  async create(documentId: number, data: CreateVersionRequest): Promise<DocumentVersion> {
    const response = await api.post<DocumentVersion>(
      `/documents/${documentId}/versions`,
      data
    );
    return response.data;
  },

  /**
   * Get version by ID
   */
  async getById(versionId: number): Promise<DocumentVersion> {
    const response = await api.get<DocumentVersion>(`/document-versions/${versionId}`);
    return response.data;
  },

  /**
   * Get all versions for a document
   */
  async listByDocument(documentId: number): Promise<DocumentVersion[]> {
    const response = await api.get<{ items?: DocumentVersion[]; versions?: DocumentVersion[] }>(
      `/documents/${documentId}/versions`
    );
    // Support both 'items' (new) and 'versions' (old) for backwards compatibility
    return response.data.items || response.data.versions || [];
  },

  /**
   * Get latest version for a document
   * Note: List endpoint doesn't return content_html, so we fetch full version after
   */
  async getLatest(documentId: number): Promise<DocumentVersion> {
    // Step 1: Get list to find latest version ID
    const listResponse = await api.get<{ items?: DocumentVersion[]; versions?: DocumentVersion[] }>(
      `/documents/${documentId}/versions`,
      { params: { page: 1, page_size: 1 } }
    );
    
    const versions = listResponse.data.items || listResponse.data.versions || [];
    if (versions.length === 0) {
      throw new Error('No versions found for this document');
    }
    
    const latestVersionId = versions[0].id;
    
    // Step 2: Fetch FULL version with content_html
    const fullVersionResponse = await api.get<DocumentVersion>(
      `/documents/${documentId}/versions/${latestVersionId}`
    );
    
    return fullVersionResponse.data;
  },

  /**
   * Update version metadata
   */
  async update(documentId: number, versionId: number, data: any): Promise<DocumentVersion> {
    const response = await api.patch<DocumentVersion>(
      `/documents/${documentId}/versions/${versionId}`,
      data
    );
    return response.data;
  },

  /**
   * Save version content (manual or autosave)
   */
  async saveContent(documentId: number, versionId: number, data: VersionSaveRequest): Promise<VersionSaveResponse> {
    const response = await api.post<VersionSaveResponse>(
      `/documents/${documentId}/versions/${versionId}/save`,
      data
    );
    return response.data;
  },

  /**
   * Get version content HTML
   */
  async getContent(versionId: number): Promise<string> {
    const version = await this.getById(versionId);
    return version.content_html || '';
  },

  /**
   * Submit version for review (change status)
   * Requires password for e-signature
   */
  async submitForReview(documentId: number, versionId: number, data: { password: string; comments?: string }): Promise<DocumentVersion> {
    const response = await api.post<DocumentVersion>(
      `/documents/${documentId}/versions/${versionId}/submit`,
      data
    );
    return response.data;
  },

  /**
   * Approve version (Reviewer or Approver)
   * Requires password for e-signature
   */
  async approve(documentId: number, versionId: number, data: { password: string; comments?: string }): Promise<DocumentVersion> {
    const response = await api.post<DocumentVersion>(
      `/documents/${documentId}/versions/${versionId}/approve`,
      data
    );
    return response.data;
  },

  /**
   * Reject version (return to Draft)
   * Requires password for e-signature
   */
  async reject(documentId: number, versionId: number, data: { password: string; comments: string }): Promise<DocumentVersion> {
    const response = await api.post<DocumentVersion>(
      `/documents/${documentId}/versions/${versionId}/reject`,
      data
    );
    return response.data;
  },

  /**
   * Publish version (Admin only)
   * Requires password for e-signature
   */
  async publish(documentId: number, versionId: number, data: { password: string }): Promise<DocumentVersion> {
    const response = await api.post<DocumentVersion>(
      `/documents/${documentId}/versions/${versionId}/publish`,
      data
    );
    return response.data;
  },

  /**
   * Archive version (Admin only)
   * Requires password for e-signature
   */
  async archive(documentId: number, versionId: number, data: { password: string }): Promise<DocumentVersion> {
    const response = await api.post<DocumentVersion>(
      `/documents/${documentId}/versions/${versionId}/archive`,
      data
    );
    return response.data;
  },

  /**
   * Create new version from existing Effective version
   * This is the main versioning endpoint for controlled document versioning
   */
  async createNewVersion(
    documentId: number, 
    versionId: number, 
    data: { change_reason: string; change_type: 'Minor' | 'Major' }
  ): Promise<DocumentVersion> {
    const response = await api.post<DocumentVersion>(
      `/documents/${documentId}/versions/${versionId}/create-new`,
      data
    );
    return response.data;
  },

  /**
   * Get full version history tree including obsolete versions
   */
  async getVersionHistory(documentId: number): Promise<DocumentVersion[]> {
    const response = await api.get<DocumentVersion[]>(
      `/documents/${documentId}/versions/history`
    );
    return response.data;
  },

  /**
   * Get versions with filtering options
   */
  async listWithFilters(
    documentId: number, 
    options?: {
      include_obsolete?: boolean;
      status_filter?: string;
      page?: number;
      page_size?: number;
    }
  ): Promise<{ versions: DocumentVersion[]; total: number }> {
    const response = await api.get<{ versions: DocumentVersion[]; total: number }>(
      `/documents/${documentId}/versions`,
      { params: options }
    );
    return response.data;
  },

  /**
   * Mark document version as viewed by current user
   * Required before performing workflow actions (approve, reject, publish)
   */
  async markAsViewed(documentId: number, versionId: number): Promise<{ message: string; viewed_at: string }> {
    const response = await api.post<{ message: string; viewed_at: string }>(
      `/documents/${documentId}/versions/${versionId}/mark-viewed`
    );
    return response.data;
  },
};

export default versionService;

