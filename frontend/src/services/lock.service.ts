import api from './api';
import { EditLock } from '../types/document';

/**
 * Edit Lock Service - Handles document editing locks and concurrency control
 */

export interface AcquireLockRequest {
  document_id: number;
  document_version_id: number;
  lock_duration_minutes?: number;
}

export interface AcquireLockResponse {
  lock: EditLock;
  lock_token: string;
  expires_at: string;
}

export interface RefreshLockRequest {
  document_id: number;
  document_version_id: number;
  lock_token: string;
  extend_minutes?: number;
}

export interface ReleaseLockRequest {
  document_id: number;
  document_version_id: number;
  lock_token: string;
}

export interface CheckLockResponse {
  is_locked: boolean;
  locked_by_username?: string;
  locked_by_user_id?: number;
  lock_expires_at?: string;
  can_acquire: boolean;
  lock_token?: string; // Returned if the current user owns the lock
}

const lockService = {
  /**
   * Acquire edit lock for a document version
   */
  async acquire(data: AcquireLockRequest): Promise<AcquireLockResponse> {
    const response = await api.post<AcquireLockResponse>(
      `/documents/${data.document_id}/versions/${data.document_version_id}/lock`,
      { timeout_minutes: data.lock_duration_minutes || 30 }
    );
    return response.data;
  },

  /**
   * Refresh (extend) an existing lock - heartbeat
   */
  async refresh(data: RefreshLockRequest): Promise<AcquireLockResponse> {
    const response = await api.post<AcquireLockResponse>(
      `/documents/${data.document_id}/versions/${data.document_version_id}/lock/heartbeat`,
      {
        lock_token: data.lock_token,
        extend_minutes: data.extend_minutes || 30,
      }
    );
    return response.data;
  },

  /**
   * Release (unlock) a document version
   */
  async release(data: ReleaseLockRequest): Promise<void> {
    await api.delete(
      `/documents/${data.document_id}/versions/${data.document_version_id}/lock`,
      {
        data: { lock_token: data.lock_token }
      }
    );
  },

  /**
   * Check if a document version is locked
   */
  async checkLock(documentId: number, versionId: number): Promise<CheckLockResponse> {
    const response = await api.get<CheckLockResponse>(
      `/documents/${documentId}/versions/${versionId}/lock`
    );
    return response.data;
  },

  /**
   * Get current active lock for a version
   */
  async getCurrentLock(documentId: number, versionId: number): Promise<EditLock | null> {
    try {
      const response = await api.get<EditLock>(
        `/documents/${documentId}/versions/${versionId}/lock`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No active lock
      }
      throw error;
    }
  },

  /**
   * Heartbeat helper - for use in useEffect interval
   */
  async heartbeat(documentId: number, versionId: number, lockToken: string, extendMinutes: number = 30): Promise<AcquireLockResponse> {
    return this.refresh({
      document_id: documentId,
      document_version_id: versionId,
      lock_token: lockToken,
      extend_minutes: extendMinutes,
    });
  },
};

export default lockService;
