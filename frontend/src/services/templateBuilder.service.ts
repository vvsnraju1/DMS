import api from './api';

/**
 * Template Builder Service - Handles block-based template operations
 */

export interface TemplateBlock {
  id: string;
  type: string;
  html: string;
  order: number;
  metadata?: any;
}

export interface TemplateMetadata {
  template_title: string;
  template_code: string;
  category: string;
  revision: string;
  effective_date?: string;
  next_review_date?: string;
  cc_number?: string;
  department: string;
  confidentiality: string;
  owner_id: number;
}

export interface TemplateData {
  metadata: TemplateMetadata;
  blocks: TemplateBlock[];
}

export interface CreateTemplateRequest {
  template_data: TemplateData;
  sample_values?: { [key: string]: string };
}

export interface UpdateTemplateRequest {
  template_data: TemplateData;
  sample_values?: { [key: string]: string };
}

export interface PreviewRequest {
  sample_values?: { [key: string]: string };
}

export interface GenerateRequest {
  token_values: { [key: string]: string };
  format: 'docx' | 'pdf' | 'html';
  strict_mode?: boolean;
}

const templateBuilderService = {
  /**
   * Create a new template
   */
  async createTemplate(data: CreateTemplateRequest) {
    const response = await api.post('/template-builder/create', data);
    return response.data;
  },

  /**
   * Get template by ID
   */
  async getTemplate(templateId: number) {
    const response = await api.get(`/template-builder/${templateId}`);
    return response.data;
  },

  /**
   * Update template
   */
  async updateTemplate(templateId: number, data: UpdateTemplateRequest) {
    const response = await api.put(`/template-builder/${templateId}`, data);
    return response.data;
  },

  /**
   * Preview template
   */
  async previewTemplate(templateId: number, data: PreviewRequest) {
    const response = await api.post(`/template-builder/${templateId}/preview`, data);
    return response.data;
  },

  /**
   * Generate document from template
   */
  async generateDocument(templateId: number, data: GenerateRequest) {
    const response = await api.post(`/template-builder/${templateId}/generate`, data);
    return response.data;
  },

  /**
   * Download generated document
   */
  async downloadDocument(templateId: number, format: string = 'docx') {
    const response = await api.get(`/template-builder/${templateId}/download`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get token usage for template
   */
  async getTokenUsage(templateId: number) {
    const response = await api.get(`/template-builder/${templateId}/tokens`);
    return response.data;
  },

  /**
   * Get token library
   */
  async getTokenLibrary() {
    const response = await api.get('/template-builder/tokens/library');
    return response.data;
  },
};

export default templateBuilderService;







