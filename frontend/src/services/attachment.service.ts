import api from './api';
import { Attachment } from '../types/document';

/**
 * Attachment Service - Handles file uploads and downloads
 */

export interface UploadAttachmentResponse {
  attachment: Attachment;
  message: string;
}

const attachmentService = {
  /**
   * Upload file attachment to a document version
   */
  async upload(
    versionId: number,
    file: File,
    description?: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<UploadAttachmentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const response = await api.post<UploadAttachmentResponse>(
      `/attachments/upload/${versionId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );

    return response.data;
  },

  /**
   * Get all attachments for a document version
   */
  async listByVersion(versionId: number): Promise<Attachment[]> {
    const response = await api.get<Attachment[]>(`/attachments/version/${versionId}`);
    return response.data;
  },

  /**
   * Get attachment metadata by ID
   */
  async getById(attachmentId: number): Promise<Attachment> {
    const response = await api.get<Attachment>(`/attachments/${attachmentId}`);
    return response.data;
  },

  /**
   * Download attachment file
   */
  async download(attachmentId: number): Promise<Blob> {
    const response = await api.get(`/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Download attachment and trigger browser download
   */
  async downloadFile(attachmentId: number, filename: string): Promise<void> {
    const blob = await this.download(attachmentId);
    
    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Delete attachment
   */
  async delete(attachmentId: number): Promise<void> {
    await api.delete(`/attachments/${attachmentId}`);
  },

  /**
   * Update attachment metadata
   */
  async update(attachmentId: number, description: string): Promise<Attachment> {
    const response = await api.patch<Attachment>(`/attachments/${attachmentId}`, {
      description,
    });
    return response.data;
  },

  /**
   * Get attachment download URL (for preview)
   */
  getDownloadUrl(attachmentId: number): string {
    return `${api.defaults.baseURL}/attachments/${attachmentId}/download`;
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Check if file type is allowed
   */
  isFileTypeAllowed(file: File, allowedTypes: string[]): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  },

  /**
   * Validate file before upload
   */
  validateFile(file: File, maxSizeMB: number = 50): { valid: boolean; error?: string } {
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${maxSizeMB}MB`,
      };
    }

    // Check file type (common document types)
    const allowedTypes = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'txt',
      'jpg',
      'jpeg',
      'png',
      'gif',
      'zip',
      'rar',
    ];

    if (!this.isFileTypeAllowed(file, allowedTypes)) {
      return {
        valid: false,
        error: 'File type not allowed',
      };
    }

    return { valid: true };
  },
};

export default attachmentService;

