import api from './api';

/**
 * Template Service - Handles all template operations
 */

export interface Template {
  id: number;
  name: string;
  description?: string;
  category?: string;
  department?: string;
  template_type?: string;
  owner_id: number;
  created_by_id: number;
  current_published_version_id?: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  owner_username?: string;
  owner_full_name?: string;
  created_by_username?: string;
  version_count?: number;
}

export interface TemplateVersion {
  id: number;
  template_id: number;
  version_number: number;
  docx_file_path: string;
  preview_html_path?: string;
  status: 'Draft' | 'UnderReview' | 'PendingApproval' | 'Rejected' | 'Published';
  created_by_id: number;
  created_by_username?: string;
  submitted_for_review_at?: string;
  submitted_for_review_by_id?: number;
  submitted_for_approval_at?: string;
  submitted_for_approval_by_id?: number;
  published_at?: string;
  published_by_id?: number;
  rejected_at?: string;
  rejected_by_id?: number;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateReview {
  id: number;
  template_version_id: number;
  reviewer_id: number;
  reviewer_username?: string;
  reviewer_full_name?: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateApproval {
  id: number;
  template_version_id: number;
  approver_id: number;
  approver_username?: string;
  approver_full_name?: string;
  decision: 'Approved' | 'Rejected';
  comment?: string;
  created_at: string;
}

export interface TemplateListResponse {
  items: Template[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface TemplateVersionListResponse {
  items: TemplateVersion[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface TemplateVersionDetail extends TemplateVersion {
  reviews: TemplateReview[];
  approvals: TemplateApproval[];
}

export interface TemplateUsageResponse {
  template_id: number;
  template_version_id: number;
  template_name: string;
  html_content: string;
  required_metadata_fields?: Array<{
    key: string;
    label: string;
    required: boolean;
  }>;
}

export interface UploadTemplateRequest {
  file: File;
  name?: string;
  description?: string;
  category?: string;
  department?: string;
  owner_id?: number;
}

export interface ReviewCommentRequest {
  comment: string;
}

export interface ApprovalRequest {
  decision: 'Approved' | 'Rejected';
  comment?: string;
  password: string;
}

export interface ValidationRequest {
  required_headings?: string[];
}

const templateService = {
  /**
   * Upload a new template (DOCX file)
   */
  async upload(data: UploadTemplateRequest): Promise<TemplateVersion> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.department) formData.append('department', data.department);
    if (data.owner_id) formData.append('owner_id', data.owner_id.toString());

    const response = await api.post<TemplateVersion>('/templates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * List templates with filters
   */
  async list(params?: {
    name?: string;
    category?: string;
    department?: string;
    page?: number;
    page_size?: number;
  }): Promise<TemplateListResponse> {
    const response = await api.get<TemplateListResponse>('/templates', { params });
    return response.data;
  },

  /**
   * Get published templates only (for document creation)
   */
  async getPublished(): Promise<Template[]> {
    const response = await api.get<Template[]>('/templates/published');
    return response.data;
  },

  /**
   * List template versions
   */
  async listVersions(
    templateId: number,
    params?: { page?: number; page_size?: number }
  ): Promise<TemplateVersionListResponse> {
    const response = await api.get<TemplateVersionListResponse>(
      `/templates/${templateId}/versions`,
      { params }
    );
    return response.data;
  },

  /**
   * Get template version details
   */
  async getVersion(templateId: number, versionId: number): Promise<TemplateVersionDetail> {
    const response = await api.get<TemplateVersionDetail>(
      `/templates/${templateId}/versions/${versionId}`
    );
    return response.data;
  },

  /**
   * Submit template version for review
   */
  async submitForReview(
    templateId: number,
    versionId: number,
    validation?: ValidationRequest
  ): Promise<TemplateVersion> {
    const response = await api.post<TemplateVersion>(
      `/templates/${templateId}/versions/${versionId}/submit-for-review`,
      validation || {}
    );
    return response.data;
  },

  /**
   * Add review comment
   */
  async addReviewComment(
    templateId: number,
    versionId: number,
    data: ReviewCommentRequest
  ): Promise<TemplateReview> {
    const response = await api.post<TemplateReview>(
      `/templates/${templateId}/versions/${versionId}/reviews`,
      data
    );
    return response.data;
  },

  /**
   * Submit template version for approval
   */
  async submitForApproval(
    templateId: number,
    versionId: number,
    validation?: ValidationRequest
  ): Promise<TemplateVersion> {
    const response = await api.post<TemplateVersion>(
      `/templates/${templateId}/versions/${versionId}/submit-for-approval`,
      validation || {}
    );
    return response.data;
  },

  /**
   * Approve or reject template version
   */
  async approve(
    templateId: number,
    versionId: number,
    data: ApprovalRequest
  ): Promise<TemplateApproval> {
    const response = await api.post<TemplateApproval>(
      `/templates/${templateId}/versions/${versionId}/approve`,
      data
    );
    return response.data;
  },

  /**
   * Publish template version
   */
  async publish(templateId: number, versionId: number): Promise<TemplateVersion> {
    const response = await api.post<TemplateVersion>(
      `/templates/${templateId}/versions/${versionId}/publish`
    );
    return response.data;
  },

  /**
   * Get template HTML content for document creation
   */
  async getTemplateHtml(templateId: number, versionId: number): Promise<TemplateUsageResponse> {
    const response = await api.get<TemplateUsageResponse>(
      `/templates/${templateId}/versions/${versionId}/html`
    );
    return response.data;
  },
};

export default templateService;


