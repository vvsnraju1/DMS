import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, ChevronRight } from 'lucide-react';
import documentService from '../../services/document.service';
import versionService from '../../services/version.service';
import templateService, { Template, TemplateUsageResponse } from '../../services/template.service';
import { useAuth } from '../../context/AuthContext';

interface MetadataField {
  key: string;
  label: string;
  required: boolean;
}

export default function CreateDocument() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'template' | 'metadata'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateMetadataFields, setTemplateMetadataFields] = useState<MetadataField[]>([]);
  const [templateHtml, setTemplateHtml] = useState<string>('');
  const [metadataValues, setMetadataValues] = useState<Record<string, string>>({});

  // Load published templates
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true);
      console.log('Loading published templates...');
      console.log('API base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1');
      
      const publishedTemplates = await templateService.getPublished();
      console.log('Published templates loaded:', publishedTemplates);
      console.log('Number of templates:', publishedTemplates?.length || 0);
      setTemplates(publishedTemplates || []);
    } catch (err: any) {
      console.error('Error loading templates:', err);
      console.error('Error type:', err.constructor.name);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error details:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error config:', err.config);
      
      // More specific error message
      let errorMessage = 'Failed to load templates';
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error: Could not connect to the server. Please check if the backend is running.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication error: Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Permission denied: You do not have access to templates.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Templates endpoint not found. Please check the API configuration.';
      } else if (err.response?.data?.detail) {
        errorMessage = `Failed to load templates: ${err.response.data.detail}`;
      } else if (err.message) {
        errorMessage = `Failed to load templates: ${err.message}`;
      }
      
      setError(errorMessage);
      setTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  };

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    doc_number: '',
    department: '',
    description: '',
    createVersion: true, // Option to create initial version
    templateId: '', // Selected template ID
  });

  // Templates state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // Map metadata keys to document fields to avoid duplicate inputs
  const metadataToDocFieldMap: Record<string, keyof typeof formData> = {
    template_title: 'title',
    template_code: 'doc_number',
    department: 'department',
  };

  // Handle template selection change
  const handleTemplateChange = async (templateId: string) => {
    setFormData((prev) => ({ ...prev, templateId }));
    
    if (!templateId) {
      setSelectedTemplate(null);
      setTemplateMetadataFields([]);
      setTemplateHtml('');
      setMetadataValues({});
      setStep('template');
      return;
    }

    try {
      const template = templates.find(t => t.id === parseInt(templateId));
      console.log('Selected template:', template);
      
      if (!template) {
        setError('Template not found');
        return;
      }

      if (!template.current_published_version_id) {
        console.error('Template has no published version ID:', template);
        setError('This template does not have a published version');
        return;
      }

      setSelectedTemplate(template);
      
      // Fetch template HTML and metadata fields
      console.log('Fetching template HTML for template:', template.id, 'version:', template.current_published_version_id);
      const templateData: TemplateUsageResponse = await templateService.getTemplateHtml(
        template.id,
        template.current_published_version_id
      );
      
      console.log('Template data received:', {
        html_length: templateData.html_content?.length,
        metadata_fields: templateData.required_metadata_fields?.length
      });
      
      setTemplateHtml(templateData.html_content);
      
      // Extract required metadata fields
      if (templateData.required_metadata_fields && templateData.required_metadata_fields.length > 0) {
        console.log('Template requires metadata fields:', templateData.required_metadata_fields);
        setTemplateMetadataFields(templateData.required_metadata_fields);
        // Initialize metadata values
        const initialValues: Record<string, string> = {};
        templateData.required_metadata_fields.forEach(field => {
          initialValues[field.key] = '';
        });
        setMetadataValues(initialValues);
      } else {
        console.log('Template has no required metadata fields');
        setTemplateMetadataFields([]);
      }
    } catch (err: any) {
      console.error('Error loading template:', err);
      setError(err.response?.data?.detail || 'Failed to load template details');
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle metadata field changes
  const handleMetadataChange = (key: string, value: string) => {
    setMetadataValues((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Keep document fields in sync to avoid duplicate entry
    const mappedField = metadataToDocFieldMap[key];
    if (mappedField) {
      setFormData((prev) => ({
        ...prev,
        [mappedField]: value,
      }));
    }
  };

  // Map metadata field keys to token names
  const getTokenName = (fieldKey: string): string => {
    const tokenMap: Record<string, string> = {
      'template_title': 'TEMPLATE_TITLE',
      'template_code': 'TEMPLATE_CODE',
      'revision': 'REVISION',
      'effective_date': 'EFFECTIVE_DATE',
      'next_review_date': 'NEXT_REVIEW_DATE',
      'department': 'DEPARTMENT',
      'cc_number': 'CC_NUMBER',
      'confidentiality': 'CONFIDENTIALITY',
    };
    return tokenMap[fieldKey] || fieldKey.toUpperCase();
  };

  // Replace tokens in HTML content
  const replaceTokens = (html: string, values: Record<string, string>): string => {
    let result = html;
    // Replace all tokens like {{TOKEN_NAME}} with values
    Object.keys(values).forEach(key => {
      const tokenName = getTokenName(key);
      const token = `{{${tokenName}}}`;
      const value = values[key] || '';
      // Use global replace with escaped token
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escapedToken, 'g'), value);
    });
    return result;
  };

  // Validate combined form (template metadata + document info)
  const validateBeforeSubmit = (): string | null => {
    // Required template metadata
    for (const field of templateMetadataFields) {
      if (field.required && !metadataValues[field.key]?.trim()) {
        return `${field.label} is required`;
      }
    }

    // Compute document fields using metadata where applicable to avoid duplicates
    const computedTitle = (metadataValues['template_title'] || formData.title).trim();
    const computedDocNumber = (metadataValues['template_code'] || formData.doc_number).trim();
    const computedDepartment = (metadataValues['department'] || formData.department).trim();

    if (!computedTitle) return 'Title is required';
    if (!computedDocNumber) return 'Document number is required';
    if (!formData.documentType) return 'Document type is required';
    if (!computedDepartment) return 'Department is required';
    return null;
  };

  // Move to metadata step after template selection
  const handleTemplateNext = () => {
    setError(null);
    setStep('metadata');
  };

  // Handle form submission
  const handleSubmit = async () => {
    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Compute document values from metadata to avoid double entry
      const title = (metadataValues['template_title'] || formData.title).trim();
      const documentNumber = (metadataValues['template_code'] || formData.doc_number).trim();
      const department = (metadataValues['department'] || formData.department).trim();
      const description = formData.description.trim() || undefined;

      // Create document metadata
      const document = await documentService.create({
        title,
        document_number: documentNumber,
        department,
        description,
      });

      // Create initial version if requested
      if (formData.createVersion) {
        let initialContent = '<p>Start writing your document here...</p>';
        
        // If template is selected, load template HTML and replace tokens
        if (formData.templateId && templateHtml) {
          try {
            // Build token mapping from metadata values
            const tokenMapping: Record<string, string> = {};
            
            // Add metadata field values
            Object.keys(metadataValues).forEach(key => {
              tokenMapping[key] = metadataValues[key];
            });
            
            // Map common document fields to their corresponding metadata keys
            // These will be used if the template requires them
            tokenMapping['template_title'] = title;
            tokenMapping['template_code'] = documentNumber;
            tokenMapping['department'] = department;
            
            initialContent = replaceTokens(templateHtml, tokenMapping);
          } catch (err) {
            console.error('Error processing template HTML:', err);
            // Continue with default content if template processing fails
          }
        }
        
        await versionService.create(document.id, {
          content_html: initialContent,
        });
        
        // Navigate to editor
        navigate(`/documents/${document.id}/edit`);
      } else {
        // Navigate to document detail
        navigate(`/documents/${document.id}`);
      }
    } catch (err: any) {
      console.error('Error creating document:', err);
      setError(err.response?.data?.detail || 'Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  // Get field input type based on key
  const getFieldInputType = (key: string): string => {
    if (key.includes('date') || key.includes('Date')) {
      return 'date';
    }
    if (key.includes('number') || key.includes('Number')) {
      return 'text';
    }
    return 'text';
  };

  // Get field placeholder
  const getFieldPlaceholder = (key: string): string => {
    const placeholders: Record<string, string> = {
      'template_title': 'e.g., Standard Operating Procedure for Equipment Cleaning',
      'template_code': 'e.g., SOP-QA-001',
      'revision': 'e.g., 01',
      'effective_date': 'Select effective date',
      'next_review_date': 'Select next review date',
      'cc_number': 'e.g., CC-001',
      'department': 'e.g., Quality Assurance',
      'confidentiality': 'e.g., Internal, Confidential',
    };
    return placeholders[key] || `Enter ${key.replace(/_/g, ' ')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Documents
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-brand-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <FileText className="text-white" size={28} />
          </div>
          <div>
            <h1 className="page-title">Create New Document</h1>
            <p className="page-subtitle">
              {step === 'template' 
                ? 'Choose a template first, then we will ask for its metadata'
                : 'Fill in the required metadata and document details'}
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-6 flex items-center gap-2">
        <div className={`flex items-center ${step === 'template' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'template' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <span className="ml-2 font-medium">Select Template</span>
        </div>
        <ChevronRight className="text-gray-400" size={20} />
        <div className={`flex items-center ${step === 'metadata' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'metadata' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
          <span className="ml-2 font-medium">Metadata & Details</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Template Selection Step */}
      {step === 'template' && (
        <form onSubmit={(e) => { e.preventDefault(); handleTemplateNext(); }} className="card">
          {/* Template Selection */}
          <div className="mb-6">
            <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
              Select a template to start
            </label>
            {templatesLoading ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Loading templates...</span>
                </div>
              </div>
            ) : (
              <select
                id="templateId"
                name="templateId"
                value={formData.templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No template (start from scratch)</option>
                {templates.length === 0 ? (
                  <option value="" disabled>No published templates available</option>
                ) : (
                  templates.map((template) => (
                    <option key={template.id} value={template.id.toString()}>
                      {template.name} {template.category ? `(${template.category})` : ''}
                    </option>
                  ))
                )}
              </select>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {templatesLoading 
                ? 'Loading published templates...'
                : templates.length === 0
                ? 'No published templates available. Create and publish a template first.'
                : 'Pick a template. If it has required metadata, we will ask next.'}
            </p>
            {selectedTemplate && templateMetadataFields.length > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                This template requires {templateMetadataFields.length} metadata field(s). You'll fill them in the next step.
              </p>
            )}
          </div>

          {/* Create Initial Version Option */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                name="createVersion"
                checked={formData.createVersion}
                onChange={handleChange}
                className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Create initial draft version</span>
                <p className="text-sm text-gray-600 mt-1">
                  Automatically create Version 1.0 (Draft) and open the editor. 
                  Uncheck if you only want to create the document metadata.
                </p>
              </div>
            </label>
          </div>

          {/* Created By Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Created by:</strong> {user?.full_name} ({user?.username})
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <strong>Roles:</strong> {user?.roles.join(', ')}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <ChevronRight size={20} />
              Continue
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/documents')}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Metadata & Details Step */}
      {step === 'metadata' && (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedTemplate ? `Template: ${selectedTemplate.name}` : 'No template selected'}
            </h2>
            <p className="text-sm text-gray-600">
              Fill the required metadata. Linked fields (Title, Number, Department) are only asked once and sync with the template.
            </p>
          </div>

          {templateMetadataFields.length > 0 && (
            <div className="mb-8">
              {templateMetadataFields.map((field) => (
                <div key={field.key} className="mb-6">
                  <label htmlFor={`metadata_${field.key}`} className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {getFieldInputType(field.key) === 'date' ? (
                    <input
                      type="date"
                      id={`metadata_${field.key}`}
                      value={metadataValues[field.key] || ''}
                      onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={field.required}
                    />
                  ) : (
                    <input
                      type={getFieldInputType(field.key)}
                      id={`metadata_${field.key}`}
                      value={metadataValues[field.key] || ''}
                      onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                      placeholder={getFieldPlaceholder(field.key)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={field.required}
                    />
                  )}
                  {metadataToDocFieldMap[field.key] && (
                    <p className="text-xs text-blue-600 mt-1">Linked to document {metadataToDocFieldMap[field.key] === 'title' ? 'Title' : metadataToDocFieldMap[field.key] === 'doc_number' ? 'Number' : 'Department'} (no duplicate entry)</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Document Info (only show fields not linked to metadata) */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Document Details</h3>

            {!templateMetadataFields.find(f => f.key === 'template_title') && (
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Standard Operating Procedure for Equipment Cleaning"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {!templateMetadataFields.find(f => f.key === 'template_code') && (
              <div className="mb-4">
                <label htmlFor="doc_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="doc_number"
                  name="doc_number"
                  value={formData.doc_number}
                  onChange={handleChange}
                  placeholder="e.g., SOP-QA-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {!templateMetadataFields.find(f => f.key === 'department') && (
              <div className="mb-4">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a department</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Production">Production</option>
                  <option value="Research & Development">Research & Development</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Regulatory Affairs">Regulatory Affairs</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                id="documentType"
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select type</option>
                <option value="SOP">SOP</option>
                <option value="STP">STP</option>
                <option value="Form">Form</option>
                <option value="Report">Report</option>
                <option value="Annexure">Annexure</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the document purpose and scope..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Create Initial Version Option */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                name="createVersion"
                checked={formData.createVersion}
                onChange={handleChange}
                className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Create initial draft version</span>
                <p className="text-sm text-gray-600 mt-1">
                  Automatically create Version 1.0 (Draft) and open the editor. 
                  Uncheck if you only want to create the document metadata.
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep('template')}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <ArrowLeft size={18} className="inline mr-2" />
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create & Start Editing
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Help Text */}
      {step === 'template' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">📋 Document Workflow</h3>
          <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
            <li><strong>Draft:</strong> Create and edit content</li>
            <li><strong>Under Review:</strong> Submit for peer review</li>
            <li><strong>Pending Approval:</strong> Awaiting HOD/QA approval</li>
            <li><strong>Effective:</strong> Active and in use (only one per document)</li>
            <li><strong>Obsolete:</strong> Superseded by newer version</li>
            <li><strong>Archived:</strong> Historical archival</li>
          </ol>
        </div>
      )}
    </div>
  );
}
