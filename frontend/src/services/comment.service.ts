/**
 * Comment Service
 * Handles inline comments and annotations
 */
import api from './api';
import { DocumentComment, CommentCreate, CommentListResponse } from '../types/document';

const API_BASE = '/documents';

export const commentService = {
  /**
   * Create a comment on a document version
   */
  async create(documentId: number, versionId: number, data: CommentCreate): Promise<DocumentComment> {
    const response = await api.post<DocumentComment>(
      `${API_BASE}/${documentId}/versions/${versionId}/comments`,
      data
    );
    return response.data;
  },

  /**
   * List all comments for a version
   */
  async list(documentId: number, versionId: number, includeResolved = false): Promise<CommentListResponse> {
    const response = await api.get<CommentListResponse>(
      `${API_BASE}/${documentId}/versions/${versionId}/comments`,
      { params: { include_resolved: includeResolved } }
    );
    return response.data;
  },

  /**
   * Update a comment
   */
  async update(
    documentId: number,
    versionId: number,
    commentId: number,
    data: { comment_text?: string; is_resolved?: boolean }
  ): Promise<DocumentComment> {
    const response = await api.patch<DocumentComment>(
      `${API_BASE}/${documentId}/versions/${versionId}/comments/${commentId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a comment
   */
  async delete(documentId: number, versionId: number, commentId: number): Promise<void> {
    await api.delete(`${API_BASE}/${documentId}/versions/${versionId}/comments/${commentId}`);
  },

  /**
   * Resolve a comment
   */
  async resolve(documentId: number, versionId: number, commentId: number): Promise<DocumentComment> {
    return this.update(documentId, versionId, commentId, { is_resolved: true });
  },

  /**
   * Unresolve a comment
   */
  async unresolve(documentId: number, versionId: number, commentId: number): Promise<DocumentComment> {
    return this.update(documentId, versionId, commentId, { is_resolved: false });
  }
};

export default commentService;

